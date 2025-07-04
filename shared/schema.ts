import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  venue: text("venue").notNull(),
  djName: text("dj_name").default(""),  // Made optional as requested
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  entryCode: text("entry_code").notNull().default(""),  // Code needed to access the event
  requestPrice: integer("request_price").notNull().default(500),  // Price in cents (default €5.00)
  imageUrl: text("image_url"),  // URL for the event image, optional
  userId: integer("user_id").notNull(),  // ID of the user (DJ) who created this event
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
});

export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

export const songRequests = pgTable("song_requests", {
  id: serial("id").primaryKey(),
  eventId: integer("event_id").notNull(),
  songName: text("song_name").notNull(),
  artistName: text("artist_name").notNull(),
  requesterName: text("requester_name").notNull(),
  wishes: text("wishes").default(""),  // User's wishes or message to the DJ
  amount: integer("amount").notNull(),
  status: text("status").notNull().default("pending"), // pending, played, skipped
  requestTime: timestamp("request_time").defaultNow().notNull(),
  playedTime: timestamp("played_time"),
});

export const insertSongRequestSchema = createInsertSchema(songRequests).omit({
  id: true,
  requestTime: true,
  playedTime: true,
});

export type InsertSongRequest = z.infer<typeof insertSongRequestSchema>;
export type SongRequest = typeof songRequests.$inferSelect;

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  isEmailVerified: boolean("is_email_verified").default(false).notNull(),
  phoneNumber: text("phone_number"),
  profilePicture: text("profile_picture"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  isSubscribed: boolean("is_subscribed").default(false).notNull(),
  subscriptionStatus: text("subscription_status").default("inactive"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phoneNumber: true,
  profilePicture: true,
  isSubscribed: true,
  subscriptionStatus: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Verification codes for email verification
export const verificationCodes = pgTable("verification_codes", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  isUsed: boolean("is_used").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVerificationCodeSchema = createInsertSchema(verificationCodes).omit({
  id: true,
  createdAt: true,
});

export type InsertVerificationCode = z.infer<typeof insertVerificationCodeSchema>;
export type VerificationCode = typeof verificationCodes.$inferSelect;
