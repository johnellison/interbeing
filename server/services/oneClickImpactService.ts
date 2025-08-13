interface OneClickImpactResponse {
  success: boolean;
  impact_id?: string;
  message?: string;
  error?: string;
}

interface ImpactAction {
  action: 'plant_tree' | 'clean_ocean' | 'capture_carbon' | 'donate_money';
  amount: number;
}

class OneClickImpactService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.ONE_CLICK_IMPACT_API_KEY || 'test_5fe47f5161c75d7bc05a5734a8ef1948';
    this.baseUrl = 'https://api.1clickimpact.com/v1';
  }

  async createImpact(action: ImpactAction, description?: string): Promise<OneClickImpactResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/impact`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: action.action,
          amount: action.amount,
          description: description || `Habit completion - ${action.action}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('1ClickImpact API error:', data);
        return {
          success: false,
          error: data.message || 'Failed to create impact action',
        };
      }

      return {
        success: true,
        impact_id: data.impact_id,
        message: data.message,
      };
    } catch (error) {
      console.error('1ClickImpact service error:', error);
      return {
        success: false,
        error: 'Network error while creating impact action',
      };
    }
  }

  async getImpactTypes(): Promise<Array<{
    action: string;
    name: string;
    unit: string;
    description: string;
  }>> {
    // Return the supported impact types
    return [
      {
        action: 'plant_tree',
        name: 'Plant Trees',
        unit: 'trees',
        description: 'Plant real trees to combat climate change',
      },
      {
        action: 'clean_ocean',
        name: 'Clean Ocean',
        unit: 'lbs',
        description: 'Remove plastic waste from oceans',
      },
      {
        action: 'capture_carbon',
        name: 'Capture Carbon',
        unit: 'lbs CO₂',
        description: 'Remove carbon dioxide from the atmosphere',
      },
      {
        action: 'donate_money',
        name: 'Donate Money',
        unit: 'cents USD',
        description: 'Support environmental causes with donations',
      },
    ];
  }
}

export const oneClickImpactService = new OneClickImpactService();
export type { ImpactAction, OneClickImpactResponse };