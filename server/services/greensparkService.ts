interface GreensparkResponse {
  success: boolean;
  impact_id?: string;
  message?: string;
  error?: string;
  data?: any;
}

interface ImpactAction {
  action: 'plant_tree' | 'rescue_plastic' | 'offset_carbon';
  amount: number;
}

class GreensparkService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.GREENSPARK_API_KEY || '';
    this.baseUrl = 'https://api.greenspark.org/v1';
  }

  async createImpact(action: ImpactAction, description?: string): Promise<GreensparkResponse> {
    try {
      // Map our actions to Greenspark's API endpoints
      const actionMapping = {
        'plant_tree': 'trees',
        'rescue_plastic': 'plastic',
        'offset_carbon': 'carbon'
      };

      const endpoint = actionMapping[action.action];
      if (!endpoint) {
        return {
          success: false,
          error: `Unsupported action: ${action.action}`
        };
      }

      const response = await fetch(`${this.baseUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          quantity: action.amount,
          description: description || `Habit completion - ${action.action}`,
          metadata: {
            source: 'interbeing-habit-tracker',
            timestamp: new Date().toISOString()
          }
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('Greenspark API error:', data);
        return {
          success: false,
          error: data.message || data.error || 'Failed to create impact action',
        };
      }

      return {
        success: true,
        impact_id: data.id || data.impact_id,
        message: data.message || 'Impact action created successfully',
        data: data
      };
    } catch (error) {
      console.error('Greenspark service error:', error);
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
    emoji: string;
  }>> {
    // Return the supported Greenspark impact types
    return [
      {
        action: 'plant_tree',
        name: 'Plant Trees',
        unit: 'trees',
        description: 'Plant real trees to combat climate change and restore forests',
        emoji: '🌳'
      },
      {
        action: 'rescue_plastic',
        name: 'Rescue Plastic',
        unit: 'bottles',
        description: 'Remove plastic waste from oceans and waterways',
        emoji: '🐋'
      },
      {
        action: 'offset_carbon',
        name: 'Offset Carbon',
        unit: 'kg CO₂',
        description: 'Offset carbon emissions through verified projects',
        emoji: '☁️'
      }
    ];
  }

  async validateApiKey(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/account`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Greenspark API validation error:', error);
      return false;
    }
  }
}

export const greensparkService = new GreensparkService();
export type { ImpactAction, GreensparkResponse };