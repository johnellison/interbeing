import OpenAI from "openai";
import { CelebrationPrefs } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface CelebrationContext {
  habitName: string;
  streak: number;
  impactAction: 'plant_tree' | 'rescue_plastic' | 'offset_carbon' | 'plant_kelp' | 'provide_water' | 'sponsor_bees';
  impactAmount: number;
  projectInfo?: {
    name: string;
    description: string;
    location: string;
  };
  userAspiration?: string;
  userContext?: string;
  emotionalFeedbackHistory?: number[]; // Recent emotional ratings 1-5
  celebrationPrefs?: CelebrationPrefs;
  userName?: string; // User's first name for personalization
}

interface CelebrationMessage {
  title: string;
  message: string;
  motivationalNote: string;
  progressInsight?: string;
}

export class CelebrationAIService {
  private static getPersonalityPrompt(personalityTone: string): string {
    const personalityMap = {
      warm: "Be warm, encouraging, and personally supportive. Use gentle language that feels like a caring friend celebrating with them.",
      direct: "Be clear, straightforward, and focused on results. Acknowledge their achievement efficiently and point out tangible progress.",
      playful: "Be enthusiastic, fun, and energetic! Use engaging language with appropriate emojis and celebrate with genuine excitement.",
      scientist: "Be analytical and data-driven. Focus on the measurable impact, patterns, and evidence-based benefits of their consistency."
    };
    return personalityMap[personalityTone as keyof typeof personalityMap] || personalityMap.warm;
  }

  private static getStylePrompt(style: string): string {
    const styleMap = {
      minimal: "Keep it concise and focused. 1-2 sentences for title, 2-3 sentences for message, 1 sentence for motivation.",
      standard: "Provide a balanced celebration. 3-4 sentences for message, meaningful motivational note.",
      hype: "Go all out! Be celebratory, expansive, and really emphasize the significance of this moment and progress."
    };
    return styleMap[style as keyof typeof styleMap] || styleMap.standard;
  }

  private static getImpactActionContext(impactAction: string, impactAmount: number, projectInfo?: any): string {
    const impactMap = {
      plant_tree: `planted ${impactAmount} tree${impactAmount > 1 ? 's' : ''}`,
      rescue_plastic: `rescued ${impactAmount} plastic bottle${impactAmount > 1 ? 's' : ''}`,
      offset_carbon: `offset ${impactAmount}kg of CO₂`,
      plant_kelp: `planted ${impactAmount} kelp plant${impactAmount > 1 ? 's' : ''}`,
      provide_water: `provided ${impactAmount} liter${impactAmount > 1 ? 's' : ''} of clean water`,
      sponsor_bees: `protected ${impactAmount} bee${impactAmount > 1 ? 's' : ''}`
    };

    let context = `Just ${impactMap[impactAction as keyof typeof impactMap] || 'created positive impact'}`;
    
    if (projectInfo?.name && projectInfo?.location) {
      context += ` through the "${projectInfo.name}" project in ${projectInfo.location}`;
    }

    return context;
  }

