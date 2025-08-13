import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  treesPlanted: integer("trees_planted").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  icon: text("icon").notNull().default("leaf"),
  category: text("category").notNull().default("wellness"),
  isActive: boolean("is_active").notNull().default(true),
  streak: integer("streak").notNull().default(0),
  treesEarned: integer("trees_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitCompletions = pgTable("habit_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull().references(() => habits.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  treePlanted: boolean("tree_planted").notNull().default(false),
  ecoloiTreeId: text("ecologi_tree_id"), // Track Ecologi tree purchase ID
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  treesPlanted: true,
  currentStreak: true,
  longestStreak: true,
  createdAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  streak: true,
  treesEarned: true,
  createdAt: true,
});

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
  completedAt: true,
  treePlanted: true,
  ecoloiTreeId: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
