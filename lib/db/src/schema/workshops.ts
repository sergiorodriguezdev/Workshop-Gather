import { createInsertSchema } from "drizzle-zod";
import { sql } from "drizzle-orm";
import {
  check,
  date,
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const workshopsTable = pgTable(
  "gather_workshops",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    image: text("image").notNull(),
    category: text("category").notNull(),
    color: text("color").notNull(),
    host: text("host").notNull(),
    hostNote: text("host_note").notNull(),
    venue: text("venue").notNull(),
    address: text("address").notNull(),
    date: date("date", { mode: "string" }).notNull(),
    time: text("time").notNull(),
    duration: text("duration").notNull(),
    capacity: integer("capacity").notNull(),
    seatsReserved: integer("seats_reserved").notNull().default(0),
    includes: text("includes").array().notNull().default([]),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [
    check("gather_workshops_capacity_positive", sql`${table.capacity} > 0`),
    check(
      "gather_workshops_seats_within_capacity",
      sql`${table.seatsReserved} >= 0 AND ${table.seatsReserved} <= ${table.capacity}`,
    ),
  ],
);

export const insertWorkshopSchema = createInsertSchema(workshopsTable);
export type InsertWorkshop = z.infer<typeof insertWorkshopSchema>;
export type Workshop = typeof workshopsTable.$inferSelect;
