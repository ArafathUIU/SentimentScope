import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { metrics, models } from "@db/schema";
import { eq, desc, sql, gte, and } from "drizzle-orm";

export const metricsRouter = createRouter({
  // Record new metric
  record: publicQuery
    .input(z.object({
      modelId: z.number(),
      metricType: z.enum(["accuracy", "precision", "recall", "f1", "latency", "throughput", "memory"]),
      value: z.number(),
    }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(metrics).values(input);
      return { success: true };
    }),

  // Get metrics for a model
  getByModel: publicQuery
    .input(z.object({
      modelId: z.number(),
      metricType: z.enum(["accuracy", "precision", "recall", "f1", "latency", "throughput", "memory"]).optional(),
      limit: z.number().min(1).max(1000).default(100),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [eq(metrics.modelId, input.modelId)];
      if (input.metricType) {
        conditions.push(eq(metrics.metricType, input.metricType));
      }
      const results = await db.select().from(metrics)
        .where(and(...conditions))
        .orderBy(desc(metrics.timestamp)).limit(input.limit);
      return results;
    }),

  // Get latest metrics for all active models
  latest: publicQuery.query(async () => {
    const db = getDb();
    const activeModels = await db.select().from(models).where(eq(models.status, "active"));

    const latestMetrics = await Promise.all(
      activeModels.map(async (model) => {
        const modelMetrics = await db.select()
          .from(metrics)
          .where(eq(metrics.modelId, model.id))
          .orderBy(desc(metrics.timestamp))
          .limit(5);

        return {
          modelId: model.id,
          modelName: model.name,
          modelVersion: model.version,
          modelType: model.type,
          metrics: modelMetrics,
        };
      })
    );

    return latestMetrics;
  }),

  // Get performance trends
  trends: publicQuery
    .input(z.object({
      modelId: z.number(),
      metricType: z.enum(["accuracy", "precision", "recall", "f1", "latency", "throughput", "memory"]),
      hours: z.number().min(1).max(168).default(24),
    }))
    .query(async ({ input }) => {
      const db = getDb();
      const cutoff = new Date(Date.now() - input.hours * 60 * 60 * 1000);

      const results = await db.select()
        .from(metrics)
        .where(and(
          eq(metrics.modelId, input.modelId),
          eq(metrics.metricType, input.metricType),
          gte(metrics.timestamp, cutoff),
        ))
        .orderBy(metrics.timestamp);

      return results;
    }),

  // Get aggregated metrics summary
  summary: publicQuery.query(async () => {
    const db = getDb();
    const dbMetrics = await db.select().from(metrics);

    const avgAccuracy = await db.select({
      avg: sql<number>`avg(value)`,
    })
      .from(metrics)
      .where(eq(metrics.metricType, "accuracy"));

    const avgLatency = await db.select({
      avg: sql<number>`avg(value)`,
    })
      .from(metrics)
      .where(eq(metrics.metricType, "latency"));

    const avgThroughput = await db.select({
      avg: sql<number>`avg(value)`,
    })
      .from(metrics)
      .where(eq(metrics.metricType, "throughput"));

    return {
      totalMetrics: dbMetrics.length,
      avgAccuracy: Number((avgAccuracy[0]?.avg ?? 0).toFixed(4)),
      avgLatencyMs: Number((avgLatency[0]?.avg ?? 0).toFixed(2)),
      avgThroughput: Number((avgThroughput[0]?.avg ?? 0).toFixed(2)),
    };
  }),
});
