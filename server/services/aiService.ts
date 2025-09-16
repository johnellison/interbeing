import OpenAI from "openai";
import { OnboardingProfile, Behavior, behaviorSchema } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConversationState {
  phase: 'welcome' | 'clarify_aspiration' | 'recommend_behaviors';
  messageCount: number;
  data: Partial<OnboardingProfile>;
}

export class AIOnboardingService {
  private static systemPrompt = `You are John Ellison, a warm behavior change coach. Your goal is to quickly understand what the user wants to achieve and recommend 3 personalized habits.

This is a STRUCTURED 3-message conversation:
1. WELCOME: Greet them and ask about their aspiration
2. CLARIFY: Ask ONE clarifying question about their goal  
3. RECOMMEND: Present 3 specific behavior recommendations

Your conversation style:
- Warm and encouraging
- Ask ONE clear question at a time
- Keep responses short (1-2 sentences max)
- Focus on understanding their main goal for personalized recommendations

CRITICAL: Always respond with valid JSON in this format:
{
  "message": "your response to the user",
  "nextPhase": "welcome|clarify_aspiration|recommend_behaviors",
  "suggestions": ["helpful responses the user could give to your question"],
  "data": "brief summary of their aspiration if clear",
  "behaviors": [array of 3 behavior objects - only include when nextPhase is recommend_behaviors]
}`;

