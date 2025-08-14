import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { oneClickImpactService } from "./services/oneClickImpactService";
import { insertHabitSchema, insertHabitCompletionSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Get user stats and habits (protected route)
  app.get("/api/dashboard", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const habits = await storage.getHabitsByUserId(userId);
      const todayCompletions = await storage.getTodayCompletions(userId);
      
      // Calculate weekly progress
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - 6);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date();
      weekEnd.setHours(23, 59, 59, 999);
      
      const weekCompletions = await storage.getCompletionsByDateRange(userId, weekStart, weekEnd);
      
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

      // Calculate total impact by action type
      const totalImpact = habits.reduce((acc, habit) => {
        const amount = habit.totalImpactEarned || 0;
        switch (habit.impactAction) {
          case 'plant_tree':
            acc.treesPlanted += amount;
            break;
          case 'clean_ocean':
            acc.wasteRemoved += amount;
            break;
          case 'capture_carbon':
            acc.carbonCaptured += amount;
            break;
          case 'donate_money':
            acc.moneyDonated += amount * 100; // Convert dollars to cents for storage
            break;
        }
        return acc;
      }, { treesPlanted: 0, wasteRemoved: 0, carbonCaptured: 0, moneyDonated: 0 });

      res.json({
        user: {
          ...user,
          totalImpact,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
        },
        habits: habits.map(habit => ({
          ...habit,
          completedToday: todayCompletions.some(c => c.habitId === habit.id),
        })),
        todayCompletions: todayCompletions.length,
        totalHabits: habits.length,
        weeklyProgress,
        monthlyTrees: Math.floor(totalImpact.treesPlanted * 0.3),
        co2Offset: totalImpact.carbonCaptured + (totalImpact.treesPlanted * 22),
      });
    } catch (error) {
      console.error("Dashboard error:", error);
      res.status(500).json({ message: "Failed to load dashboard data" });
    }
  });

  // Create new habit (protected route)
  app.post("/api/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertHabitSchema.parse({
        ...req.body,
        userId,
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

  // Complete/uncomplete habit (protected route)
  app.post("/api/habits/:habitId/toggle", isAuthenticated, async (req: any, res) => {
    try {
      const { habitId } = req.params;
      const userId = req.user.claims.sub;
      const habit = await storage.getHabit(habitId);
      
      if (!habit) {
        return res.status(404).json({ message: "Habit not found" });
      }

      // Check if already completed today
      const todayCompletions = await storage.getTodayCompletions(userId);
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
          userId,
        });

        // Update habit streak and impact earned
        const newStreak = habit.streak + 1;
        const newTotalImpactEarned = habit.totalImpactEarned + habit.impactAmount;
        await storage.updateHabit(habitId, { 
          streak: newStreak, 
          totalImpactEarned: newTotalImpactEarned 
        });

        // Create impact via 1ClickImpact API
        let impactCreated = false;
        let impactId = null;
        
        try {
          const impactResult = await oneClickImpactService.createImpact({
            action: habit.impactAction as any,
            amount: habit.impactAmount,
          }, `${habit.name} completion - Streak: ${newStreak}`);
          
          if (impactResult.success) {
            impactCreated = true;
            impactId = impactResult.impact_id;
            
            // Update completion record
            await storage.updateHabitCompletion(completion.id, {
              impactCreated: true,
              impactId: impactId,
              impactAction: habit.impactAction,
              impactAmount: habit.impactAmount,
            });
            
            // Update user's impact stats (for trees planted specifically)
            const user = await storage.getUser(userId);
            if (user && habit.impactAction === 'plant_tree') {
              await storage.updateUserStats(
                userId,
                user.treesPlanted + habit.impactAmount,
                user.currentStreak + 1,
                Math.max(user.longestStreak, user.currentStreak + 1)
              );
            }
          }
        } catch (impactError) {
          console.error("Failed to create impact:", impactError);
          // Continue without failing the habit completion
        }

        res.json({ 
          completed: true, 
          impactCreated,
          impactId,
          impactAction: habit.impactAction,
          impactAmount: habit.impactAmount,
          streak: newStreak,
          message: impactCreated ? `Habit completed and ${habit.impactAction.replace('_', ' ')} impact created!` : "Habit completed (impact creation failed)"
        });
      }
    } catch (error) {
      console.error("Toggle habit error:", error);
      res.status(500).json({ message: "Failed to toggle habit completion" });
    }
  });

  // Get habit history (protected route)
  app.get("/api/habits/:habitId/history", isAuthenticated, async (req, res) => {
    try {
      const { habitId } = req.params;
      const completions = await storage.getHabitCompletions(habitId);
      res.json(completions);
    } catch (error) {
      console.error("Get habit history error:", error);
      res.status(500).json({ message: "Failed to get habit history" });
    }
  });

  // Delete habit (protected route)
  app.delete("/api/habits/:habitId", isAuthenticated, async (req, res) => {
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

  // Get available impact types
  app.get("/api/impact-types", async (req, res) => {
    try {
      const impactTypes = await oneClickImpactService.getImpactTypes();
      res.json(impactTypes);
    } catch (error) {
      console.error("Get impact types error:", error);
      res.status(500).json({ message: "Failed to get impact types" });
    }
  });

  // Get recent impact entries (protected route)
  app.get("/api/recent-impact", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const recentImpact = await storage.getRecentImpactEntries(userId, 5);
      res.json(recentImpact);
    } catch (error) {
      console.error("Get recent impact error:", error);
      res.status(500).json({ message: "Failed to get recent impact" });
    }
  });

  // Get full impact timeline (protected route)
  app.get("/api/impact-timeline", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any).claims.sub;
      const timeline = await storage.getImpactTimeline(userId);
      res.json(timeline);
    } catch (error) {
      console.error("Get impact timeline error:", error);
      res.status(500).json({ message: "Failed to get impact timeline" });
    }
  });

  // Analytics data
  app.get('/api/analytics', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const habits = await storage.getHabitsByUserId(userId);
      const completions = await storage.getHabitCompletionsByUserId(userId);
      
      // Calculate impact summary
      const impactSummary = {
        totalTrees: 0,
        totalOceanCleaned: 0,
        totalCarbonCaptured: 0,
        totalDonated: 0
      };
      
      habits.forEach(habit => {
        switch (habit.impactAction) {
          case 'plant_tree':
            impactSummary.totalTrees += habit.totalImpactEarned;
            break;
          case 'clean_ocean':
            impactSummary.totalOceanCleaned += habit.totalImpactEarned;
            break;
          case 'capture_carbon':
            impactSummary.totalCarbonCaptured += habit.totalImpactEarned;
            break;
          case 'donate_money':
            impactSummary.totalDonated += habit.totalImpactEarned; // Already in dollars
            break;
        }
      });

      res.json({
        habits,
        impactSummary,
        totalCompletions: completions.length
      });
    } catch (error) {
      console.error("Get analytics error:", error);
      res.status(500).json({ message: "Failed to get analytics data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
