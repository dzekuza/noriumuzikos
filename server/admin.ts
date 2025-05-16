import { Request, Response, NextFunction } from "express";
import { storage } from "./storage";

// Middleware to check if user is admin (user IDs 1 and 3 are considered admins)
export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  // User with ID 1 (platform owner) and ID 3 (dannie) are super admins
  if (req.user?.id !== 1 && req.user?.id !== 3) {
    return res.status(403).json({ message: "Access denied. Admin privileges required." });
  }

  next();
}

// Get all users with subscription information
export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await storage.getAllUsers();
    
    // Remove password from user data
    const safeUsers = users.map((user) => {
      // Destructure with explicit typing for password
      const { password, ...safeUser } = user;
      return safeUser;
    });
    
    res.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Failed to fetch users" });
  }
}

// Get all events with creator information
export async function getAllEvents(req: Request, res: Response) {
  try {
    const events = await storage.getAllEventsWithCreators();
    res.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
}

// Get payment and subscription statistics
export async function getPaymentStats(req: Request, res: Response) {
  try {
    // Get active subscriptions
    const users = await storage.getAllUsers();
    const activeSubscriptions = users.filter(user => user.isSubscribed).length;
    
    // Calculate subscription revenue (assume €10 per month per active subscription)
    const subscriptionRevenue = activeSubscriptions * 1000; // €10.00 in cents
    
    // Get song request payments
    const songRequests = await storage.getAllSongRequests();
    const songRequestRevenue = songRequests.reduce((total: number, request) => total + request.amount, 0);
    
    // Calculate total amount
    const totalAmount = subscriptionRevenue + songRequestRevenue;
    
    res.json({
      totalPayments: songRequests.length + activeSubscriptions,
      totalAmount,
      activeSubscriptions,
      subscriptionRevenue,
      songRequestRevenue
    });
  } catch (error) {
    console.error("Error fetching payment stats:", error);
    res.status(500).json({ message: "Failed to fetch payment statistics" });
  }
}