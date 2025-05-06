import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSongRequestSchema } from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";
import { rekordboxService } from "./rekordbox";
import { setupAuth, requireAuth } from "./auth";
import { sendSongRequestNotification } from "./email-service";

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key. Set STRIPE_SECRET_KEY in environment variables');
}

// Initialize Stripe client if secret key is available - explicitly set to test mode
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      typescript: true,
      apiVersion: '2025-04-30.basil',
      appInfo: {
        name: 'DJ Request System',
        version: '1.0.0',
      },
    })
  : null;

// Ensure we're using a test key
if (stripe && process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
  console.warn('⚠️ Warning: Using a non-test Stripe key. Please use a test key for this application.');
} else {
  console.log("✅ Stripe initialized in test mode with test API keys");
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      console.log('Creating new event with data:', req.body);
      
      // Handle date formats correctly - Convert string dates to Date objects
      const eventData = {
        ...req.body,
        // Ensure entry code and request price are properly formatted
        entryCode: String(req.body.entryCode || ''),
        requestPrice: Number(req.body.requestPrice || 500),
        // Convert string dates to actual Date objects
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        isActive: req.body.isActive !== undefined ? Boolean(req.body.isActive) : true,
      };
      
      console.log('Processed event data:', eventData);
      const createdEvent = await storage.createEvent(eventData);
      console.log('Event created successfully:', createdEvent);
      res.status(201).json(createdEvent);
    } catch (error) {
      console.error('Error creating event:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid event data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  app.get("/api/events/:id", async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  
  app.patch("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      console.log(`Updating event ${eventId} with data:`, req.body);
      
      const updatedEvent = await storage.updateEvent(eventId, req.body);
      
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      console.log('Event updated successfully:', updatedEvent);
      res.json(updatedEvent);
    } catch (error) {
      console.error('Error updating event:', error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });

  // Song requests endpoints - removed requireAuth temporarily for debugging
  app.get("/api/events/:eventId/song-requests", async (req, res) => {
    try {
      const eventId = parseInt(req.params.eventId);
      const status = req.query.status as string | undefined;
      
      const requests = await storage.getSongRequests(eventId, status);
      res.json(requests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch song requests" });
    }
  });

  app.post("/api/events/:eventId/song-requests", async (req, res) => {
    try {
      console.log('Received song request:', req.body);
      const eventId = parseInt(req.params.eventId);
      console.log('For event ID:', eventId);
      
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        console.error('Event not found for ID:', eventId);
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Use the event's custom request price or default to 500 cents (€5.00)
      const requestData = {
        ...req.body,
        eventId,
        amount: event.requestPrice || 500
      };
      
      console.log('Preparing to save song request:', requestData);
      const validatedData = insertSongRequestSchema.parse(requestData);
      console.log('Validated data:', validatedData);
      
      const createdRequest = await storage.createSongRequest(validatedData);
      console.log('Song request created successfully:', createdRequest);
      
      res.status(201).json(createdRequest);
    } catch (error) {
      console.error('Error creating song request:', error);
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create song request" });
    }
  });

  app.patch("/api/song-requests/:id/status", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !["pending", "played", "skipped"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const updatedRequest = await storage.updateSongRequestStatus(id, status);
      
      if (!updatedRequest) {
        return res.status(404).json({ message: "Song request not found" });
      }
      
      res.json(updatedRequest);
    } catch (error) {
      res.status(500).json({ message: "Failed to update song request status" });
    }
  });

  // Stripe payment handling
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      if (!stripe) {
        return res.status(500).json({ message: "Stripe is not configured" });
      }
      
      // Get the event ID from the request if available
      const eventId = req.body.eventId;
      let amount = 500; // Default amount (€5.00)
      
      // If eventId is provided, get the event's custom price
      if (eventId) {
        try {
          const event = await storage.getEvent(Number(eventId));
          if (event && event.requestPrice) {
            amount = event.requestPrice;
            console.log(`Using custom price ${amount} cents for event ${eventId}`);
          }
        } catch (err) {
          console.warn(`Could not fetch price for event ${eventId}, using default`);
        }
      }
      
      // Create a payment intent
      console.log(`Creating Stripe payment intent in TEST mode for ${amount} cents`);
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
        // Explicitly add metadata to indicate test mode
        metadata: {
          integration_check: 'accept_a_payment',
          mode: 'test',
          eventId: eventId || 'unknown'
        },
      });
      
      res.json({ 
        clientSecret: paymentIntent.client_secret,
        amount: amount
      });
    } catch (error: any) {
      res.status(500).json({ message: `Error creating payment intent: ${error.message}` });
    }
  });

  // Rekordbox integration endpoints
  app.get("/api/rekordbox/current-track", (req, res) => {
    const currentTrack = rekordboxService.getCurrentTrack();
    res.json(currentTrack || { message: "No track currently playing" });
  });

  app.get("/api/rekordbox/playlist", (req, res) => {
    const playlist = rekordboxService.getPlaylist();
    res.json(playlist);
  });

  app.get("/api/rekordbox/recently-played", (req, res) => {
    const recentlyPlayed = rekordboxService.getRecentlyPlayed();
    res.json(recentlyPlayed);
  });

  // Update endpoint to manually mark song requests as played
  app.post("/api/rekordbox/mark-played/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const request = await rekordboxService.markSongRequestAsPlayed(id);
      
      if (!request) {
        return res.status(404).json({ message: "Song request not found" });
      }
      
      res.json(request);
    } catch (error: any) {
      res.status(500).json({ message: `Error marking request as played: ${error.message}` });
    }
  });

  // Simulate endpoints for testing the rekordbox integration
  app.post("/api/rekordbox/simulate/playing", requireAuth, (req, res) => {
    const { title, artist, id } = req.body;
    
    if (!title || !artist) {
      return res.status(400).json({ message: "Title and artist are required" });
    }
    
    rekordboxService.updateCurrentTrack({
      id: id || `track-${Date.now()}`,
      title,
      artist,
      duration: req.body.duration || 180,
      position: 0,
      status: 'playing'
    });
    
    res.json({ message: "Track updated successfully" });
  });

  app.post("/api/rekordbox/simulate/playlist", requireAuth, (req, res) => {
    const { tracks } = req.body;
    
    if (!Array.isArray(tracks)) {
      return res.status(400).json({ message: "Tracks must be an array" });
    }
    
    rekordboxService.updatePlaylist(tracks);
    res.json({ message: "Playlist updated successfully" });
  });

  const httpServer = createServer(app);
  
  // Initialize the rekordbox service with the HTTP server
  rekordboxService.init(httpServer);
  return httpServer;
}
