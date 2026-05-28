import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  float,
  int,
  json,
} from "drizzle-orm/mysql-core";

// Text analyses table - stores NLP analysis results
export const analyses = mysqlTable("analyses", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  sentiment: mysqlEnum("sentiment", ["positive", "negative", "neutral", "mixed"]).notNull(),
  sentimentScore: float("sentiment_score").notNull(),
  confidence: float("confidence").notNull(),
  topic: varchar("topic", { length: 100 }),
  summary: text("summary"),
  entities: json("entities").$type<Array<{ name: string; type: string }>>(),
  processingTime: float("processing_time").notNull(),
  modelVersion: varchar("model_version", { length: 50 }).notNull().default("v1.0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Model registry table
export const models = mysqlTable("models", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  version: varchar("version", { length: 50 }).notNull(),
  type: mysqlEnum("type", ["sentiment", "topic", "summarization", "ner", "custom"]).notNull(),
  framework: varchar("framework", { length: 50 }).notNull(),
  accuracy: float("accuracy"),
  f1Score: float("f1_score"),
  latency: float("latency"),
  status: mysqlEnum("status", ["active", "deprecated", "training", "failed"]).notNull().default("active"),
  description: text("description"),
  trainingDataSize: int("training_data_size"),
  deployedAt: timestamp("deployed_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Experiment tracking table
export const experiments = mysqlTable("experiments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 200 }).notNull(),
  modelType: mysqlEnum("model_type", ["sentiment", "topic", "summarization", "ner", "custom"]).notNull(),
  status: mysqlEnum("status", ["running", "completed", "failed", "queued"]).notNull().default("queued"),
  hyperparameters: json("hyperparameters").$type<Record<string, string | number>>(),
  metrics: json("metrics").$type<Record<string, number>>(),
  epochs: int("epochs"),
  currentEpoch: int("current_epoch"),
  loss: float("loss"),
  valLoss: float("val_loss"),
  accuracy: float("accuracy"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  duration: float("duration"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Performance metrics table
export const metrics = mysqlTable("metrics", {
  id: serial("id").primaryKey(),
  modelId: int("model_id").notNull(),
  metricType: mysqlEnum("metric_type", ["accuracy", "precision", "recall", "f1", "latency", "throughput", "memory"]).notNull(),
  value: float("value").notNull(),
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

// Dataset samples for training
export const datasetSamples = mysqlTable("dataset_samples", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  label: varchar("label", { length: 50 }).notNull(),
  sentiment: mysqlEnum("sentiment", ["positive", "negative", "neutral", "mixed"]),
  topic: varchar("topic", { length: 100 }),
  confidence: float("confidence"),
  source: varchar("source", { length: 100 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
