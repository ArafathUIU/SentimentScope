import { createRouter, publicQuery } from "./middleware";
import { analysisRouter } from "./routers/analysis";
import { modelsRouter } from "./routers/models";
import { experimentsRouter } from "./routers/experiments";
import { metricsRouter } from "./routers/metrics";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  analysis: analysisRouter,
  models: modelsRouter,
  experiments: experimentsRouter,
  metrics: metricsRouter,
});

export type AppRouter = typeof appRouter;
