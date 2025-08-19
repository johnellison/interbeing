import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { greensparkService } from "./services/greensparkService";
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
          case 'rescue_plastic':
            acc.plasticRescued += amount;
            break;
          case 'offset_carbon':
            acc.carbonOffset += amount;
            break;
          case 'plant_kelp':
            acc.kelpPlanted += amount;
            break;
          case 'provide_water':
            acc.waterProvided += amount;
            break;
          case 'sponsor_bees':
            acc.beesSponsored += amount;
            break;
        }
        return acc;
      }, { 
        treesPlanted: 0, 
        plasticRescued: 0, 
        carbonOffset: 0, 
        kelpPlanted: 0, 
        waterProvided: 0, 
        beesSponsored: 0 
      });

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
        co2Offset: totalImpact.carbonOffset + (totalImpact.treesPlanted * 22),
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
          const impactResult = await greensparkService.createImpact({
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
      const impactTypes = await greensparkService.getImpactTypes();
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

  // Get projects by impact type
  app.get("/api/projects/:impactType", isAuthenticated, async (req, res) => {
    try {
      const { impactType } = req.params;
      const projects = await greensparkService.getProjectsByType(impactType);
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects by type:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get specific project details
  app.get("/api/project/:projectId", isAuthenticated, async (req, res) => {
    try {
      const { projectId } = req.params;
      const project = await greensparkService.getProjectDetails(projectId);
      res.json(project);
    } catch (error) {
      console.error("Error fetching project details:", error);
      res.status(500).json({ message: "Failed to fetch project details" });
    }
  });

  // Diagnostic endpoint for Greenspark API troubleshooting
  app.get("/api/greenspark-diagnostic", isAuthenticated, async (req, res) => {
    const diagnosticResult = {
      timestamp: new Date().toISOString(),
      apiKeyConfigured: !!process.env.GREENSPARK_API_KEY,
      apiKeyPrefix: process.env.GREENSPARK_API_KEY ? process.env.GREENSPARK_API_KEY.substring(0, 8) + '...' : 'not configured',
      sdkVersion: '1.4.0',
      baseUrl: 'https://demo.getgreenspark.com',
      tests: []
    };

    // Test 1: Basic API connection
    try {
      console.log('=== Greenspark API Diagnostic Started ===');
      const projects = await greensparkService.getProjectsByType('plant_tree');
      
      diagnosticResult.tests.push({
        test: 'getProjectsByType',
        success: true,
        projectCount: projects.length,
        hasValidImages: projects.filter(p => p.imageUrl && p.imageUrl.startsWith('http')).length,
        sampleProject: projects.length > 0 ? {
          name: projects[0].name || 'unnamed',
          hasImageUrl: !!projects[0].imageUrl,
          imageUrl: projects[0].imageUrl || 'none',
          registryLink: projects[0].registryLink || 'none'
        } : null
      });

      console.log(`Greenspark API test: ${projects.length} projects found`);
    } catch (error: any) {
      diagnosticResult.tests.push({
        test: 'getProjectsByType',
        success: false,
        error: error.message,
        isHtmlResponse: error.message.includes('<!doctype html>') || error.message.includes('<html')
      });
      console.error('Greenspark API test failed:', error.message);
    }

    // Test 2: API validation
    try {
      const isValid = await greensparkService.validateApiKey();
      diagnosticResult.tests.push({
        test: 'validateApiKey',
        success: isValid,
        result: isValid ? 'API key is valid' : 'API key validation failed'
      });
    } catch (error: any) {
      diagnosticResult.tests.push({
        test: 'validateApiKey',
        success: false,
        error: error.message
      });
    }

    // Test 3: Alternative endpoint testing
    try {
      const alternativeResults = await greensparkService.testAlternativeEndpoints();
      diagnosticResult.tests.push({
        test: 'alternativeEndpoints',
        success: alternativeResults.some(r => r.success),
        results: alternativeResults,
        workingEndpoints: alternativeResults.filter(r => r.success)
      });
    } catch (error: any) {
      diagnosticResult.tests.push({
        test: 'alternativeEndpoints',
        success: false,
        error: error.message
      });
    }

    console.log('=== Greenspark API Diagnostic Completed ===');
    res.json(diagnosticResult);
  });

  // Get impact locations for global map (enhanced with real project data)
  app.get("/api/impact-locations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Fetch real project data from Greenspark API
      let realProjectData: Record<string, any> = {};
      try {
        const allImpactTypes = ['plant_tree', 'sponsor_bees', 'plant_kelp', 'rescue_plastic', 'offset_carbon', 'provide_water'];
        console.log('Fetching real environmental projects from Greenspark API...');
        
        for (const impactType of allImpactTypes) {
          const projects = await greensparkService.getProjectsByType(impactType);
          if (projects.length > 0) {
            // Use the first project for this impact type
            realProjectData[impactType] = projects[0];
            console.log(`Found ${projects.length} ${impactType} projects - using: ${projects[0].name}`);
          }
        }
        
        const projectCount = Object.keys(realProjectData).length;
        if (projectCount > 0) {
          console.log(`Successfully loaded ${projectCount} real environmental projects from Greenspark API`);
        } else {
          console.warn('No projects retrieved from Greenspark API');
        }
      } catch (error: any) {
        console.error('Failed to fetch real project data from Greenspark API:', error?.message || 'Unknown error');
      }
      
      // Use real Greenspark project data when available
      const getProjectData = (impactType: string, fallbackName: string, fallbackDesc: string, fallbackRegistry: string, fallbackImage: string) => {
        const realProject = realProjectData[impactType];
        if (realProject) {
          console.log(`Using real project data for ${impactType}: ${realProject.name}`);
          return {
            projectName: realProject.name || fallbackName,
            projectDescription: realProject.description || fallbackDesc,
            registryLink: realProject.registryLink || fallbackRegistry,
            imageUrl: realProject.imageUrl || fallbackImage,
            projectId: realProject.projectId,
            dataSource: "greenspark-api"
          };
        }
        console.log(`Using fallback data for ${impactType}`);
        return {
          projectName: fallbackName,
          projectDescription: fallbackDesc,
          registryLink: fallbackRegistry,
          imageUrl: fallbackImage,
          projectId: `fallback-${impactType}-001`,
          dataSource: "curated"
        };
      };

      const impactLocations = [
        {
          id: "kenya-trees",
          country: "Kenya",
          region: "Central Kenya",
          coordinates: [37.0902, -0.0236],
          impactType: "plant_tree",
          totalAmount: 45,
          unit: "trees planted",
          completionCount: 12,
          ...getProjectData(
            "plant_tree",
            "Kenya Forest Restoration",
            "Restoring indigenous forests in the Mount Kenya region to combat deforestation and support local communities.",
            "https://www.goldstandard.org/projects/kenya-forest-restoration",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
          )
        },
        {
          id: "kenya-bees",
          country: "Kenya", 
          region: "Western Kenya",
          coordinates: [34.7519, 0.0236],
          impactType: "sponsor_bees",
          totalAmount: 60,
          unit: "bees protected",
          completionCount: 3,
          ...getProjectData(
            "sponsor_bees",
            "EarthLungs Pollinator Project",
            "Creating pollinator habitats and fostering biodiversity. Supporting bee conservation in Kenya through partnership with EarthLungs.",
            "https://earthlungs.org/pollinator-project",
            "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800&q=80"
          )
        },
        {
          id: "bali-kelp",
          country: "Indonesia",
          region: "Bali",
          coordinates: [115.0920, -8.4095],
          impactType: "plant_kelp",
          totalAmount: 25,
          unit: "kelp plants",
          completionCount: 8,
          ...getProjectData(
            "plant_kelp",
            "Bali Marine Restoration",
            "Restoring kelp forests around Bali to support marine biodiversity and protect coral reef ecosystems.",
            "https://www.bluecarbon.org/bali-marine-restoration",
            "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
          )
        },
        {
          id: "mexico-plastic",
          country: "Mexico",
          region: "Yucatan Peninsula",
          coordinates: [-87.7289, 20.6296],
          impactType: "rescue_plastic",
          totalAmount: 180,
          unit: "bottles collected",
          completionCount: 15,
          ...getProjectData(
            "rescue_plastic",
            "Caribbean Ocean Cleanup",
            "Removing plastic waste from Caribbean waters to protect marine life and preserve ocean ecosystems.",
            "https://www.plasticbank.com/projects/caribbean-cleanup",
            "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80"
          )
        },
        {
          id: "brazil-carbon",
          country: "Brazil",
          region: "Amazon Basin",
          coordinates: [-60.0261, -3.4653],
          impactType: "offset_carbon",
          totalAmount: 320,
          unit: "kg CO₂ offset",
          completionCount: 22,
          ...getProjectData(
            "offset_carbon",
            "Amazon Carbon Sequestration",
            "Protecting existing rainforest and supporting reforestation efforts to capture atmospheric carbon.",
            "https://registry.verra.org/amazon-carbon-project",
            "https://images.unsplash.com/photo-1554990349-170b9e4bdf3b?w=800&q=80"
          )
        },
        {
          id: "ethiopia-water",
          country: "Ethiopia",
          region: "Tigray Region",
          coordinates: [39.4759, 14.2681],
          impactType: "provide_water",
          totalAmount: 2500,
          unit: "days of clean water",
          completionCount: 18,
          ...getProjectData(
            "provide_water",
            "Clean Water Access Initiative",
            "Building wells and water purification systems to provide clean drinking water to rural communities.",
            "https://www.charitywater.org/projects/ethiopia-wells",
            "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
          )
        }
      ];

      res.json(impactLocations);
    } catch (error) {
      console.error("Error fetching impact locations:", error);
      res.status(500).json({ message: "Failed to fetch impact locations" });
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
        totalPlasticRescued: 0,
        totalCarbonOffset: 0
      };
      
      habits.forEach(habit => {
        switch (habit.impactAction) {
          case 'plant_tree':
            impactSummary.totalTrees += habit.totalImpactEarned;
            break;
          case 'rescue_plastic':
            impactSummary.totalPlasticRescued += habit.totalImpactEarned;
            break;
          case 'offset_carbon':
            impactSummary.totalCarbonOffset += habit.totalImpactEarned;
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
