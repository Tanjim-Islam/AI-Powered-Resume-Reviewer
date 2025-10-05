import { z } from "zod";

interface LLMConfig {
  openrouterApiKey?: string;
  openrouterBaseUrl?: string;
  modelDefault?: string;
  geminiApiKey?: string;
  geminiModel?: string;
  geminiOnly?: boolean;
}

class LLMProvider {
  private config: LLMConfig;

  constructor() {
    this.config = {
      openrouterApiKey: process.env.OPENROUTER_API_KEY,
      openrouterBaseUrl:
        process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1",
      modelDefault:
        process.env.MODEL_DEFAULT || "meta-llama/llama-3.1-70b-instruct",
      geminiApiKey: process.env.GEMINI_API_KEY,
      geminiModel: process.env.GEMINI_MODEL || "gemini-1.5-pro",
      geminiOnly: process.env.GEMINI_ONLY === "true",
    };
  }

  private getProvider(): "openrouter" | "gemini" | null {
    if (this.config.geminiOnly && this.config.geminiApiKey) {
      return "gemini";
    }

    if (this.config.openrouterApiKey) {
      return "openrouter";
    }

    if (this.config.geminiApiKey) {
      return "gemini";
    }

    return null;
  }

  async generateJson<T>(
    schema: z.ZodSchema<T>,
    systemPrompt: string,
    userPrompt: string,
    maxRetries: number = 2
  ): Promise<T> {
    const provider = this.getProvider();

    if (!provider) {
      throw new Error(
        "No LLM provider configured. Please set OPENROUTER_API_KEY or GEMINI_API_KEY"
      );
    }

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        let response: string;

        if (provider === "openrouter") {
          response = await this.callOpenRouter(systemPrompt, userPrompt);
        } else {
          response = await this.callGemini(systemPrompt, userPrompt);
        }

        // Try to parse JSON from response
        let jsonResponse: any;
        try {
          // Remove any markdown code blocks if present
          const cleanedResponse = response
            .replace(/```json\n?|\n?```/g, "")
            .trim();
          jsonResponse = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          if (attempt === maxRetries) {
            throw new Error("Invalid JSON response from LLM");
          }
          continue;
        }

        // Validate against schema
        const validatedResponse = schema.parse(jsonResponse);
        return validatedResponse;
      } catch (error) {
        console.error(`LLM call attempt ${attempt + 1} failed:`, error);

        if (attempt === maxRetries) {
          if (error instanceof z.ZodError) {
            throw new Error(`Schema validation failed: ${error.message}`);
          }
          throw error;
        }

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * (attempt + 1))
        );
      }
    }

    throw new Error("All LLM attempts failed");
  }

  private async callOpenRouter(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response = await fetch(
      `${this.config.openrouterBaseUrl}/chat/completions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.config.openrouterApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.modelDefault,
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.2,
          response_format: { type: "json_object" },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error(
        `OpenRouter API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "";
  }

  private async callGemini(
    systemPrompt: string,
    userPrompt: string
  ): Promise<string> {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.config.geminiModel}:generateContent?key=${this.config.geminiApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data.candidates[0]?.content?.parts[0]?.text || "";
  }
}

export const llmProvider = new LLMProvider();
