import { boolean, integer, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

// Every anonymous question. No names, emails, IPs or device ids are stored.
export const questions = pgTable("qa_questions", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  // new | starred | answered | hidden
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

// Single row (id = 1) that controls what the projector / FreeShow screen shows.
export const displayState = pgTable("qa_display_state", {
  id: integer("id").primaryKey(),
  // welcome | question | socials | blank
  mode: text("mode").notNull().default("welcome"),
  text: text("text"),
  askedCount: integer("asked_count").notNull().default(0),
  accepting: boolean("accepting").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Question = typeof questions.$inferSelect;
export type DisplayState = typeof displayState.$inferSelect;
