import OpenAI from "openai";
import { OnboardingProfile, Behavior, behaviorSchema } from "@shared/schema";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConversationState {
  phase: 'welcome' | 'clarify_aspiration' | 'ready_to_create';
  data: Partial<OnboardingProfile>;
}

export class AIOnboardingService {
  private static systemPrompt = `You are John Ellison, a warm behavior change coach. Your goal is to quickly understand what the user wants to achieve and help them get started with their first habit.

Keep the conversation brief and focused:
- Welcome them warmly
- Understand their main aspiration in 1-2 exchanges
- Once you understand what they want, encourage them to create their first habit

Your conversation style:
- Warm and encouraging
- Ask ONE clear question at a time
- Keep responses short (1-2 sentences max)
- Focus on understanding their main goal, not deep analysis

CRITICAL: Always respond with valid JSON in this format:
{
  "message": "your response to the user",
  "nextPhase": "welcome|clarify_aspiration|ready_to_create",
  "suggestions": ["helpful responses the user could give to your question"],
  "data": "brief summary of their aspiration if clear"
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
    
    const phasePrompts = {
      welcome: "Welcome the user briefly and ask what change they want to make in their life. Keep it simple and warm.",
      
      clarify_aspiration: "Ask ONE clarifying question to better understand their aspiration. Once you understand their main goal, move to ready_to_create phase.",
      
      ready_to_create: "Acknowledge their aspiration and encourage them to create their first habit using the app. Be encouraging and positive."
    };

    const contextPrompt = `
Current phase: ${conversationState.phase}
Phase instruction: ${phasePrompts[conversationState.phase]}
Current data: ${JSON.stringify(conversationState.data)}
User's message: "${userMessage}"

Remember:
- Keep responses short and focused
- Ask only ONE question at a time
- Provide helpful user response suggestions
- Move to ready_to_create once you understand their main aspiration
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
      
      if (result.data && (conversationState.phase === 'clarify_aspiration' || result.nextPhase === 'ready_to_create')) {
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
      description: `${behavior.whyEffective} Trigger: ${behavior.trigger}`,
      icon: behavior.icon,
      category: behavior.category,
      impactAction: behavior.impactAction,
      impactAmount: behavior.impactAmount
    }));
  }
}