import { type User, type InsertUser, type UpsertUser, type Habit, type InsertHabit, type HabitCompletion, type InsertHabitCompletion, users, habits, habitCompletions } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, lte, desc } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;
  updateUserStats(userId: string, treesPlanted: number, currentStreak: number, longestStreak: number): Promise<User | undefined>;

  // Habit methods
  getHabitsByUserId(userId: string): Promise<Habit[]>;
  getHabit(id: string): Promise<Habit | undefined>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined>;
  deleteHabit(id: string): Promise<boolean>;

  // Habit completion methods
  getHabitCompletions(habitId: string): Promise<HabitCompletion[]>;
  getHabitCompletionsByUserId(userId: string): Promise<HabitCompletion[]>;
  getTodayCompletions(userId: string): Promise<HabitCompletion[]>;
  getCompletionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<HabitCompletion[]>;
  getRecentHabitCompletions(userId: string, limit: number): Promise<HabitCompletion[]>;
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  updateHabitCompletion(id: string, updates: Partial<HabitCompletion>): Promise<HabitCompletion | undefined>;
  deleteHabitCompletion(id: string): Promise<boolean>;

  // Impact timeline methods
  getRecentImpactEntries(userId: string, limit: number): Promise<any[]>;
  getImpactTimeline(userId: string): Promise<any[]>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    // Initialize default data if needed
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // No longer needed - users will be created via Replit Auth
    // This method kept empty for compatibility but can be removed later
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    // Username field doesn't exist in current schema - this method is not used
    return undefined;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStats(userId: string, treesPlanted: number, currentStreak: number, longestStreak: number): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        treesPlanted,
        currentStreak,
        longestStreak,
      })
      .where(eq(users.id, userId))
      .returning();
    return updatedUser || undefined;
  }

  async getHabitsByUserId(userId: string): Promise<Habit[]> {
    return await db.select().from(habits).where(and(eq(habits.userId, userId), eq(habits.isActive, true)));
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit || undefined;
  }

  async getHabitById(id: string): Promise<Habit | undefined> {
    const [habit] = await db.select().from(habits).where(eq(habits.id, id));
    return habit || undefined;
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const [habit] = await db
      .insert(habits)
      .values(insertHabit)
      .returning();
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const [updatedHabit] = await db
      .update(habits)
      .set(updates)
      .where(eq(habits.id, id))
      .returning();
    return updatedHabit || undefined;
  }

  async deleteHabit(id: string): Promise<boolean> {
    const result = await db.delete(habits).where(eq(habits.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    return await db.select().from(habitCompletions).where(eq(habitCompletions.habitId, habitId));
  }

  async getHabitCompletionsByUserId(userId: string): Promise<HabitCompletion[]> {
    return await db.select().from(habitCompletions).where(eq(habitCompletions.userId, userId));
  }

  async getTodayCompletions(userId: string): Promise<HabitCompletion[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return await db.select().from(habitCompletions).where(
      and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.completedAt, today),
        lte(habitCompletions.completedAt, tomorrow)
      )
    );
  }

  async getCompletionsByDate(userId: string, date: Date): Promise<HabitCompletion[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db.select().from(habitCompletions).where(
      and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.completedAt, startOfDay),
        lte(habitCompletions.completedAt, endOfDay)
      )
    );
  }

  async getCompletionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<HabitCompletion[]> {
    return await db.select().from(habitCompletions).where(
      and(
        eq(habitCompletions.userId, userId),
        gte(habitCompletions.completedAt, startDate),
        lte(habitCompletions.completedAt, endDate)
      )
    );
  }

  async getRecentHabitCompletions(userId: string, limit: number): Promise<HabitCompletion[]> {
    return await db.select().from(habitCompletions)
      .where(eq(habitCompletions.userId, userId))
      .orderBy(desc(habitCompletions.completedAt))
      .limit(limit);
  }

  async createHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const [completion] = await db
      .insert(habitCompletions)
      .values(insertCompletion)
      .returning();
    return completion;
  }

  async deleteHabitCompletion(id: string): Promise<boolean> {
    const result = await db.delete(habitCompletions).where(eq(habitCompletions.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateHabitCompletion(id: string, updates: Partial<HabitCompletion>): Promise<HabitCompletion | undefined> {
    const [updated] = await db
      .update(habitCompletions)
      .set(updates)
      .where(eq(habitCompletions.id, id))
      .returning();
    return updated;
  }

  async getRecentImpactEntries(userId: string, limit: number): Promise<any[]> {
    try {
      const completions = await db
        .select({
          id: habitCompletions.id,
          habitName: habits.name,
          impactAction: habits.impactAction, // Get from habits table since completion might not have it
          impactAmount: habits.impactAmount, // Get from habits table since completion might not have it
          completedAt: habitCompletions.completedAt
        })
        .from(habitCompletions)
        .innerJoin(habits, eq(habitCompletions.habitId, habits.id))
        .where(eq(habits.userId, userId))
        .orderBy(desc(habitCompletions.completedAt))
        .limit(limit);
      
      return completions || [];
    } catch (error) {
      console.error("Error getting recent impact entries:", error);
      return [];
    }
  }

  async getImpactTimeline(userId: string): Promise<any[]> {
    try {
      const completions = await db
        .select({
          id: habitCompletions.id,
          habitName: habits.name,
          impactAction: habits.impactAction, // Get from habits table since completion might not have it
          impactAmount: habits.impactAmount, // Get from habits table since completion might not have it
          completedAt: habitCompletions.completedAt,
          streak: habits.streak // Get streak from habits table
        })
        .from(habitCompletions)
        .innerJoin(habits, eq(habitCompletions.habitId, habits.id))
        .where(eq(habits.userId, userId))
        .orderBy(desc(habitCompletions.completedAt));
      
      return completions || [];
    } catch (error) {
      console.error("Error getting impact timeline:", error);
      return [];
    }
  }
}

export const storage = new DatabaseStorage();
