interface EcologiTreeResponse {
  treeUrl: string;
  amount: string;
}

interface EcologiTreeRequest {
  number: number;
  name: string;
  test: boolean;
}

export class EcologiService {
  private apiUrl = "https://public.ecologi.com/impact/trees";
  private apiToken: string;

  constructor() {
    this.apiToken = process.env.ECOLOGI_API_TOKEN || "";
    if (!this.apiToken) {
      console.warn("ECOLOGI_API_TOKEN not found in environment variables");
    }
  }

  async plantTree(description: string = "Habit completion tree"): Promise<EcologiTreeResponse | null> {
    if (!this.apiToken) {
      throw new Error("Ecologi API token not configured");
    }

    try {
      const requestData: EcologiTreeRequest = {
        number: 1,
        name: description,
        test: process.env.NODE_ENV === "development", // Test mode in development
      };

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ecologi API error: ${response.status} - ${errorText}`);
      }

      const result: EcologiTreeResponse = await response.json();
      return result;
    } catch (error) {
      console.error("Failed to plant tree via Ecologi API:", error);
      throw error;
    }
  }

  async plantMultipleTrees(count: number, description: string = "Multiple habit completions"): Promise<EcologiTreeResponse | null> {
    if (!this.apiToken) {
      throw new Error("Ecologi API token not configured");
    }

    try {
      const requestData: EcologiTreeRequest = {
        number: count,
        name: description,
        test: process.env.NODE_ENV === "development",
      };

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Ecologi API error: ${response.status} - ${errorText}`);
      }

      const result: EcologiTreeResponse = await response.json();
      return result;
    } catch (error) {
      console.error("Failed to plant trees via Ecologi API:", error);
      throw error;
    }
  }
}

export const ecologiService = new EcologiService();
