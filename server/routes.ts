import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ecologiService } from "./services/ecologi";
import { insertHabitSchema, insertHabitCompletionSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEFAULT_USER_ID = "default-user"; // For demo purposes

  // Get user stats and habits
  app.get("/api/dashboard", async (req, res) => {
    try {
      const user = await storage.getUser(DEFAULT_USER_ID);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const habits = await storage.getHabitsByUserId(DEFAULT_USER_ID);
      const todayCompletions = await storage.getTodayCompletions(DEFAULT_USER_ID);
      
      // Calculate weekly progress
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date();
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekCompletions = await storage.getCompletionsByDateRange(DEFAULT_USER_ID, weekStart, weekEnd);
      
      // Group completions by date
      const weeklyProgress = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayCompletions = weekCompletions.filter(completion => 
          completion.completedAt >= date && completion.completedAt < nextDay
        );
        
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        weeklyProgress.push({
          day: dayName,
          completed: dayCompletions.length,
          total: habits.length,
          isToday: i === 0,
        });
      }

      res.json({
        user,
        habits: habits.map(habit => ({
          ...habit,
          completedToday: todayCompletions.some(c => c.habitId === habit.id),
        })),
        todayCompletions: todayCompletions.length,
        totalHabits: habits.length,
        weeklyProgress,
        monthlyTrees: Math.floor(user.treesPlanted * 0.1), // Approximate monthly trees
        co2Offset: user.treesPlanted * 2.2, // Approximate kg CO2
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard data" });
    }
  });

  // Create new habit
  app.post("/api/habits", async (req, res) => {
    try {
      const validatedData = insertHabitSchema.parse({
        ...req.body,
        userId: DEFAULT_USER_ID,
      });
      
      const habit = await storage.createHabit(validatedData);
      res.status(201).json(habit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      console.error("Create habit error:", error);
      res.status(500).json({ message: "Failed to create habit" });
    }
  });

  // Complete/uncomplete habit
  app.post("/api/habits/:habitId/toggle", async (req, res) => {
    try {
      const { habitId } = req.params;
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }

      // Check if already completed today
      const todayCompletions = await storage.getTodayCompletions(DEFAULT_USER_ID);
      const existingCompletion = todayCompletions.find(c => c.habitId === habitId);

      if (existingCompletion) {
        // Uncomplete the habit
        await storage.deleteHabitCompletion(existingCompletion.id);
        
        // Update habit streak (decrement)
        const newStreak = Math.max(0, habit.streak - 1);
        await storage.updateHabit(habitId, { streak: newStreak });
        
        res.json({ completed: false, message: "Habit uncompleted" });
      } else {
        // Complete the habit
        const completion = await storage.createHabitCompletion({
          habitId,
          userId: DEFAULT_USER_ID,
        });

        // Update habit streak and trees earned
        const newStreak = habit.streak + 1;
        const newTreesEarned = habit.treesEarned + 1;
        await storage.updateHabit(habitId, { 
          streak: newStreak, 
          treesEarned: newTreesEarned 
        });

        // Plant tree via Ecologi API
        let treePlanted = false;
        let ecologiTreeId = null;
        
        try {
          const treeResult = await ecologiService.plantTree(`${habit.name} completion - Streak: ${newStreak}`);
          if (treeResult) {
            treePlanted = true;
            ecologiTreeId = treeResult.treeUrl;
            
            // Update completion record
            completion.treePlanted = true;
            completion.ecoloiTreeId = ecologiTreeId;
            
            // Update user's tree count
            const user = await storage.getUser(DEFAULT_USER_ID);
            if (user) {
              await storage.updateUserStats(
                DEFAULT_USER_ID,
                user.treesPlanted + 1,
                user.currentStreak + 1,
                Math.max(user.longestStreak, user.currentStreak + 1)
              );
            }
          }
        } catch (treeError) {
          console.error("Failed to plant tree:", treeError);
          // Continue without failing the habit completion
        }

        res.json({ 
          completed: true, 
          treePlanted,
          ecologiTreeId,
          streak: newStreak,
          message: treePlanted ? "Habit completed and tree planted!" : "Habit completed (tree planting failed)"
        });
      }
    } catch (error) {
      console.error("Toggle habit error:", error);
      res.status(500).json({ message: "Failed to toggle habit completion" });
    }
  });

  // Get habit history
  app.get("/api/habits/:habitId/history", async (req, res) => {
    try {
      const { habitId } = req.params;
      const completions = await storage.getHabitCompletions(habitId);
      res.json(completions);
    } catch (error) {
      console.error("Get habit history error:", error);
      res.status(500).json({ message: "Failed to get habit history" });
    }
  });

  // Delete habit
  app.delete("/api/habits/:habitId", async (req, res) => {
    try {
      const { habitId } = req.params;
      const deleted = await storage.deleteHabit(habitId);
      
      if (!deleted) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      res.json({ message: "Habit deleted successfully" });
    } catch (error) {
      console.error("Delete habit error:", error);
      res.status(500).json({ message: "Failed to delete habit" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
