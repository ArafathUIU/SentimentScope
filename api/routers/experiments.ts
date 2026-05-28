import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { experiments } from "@db/schema";
import { eq, desc } from "drizzle-orm";

export const experimentsRouter = createRouter({
  // List all experiments
  list: publicQuery.query(async () => {
    const db = getDb();
    const items = await db.select().from(experiments).orderBy(desc(experiments.createdAt));
    return items;
  }),

  // Get experiment by ID
  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const results = await db.select().from(experiments).where(eq(experiments.id, input.id));
      return results[0] ?? null;
    }),

  // Create new experiment
  create: publicQuery
    .input(z.object({
      name: z.string().min(1).max(200),
      modelType: z.enum(["sentiment", "topic", "summarization", "ner", "custom"]),
      hyperparameters: z.record(z.string(), z.union([z.string(), z.number()])).optional(),
      epochs: z.number().min(1).max(1000).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(experiments).values({
        name: input.name,
        modelType: input.modelType,
        hyperparameters: input.hyperparameters as Record<string, string | number> | undefined,
        epochs: input.epochs,
        status: "queued",
      });
      return result;
    }),

  // Start experiment
  start: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(experiments)
        .set({
          status: "running",
          startedAt: new Date(),
          currentEpoch: 0,
        })
        .where(eq(experiments.id, input.id));
      return { success: true };
    }),

  // Update experiment progress (simulated training step)
  updateProgress: publicQuery
    .input(z.object({
      id: z.number(),
      currentEpoch: z.number(),
      loss: z.number().optional(),
      valLoss: z.number().optional(),
      accuracy: z.number().optional(),
      metrics: z.record(z.string(), z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...updates } = input;
      await db.update(experiments)
        .set({
          currentEpoch: updates.currentEpoch,
          loss: updates.loss,
          valLoss: updates.valLoss,
          accuracy: updates.accuracy,
          metrics: updates.metrics as Record<string, number> | undefined,
        })
        .where(eq(experiments.id, id));
      return { success: true };
    }),

  // Complete experiment
  complete: publicQuery
    .input(z.object({
      id: z.number(),
      loss: z.number().optional(),
      valLoss: z.number().optional(),
      accuracy: z.number().optional(),
      metrics: z.record(z.string(), z.number()).optional(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;

      // Get experiment to calculate duration
      const exp = await db.select().from(experiments).where(eq(experiments.id, id));
      if (!exp[0]) return { success: false };

      const startedAt = exp[0].startedAt;
      const duration = startedAt
        ? (Date.now() - new Date(startedAt).getTime()) / 1000
        : 0;

      await db.update(experiments)
        .set({
          loss: data.loss,
          valLoss: data.valLoss,
          accuracy: data.accuracy,
          metrics: data.metrics as Record<string, number> | undefined,
          status: "completed",
          completedAt: new Date(),
          duration,
        })
        .where(eq(experiments.id, id));

      return { success: true };
    }),

  // Fail experiment
  fail: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(experiments)
        .set({ status: "failed" })
        .where(eq(experiments.id, input.id));
      return { success: true };
    }),

  // Delete experiment
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(experiments).where(eq(experiments.id, input.id));
      return { success: true };
    }),

  // Get experiment stats
  stats: publicQuery.query(async () => {
    const db = getDb();
    const all = await db.select().from(experiments);
    const completed = all.filter((e) => e.status === "completed").length;
    const running = all.filter((e) => e.status === "running").length;
    const failed = all.filter((e) => e.status === "failed").length;

    return {
      total: all.length,
      completed,
      running,
      failed,
      successRate: all.length > 0 ? Number((completed / all.length).toFixed(3)) : 0,
    };
  }),
});
