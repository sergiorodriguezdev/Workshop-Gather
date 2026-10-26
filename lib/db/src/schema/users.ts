import { createInsertSchema } from "drizzle-zod";
import { timestamp, text, pgTable } from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const usersTable = pgTable("gather_users", {
  // Clerk is the source of identity; this key comes from the verified session.
  id: text("id").primaryKey(),
  email: text("email"),
  fullName: text("full_name"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insertUserSchema = createInsertSchema(usersTable);
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;