  static async processMessage(
    userMessage: string, 
    conversationState: ConversationState
  ): Promise<{
    response: string;
    nextPhase: ConversationState['phase'];
    suggestions?: string[];
    updatedData: Partial<OnboardingProfile>;
  }> {
    
    // Force transition logic - structured 3-message flow
    if (conversationState.messageCount >= 2) {
      // After 2 messages (welcome + clarify), always move to recommend_behaviors
      const behaviors = await this.generateBehaviorRecommendations(
        conversationState.data.aspiration || "general wellness",
        userMessage
      );
      
      return {
        response: `Perfect! Based on what you've shared, here are 3 habits I recommend for you:

1. **${behaviors[0].name}** - ${behaviors[0].whyEffective}

2. **${behaviors[1].name}** - ${behaviors[1].whyEffective}

3. **${behaviors[2].name}** - ${behaviors[2].whyEffective}

Would you like me to create these habits for you automatically, or would you prefer to add them manually yourself?`,
        nextPhase: 'recommend_behaviors' as const,
        suggestions: ["Create them for me automatically", "I'll add them manually", "Tell me more about these habits"],
        updatedData: {
          ...conversationState.data,
          aspiration: conversationState.data.aspiration || "wellness improvement",
          context: userMessage,
          recommendedBehaviors: behaviors
        }
      };
    }

    const phasePrompts = {
      welcome: "Welcome the user briefly and ask what change they want to make in their life. Keep it simple and warm.",
      
      clarify_aspiration: "Ask ONE clarifying question to better understand their aspiration. This is your only clarifying question before recommending habits.",
      
      recommend_behaviors: "Present the 3 recommended behaviors and ask if they want automatic creation or manual creation."
    };

    const contextPrompt = `
Current phase: ${conversationState.phase}
Phase instruction: ${phasePrompts[conversationState.phase]}
Current data: ${JSON.stringify(conversationState.data)}
User's message: "${userMessage}"

Remember:
- This is message ${conversationState.messageCount + 1} of exactly 3 total messages
- Keep responses short and focused
- Ask only ONE question at a time
- Provide helpful user response suggestions
- After clarify_aspiration, you will recommend 3 specific behaviors
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-nano-2025-08-07",
        messages: [
          { role: "system", content: AIOnboardingService.systemPrompt },
          { role: "user", content: contextPrompt }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Update conversation data based on phase
      let updatedData = { ...conversationState.data };
      
      if (result.data && (conversationState.phase === 'clarify_aspiration' || result.nextPhase === 'recommend_behaviors')) {
        updatedData.aspiration = result.data;
        updatedData.context = userMessage; // Store their context for celebration personalization
        updatedData.motivations = []; // Will be inferred from aspiration for celebrations
        updatedData.obstacles = []; // Not collecting detailed obstacles in simplified flow
        updatedData.selectedBehaviors = []; // They'll create habits manually
      }
      
      return {
        response: result.message || "I'm here to help you get started with your first habit.",
        nextPhase: result.nextPhase || conversationState.phase,
        suggestions: result.suggestions,
        updatedData
      };
      
    } catch (error: any) {
      console.error('AI service error:', error);
      
      // Handle specific OpenAI errors
      let errorMessage = "I'm having trouble right now. Could you try again in a moment?";
      
      if (error.status === 429) {
        errorMessage = "I'm temporarily unavailable due to high demand. Please try again in a few minutes, or contact support if this persists.";
      } else if (error.status === 401) {
        errorMessage = "There's an authentication issue with my AI service. Please contact support.";
      } else if (error.status >= 500) {
        errorMessage = "My AI service is experiencing issues. Please try again in a few minutes.";
      }
      
      // For the welcome phase, provide a more specific fallback
      if (conversationState.phase === 'welcome') {
        errorMessage = "Hi! I'm John Ellison, and I'm here to help you create meaningful habits. Unfortunately, I'm having technical difficulties right now. " + errorMessage;
      }
      
      return {
        response: errorMessage,
        nextPhase: conversationState.phase,
        updatedData: conversationState.data
      };
    }
  }

  static async generateBehaviorRecommendations(aspiration: string, context: string): Promise<Behavior[]> {
    const prompt = `Based on this user aspiration: "${aspiration}" and their context: "${context}", generate exactly 3 specific, actionable habit recommendations.

Return a JSON array of 3 behaviors with this exact structure:
[
  {
    "name": "specific habit name (e.g., 'Take a 10-minute morning walk')",
    "whyEffective": "brief explanation of how this helps their aspiration",
    "abilityScore": 4,
    "trigger": "suggested when/where to do this habit",
    "category": "wellness|fitness|mindfulness|productivity|learning|creativity|social|environmental",
    "icon": "lucide icon name (e.g., 'footprints', 'book', 'smile')",
    "impactAction": "plant_tree|rescue_plastic|offset_carbon|plant_kelp|provide_water|sponsor_bees",
    "impactAmount": 1
  }
]

Requirements:
- Each behavior must have a DIFFERENT impactAction (3 different environmental impacts)  
- Make them specific and achievable for a beginner
- Tailor to their aspiration but keep habits simple
- Use appropriate lucide icon names
- Set reasonable impactAmount (1-5 range)`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5-nano-2025-08-07",
        messages: [
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || '[]');
      let behaviors = Array.isArray(result) ? result : result.behaviors || [];
      
      // Ensure we have exactly 3 behaviors with distinct impact actions
      if (behaviors.length !== 3) {
        behaviors = this.getFallbackBehaviors(aspiration);
      }
      
      // Ensure distinct impact actions
      const impactActions = ['plant_tree', 'rescue_plastic', 'offset_carbon', 'plant_kelp', 'provide_water', 'sponsor_bees'];
      behaviors = behaviors.map((behavior: any, index: number) => ({
        ...behavior,
        impactAction: impactActions[index % impactActions.length] // Ensure uniqueness
      }));

      return behaviors;
    } catch (error) {
      console.error('Error generating behavior recommendations:', error);
      return this.getFallbackBehaviors(aspiration);
    }
  }

  private static getFallbackBehaviors(aspiration: string): Behavior[] {
    return [
      {
        name: "Take a 5-minute morning walk",
        whyEffective: "Gentle movement helps build momentum and energy for your goals",
        abilityScore: 4,
        trigger: "Right after having morning coffee or tea",
        category: "wellness" as const,
        icon: "footprints",
        impactAction: "plant_tree" as const,
        impactAmount: 1
      },
      {
        name: "Write one thing you're grateful for",
        whyEffective: "Positive mindset supports lasting change and motivation",
        abilityScore: 5,
        trigger: "Before going to bed each night",
        category: "mindfulness" as const,
        icon: "heart",
        impactAction: "rescue_plastic" as const,
        impactAmount: 1
      },
      {
        name: "Drink one extra glass of water",
        whyEffective: "Small health improvements create foundation for bigger changes",
        abilityScore: 5,
        trigger: "With each meal",
        category: "wellness" as const,
        icon: "droplets",
        impactAction: "provide_water" as const,
        impactAmount: 1
      }
    ];
  }

  static async generateHabitsFromBehaviors(behaviors: Behavior[]): Promise<Array<{
    name: string;
    description: string;
    icon: string;
    category: string;
    impactAction: string;
    impactAmount: number;
  }>> {
    return behaviors.map(behavior => ({
      name: behavior.name,
      description: behavior.whyEffective,
      icon: behavior.icon,
      category: behavior.category,
      impactAction: behavior.impactAction,
      impactAmount: behavior.impactAmount
    }));
  }
}