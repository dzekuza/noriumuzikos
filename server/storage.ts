import { 
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  songRequests, type SongRequest, type InsertSongRequest
} from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Event methods
  getEvents(): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<Event>): Promise<Event | undefined>;
  
  // Song request methods
  getSongRequests(eventId: number, status?: string): Promise<SongRequest[]>;
  getSongRequest(id: number): Promise<SongRequest | undefined>;
  createSongRequest(request: InsertSongRequest): Promise<SongRequest>;
  updateSongRequestStatus(id: number, status: string): Promise<SongRequest | undefined>;
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

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
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
}

export const storage = new DatabaseStorage();
