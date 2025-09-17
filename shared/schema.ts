import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, integer, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  treesPlanted: integer("trees_planted").notNull().default(0),
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  onboardingCompleted: boolean("onboarding_completed").notNull().default(false),
  onboardingProfile: jsonb("onboarding_profile"), // aspiration, motivations, obstacles, selectedBehaviors
  celebrationPrefs: jsonb("celebration_prefs"), // personalityTone, style, themes, etc
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
  impactAction: text("impact_action", { 
    enum: ["plant_tree", "rescue_plastic", "offset_carbon", "plant_kelp", "provide_water", "sponsor_bees"] 
  }).notNull().default("plant_tree"),
  impactAmount: integer("impact_amount").notNull().default(1),
  totalImpactEarned: integer("total_impact_earned").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitCompletions = pgTable("habit_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull().references(() => habits.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  impactCreated: boolean("impact_created").notNull().default(false),
  impactId: text("impact_id"), // Track 1ClickImpact action ID
  impactAction: text("impact_action"),
  impactAmount: integer("impact_amount"),
  emotionalFeedback: integer("emotional_feedback"), // 1-5 rating from celebration modal
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  treesPlanted: true,
  currentStreak: true,
  longestStreak: true,
  createdAt: true,
  updatedAt: true,
});

export const upsertUserSchema = createInsertSchema(users).omit({
  treesPlanted: true,
  currentStreak: true,
  longestStreak: true,
  createdAt: true,
  updatedAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  streak: true,
  totalImpactEarned: true,
  createdAt: true,
});

export const updateHabitSchema = createInsertSchema(habits).omit({
  id: true,
  userId: true,
  streak: true,
  totalImpactEarned: true,
  createdAt: true,
}).partial();

export const insertHabitCompletionSchema = createInsertSchema(habitCompletions).omit({
  id: true,
  completedAt: true,
  impactCreated: true,
  impactId: true,
  impactAction: true,
  impactAmount: true,
});

// Onboarding and celebration schemas
export const behaviorSchema = z.object({
  name: z.string(),
  whyEffective: z.string(),
  abilityScore: z.number().min(1).max(5),
  trigger: z.string(),
  category: z.enum(["wellness", "fitness", "mindfulness", "productivity", "learning", "creativity", "social", "environmental"]),
  icon: z.string(),
  impactAction: z.enum(["plant_tree", "rescue_plastic", "offset_carbon", "plant_kelp", "provide_water", "sponsor_bees"]),
  impactAmount: z.number().min(1)
});

export const onboardingProfileSchema = z.object({
  aspiration: z.string(),
  motivations: z.array(z.string()),
  obstacles: z.array(z.string()),
  context: z.string(),
  selectedBehaviors: z.array(behaviorSchema).max(3),
  recommendedBehaviors: z.array(behaviorSchema).max(3).optional(), // AI-generated recommendations
  choice: z.enum(["manual", "automatic"]).optional(), // User's habit creation choice
  conversationId: z.string().optional(),
  completedAt: z.string().optional()
});

export const celebrationPrefsSchema = z.object({
  personalityTone: z.enum(["warm", "direct", "playful", "scientist"]).default("warm"),
  style: z.enum(["minimal", "standard", "hype"]).default("standard"),
  emojiLevel: z.number().min(1).max(3).default(2),
  surpriseLevel: z.number().min(1).max(3).default(2),
  themes: z.array(z.string()).default([]),
  soundEnabled: z.boolean().default(true)
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type Habit = typeof habits.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type UpdateHabit = z.infer<typeof updateHabitSchema>;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertHabitCompletion = z.infer<typeof insertHabitCompletionSchema>;
export type Behavior = z.infer<typeof behaviorSchema>;
export type OnboardingProfile = z.infer<typeof onboardingProfileSchema>;
export type CelebrationPrefs = z.infer<typeof celebrationPrefsSchema>;
