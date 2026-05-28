import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { analyses } from "@db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { analyzeWithGemini } from "../lib/gemini";

type AnalysisResult = {
  sentiment: string;
  sentimentScore: number;
  confidence: number;
  topic: string;
  summary: string;
  entities: Array<{ name: string; type: string }>;
  processingTime: number;
  modelVersion?: string;
  engine: "gemini" | "rule";
};

async function tryGeminiFirst(text: string): Promise<{
  result: Omit<AnalysisResult, "engine" | "modelVersion"> | null;
}> {
  const { result: geminiResult, timing } = await analyzeWithGemini(text);
  if (!geminiResult) return { result: null };

  return {
    result: {
      sentiment: geminiResult.sentiment,
      sentimentScore: geminiResult.sentimentScore,
      confidence: geminiResult.confidence,
      topic: geminiResult.topic,
      summary: geminiResult.summary,
      entities: geminiResult.entities,
      processingTime: timing,
    },
  };
}

// NLP Analysis Engine - rule-based sentiment and topic analysis
function analyzeSentiment(text: string): { sentiment: string; score: number; confidence: number } {
  const positiveWords = [
    "excellent", "great", "amazing", "wonderful", "fantastic", "outstanding", "superb", "brilliant",
    "love", "loved", "like", "liked", "enjoy", "enjoyed", "happy", "pleased", "satisfied",
    "recommend", "perfect", "best", "awesome", "incredible", "impressive", "good", "nice",
    "beautiful", "smooth", "fast", "easy", "helpful", "friendly", "professional", "clean",
    "delicious", "fresh", "tasty", "comfortable", "convenient", "affordable", "worth", "quality"
  ];
  const negativeWords = [
    "terrible", "awful", "horrible", "bad", "worst", "hate", "hated", "dislike", "disliked",
    "disappointed", "disappointing", "poor", "cheap", "broken", "slow", "difficult", "hard",
    "problem", "problems", "issue", "issues", "error", "errors", "fail", "failed", "wrong",
    "dirty", "rude", "unprofessional", "expensive", "overpriced", "waste", "worst", "never",
    "avoid", "regret", "frustrated", "annoying", "useless", "pathetic", "disgusting"
  ];

  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  let positive = 0;
  let negative = 0;

  words.forEach((word) => {
    if (positiveWords.includes(word)) positive++;
    if (negativeWords.includes(word)) negative++;
  });

  const total = positive + negative;
  if (total === 0) return { sentiment: "neutral", score: 0, confidence: 0.85 };

  const score = (positive - negative) / words.length;
  const confidence = Math.min(total / words.length + 0.6, 0.99);

  if (positive > negative * 1.5) return { sentiment: "positive", score, confidence };
  if (negative > positive * 1.5) return { sentiment: "negative", score, confidence };
  return { sentiment: "mixed", score, confidence };
}

function classifyTopic(text: string): string {
  const topics: Record<string, string[]> = {
    "Technology": ["software", "app", "computer", "phone", "internet", "digital", "tech", "ai", "data", "code", "programming"],
    "Food": ["food", "restaurant", "meal", "dish", "cuisine", "taste", "flavor", "delicious", "cooking", "chef"],
    "Travel": ["hotel", "flight", "vacation", "trip", "travel", "destination", "tourist", "booking"],
    "Health": ["health", "doctor", "medicine", "hospital", "treatment", "symptom", "pain", "care"],
    "Finance": ["money", "price", "cost", "expensive", "cheap", "value", "payment", "budget", "investment"],
    "Service": ["service", "staff", "customer", "support", "help", "response", "experience"],
  };

  const textLower = text.toLowerCase();
  let bestTopic = "General";
  let maxScore = 0;

  for (const [topic, keywords] of Object.entries(topics)) {
    const score = keywords.filter((k) => textLower.includes(k)).length;
    if (score > maxScore) {
      maxScore = score;
      bestTopic = topic;
    }
  }

  return bestTopic;
}

function generateSummary(text: string): string {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  if (sentences.length <= 2) return text;

  // Simple extractive summarization - pick first and most informative sentences
  const importantWords = ["important", "key", "main", "significant", "critical", "essential", "major"];
  const scored = sentences.map((s, i) => {
    let score = 0;
    if (i === 0) score += 3;
    if (i === sentences.length - 1) score += 2;
    importantWords.forEach((w) => {
      if (s.toLowerCase().includes(w)) score += 2;
    });
    score += s.split(",").length * 0.5;
    return { sentence: s.trim(), score };
  });

  scored.sort((a, b) => b.score - a.score);
  const summary = scored.slice(0, Math.min(2, Math.ceil(sentences.length / 3)));
  summary.sort((a, b) => sentences.indexOf(a.sentence) - sentences.indexOf(b.sentence));

  return summary.map((s) => s.sentence).join(" ");
}

function extractEntities(text: string): Array<{ name: string; type: string }> {
  const entities: Array<{ name: string; type: string }> = [];

  // Simple NER - capitalize word sequences
  const capitalized = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
  capitalized.forEach((match) => {
    if (match.length > 2 && !["The", "This", "That", "They", "Their"].includes(match.split(" ")[0])) {
      entities.push({ name: match, type: "ORG" });
    }
  });

  // Numbers
  const numbers = text.match(/\$?\d+(?:,\d{3})*(?:\.\d+)?/g) || [];
  numbers.forEach((n) => entities.push({ name: n, type: "MONEY" }));

  // Dates
  const dates = text.match(/\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}(?:,\s+\d{4})?/gi) || [];
  dates.forEach((d) => entities.push({ name: d, type: "DATE" }));

  return entities.slice(0, 8);
}

