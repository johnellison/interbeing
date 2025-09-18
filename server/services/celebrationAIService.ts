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
  private static enforceMessageLimits(message: string): string {
    // Split into sentences and normalize whitespace
    const sentences = message.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);
    
    // Take first 3-4 sentences
    const limitedSentences = sentences.slice(0, 4);
    let result = limitedSentences.join('. ') + '.';
    
    // If still over 255 characters, trim and add short ending
    if (result.length > 255) {
      const trimmed = result.substring(0, 215).trim();
      result = trimmed + '... You\'re building something amazing! 🌟';
    }
    
    return result;
  }
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
      plant_kelp: `planted some kelp (${impactAmount} plant${impactAmount > 1 ? 's' : ''})`,
      provide_water: `provided ${impactAmount} liter${impactAmount > 1 ? 's' : ''} of clean water`,
      sponsor_bees: `protected ${impactAmount} bee${impactAmount > 1 ? 's' : ''}`
    };

    let context = `just ${impactMap[impactAction as keyof typeof impactMap] || 'created positive impact'}`;
    
    // Remove project location details for cleaner message

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
    
    const systemPrompt = `You are John Ellison, a warm and encouraging habit coach who celebrates with genuine enthusiasm and variety. Create a personalized celebration that STRONGLY emphasizes the user's aspiration and shows how this habit connects to their bigger dreams.

Return JSON with ONE field only:
{
  "message": "Complete celebration that PROMINENTLY features their aspiration + celebrates habit completion + mentions environmental impact + varies motivational language"
}

CRITICAL REQUIREMENTS:
- MOBILE-FRIENDLY: Keep message to exactly 3-4 sentences and under 255 characters total
- Use 2-3 emojis naturally throughout the message 🎉✨
- LEAD with their aspiration: "Your journey toward [ASPIRATION] is getting stronger!" 
- Vary motivational endings - NEVER use "Keep this positive momentum going!" 
- Connect habit → aspiration → environmental impact in that order
- Use professional celebration starters: "Excellent!", "Outstanding!", "Well done!", "Great progress!", "Impressive!"
- Use concise motivational endings: "Keep building!", "You're on track!", "Every step counts!", "Progress made!", "Well earned!"

Varied opening patterns (keep concise):
1. "[NAME]! 🎉 Your [ASPIRATION] journey just got stronger with [HABIT]!"
2. "Excellent work, [NAME]! ✨ Every [HABIT] brings you closer to [ASPIRATION]!"
3. "Well done, [NAME]! This [HABIT] is building the [ASPIRATION] you're working toward!"

Personalization priority: ASPIRATION > NAME > HABIT > IMPACT > VARIED MOTIVATION
IMPORTANT: Keep total message under 255 characters for mobile readability.`;

    const contextPrompt = `Create a celebration for:

- User: ${context.userName || 'there'}  
- Their BIG ASPIRATION: "${context.userAspiration || 'personal growth and wellness'}" ← FEATURE THIS PROMINENTLY!
- Habit completed: "${context.habitName}"
- Current streak: ${context.streak} day${context.streak !== 1 ? 's' : ''}
- Environmental impact: ${impactContext}

INSTRUCTIONS:
1. START by connecting this habit to their aspiration 
2. Show excitement about their environmental contribution
3. Use 2-3 emojis throughout
4. End with fresh, varied motivational language (never \"keep this positive momentum going\")
5. Make it feel like a personal coach celebrating their success

Focus heavily on how "${context.habitName}" builds toward "${context.userAspiration || 'their dreams'}"!`;

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
      
      const rawMessage = result.message || `Great job completing "${context.habitName}"! You're building momentum toward your goals while making a positive environmental impact. Keep up this amazing consistency!`;
      
      return {
        title: "Great Work!",
        message: this.enforceMessageLimits(rawMessage),
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

    let message = `${context.userName ? `Excellent work, ${context.userName}!` : 'Excellent work!'} ${emoji} Your "${context.habitName}" habit ${impactText}.`;
    
    if (context.streak >= 7) {
      message += ` Building this ${context.streak}-day streak shows real dedication!`;
    } else {
      message += ` You're building something incredible!`;
    }

    return {
      title,
      message: this.enforceMessageLimits(message),
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