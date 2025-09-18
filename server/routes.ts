import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { greensparkService } from "./services/greensparkService";
import { insertHabitSchema, updateHabitSchema, insertHabitCompletionSchema, onboardingProfileSchema, celebrationPrefsSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { AIOnboardingService } from "./services/aiService";
import { CelebrationAIService } from "./services/celebrationAIService";
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

  // Get featured Greenspark projects for landing page
  app.get("/api/featured-projects", async (req, res) => {
    try {
      console.log('Fetching featured Greenspark projects for landing page');
      
      // Fetch projects for the three organizations mentioned on landing page
      const [treeProjects, plasticProjects, beeProjects] = await Promise.all([
        greensparkService.getProjectsByType('plant_tree'),
        greensparkService.getProjectsByType('rescue_plastic'), 
        greensparkService.getProjectsByType('sponsor_bees')
      ]);

      // Find specific projects by searching for organization names
      const americanForestsProject = treeProjects.find(p => 
        p.name?.toLowerCase().includes('american forests') || 
        p.description?.toLowerCase().includes('american forests') ||
        p.description?.toLowerCase().includes('oregon') ||
        p.name?.toLowerCase().includes('wildfire')
      ) || treeProjects[0];

      const plasticBankProject = plasticProjects.find(p => 
        p.name?.toLowerCase().includes('plastic bank') ||
        p.description?.toLowerCase().includes('plastic bank') ||
        p.description?.toLowerCase().includes('ocean-bound plastic')
      ) || plasticProjects[0];

      const earthLungsProject = beeProjects.find(p => 
        p.name?.toLowerCase().includes('earthlungs') || 
        p.name?.toLowerCase().includes('earth lungs') ||
        p.description?.toLowerCase().includes('earthlungs') ||
        p.description?.toLowerCase().includes('kenya') ||
        p.description?.toLowerCase().includes('pollinator')
      ) || beeProjects[0];

      const featuredProjects = [
        {
          id: 'american-forests',
          name: 'American Forests',
          title: 'Wildfire Forest Restoration',
          description: americanForestsProject?.description || 'Restoring Oregon\'s wildfire-affected areas with native Pacific Northwest trees',
          emoji: '🌲',
          impactType: 'plant_tree',
          imageUrl: americanForestsProject?.imageUrl || null,
          registryLink: americanForestsProject?.registryLink || americanForestsProject?.link || null,
          location: americanForestsProject?.location || (americanForestsProject?.countries && americanForestsProject.countries[0]) || 'Global',
          projectName: americanForestsProject?.name || null
        },
        {
          id: 'plastic-bank', 
          name: 'Plastic Bank',
          title: 'Ocean-Bound Plastic Recovery',
          description: plasticBankProject?.description || 'Transforming ocean-bound plastic waste into empowering income globally',
          emoji: '🌊',
          impactType: 'rescue_plastic',
          imageUrl: plasticBankProject?.imageUrl || null,
          registryLink: plasticBankProject?.registryLink || plasticBankProject?.link || null,
          location: plasticBankProject?.location || (plasticBankProject?.countries && plasticBankProject.countries[0]) || 'Global',
          projectName: plasticBankProject?.name || null
        },
        {
          id: 'earthlungs-kenya',
          name: 'EarthLungs Kenya', 
          title: 'Pollinator Habitat Conservation',
          description: earthLungsProject?.description || 'Creating pollinator habitats and fostering biodiversity through bee conservation',
          emoji: '🐝',
          impactType: 'sponsor_bees',
          imageUrl: earthLungsProject?.imageUrl || null,
          registryLink: earthLungsProject?.registryLink || earthLungsProject?.link || null,
          location: earthLungsProject?.location || (earthLungsProject?.countries && earthLungsProject.countries[0]) || 'Global',
          projectName: earthLungsProject?.name || null
        }
      ];

      console.log(`Successfully fetched ${featuredProjects.length} featured projects`);
      res.json(featuredProjects);
    } catch (error: any) {
      console.error('Error fetching featured projects:', error);
      res.status(500).json({ 
        message: 'Failed to fetch featured projects',
        error: error.message 
      });
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
      
      // Get date from query parameter, default to today
      const dateParam = req.query.date as string;
      const selectedDate = dateParam ? new Date(dateParam) : new Date();
      
      // Use specific date completions if date provided, otherwise today's completions
      const dayCompletions = await storage.getCompletionsByDate(userId, selectedDate);
      
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
        
        // Get detailed completion information with habit categories
        const completionDetails = dayCompletions.map(completion => {
          const habit = habits.find(h => h.id === completion.habitId);
          return {
            habitId: completion.habitId,
            habitName: habit?.name || 'Unknown',
            category: habit?.category || 'wellness'
          };
        });
        
        const dayName = date.toLocaleDateString('en', { weekday: 'short' });
        weeklyProgress.push({
          day: dayName,
          completed: dayCompletions.length,
          total: habits.length,
          isToday: i === 0,
          completions: completionDetails
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
          completedToday: dayCompletions.some((c: any) => c.habitId === habit.id),
        })),
        todayCompletions: dayCompletions.length,
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

  // Update habit (protected route)
  app.put("/api/habits/:id", isAuthenticated, async (req: any, res) => {
    try {
      const habitId = req.params.id;
      const userId = req.user.claims.sub;
      
      // Verify habit belongs to user
      const existingHabit = await storage.getHabitById(habitId);
      if (!existingHabit || existingHabit.userId !== userId) {
        return res.status(404).json({ message: "Habit not found" });
      }
      
      const validatedData = updateHabitSchema.parse(req.body);
      const updatedHabit = await storage.updateHabit(habitId, validatedData);
      
      res.json(updatedHabit);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid habit data", errors: error.errors });
      }
      console.error("Update habit error:", error);
      res.status(500).json({ message: "Failed to update habit" });
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
      
      // Authorization check - ensure habit belongs to user
      if (habit.userId !== userId) {
        return res.status(404).json({ message: "Habit not found" });
      }

      // Get date from query parameter, default to today
      const dateParam = req.query.date as string;
      let selectedDate: Date;
      
      if (dateParam) {
        selectedDate = new Date(dateParam);
        if (isNaN(selectedDate.getTime())) {
          return res.status(400).json({ message: "Invalid date parameter" });
        }
      } else {
        selectedDate = new Date();
      }
      
      // Normalize to start of day
      selectedDate.setHours(0, 0, 0, 0);
      
      // Check if already completed on selected date
      const dayCompletions = await storage.getCompletionsByDate(userId, selectedDate);
      const existingCompletion = dayCompletions.find(c => c.habitId === habitId);

      if (existingCompletion) {
        // Uncomplete the habit
        await storage.deleteHabitCompletion(existingCompletion.id);
        
        // Update habit streak (decrement) - only for today's completions
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = selectedDate.getTime() === today.getTime();
        
        if (isToday) {
          const newStreak = Math.max(0, habit.streak - 1);
          await storage.updateHabit(habitId, { streak: newStreak });
        }
        
        res.json({ completed: false, message: "Habit uncompleted" });
      } else {
        // Complete the habit
        const completion = await storage.createHabitCompletion({
          habitId,
          userId,
          completedAt: selectedDate,
        });

        // Update habit streak and impact earned (only for today's completions)
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isToday = selectedDate.getTime() === today.getTime();
        
        let newStreak = habit.streak;
        let newTotalImpactEarned = habit.totalImpactEarned;
        
        if (isToday) {
          newStreak = habit.streak + 1;
          newTotalImpactEarned = habit.totalImpactEarned + habit.impactAmount;
          await storage.updateHabit(habitId, { 
            streak: newStreak, 
            totalImpactEarned: newTotalImpactEarned 
          });
        } else {
          // For historical dates, still add to total impact but don't update streak
          newTotalImpactEarned = habit.totalImpactEarned + habit.impactAmount;
          await storage.updateHabit(habitId, { 
            totalImpactEarned: newTotalImpactEarned 
          });
        }

        // Create impact via Greenspark API (only for today's completions)
        let impactCreated = false;
        let impactId = null;
        
        if (isToday) {
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
        }

        // Fetch project information for the celebration modal
        let projectInfo = null;
        if (impactCreated) {
          try {
            const projects = await greensparkService.getProjectsByType(habit.impactAction);
            if (projects.length > 0) {
              const project = projects[0]; // Use the first (most relevant) project
              projectInfo = {
                name: project.name,
                description: project.description,
                location: project.countries?.length > 0 ? project.countries[0] : 'Global',
                imageUrl: project.imageUrl,
                registryLink: project.link
              };
            }
          } catch (projectError) {
            console.error("Failed to fetch project info:", projectError);
          }
        }

        // Return immediate response for instant modal
        res.json({ 
          completed: true, 
          impactCreated,
          impactId,
          impactAction: habit.impactAction,
          impactAmount: habit.impactAmount,
          streak: newStreak,
          projectInfo,
          message: impactCreated ? `Habit completed and ${habit.impactAction.replace('_', ' ')} impact created!` : "Habit completed (impact creation failed)"
        });

        // Generate personalized AI celebration message asynchronously (non-blocking)
        setImmediate(async () => {
          try {
            const celebrationContext = await CelebrationAIService.getCelebrationContext(
              habit.name,
              newStreak,
              habit.impactAction,
              habit.impactAmount,
              projectInfo,
              userId,
              storage
            );
            const celebrationMessage = await CelebrationAIService.generateCelebrationMessage(celebrationContext);
            
            // Store the generated message for potential future retrieval or real-time updates
            // For now, we'll rely on the frontend's fallback approach
            console.log('AI celebration generated:', celebrationMessage.title);
          } catch (celebrationError) {
            console.error("Failed to generate AI celebration:", celebrationError);
          }
        });
      }
    } catch (error) {
      console.error("Toggle habit error:", error);
      res.status(500).json({ message: "Failed to toggle habit completion" });
    }
  });

  // Get AI celebration message for recent habit completion (protected route)
  app.get("/api/habits/:habitId/celebration", isAuthenticated, async (req, res) => {
    try {
      const { habitId } = req.params;
      const userId = (req.user as any)?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const habit = await storage.getHabit(habitId);
      if (!habit || habit.userId !== userId) {
        return res.status(404).json({ message: "Habit not found" });
      }

      // Get the most recent completion for streak calculation
      const completions = await storage.getHabitCompletions(habitId);
      const currentStreak = habit.streak || 1;

      // Fetch project information
      let projectInfo = null;
      try {
        const projects = await greensparkService.getProjectsByType(habit.impactAction);
        if (projects.length > 0) {
          const project = projects[0];
          projectInfo = {
            name: project.name,
            description: project.description,
            location: project.countries?.length > 0 ? project.countries[0] : 'Global',
            imageUrl: project.imageUrl,
            registryLink: project.link
          };
        }
      } catch (projectError) {
        console.error("Failed to fetch project info:", projectError);
      }

      // Generate personalized AI celebration message
      try {
        const celebrationContext = await CelebrationAIService.getCelebrationContext(
          habit.name,
          currentStreak,
          habit.impactAction,
          habit.impactAmount,
          projectInfo,
          userId,
          storage
        );
        const celebrationMessage = await CelebrationAIService.generateCelebrationMessage(celebrationContext);
        
        res.json({ 
          celebrationMessage,
          projectInfo 
        });
      } catch (celebrationError) {
        console.error("Failed to generate AI celebration:", celebrationError);
        res.status(500).json({ message: "Failed to generate celebration message" });
      }
    } catch (error) {
      console.error("Get celebration error:", error);
      res.status(500).json({ message: "Failed to get celebration" });
    }
  });

  // Pre-load celebration messages for all user habits (protected route)
  app.get("/api/habits/preload-celebrations", isAuthenticated, async (req, res) => {
    try {
      const userId = (req.user as any)?.claims?.sub;
      
      if (!userId) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // Get all user habits
      const habits = await storage.getHabitsByUserId(userId);
      
      if (!habits || habits.length === 0) {
        return res.json({ preloadedCelebrations: {} });
      }

      // Generate celebration messages for all habits in parallel
      const preloadedCelebrations: Record<string, any> = {};
      const celebrationPromises = habits.map(async (habit: any) => {
        try {
          // Fetch project information
          let projectInfo = null;
          try {
            const projects = await greensparkService.getProjectsByType(habit.impactAction);
            if (projects.length > 0) {
              const project = projects[0];
              projectInfo = {
                name: project.name,
                description: project.description,
                location: project.countries?.length > 0 ? project.countries[0] : 'Global',
                imageUrl: project.imageUrl,
                registryLink: project.link
              };
            }
          } catch (projectError) {
            console.error(`Failed to fetch project info for habit ${habit.id}:`, projectError);
          }

          // Generate celebration message
          const currentStreak = habit.streak || 1;
          const celebrationContext = await CelebrationAIService.getCelebrationContext(
            habit.name,
            currentStreak,
            habit.impactAction,
            habit.impactAmount,
            projectInfo,
            userId,
            storage
          );
          
          const celebrationMessage = await CelebrationAIService.generateCelebrationMessage(celebrationContext);
          
          return {
            habitId: habit.id,
            celebrationMessage,
            projectInfo
          };
        } catch (error) {
          console.error(`Failed to generate celebration for habit ${habit.id}:`, error);
          return {
            habitId: habit.id,
            celebrationMessage: {
              title: "Great Work!",
              message: `Excellent work completing "${habit.name}"! You're making a positive impact while building great habits. 🌟`,
              motivationalNote: "Keep going!",
            },
            projectInfo: null
          };
        }
      });

      const results = await Promise.all(celebrationPromises);
      
      // Convert to object keyed by habitId
      results.forEach((result: any) => {
        preloadedCelebrations[result.habitId] = {
          celebrationMessage: result.celebrationMessage,
          projectInfo: result.projectInfo
        };
      });

      console.log(`Pre-loaded ${results.length} celebration messages for user ${userId}`);
      res.json({ preloadedCelebrations });
      
    } catch (error) {
      console.error("Pre-load celebrations error:", error);
      res.status(500).json({ message: "Failed to pre-load celebration messages" });
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
      
      // Enhance impact entries with project location data
      const enhancedImpact = await Promise.all(
        recentImpact.map(async (entry) => {
          try {
            // Get project data for this impact type
            const projects = await greensparkService.getProjectsByType(entry.impactAction);
            
            if (projects && projects.length > 0) {
              // Use first matching project for location
              const project = projects[0];
              const location = project.location || 
                              (project.countries && project.countries[0]) || 
                              'Global Location';
              
              // Clean up location format
              const cleanLocation = location.replace(/^USA - /, '').replace(/^([^,]+),.*/, '$1');
              
              return {
                ...entry,
                projectLocation: cleanLocation
              };
            }
            
            return {
              ...entry,
              projectLocation: 'Global Location'
            };
          } catch (error) {
            console.warn(`Failed to get location for ${entry.impactAction}:`, error);
            return {
              ...entry,
              projectLocation: 'Global Location'
            };
          }
        })
      );
      
      res.json(enhancedImpact);
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
      tests: [] as any[]
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

  // Onboarding conversation endpoints
  app.post("/api/onboarding/message", isAuthenticated, async (req: any, res) => {
    try {
      const { message, conversationState } = req.body;
      const userId = req.user.claims.sub;
      
      // Get user data to access their first name
      const user = await storage.getUser(userId);
      const userName = user?.firstName || undefined;
      
      // Process the message with AI service
      const result = await AIOnboardingService.processMessage(message, conversationState, userName);
      
      res.json(result);
    } catch (error: any) {
      console.error('Onboarding message error:', error);
      res.status(500).json({ 
        error: 'Failed to process message',
        fallback: "I'm having trouble right now. Could you try again?"
      });
    }
  });

  app.post("/api/onboarding/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { onboardingProfile, celebrationPrefs } = req.body;
      const userId = req.user.claims.sub;
      
      // Validate the data
      const validatedProfile = onboardingProfileSchema.parse(onboardingProfile);
      const validatedPrefs = celebrationPrefsSchema.parse(celebrationPrefs || {});
      
      // Update user profile
      await storage.updateUser(userId, {
        onboardingCompleted: true,
        onboardingProfile: validatedProfile,
        celebrationPrefs: validatedPrefs
      });
      
      // Generate habits from selected behaviors
      if (validatedProfile.selectedBehaviors && validatedProfile.selectedBehaviors.length > 0) {
        const habitData = await AIOnboardingService.generateHabitsFromBehaviors(validatedProfile.selectedBehaviors);
        
        const createdHabits = [];
        for (const habit of habitData) {
          const createdHabit = await storage.createHabit({
            userId,
            name: habit.name,
            description: habit.description,
            icon: habit.icon,
            category: habit.category,
            impactAction: habit.impactAction as any,
            impactAmount: habit.impactAmount,
            isActive: true
          });
          createdHabits.push(createdHabit);
        }
        
        res.json({ 
          success: true, 
          habitsCreated: createdHabits.length,
          habits: createdHabits
        });
      } else {
        res.json({ success: true, habitsCreated: 0 });
      }
      
    } catch (error: any) {
      console.error('Onboarding completion error:', error);
      res.status(500).json({ error: 'Failed to complete onboarding' });
    }
  });

  app.get("/api/user/profile", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUserById(userId);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        onboardingCompleted: user.onboardingCompleted,
        onboardingProfile: user.onboardingProfile,
        celebrationPrefs: user.celebrationPrefs
      });
    } catch (error: any) {
      console.error('Get user profile error:', error);
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  });

  // Get impact locations for global map (enhanced with real project data)
  app.get("/api/impact-locations", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      
      // Fetch real project data from Greenspark API with uniqueness tracking
      let realProjectData: Record<string, any> = {};
      let usedProjectIds = new Set<string>();
      
      try {
        const allImpactTypes = ['plant_tree', 'sponsor_bees', 'plant_kelp', 'rescue_plastic', 'offset_carbon', 'provide_water'];
        console.log('Fetching unique environmental projects from Greenspark API...');
        
        for (const impactType of allImpactTypes) {
          const projects = await greensparkService.getProjectsByType(impactType);
          
          // Find first project that hasn't been used yet
          let selectedProject = null;
          for (const project of projects) {
            const projectId = project.projectId || project.id;
            if (!usedProjectIds.has(projectId)) {
              selectedProject = project;
              usedProjectIds.add(projectId);
              break;
            }
          }
          
          if (selectedProject) {
            realProjectData[impactType] = selectedProject;
            console.log(`Found ${projects.length} ${impactType} projects - using unique project: ${selectedProject.name}`);
          } else if (projects.length > 0) {
            // Fallback to first project if all are used (shouldn't happen with enough diversity)
            realProjectData[impactType] = projects[0];
            console.log(`Using ${impactType} project (no unique available): ${projects[0].name}`);
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
      
      // Use real Greenspark project data when available, with proper location override
      const getProjectData = (impactType: string, fallbackName: string, fallbackDesc: string, fallbackRegistry: string, fallbackImage: string, templateRegion: string, templateCountry: string) => {
        const realProject = realProjectData[impactType];
        if (realProject) {
          console.log(`Using real project data for ${impactType}: ${realProject.name}`);
          // Extract real location from API project
          const realLocation = realProject.location || (realProject.countries && realProject.countries[0]) || `${templateRegion}, ${templateCountry}`;
          const [region, country] = realLocation.includes(',') ? realLocation.split(',').map((s: string) => s.trim()) : [realLocation, realLocation];
          
          return {
            projectName: realProject.name || fallbackName,
            projectDescription: realProject.description || fallbackDesc,
            registryLink: realProject.registryLink || fallbackRegistry,
            imageUrl: realProject.imageUrl || fallbackImage,
            projectId: realProject.projectId,
            dataSource: "greenspark-api",
            // Override template location with real project location
            realRegion: region,
            realCountry: country,
            realCoordinates: realProject.coordinates
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

      // Build impact locations using real API data
      const impactLocations = [];
      
      // Create unique projects for each impact type
      const impactProjects = [
        {
          id: "project-trees",
          impactType: "plant_tree",
          templateCountry: "Kenya",
          templateRegion: "Central Kenya", 
          templateCoords: [37.0902, -0.0236],
          totalAmount: 45,
          unit: "trees planted",
          completionCount: 12,
          fallbacks: {
            name: "Kenya Forest Restoration",
            description: "Restoring indigenous forests in the Mount Kenya region to combat deforestation and support local communities.",
            registry: "https://www.goldstandard.org/projects/kenya-forest-restoration",
            image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&q=80"
          }
        },
        {
          id: "project-bees",
          impactType: "sponsor_bees",
          templateCountry: "Kenya",
          templateRegion: "Western Kenya",
          templateCoords: [34.7519, 0.0236],
          totalAmount: 60,
          unit: "bees protected",
          completionCount: 3,
          fallbacks: {
            name: "EarthLungs Pollinator Project",
            description: "Creating pollinator habitats and fostering biodiversity. Supporting bee conservation in Kenya through partnership with EarthLungs.",
            registry: "https://earthlungs.org/pollinator-project",
            image: "https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=800&q=80"
          }
        },
        {
          id: "project-kelp",
          impactType: "plant_kelp",
          templateCountry: "Indonesia",
          templateRegion: "Bali",
          templateCoords: [115.0920, -8.4095],
          totalAmount: 25,
          unit: "kelp plants", 
          completionCount: 8,
          fallbacks: {
            name: "Bali Marine Restoration",
            description: "Restoring kelp forests around Bali to support marine biodiversity and protect coral reef ecosystems.",
            registry: "https://www.bluecarbon.org/bali-marine-restoration",
            image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80"
          }
        },
        {
          id: "project-plastic",
          impactType: "rescue_plastic", 
          templateCountry: "Mexico",
          templateRegion: "Yucatan Peninsula",
          templateCoords: [-87.7289, 20.6296],
          totalAmount: 180,
          unit: "bottles collected",
          completionCount: 15,
          fallbacks: {
            name: "Caribbean Ocean Cleanup",
            description: "Removing plastic waste from Caribbean waters to protect marine life and preserve ocean ecosystems.",
            registry: "https://www.plasticbank.com/projects/caribbean-cleanup", 
            image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&q=80"
          }
        },
        {
          id: "project-carbon",
          impactType: "offset_carbon",
          templateCountry: "Brazil", 
          templateRegion: "Amazon Basin",
          templateCoords: [-60.0261, -3.4653],
          totalAmount: 320,
          unit: "kg CO₂ offset",
          completionCount: 22,
          fallbacks: {
            name: "Amazon Carbon Sequestration",
            description: "Protecting existing rainforest and supporting reforestation efforts to capture atmospheric carbon.",
            registry: "https://registry.verra.org/amazon-carbon-project",
            image: "https://images.unsplash.com/photo-1554990349-170b9e4bdf3b?w=800&q=80"
          }
        },
        {
          id: "project-water",
          impactType: "provide_water",
          templateCountry: "Ethiopia",
          templateRegion: "Tigray Region", 
          templateCoords: [39.4759, 14.2681],
          totalAmount: 2500,
          unit: "days of clean water",
          completionCount: 18,
          fallbacks: {
            name: "Clean Water Access Initiative",
            description: "Building wells and water purification systems to provide clean drinking water to rural communities.",
            registry: "https://www.charitywater.org/projects/ethiopia-wells",
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80"
          }
        }
      ];

      // Build final impact locations array with correct data priority
      for (const template of impactProjects) {
        const projectData = getProjectData(
          template.impactType,
          template.fallbacks.name,
          template.fallbacks.description, 
          template.fallbacks.registry,
          template.fallbacks.image,
          template.templateRegion,
          template.templateCountry
        );

        // Use real project coordinates if available, otherwise template coordinates
        const finalCoords = projectData.realCoordinates || template.templateCoords;
        const finalRegion = projectData.realRegion || template.templateRegion;
        const finalCountry = projectData.realCountry || template.templateCountry;

        impactLocations.push({
          id: template.id,
          country: finalCountry,
          region: finalRegion,
          coordinates: finalCoords,
          impactType: template.impactType,
          totalAmount: template.totalAmount,
          unit: template.unit,
          completionCount: template.completionCount,
          projectName: projectData.projectName,
          projectDescription: projectData.projectDescription,
          registryLink: projectData.registryLink,
          imageUrl: projectData.imageUrl,
          projectId: projectData.projectId,
          dataSource: projectData.dataSource
        });
      }

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
