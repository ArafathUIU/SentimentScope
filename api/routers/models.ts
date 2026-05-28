import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { models } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const modelsRouter = createRouter({
  // List all models
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(models).orderBy(desc(models.createdAt));
    return items;
  }),

  // Get model by ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(models).where(eq(models.id, input.id));
      return results[0] ?? null;
    }),

  // Create new model
  create: publicQuery
    .input(z.object({
      name: z.string().min(1).max(100),
      version: z.string().min(1).max(50),
      type: z.enum(["sentiment", "topic", "summarization", "ner", "custom"]),
      framework: z.string().min(1).max(50),
      accuracy: z.number().min(0).max(1).optional(),
      f1Score: z.number().min(0).max(1).optional(),
      latency: z.number().optional(),
      status: z.enum(["active", "deprecated", "training", "failed"]).default("active"),
      description: z.string().optional(),
      trainingDataSize: z.number().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(models).values({
        ...input,
        deployedAt: input.status === "active" ? new Date() : undefined,
      });
      return result;
    }),

  // Update model
  update: publicQuery
    .input(z.object({
      id: z.number(),
      name: z.string().min(1).max(100).optional(),
      version: z.string().min(1).max(50).optional(),
      status: z.enum(["active", "deprecated", "training", "failed"]).optional(),
      accuracy: z.number().min(0).max(1).optional(),
      f1Score: z.number().min(0).max(1).optional(),
      latency: z.number().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(models).set(updates).where(eq(models.id, id));
      return { success: true };
    }),

  // Delete model
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(models).where(eq(models.id, input.id));
      return { success: true };
    }),

  // Get active models count
  stats: publicQuery.query(async () => {
    const db = getDb();
    const activeCount = await db.select().from(models).where(eq(models.status, "active"));
    const totalCount = await db.select().from(models);
    const avgAccuracy = await db.select().from(models).where(eq(models.status, "active"));
    const avgAccuracyValue = avgAccuracy.length > 0
      ? avgAccuracy.reduce((acc, m) => acc + (m.accuracy ?? 0), 0) / avgAccuracy.length
      : 0;

    return {
      activeModels: activeCount.length,
      totalModels: totalCount.length,
      avgAccuracy: Number(avgAccuracyValue.toFixed(3)),
    };
  }),
});
