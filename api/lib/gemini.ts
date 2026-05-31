import { env } from "./env";

const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

interface GeminiItem {
  name: string;
  type: string;
}

interface GeminiResult {
  sentiment: "positive" | "negative" | "neutral" | "mixed";
  sentimentScore: number;
  confidence: number;
  topic: string;
  summary: string;
  entities: GeminiItem[];
}

function buildPrompt(text: string): string {
  return `Analyze the sentiment and content of this text. Return ONLY valid JSON (no markdown, no backticks, no explanation).

{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "sentimentScore": number between -1 (very negative) and 1 (very positive),
  "confidence": number between 0 and 1,
  "topic": one of "Technology" | "Food" | "Travel" | "Health" | "Finance" | "Service" | "General",
  "summary": "concise 1-2 sentence extractive summary",
  "entities": array of {"name": string, "type": "ORG" | "PERSON" | "DATE" | "MONEY"}
}

Text: """${text}"""`;
}

export async function analyzeWithGemini(text: string): Promise<{
  result: GeminiResult | null;
  timing: number;
}> {
  const startTime = Date.now();

  if (!env.geminiApiKey) {
    return { result: null, timing: (Date.now() - startTime) / 1000 };
  }

  try {
    const response = await fetch(`${API_BASE}?key=${env.geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(text) }] }],
        generationConfig: {
          temperature: 0.2,
          topP: 0.95,
          maxOutputTokens: 4096,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errBody = await response.text().catch(() => "");
      console.error(`Gemini API error ${response.status}: ${errBody}`);
      return { result: null, timing: (Date.now() - startTime) / 1000 };
    }

    const data = await response.json() as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> };
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) {
      return { result: null, timing: (Date.now() - startTime) / 1000 };
    }

    const parsed = JSON.parse(rawText) as GeminiResult;

    if (!parsed.sentiment || typeof parsed.sentimentScore !== "number") {
      return { result: null, timing: (Date.now() - startTime) / 1000 };
    }

    return {
      result: {
        sentiment: parsed.sentiment,
        sentimentScore: parsed.sentimentScore,
        confidence: parsed.confidence ?? 0.9,
        topic: parsed.topic ?? "General",
        summary: parsed.summary ?? "",
        entities: Array.isArray(parsed.entities) ? parsed.entities.slice(0, 8) : [],
      },
      timing: (Date.now() - startTime) / 1000,
    };
  } catch (err) {
    console.error("Gemini call failed:", err);
    return { result: null, timing: (Date.now() - startTime) / 1000 };
  }
}
