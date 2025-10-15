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
      geminiModel: process.env.GEMINI_MODEL || "gemini-1.0-pro",
      geminiOnly: process.env.GEMINI_ONLY === "true",
    };
  }

  private getProvider(): "openrouter" | "gemini" | null {
    // If Gemini-only is set and we have a key, try Gemini first
    if (this.config.geminiOnly && this.config.geminiApiKey) {
      return "gemini";
    }

    // Otherwise, prefer OpenRouter if available
    if (this.config.openrouterApiKey) {
      return "openrouter";
    }

    // Fall back to Gemini if OpenRouter isn't available but Gemini is
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
    let provider = this.getProvider();
    let currentAttempt = 0;

    if (!provider) {
      throw new Error(
        "No LLM provider configured. Please set OPENROUTER_API_KEY or GEMINI_API_KEY"
      );
    }

    while (currentAttempt <= maxRetries) {
      try {
        let response: string;

        if (provider === "openrouter") {
          response = await this.callOpenRouter(systemPrompt, userPrompt);
        } else {
          response = await this.callGemini(systemPrompt, userPrompt);
        }

        // Try to parse JSON from response
        let jsonResponse: unknown;
        try {
          // Remove any markdown code blocks if present
          const cleanedResponse = response
            .replace(/```json\n?|\n?```/g, "")
            .trim();
          jsonResponse = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.error("Failed to parse JSON response:", parseError);
          if (currentAttempt === maxRetries) {
            throw new Error("Invalid JSON response from LLM");
          }
          continue;
        }

        // Validate against schema
        const validatedResponse = schema.parse(jsonResponse);
        return validatedResponse;
      } catch (error) {
        console.error(`LLM call attempt ${currentAttempt + 1} failed:`, error);

        if (currentAttempt === maxRetries) {
          if (error instanceof z.ZodError) {
            throw new Error(`Schema validation failed: ${error.message}`);
          }

          // If this was a Gemini error and OpenRouter is available, suggest trying OpenRouter
          if (
            provider === "gemini" &&
            this.config.openrouterApiKey &&
            error instanceof Error &&
            error.message.includes("Gemini API")
          ) {
            throw new Error(
              `${error.message}. OpenRouter is also configured - consider disabling GEMINI_ONLY=true in .env to use OpenRouter instead.`
            );
          }

          throw error;
        }

        // If Gemini failed and OpenRouter is available, try OpenRouter as fallback
        if (
          provider === "gemini" &&
          this.config.openrouterApiKey &&
          error instanceof Error &&
          error.message.includes("Invalid request to Gemini API")
        ) {
          console.log("Gemini failed, trying OpenRouter as fallback...");
          provider = "openrouter"; // Switch to OpenRouter for next attempt
          currentAttempt--; // Don't count this as a retry for the new provider
        }

        currentAttempt++;

        // Wait before retry
        await new Promise((resolve) =>
          setTimeout(resolve, 1000 * currentAttempt)
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
    if (!this.config.geminiApiKey) {
      throw new Error("Gemini API key is not configured");
    }

    // Use the latest API endpoint format
    const apiUrl = `https://generativelanguage.googleapis.com/v1/models/${this.config.geminiModel}:generateContent?key=${this.config.geminiApiKey}`;

    console.log(`Calling Gemini API: ${this.config.geminiModel}`);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }, { text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
        },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error("Rate limit exceeded. Please try again later.");
      }
      if (response.status === 503) {
        throw new Error(
          "Gemini API service is temporarily unavailable. Please try again later."
        );
      }
      if (response.status === 400) {
        throw new Error(
          "Invalid request to Gemini API. Check model name and parameters."
        );
      }
      throw new Error(
        `Gemini API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0) {
      throw new Error("Gemini API returned no response");
    }

    return data.candidates[0]?.content?.parts[0]?.text || "";
  }
}

export const llmProvider = new LLMProvider();
