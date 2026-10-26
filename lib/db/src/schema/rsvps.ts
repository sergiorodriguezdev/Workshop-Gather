import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import {
  index,
  pgTable,
  serial,
  timestamp,
  uniqueIndex,
  text,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { workshopsTable } from "./workshops";

export const rsvpsTable = pgTable(
  "gather_rsvps",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    workshopId: text("workshop_id")
      .notNull()
      .references(() => workshopsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("gather_rsvps_user_workshop_unique").on(
      table.userId,
      table.workshopId,
    ),
    index("gather_rsvps_user_id_idx").on(table.userId),
  ],
);

export const usersRelations = relations(usersTable, ({ many }) => ({
  rsvps: many(rsvpsTable),
}));

export const workshopsRelations = relations(workshopsTable, ({ many }) => ({
  rsvps: many(rsvpsTable),
}));

export const rsvpsRelations = relations(rsvpsTable, ({ one }) => ({
  user: one(usersTable, {
    fields: [rsvpsTable.userId],
    references: [usersTable.id],
  }),
  workshop: one(workshopsTable, {
    fields: [rsvpsTable.workshopId],
    references: [workshopsTable.id],
  }),
}));

export const insertRsvpSchema = createInsertSchema(rsvpsTable);
export type InsertRsvp = z.infer<typeof insertRsvpSchema>;
export type Rsvp = typeof rsvpsTable.$inferSelect;
