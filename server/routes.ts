import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSongRequestSchema } from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";
import { rekordboxService } from "./rekordbox";

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key. Set STRIPE_SECRET_KEY in environment variables');
}

// Initialize Stripe client if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY) 
  : null;

export async function registerRoutes(app: Express): Promise<Server> {
  // Events endpoints
  app.get("/api/events", async (req, res) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
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

  // Song requests endpoints
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
      const eventId = parseInt(req.params.eventId);
      const event = await storage.getEvent(eventId);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      const requestData = {
        ...req.body,
        eventId,
        amount: 500 // €5.00 in cents
      };
      
      const validatedData = insertSongRequestSchema.parse(requestData);
      const createdRequest = await storage.createSongRequest(validatedData);
      
      res.status(201).json(createdRequest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid request data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create song request" });
    }
  });

  app.patch("/api/song-requests/:id/status", async (req, res) => {
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
      
      // Create a payment intent for €5
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 500, // €5.00 in cents
        currency: "eur",
        automatic_payment_methods: {
          enabled: true,
        },
      });
      
      res.json({ clientSecret: paymentIntent.client_secret });
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
  app.post("/api/rekordbox/mark-played/:id", async (req, res) => {
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
  app.post("/api/rekordbox/simulate/playing", (req, res) => {
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

  app.post("/api/rekordbox/simulate/playlist", (req, res) => {
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