  static async generateCelebrationMessage(context: CelebrationContext): Promise<CelebrationMessage> {
    const prefs = context.celebrationPrefs || {
      personalityTone: 'warm' as const,
      style: 'standard' as const,
      emojiLevel: 2,
      surpriseLevel: 2,
      themes: [],
      soundEnabled: true
    };

    const personalityPrompt = this.getPersonalityPrompt(prefs.personalityTone);
    const stylePrompt = this.getStylePrompt(prefs.style);
    const impactContext = this.getImpactActionContext(context.impactAction, context.impactAmount, context.projectInfo);
    
    const systemPrompt = `You are John Ellison, a warm and encouraging habit coach. Create a single, focused celebration message.

Return JSON with ONE field only:
{
  "message": "Complete personalized celebration (3-4 sentences max) that includes: greeting with name + specific habit praise + environmental impact + brief motivation"
}

Example: "Great work, Sarah! Your morning meditation habit is helping you build mindful awareness while offsetting 1kg of CO₂. This consistency shows real commitment to both personal growth and our planet. Keep this positive momentum going!"

Guidelines:
- Use their first name naturally
- Reference their specific habit and environmental impact
- Keep under 60 words total
- Warm, encouraging tone
- Minimal emojis (0-2 max)
- Connect personal growth to planetary benefit`;

    const contextPrompt = `Create a celebration for:

- User: ${context.userName || 'there'}
- Habit: "${context.habitName}"
- Streak: ${context.streak} day${context.streak !== 1 ? 's' : ''}
- Impact: ${impactContext}

Make it personal, acknowledge their environmental contribution, and encourage continued progress.`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: contextPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7 // Add some creativity while staying consistent
      }, {
        timeout: 10000 // 10 second timeout to prevent API delays
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      return {
        title: "Great Work!",
        message: result.message || `Great job completing "${context.habitName}"! You're building momentum toward your goals while making a positive environmental impact. Keep up this amazing consistency!`,
        motivationalNote: "Keep going!",
        progressInsight: undefined
      };

    } catch (error: any) {
      console.error('Celebration AI service error:', error);
      
      // Fallback to a personalized but static celebration
      return this.generateFallbackCelebration(context);
    }
  }

  private static generateFallbackCelebration(context: CelebrationContext): CelebrationMessage {
    const impactEmojis = {
      plant_tree: "🌳",
      rescue_plastic: "🐋", 
      offset_carbon: "☁️",
      plant_kelp: "🌿",
      provide_water: "💧",
      sponsor_bees: "🐝"
    };

    const emoji = impactEmojis[context.impactAction];
    const impactText = this.getImpactActionContext(context.impactAction, context.impactAmount, context.projectInfo);

    let title = "Outstanding Work!";
    if (context.streak >= 7) title = "Week Streak Champion!";
    if (context.streak >= 30) title = "Monthly Milestone Master!";

    let message = `${context.userName ? `Excellent work, ${context.userName}!` : 'Excellent work!'} Your "${context.habitName}" habit just ${impactText} while building your ${context.streak}-day streak.`;
    
    if (context.streak >= 7) {
      message += ` This consistent commitment shows real dedication to both personal growth and environmental impact.`;
    } else {
      message += ` Keep building this positive momentum!`;
    }

    return {
      title,
      message,
      motivationalNote: "Keep going!",
      progressInsight: undefined
    };
  }

  // Helper method for getting user's celebration preferences and context
  static async getCelebrationContext(
    habitName: string,
    streak: number,
    impactAction: string,
    impactAmount: number,
    projectInfo: any,
    userId: string,
    storage: any
  ): Promise<CelebrationContext> {
    try {
      // Get user data to access both onboarding profile and celebration preferences
      const user = await storage.getUser(userId);
      const onboardingProfile = user?.onboardingProfile;
      const celebrationPrefs = user?.celebrationPrefs || onboardingProfile?.celebrationPrefs;
      
      // Get recent emotional feedback from completed habits
      const recentCompletions = await storage.getRecentHabitCompletions(userId, 10);
      const emotionalFeedback = recentCompletions
        .filter((c: any) => c.emotionalFeedback)
        .map((c: any) => c.emotionalFeedback)
        .slice(0, 5); // Last 5 emotional ratings

      return {
        habitName,
        streak,
        impactAction: impactAction as any,
        impactAmount,
        projectInfo,
        userAspiration: onboardingProfile?.aspiration,
        userContext: onboardingProfile?.context,
        emotionalFeedbackHistory: emotionalFeedback,
        celebrationPrefs: celebrationPrefs || undefined,
        userName: user?.firstName // Add user's first name for personalization
      };
      
    } catch (error) {
      console.error('Error getting celebration context:', error);
      
      // Return minimal context if there's an error
      return {
        habitName,
        streak,
        impactAction: impactAction as any,
        impactAmount,
        projectInfo
      };
    }
  }
}