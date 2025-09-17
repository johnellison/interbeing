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
    
    const systemPrompt = `You are John Ellison, a warm behavior change coach celebrating a user's habit completion.

PERSONALITY: ${personalityPrompt}

STYLE: ${stylePrompt}

EMOJI LEVEL: ${prefs.emojiLevel === 1 ? 'Minimal emojis (0-1)' : prefs.emojiLevel === 2 ? 'Moderate emojis (1-3)' : 'Rich emojis (3-5)'}

Your task: Create a personalized celebration message that connects their daily habit to their bigger life aspiration and acknowledges their environmental impact. ${context.userName ? `Address the user by their first name (${context.userName}) to make it more personal.` : 'Use warm, personal language even without knowing their name.'}

Always respond with valid JSON in this format:
{
  "title": "Celebration headline (e.g. 'Amazing Progress!' or impact-specific title)",
  "message": "Main celebration message connecting their habit to their aspiration and impact",
  "motivationalNote": "Forward-looking encouragement tied to their goals",
  "progressInsight": "Brief insight about their streak or consistency pattern (optional)"
}`;

    const contextPrompt = `HABIT COMPLETION DETAILS:
- Habit: "${context.habitName}"
- Current Streak: ${context.streak} day${context.streak !== 1 ? 's' : ''}
- Environmental Impact: ${impactContext}

USER CONTEXT:
${context.userName ? `- Name: ${context.userName}` : '- Name: Not available'}
- Life Aspiration: ${context.userAspiration || 'building healthy habits'}
- Background Context: ${context.userContext || 'working on personal growth'}

PROGRESS PATTERNS:
- This is day ${context.streak} of their streak
- Recent emotional feedback: ${context.emotionalFeedbackHistory?.length ? `Average feeling: ${(context.emotionalFeedbackHistory.reduce((a, b) => a + b, 0) / context.emotionalFeedbackHistory.length).toFixed(1)}/5` : 'No recent feedback'}

CELEBRATION GUIDELINES:
1. Make it personal by connecting to their aspiration
2. Acknowledge the environmental impact meaningfully
3. Celebrate the streak milestone appropriately
4. Keep tone consistent with their personality preference
5. Look forward to continued progress
6. Use appropriate emoji level for their preference`;

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
        title: result.title || "Fantastic Work!",
        message: result.message || `Great job completing "${context.habitName}"! You're building momentum toward your goals.`,
        motivationalNote: result.motivationalNote || "Keep up this amazing consistency!",
        progressInsight: result.progressInsight || undefined
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

    let message = `${context.userName ? `${context.userName}, f` : 'F'}antastic job with "${context.habitName}"! ${emoji} You just ${impactText}`;
    if (context.userAspiration) {
      message += ` and you're making real progress toward ${context.userAspiration.toLowerCase()}.`;
    } else {
      message += ` while building consistency with your daily habits.`;
    }

    let motivationalNote = "Every single day counts - you're building something amazing!";
    if (context.streak >= 3) {
      motivationalNote = `${context.streak} days strong! You're proving you can stick with meaningful changes.`;
    }

    return {
      title,
      message,
      motivationalNote,
      progressInsight: context.streak >= 5 ? `Your ${context.streak}-day streak shows real commitment to growth!` : undefined
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