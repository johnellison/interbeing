import OpenAI from "openai";
import { OnboardingProfile, Behavior, behaviorSchema } from "@shared/schema";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface ConversationState {
  phase: 'welcome' | 'aspiration' | 'motivations' | 'obstacles' | 'behaviors' | 'selection' | 'complete';
  data: Partial<OnboardingProfile>;
  suggestedBehaviors?: Behavior[];
}

export class AIOnboardingService {
  private static systemPrompt = `You are John Ellison, a behavior change coach inspired by BJ Fogg's methodology. You help people clarify their aspirations and choose effective behaviors.

Key principles:
1. Help people do what they already want to do
2. Help them feel successful
3. Use BJ Fogg's "Swarm of Bs" approach to clarify aspirations before selecting behaviors

Your conversation style:
- Warm, encouraging, and insightful
- Ask thoughtful follow-up questions
- Help users dig deeper into their "why"
- Keep responses conversational and supportive (2-3 sentences max)
- Use "you" and speak directly to them

CRITICAL: Always respond with valid JSON in this format:
{
  "message": "your response to the user",
  "nextPhase": "welcome|aspiration|motivations|obstacles|behaviors|selection|complete",
  "suggestions": ["optional array of suggested responses for user"],
  "data": "any data to capture from this interaction"
}`;

  static async processMessage(
    userMessage: string, 
    conversationState: ConversationState
  ): Promise<{
    response: string;
    nextPhase: ConversationState['phase'];
    suggestions?: string[];
    updatedData: Partial<OnboardingProfile>;
    suggestedBehaviors?: Behavior[];
  }> {
    
    const phasePrompts = {
      welcome: "Welcome the user and explain you'll help them clarify their aspirations and choose 3 effective behaviors. Ask what change they want to make in their life.",
      
      aspiration: "Help them clarify their aspiration. Ask follow-up questions about WHY this matters to them, what success would look like, and what's driving this desire.",
      
      motivations: "Explore their deeper motivations. Ask about what's most important to them about this aspiration and what would achieving it mean for their life.",
      
      obstacles: "Gently explore potential obstacles or challenges they might face. Ask what has made this difficult in the past or what concerns them.",
      
      behaviors: "Based on their aspiration, suggest 3-5 specific behaviors they could do. Focus on behaviors that are: 1) Aligned with what they want, 2) Something they can realistically do, 3) Effective for their aspiration.",
      
      selection: "Help them choose their top 3 behaviors from the suggestions. Ask which ones feel most doable and exciting to them.",
      
      complete: "Celebrate their clarity and confirm their 3 chosen behaviors. Let them know you'll create their habits now."
    };

    const contextPrompt = `
Current phase: ${conversationState.phase}
Phase instruction: ${phasePrompts[conversationState.phase]}
Current data: ${JSON.stringify(conversationState.data)}
User's message: "${userMessage}"

${conversationState.phase === 'behaviors' ? `
When suggesting behaviors, include these fields for each:
- name: clear behavior description
- whyEffective: brief explanation of why this helps their aspiration  
- category: wellness|fitness|mindfulness|productivity|learning|creativity|social|environmental
- icon: emoji or icon name
- impactAction: plant_tree|rescue_plastic|offset_carbon|plant_kelp|provide_water|sponsor_bees
- impactAmount: positive integer
- trigger: when/how they'll do this behavior
- abilityScore: rate 1-5 how easy this is for them to do

Suggest behaviors that connect personal growth with environmental impact.
` : ''}
`;

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-5",
        messages: [
          { role: "system", content: AIOnboardingService.systemPrompt },
          { role: "user", content: contextPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.7
      });

      const result = JSON.parse(response.choices[0].message.content || '{}');
      
      // Update conversation data based on phase
      let updatedData = { ...conversationState.data };
      let suggestedBehaviors = conversationState.suggestedBehaviors;
      
      if (conversationState.phase === 'aspiration' && result.data) {
        updatedData.aspiration = result.data;
      } else if (conversationState.phase === 'motivations' && result.data) {
        updatedData.motivations = Array.isArray(result.data) ? result.data : [result.data];
      } else if (conversationState.phase === 'obstacles' && result.data) {
        updatedData.obstacles = Array.isArray(result.data) ? result.data : [result.data];
        updatedData.context = userMessage; // Store their context/situation
      } else if (conversationState.phase === 'behaviors' && result.suggestedBehaviors) {
        try {
          suggestedBehaviors = result.suggestedBehaviors.map((b: any) => behaviorSchema.parse(b));
        } catch (e) {
          console.error('Error parsing suggested behaviors:', e);
        }
      } else if (conversationState.phase === 'selection' && result.selectedBehaviors) {
        updatedData.selectedBehaviors = result.selectedBehaviors;
      }
      
      return {
        response: result.message || "I'm here to help you clarify your aspirations.",
        nextPhase: result.nextPhase || conversationState.phase,
        suggestions: result.suggestions,
        updatedData,
        suggestedBehaviors
      };
      
    } catch (error) {
      console.error('AI service error:', error);
      
      // Fallback responses based on phase
      const fallbacks = {
        welcome: "Hi! I'm John, and I'm excited to help you create meaningful habits that align with your aspirations. What change would you like to make in your life?",
        aspiration: "That's interesting! Tell me more about why this matters to you right now.",
        motivations: "What would achieving this mean for you personally?",
        obstacles: "What challenges do you think might come up as you work toward this?",
        behaviors: "Based on what you've shared, let me suggest some behaviors that could help.",
        selection: "Which of these behaviors feels most exciting and doable for you?",
        complete: "Excellent choices! I'll help you turn these into trackable habits."
      };
      
      return {
        response: fallbacks[conversationState.phase] || "Let's keep exploring your aspirations together.",
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