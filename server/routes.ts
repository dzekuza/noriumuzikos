import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSongRequestSchema } from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";
import { rekordboxService } from "./rekordbox";
import { setupAuth, requireAuth } from "./auth";
import { sendSongRequestNotification } from "./email-service";
import fs from 'fs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

// Always use live keys from .env file, ignoring environment variables
const readEnvFile = () => {
  try {
    const envFile = fs.readFileSync('.env', 'utf8');
    const secretKeyMatch = envFile.match(/STRIPE_SECRET_KEY=([^\n]+)/);
    const publicKeyMatch = envFile.match(/VITE_STRIPE_PUBLIC_KEY=([^\n]+)/);
    
    // Return the keys from .env file
    return {
      secret: secretKeyMatch ? secretKeyMatch[1] : null,
      public: publicKeyMatch ? publicKeyMatch[1] : null
    };
  } catch (error) {
    console.warn('Could not read .env file:', error);
    return { secret: null, public: null };
  }
};

// Always prioritize keys from the .env file first
const envKeys = readEnvFile();
let stripeSecretKey = envKeys.secret || process.env.STRIPE_SECRET_KEY;
let stripePublicKey = envKeys.public || process.env.VITE_STRIPE_PUBLIC_KEY;

// Still ensure we have valid keys
if (!stripeSecretKey || !stripePublicKey) {
  console.warn('Missing Stripe keys - payments may not work correctly');
} else {
  console.log('Using Stripe keys from .env file directly');
}

// Initialize Stripe client with the key we found
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      typescript: true,
      apiVersion: '2025-04-30.basil',
      appInfo: {
        name: 'DJ Request System',
        version: '1.0.0',
      },
    })
  : null;

// Log Stripe initialization status
if (stripe && stripeSecretKey) {
  if (stripeSecretKey.startsWith('sk_test_')) {
    console.log("✅ Stripe initialized in TEST mode with test API keys");
  } else if (stripeSecretKey.startsWith('sk_live_')) {
    console.log("✅ Stripe initialized in LIVE mode with production API keys");
  } else {
    console.warn('⚠️ Warning: Unrecognized Stripe key format');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up authentication
  setupAuth(app);
  // Event entry code validation
  app.post("/api/events/entry", async (req, res) => {
    try {
      const { entryCode } = req.body;
      
      if (!entryCode || entryCode.trim() === '') {
        return res.status(400).json({ message: "Renginio kodas yra privalomas" });
      }
      
      // Find event with matching entry code
      const events = await storage.getEvents();
      const event = events.find(e => e.entryCode === entryCode && e.isActive);
      
      if (!event) {
        return res.status(404).json({ message: "Neteisingas renginio kodas arba renginys neaktyvus" });
      }
      
      res.json({ eventId: event.id });
    } catch (error) {
      console.error('Error validating event entry code:', error);
      res.status(500).json({ message: "Serverio klaida bandant patvirtinti renginio kodą" });
    }
  });

  // Events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      // Filter out demo events or return only active events if query parameter is set
      const filteredEvents = req.query.active === 'true' 
        ? events.filter(event => event.isActive)
        : events;
      res.json(filteredEvents);
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
        requestPrice: Number(req.body.requestPrice || 5),
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
  
  // DELETE endpoint for events
  app.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const eventId = parseInt(req.params.id);
      console.log(`Deleting event ${eventId}`);
      
      // First check if event exists
      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      // Delete the event
      const result = await storage.deleteEvent(eventId);
      
      if (!result) {
        return res.status(500).json({ message: "Failed to delete event" });
      }
      
      console.log(`Event ${eventId} deleted successfully`);
      res.json({ success: true, message: "Event deleted successfully" });
    } catch (error) {
      console.error('Error deleting event:', error);
      res.status(500).json({ message: "Failed to delete event" });
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
      
      // Use the event's custom request price or default to 5 euros
      const requestData = {
        ...req.body,
        eventId,
        amount: event.requestPrice || 5
      };
      
      console.log('Preparing to save song request:', requestData);
      const validatedData = insertSongRequestSchema.parse(requestData);
      console.log('Validated data:', validatedData);
      
      const createdRequest = await storage.createSongRequest(validatedData);
      console.log('Song request created successfully:', createdRequest);
      
      // Send email notification to the DJ/admin
      try {
        await sendSongRequestNotification(createdRequest);
        console.log('Email notification sent for song request');
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Continue with the response even if email fails
      }
      
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
      let amount = 5; // Default amount (€5.00)
      
      // If eventId is provided, get the event's custom price
      if (eventId) {
        try {
          const event = await storage.getEvent(Number(eventId));
          if (event && event.requestPrice) {
            amount = event.requestPrice;
            console.log(`Using custom price ${amount} euros for event ${eventId}`);
          }
        } catch (err) {
          console.warn(`Could not fetch price for event ${eventId}, using default`);
        }
      }
      
      // The amount is already in cents, no need to convert
      const amountInCents = amount;
      const isTestMode = stripeSecretKey?.startsWith('sk_test_');
      console.log(`Creating Stripe payment intent in ${isTestMode ? 'TEST' : 'LIVE'} mode for ${amount} cents (€${(amount / 100).toFixed(2)})`);
      
      // Configure payment intent, choosing specific payment methods
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: "eur",
        // Using payment_method_types instead of automatic_payment_methods
        payment_method_types: ['card', 'alipay'],
        payment_method_options: {
          card: {
            request_three_d_secure: 'automatic',
          },
        },
        metadata: {
          integration_check: 'accept_a_payment',
          mode: isTestMode ? 'test' : 'live',
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
      status: 'playing' as const
    });
    
    res.json({ message: "Current track updated successfully" });
  });

  app.post("/api/rekordbox/simulate/playlist", requireAuth, (req, res) => {
    const { tracks } = req.body;
    
    if (!tracks || !Array.isArray(tracks)) {
      return res.status(400).json({ message: "Tracks array is required" });
    }
    
    // Format the tracks properly with correct typing
    const formattedTracks = tracks.map((track, index) => ({
      id: track.id || `track-${Date.now()}-${index}`,
      title: track.title,
      artist: track.artist,
      duration: track.duration || 180,
      position: index,
      status: 'queued' as const
    }));
    
    rekordboxService.updatePlaylist(formattedTracks);
    
    res.json({ message: "Playlist updated successfully" });
  });

  const httpServer = createServer(app);
  
  // Initialize the WebSocket server for Rekordbox integration
  rekordboxService.init(httpServer);

  return httpServer;
}