export const analysisRouter = createRouter({
  // Analyze text - main NLP endpoint
  analyze: publicQuery
    .input(z.object({
      text: z.string().min(1).max(5000),
      modelVersion: z.string().optional().default("v1.0"),
    }))
    .mutation(async ({ input }) => {
      const startTime = Date.now();

      // Try Gemini first, fall back to rule-based
      const gemini = await tryGeminiFirst(input.text);
      let analysis: Omit<AnalysisResult, "engine" | "modelVersion">;
      let engine: "gemini" | "rule";

      if (gemini.result) {
        analysis = gemini.result;
        engine = "gemini";
      } else {
        const sentiment = analyzeSentiment(input.text);
        const topic = classifyTopic(input.text);
        const summary = generateSummary(input.text);
        const entities = extractEntities(input.text);
        analysis = {
          sentiment: sentiment.sentiment,
          sentimentScore: sentiment.score,
          confidence: sentiment.confidence,
          topic,
          summary,
          entities,
          processingTime: (Date.now() - startTime) / 1000,
        };
        engine = "rule";
      }

      const result: AnalysisResult = {
        ...analysis,
        modelVersion: input.modelVersion,
        engine,
      };

      // Save to database
      const db = getDb();
      await db.insert(analyses).values({
        text: input.text,
        sentiment: analysis.sentiment as "positive" | "negative" | "neutral" | "mixed",
        sentimentScore: analysis.sentimentScore,
        confidence: analysis.confidence,
        topic: analysis.topic,
        summary: analysis.summary,
        entities: analysis.entities,
        processingTime: analysis.processingTime,
        modelVersion: input.modelVersion,
      });

      return result;
    }),

  // Batch analyze multiple texts
  batchAnalyze: publicQuery
    .input(z.object({
      texts: z.array(z.string().min(1).max(5000)).max(10),
    }))
    .mutation(async ({ input }) => {
      const results = await Promise.all(
        input.texts.map(async (text) => {
          const startTime = Date.now();

          const gemini = await tryGeminiFirst(text);
          let analysis: Omit<AnalysisResult, "engine" | "modelVersion">;
          let engine: "gemini" | "rule";

          if (gemini.result) {
            analysis = gemini.result;
            engine = "gemini";
          } else {
            const sentiment = analyzeSentiment(text);
            const topic = classifyTopic(text);
            const summary = generateSummary(text);
            const entities = extractEntities(text);
            analysis = {
              sentiment: sentiment.sentiment,
              sentimentScore: sentiment.score,
              confidence: sentiment.confidence,
              topic,
              summary,
              entities,
              processingTime: (Date.now() - startTime) / 1000,
            };
            engine = "rule";
          }

          const db = getDb();
          await db.insert(analyses).values({
            text,
            sentiment: analysis.sentiment as "positive" | "negative" | "neutral" | "mixed",
            sentimentScore: analysis.sentimentScore,
            confidence: analysis.confidence,
            topic: analysis.topic,
            summary: analysis.summary,
            entities: analysis.entities,
            processingTime: analysis.processingTime,
            modelVersion: "v1.0",
          });

          return {
            text: text.slice(0, 100) + (text.length > 100 ? "..." : ""),
            sentiment: analysis.sentiment,
            sentimentScore: analysis.sentimentScore,
            confidence: analysis.confidence,
            topic: analysis.topic,
            summary: analysis.summary,
            processingTime: analysis.processingTime,
            engine,
          };
        })
      );

      return results;
    }),

  // Get analysis history
  history: publicQuery
    .input(z.object({
      limit: z.number().min(1).max(100).default(20),
      offset: z.number().min(0).default(0),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const items = await db.select()
        .from(analyses)
        .orderBy(desc(analyses.createdAt))
        .limit(input.limit)
        .offset(input.offset);

      const total = await db.select({ count: sql<number>`count(*)` }).from(analyses);

      return { items, total: total[0]?.count ?? 0 };
    }),

  // Get sentiment distribution
  sentimentDistribution: publicQuery.query(async () => {
    const db = getDb();
    const results = await db.select({
      sentiment: analyses.sentiment,
      count: sql<number>`count(*)`,
    })
      .from(analyses)
      .groupBy(analyses.sentiment);

    return results;
  }),

  // Get topic distribution
  topicDistribution: publicQuery.query(async () => {
    const db = getDb();
    const results = await db.select({
      topic: analyses.topic,
      count: sql<number>`count(*)`,
    })
      .from(analyses)
      .where(sql`topic IS NOT NULL`)
      .groupBy(analyses.topic);

    return results;
  }),

  // Get analytics summary
  analytics: publicQuery.query(async () => {
    const db = getDb();
    const totalAnalyses = await db.select({ count: sql<number>`count(*)` }).from(analyses);
    const avgConfidence = await db.select({ avg: sql<number>`avg(confidence)` }).from(analyses);
    const avgProcessingTime = await db.select({ avg: sql<number>`avg(processing_time)` }).from(analyses);
    const todayAnalyses = await db.select({ count: sql<number>`count(*)` })
      .from(analyses)
      .where(sql`DATE(created_at) = CURDATE()`);

    return {
      totalAnalyses: totalAnalyses[0]?.count ?? 0,
      avgConfidence: Number((avgConfidence[0]?.avg ?? 0).toFixed(3)),
      avgProcessingTime: Number((avgProcessingTime[0]?.avg ?? 0).toFixed(4)),
      todayAnalyses: todayAnalyses[0]?.count ?? 0,
    };
  }),

  // Delete analysis by ID
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(analyses).where(eq(analyses.id, input.id));
      return { success: true };
    }),
});
