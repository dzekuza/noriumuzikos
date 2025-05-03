import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSongRequestSchema } from "@shared/schema";
import Stripe from "stripe";
import { z } from "zod";

// Validate Stripe secret key
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn('Missing Stripe secret key. Set STRIPE_SECRET_KEY in environment variables');
}

// Initialize Stripe client if secret key is available
const stripe = process.env.STRIPE_SECRET_KEY 
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2023-10-16" }) 
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

  const httpServer = createServer(app);
  return httpServer;
}
