import { 
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  songRequests, type SongRequest, type InsertSongRequest,
  verificationCodes, type VerificationCode, type InsertVerificationCode
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  updateUserPassword(id: number, newPasswordHash: string): Promise<User | undefined>;
  updateSubscription(userId: number, subscriptionData: { stripeCustomerId?: string, stripeSubscriptionId?: string, isSubscribed?: boolean, subscriptionStatus?: string }): Promise<User | undefined>;
  verifyUserEmail(userId: number): Promise<User | undefined>;
  
  // Verification code methods
  createVerificationCode(userId: number, email: string): Promise<VerificationCode>;
  getVerificationCode(code: string, email: string): Promise<VerificationCode | undefined>;
  markVerificationCodeAsUsed(id: number): Promise<VerificationCode | undefined>;
  
  // Event methods
  getEvents(userId?: number): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Song request methods
  getSongRequests(eventId: number, status?: string): Promise<SongRequest[]>;
  getSongRequest(id: number): Promise<SongRequest | undefined>;
  createSongRequest(request: InsertSongRequest): Promise<SongRequest>;
  updateSongRequestStatus(id: number, status: string): Promise<SongRequest | undefined>;
  
  // Admin methods
  getAllUsers(): Promise<User[]>;
  getAllEventsWithCreators(): Promise<(Event & { username: string })[]>;
  getAllSongRequests(): Promise<SongRequest[]>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }
  
  async getUserByStripeCustomerId(stripeCustomerId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.stripeCustomerId, stripeCustomerId));
    return user || undefined;
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }
  
  async verifyUserEmail(userId: number): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ isEmailVerified: true })
      .where(eq(users.id, userId))
      .returning();
    
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    // Don't allow password updates through this method for security
    // Password changes should go through a separate secure method with verification
    const userDataToUpdate = { ...userData };
    if ('password' in userDataToUpdate) {
      delete userDataToUpdate.password;
    }
    
    const [user] = await db
      .update(users)
      .set(userDataToUpdate)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async updateUserPassword(id: number, newPasswordHash: string): Promise<User | undefined> {
    // This method expects the password to already be hashed
    const [user] = await db
      .update(users)
      .set({ password: newPasswordHash })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }
  
  async updateSubscription(userId: number, subscriptionData: { 
    stripeCustomerId?: string, 
    stripeSubscriptionId?: string, 
    isSubscribed?: boolean, 
    subscriptionStatus?: string 
  }): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(subscriptionData)
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Event methods
  async getEvents(userId?: number): Promise<Event[]> {
    if (userId) {
      // Filter events by user ID if provided
      return await db.select().from(events).where(eq(events.userId, userId));
    }
    // Return all events if no userId is provided (admin access)
    return await db.select().from(events);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db
      .insert(events)
      .values(insertEvent)
      .returning();
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const [event] = await db
      .update(events)
      .set(eventUpdate)
      .where(eq(events.id, id))
      .returning();
    return event || undefined;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    try {
      // First delete any associated song requests to maintain referential integrity
      await db
        .delete(songRequests)
        .where(eq(songRequests.eventId, id));
      
      // Then delete the event
      const result = await db
        .delete(events)
        .where(eq(events.id, id));
        
      return true;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      return false;
    }
  }

  // Song request methods
  async getSongRequests(eventId: number, status?: string): Promise<SongRequest[]> {
    if (status) {
      return await db
        .select()
        .from(songRequests)
        .where(
          and(
            eq(songRequests.eventId, eventId),
            eq(songRequests.status, status)
          )
        );
    } else {
      return await db
        .select()
        .from(songRequests)
        .where(eq(songRequests.eventId, eventId));
    }
  }

  async getSongRequest(id: number): Promise<SongRequest | undefined> {
    const [songRequest] = await db
      .select()
      .from(songRequests)
      .where(eq(songRequests.id, id));
    return songRequest || undefined;
  }

  async createSongRequest(insertRequest: InsertSongRequest): Promise<SongRequest> {
    const requestTime = new Date();
    const [songRequest] = await db
      .insert(songRequests)
      .values({
        ...insertRequest,
        requestTime,
        playedTime: null
      })
      .returning();
    return songRequest;
  }

  async updateSongRequestStatus(id: number, status: string): Promise<SongRequest | undefined> {
    const playedTime = status === 'played' ? new Date() : undefined;
    const updateValues: Partial<SongRequest> = { status };
    
    if (playedTime) {
      updateValues.playedTime = playedTime;
    }
    
    const [songRequest] = await db
      .update(songRequests)
      .set(updateValues)
      .where(eq(songRequests.id, id))
      .returning();
    
    return songRequest || undefined;
  }
  
  // Admin methods
  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }
  
  async getAllEventsWithCreators(): Promise<(Event & { username: string })[]> {
    // Join events with users to get creator usernames
    const result = await db
      .select({
        id: events.id,
        name: events.name,
        venue: events.venue,
        djName: events.djName,
        startTime: events.startTime,
        endTime: events.endTime,
        isActive: events.isActive,
        entryCode: events.entryCode,
        requestPrice: events.requestPrice,
        imageUrl: events.imageUrl,
        userId: events.userId,
        username: users.username
      })
      .from(events)
      .leftJoin(users, eq(events.userId, users.id));
      
    // Filter out any potential null usernames and replace with a default value
    return result.map(event => ({
      ...event,
      username: event.username || 'Unknown User' // Ensure username is never null
    }));
  }
  
  async getAllSongRequests(): Promise<SongRequest[]> {
    return await db.select().from(songRequests);
  }
}

export const storage = new DatabaseStorage();
