import { 
  users, type User, type InsertUser,
  events, type Event, type InsertEvent,
  songRequests, type SongRequest, type InsertSongRequest
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private songRequests: Map<number, SongRequest>;
  private userId: number;
  private eventId: number;
  private songRequestId: number;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.songRequests = new Map();
    this.userId = 1;
    this.eventId = 1;
    this.songRequestId = 1;
    
    // Add a demo event
    const demoEvent: Event = {
      id: this.eventId++,
      name: "Saturday Night Live",
      venue: "Club Neon",
      djName: "DJ Spinmaster",
      startTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      endTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 hours from now
      isActive: true
    };
    this.events.set(1, demoEvent);
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Event methods
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.eventId++;
    const event: Event = { ...insertEvent, id };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: number, eventUpdate: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...eventUpdate };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  // Song request methods
  async getSongRequests(eventId: number, status?: string): Promise<SongRequest[]> {
    return Array.from(this.songRequests.values()).filter(
      (request) => 
        request.eventId === eventId && 
        (status ? request.status === status : true)
    );
  }

  async getSongRequest(id: number): Promise<SongRequest | undefined> {
    return this.songRequests.get(id);
  }

  async createSongRequest(insertRequest: InsertSongRequest): Promise<SongRequest> {
    const id = this.songRequestId++;
    const requestTime = new Date();
    const request: SongRequest = { 
      ...insertRequest, 
      id, 
      requestTime,
      playedTime: null
    };
    this.songRequests.set(id, request);
    return request;
  }

  async updateSongRequestStatus(id: number, status: string): Promise<SongRequest | undefined> {
    const request = this.songRequests.get(id);
    if (!request) return undefined;
    
    const updatedRequest: SongRequest = { 
      ...request, 
      status,
      playedTime: status === 'played' ? new Date() : request.playedTime
    };
    
    this.songRequests.set(id, updatedRequest);
    return updatedRequest;
  }
}

export const storage = new MemStorage();
