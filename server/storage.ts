import { type User, type InsertUser, type Habit, type InsertHabit, type HabitCompletion, type InsertHabitCompletion } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
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
  createHabitCompletion(completion: InsertHabitCompletion): Promise<HabitCompletion>;
  deleteHabitCompletion(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private habits: Map<string, Habit>;
  private habitCompletions: Map<string, HabitCompletion>;

  constructor() {
    this.users = new Map();
    this.habits = new Map();
    this.habitCompletions = new Map();
    
    // Create a default user for development
    this.createDefaultUser();
  }

  private async createDefaultUser() {
    const defaultUser: User = {
      id: "default-user",
      username: "demo",
      password: "password",
      treesPlanted: 127,
      currentStreak: 14,
      longestStreak: 32,
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create some default habits
    const defaultHabits = [
      {
        id: "habit-1",
        userId: "default-user",
        name: "Morning Meditation",
        description: "10 minutes of mindfulness",
        icon: "leaf",
        category: "wellness",
        isActive: true,
        streak: 7,
        treesEarned: 7,
        createdAt: new Date(),
      },
      {
        id: "habit-2",
        userId: "default-user",
        name: "Read 30 Pages",
        description: "Daily reading habit",
        icon: "book-open",
        category: "learning",
        isActive: true,
        streak: 3,
        treesEarned: 3,
        createdAt: new Date(),
      },
      {
        id: "habit-3",
        userId: "default-user",
        name: "Morning Workout",
        description: "30 minutes exercise",
        icon: "dumbbell",
        category: "fitness",
        isActive: true,
        streak: 14,
        treesEarned: 14,
        createdAt: new Date(),
      },
      {
        id: "habit-4",
        userId: "default-user",
        name: "Drink 8 Glasses Water",
        description: "Stay hydrated throughout the day",
        icon: "tint",
        category: "wellness",
        isActive: true,
        streak: 5,
        treesEarned: 5,
        createdAt: new Date(),
      },
      {
        id: "habit-5",
        userId: "default-user",
        name: "Gratitude Journal",
        description: "Write 3 things I'm grateful for",
        icon: "heart",
        category: "wellness",
        isActive: true,
        streak: 9,
        treesEarned: 9,
        createdAt: new Date(),
      },
    ];

    defaultHabits.forEach(habit => {
      this.habits.set(habit.id, habit);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      treesPlanted: 0,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserStats(userId: string, treesPlanted: number, currentStreak: number, longestStreak: number): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      treesPlanted,
      currentStreak,
      longestStreak: Math.max(longestStreak, user.longestStreak),
    };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async getHabitsByUserId(userId: string): Promise<Habit[]> {
    return Array.from(this.habits.values()).filter(habit => habit.userId === userId && habit.isActive);
  }

  async getHabit(id: string): Promise<Habit | undefined> {
    return this.habits.get(id);
  }

  async createHabit(insertHabit: InsertHabit): Promise<Habit> {
    const id = randomUUID();
    const habit: Habit = {
      id,
      userId: insertHabit.userId,
      name: insertHabit.name,
      description: insertHabit.description || null,
      icon: insertHabit.icon || "leaf",
      category: insertHabit.category || "wellness",
      isActive: insertHabit.isActive ?? true,
      streak: 0,
      treesEarned: 0,
      createdAt: new Date(),
    };
    this.habits.set(id, habit);
    return habit;
  }

  async updateHabit(id: string, updates: Partial<Habit>): Promise<Habit | undefined> {
    const habit = this.habits.get(id);
    if (!habit) return undefined;

    const updatedHabit: Habit = { ...habit, ...updates };
    this.habits.set(id, updatedHabit);
    return updatedHabit;
  }

  async deleteHabit(id: string): Promise<boolean> {
    return this.habits.delete(id);
  }

  async getHabitCompletions(habitId: string): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(completion => completion.habitId === habitId);
  }

  async getHabitCompletionsByUserId(userId: string): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(completion => completion.userId === userId);
  }

  async getTodayCompletions(userId: string): Promise<HabitCompletion[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.habitCompletions.values()).filter(completion => 
      completion.userId === userId &&
      completion.completedAt >= today &&
      completion.completedAt < tomorrow
    );
  }

  async getCompletionsByDateRange(userId: string, startDate: Date, endDate: Date): Promise<HabitCompletion[]> {
    return Array.from(this.habitCompletions.values()).filter(completion =>
      completion.userId === userId &&
      completion.completedAt >= startDate &&
      completion.completedAt <= endDate
    );
  }

  async createHabitCompletion(insertCompletion: InsertHabitCompletion): Promise<HabitCompletion> {
    const id = randomUUID();
    const completion: HabitCompletion = {
      ...insertCompletion,
      id,
      completedAt: new Date(),
      treePlanted: false,
      ecoloiTreeId: null,
    };
    this.habitCompletions.set(id, completion);
    return completion;
  }

  async deleteHabitCompletion(id: string): Promise<boolean> {
    return this.habitCompletions.delete(id);
  }
}

export const storage = new MemStorage();
