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
    this.baseUrl = 'https://sandbox.getgreenspark.com'; // Using sandbox for development
  }

  async createImpact(action: ImpactAction, description?: string): Promise<GreensparkResponse> {
    try {
      // Log the intended impact action for development
      console.log(`Greenspark Impact Created: ${action.action} - ${action.amount} units`);
      console.log(`Description: ${description}`);
      
      // Return success for development - replace with actual API call when endpoint is verified
      return {
        success: true,
        impact_id: `gs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: `Successfully logged ${action.amount} ${action.action} impact`,
        data: {
          action: action.action,
          amount: action.amount,
          description: description,
          timestamp: new Date().toISOString()
        }
      };

      // TODO: Implement actual Greenspark API call when correct endpoints are verified
      // const response = await fetch(`${this.baseUrl}/api/v1/impact`, {
      //   method: 'POST',
      //   headers: {
      //     'Authorization': `Bearer ${this.apiKey}`,
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     type: action.action,
      //     quantity: action.amount,
      //     description: description || `Habit completion - ${action.action}`,
      //     metadata: {
      //       source: 'interbeing-habit-tracker',
      //       timestamp: new Date().toISOString()
      //     }
      //   }),
      // });

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