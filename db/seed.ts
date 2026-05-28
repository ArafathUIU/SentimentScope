import { getDb } from "../api/queries/connection";
import { models, experiments, metrics, analyses } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed models
  const modelData = [
    {
      name: "SentimentBERT",
      version: "v2.1",
      type: "sentiment" as const,
      framework: "PyTorch",
      accuracy: 0.94,
      f1Score: 0.93,
      latency: 45.2,
      status: "active" as const,
      description: "Fine-tuned BERT model for sentiment classification on customer reviews",
      trainingDataSize: 50000,
      deployedAt: new Date("2024-11-15"),
    },
    {
      name: "TopicClassifier",
      version: "v1.3",
      type: "topic" as const,
      framework: "TensorFlow",
      accuracy: 0.89,
      f1Score: 0.87,
      latency: 32.5,
      status: "active" as const,
      description: "Multi-label topic classification using DistilBERT architecture",
      trainingDataSize: 35000,
      deployedAt: new Date("2024-12-01"),
    },
    {
      name: "SummaT5",
      version: "v1.0",
      type: "summarization" as const,
      framework: "PyTorch",
      accuracy: 0.85,
      f1Score: 0.84,
      latency: 120.8,
      status: "active" as const,
      description: "T5-based abstractive text summarization model",
      trainingDataSize: 20000,
      deployedAt: new Date("2025-01-10"),
    },
    {
      name: "NER-BiLSTM",
      version: "v1.2",
      type: "ner" as const,
      framework: "spaCy",
      accuracy: 0.91,
      f1Score: 0.90,
      latency: 28.4,
      status: "active" as const,
      description: "BiLSTM-CRF model for named entity recognition",
      trainingDataSize: 15000,
      deployedAt: new Date("2024-10-20"),
    },
    {
      name: "SentimentBERT-Lite",
      version: "v1.5",
      type: "sentiment" as const,
      framework: "ONNX",
      accuracy: 0.88,
      f1Score: 0.87,
      latency: 15.3,
      status: "active" as const,
      description: "Optimized lightweight sentiment model for edge deployment",
      trainingDataSize: 30000,
      deployedAt: new Date("2025-02-01"),
    },
    {
      name: "SentimentBERT",
      version: "v2.0",
      type: "sentiment" as const,
      framework: "PyTorch",
      accuracy: 0.91,
      f1Score: 0.90,
      latency: 52.1,
      status: "deprecated" as const,
      description: "Previous version of sentiment model (deprecated)",
      trainingDataSize: 40000,
      deployedAt: new Date("2024-08-15"),
    },
  ];

  for (const model of modelData) {
    await db.insert(models).values(model);
  }
  console.log(`Inserted ${modelData.length} models`);

  // Seed experiments
  const experimentData = [
    {
      name: "SentimentBERT v2.1 Fine-tuning",
      modelType: "sentiment" as const,
      status: "completed" as const,
      hyperparameters: { learning_rate: 2e-5, batch_size: 32, epochs: 5, warmup_steps: 500 },
      metrics: { accuracy: 0.94, f1: 0.93, precision: 0.95, recall: 0.91 },
      epochs: 5,
      currentEpoch: 5,
      loss: 0.12,
      valLoss: 0.18,
      accuracy: 0.94,
      startedAt: new Date("2025-01-05T09:00:00"),
      completedAt: new Date("2025-01-05T15:30:00"),
      duration: 23400,
    },
    {
      name: "Topic DistilBERT Optimization",
      modelType: "topic" as const,
      status: "completed" as const,
      hyperparameters: { learning_rate: 3e-5, batch_size: 64, epochs: 8, dropout: 0.1 },
      metrics: { accuracy: 0.89, f1: 0.87, precision: 0.88, recall: 0.86 },
      epochs: 8,
      currentEpoch: 8,
      loss: 0.22,
      valLoss: 0.28,
      accuracy: 0.89,
      startedAt: new Date("2025-02-10T10:00:00"),
      completedAt: new Date("2025-02-10T20:45:00"),
      duration: 38700,
    },
    {
      name: "T5 Summarization with RLHF",
      modelType: "summarization" as const,
      status: "running" as const,
      hyperparameters: { learning_rate: 1e-4, batch_size: 16, epochs: 10, beta: 0.3 },
      epochs: 10,
      currentEpoch: 6,
      loss: 0.35,
      valLoss: 0.42,
      accuracy: 0.82,
      startedAt: new Date("2025-02-20T08:00:00"),
    },
    {
      name: "NER BiLSTM-CRF Training",
      modelType: "ner" as const,
      status: "completed" as const,
      hyperparameters: { learning_rate: 0.001, batch_size: 128, epochs: 50, embedding_dim: 300 },
      metrics: { accuracy: 0.91, f1: 0.90, precision: 0.92, recall: 0.89 },
      epochs: 50,
      currentEpoch: 50,
      loss: 0.08,
      valLoss: 0.14,
      accuracy: 0.91,
      startedAt: new Date("2024-10-15T14:00:00"),
      completedAt: new Date("2024-10-16T06:30:00"),
      duration: 58800,
    },
    {
      name: "Sentiment Model Quantization",
      modelType: "sentiment" as const,
      status: "queued" as const,
      hyperparameters: { bits: 8, calibration_samples: 1000, method: "static" },
    },
    {
      name: "Multi-task Learning Experiment",
      modelType: "custom" as const,
      status: "failed" as const,
      hyperparameters: { learning_rate: 5e-5, batch_size: 32, epochs: 15, tasks: 3 },
      epochs: 15,
      currentEpoch: 3,
      loss: 0.89,
      valLoss: 1.12,
      startedAt: new Date("2025-01-20T11:00:00"),
      completedAt: new Date("2025-01-20T12:15:00"),
      duration: 4500,
    },
  ];

  for (const exp of experimentData) {
    await db.insert(experiments).values(exp as any);
  }
  console.log(`Inserted ${experimentData.length} experiments`);

  // Seed sample analyses
  const sampleAnalyses = [
    {
      text: "The new restaurant in town is absolutely amazing! The food was delicious and the service was outstanding. I highly recommend it to everyone.",
      sentiment: "positive" as const,
      sentimentScore: 0.75,
      confidence: 0.95,
      topic: "Food",
      summary: "The new restaurant in town is absolutely amazing! I highly recommend it to everyone.",
      entities: [{ name: "RESTAURANT", type: "ORG" }],
      processingTime: 0.045,
      modelVersion: "v1.0",
    },
    {
      text: "I was really disappointed with the product quality. It broke after just one week of use and customer support was unhelpful. Waste of money.",
      sentiment: "negative" as const,
      sentimentScore: -0.60,
      confidence: 0.92,
      topic: "Technology",
      summary: "I was really disappointed with the product quality. Waste of money.",
      entities: [],
      processingTime: 0.038,
      modelVersion: "v1.0",
    },
    {
      text: "The hotel room was clean and comfortable. Location was convenient. However, the breakfast options were limited. Overall decent experience.",
      sentiment: "mixed" as const,
      sentimentScore: 0.15,
      confidence: 0.88,
      topic: "Travel",
      summary: "The hotel room was clean and comfortable. Overall decent experience.",
      entities: [],
      processingTime: 0.052,
      modelVersion: "v1.0",
    },
    {
      text: "Booking my flight was smooth and easy. The app interface is user-friendly and I got a great deal on the tickets. Very satisfied with the experience.",
      sentiment: "positive" as const,
      sentimentScore: 0.68,
      confidence: 0.94,
      topic: "Travel",
      summary: "Booking my flight was smooth and easy. Very satisfied with the experience.",
      entities: [],
      processingTime: 0.041,
      modelVersion: "v1.0",
    },
    {
      text: "The software has a steep learning curve but once you get used to it, the features are powerful and well-designed. Documentation could be better though.",
      sentiment: "mixed" as const,
      sentimentScore: 0.22,
      confidence: 0.85,
      topic: "Technology",
      summary: "The software has a steep learning curve but features are powerful and well-designed.",
      entities: [],
      processingTime: 0.048,
      modelVersion: "v1.0",
    },
    {
      text: "Dr. Smith was very professional and caring. The medical staff explained everything clearly and the treatment was effective. I feel much better now.",
      sentiment: "positive" as const,
      sentimentScore: 0.82,
      confidence: 0.96,
      topic: "Health",
      summary: "Dr. Smith was very professional and caring. I feel much better now.",
      entities: [{ name: "Smith", type: "PERSON" }],
      processingTime: 0.035,
      modelVersion: "v1.0",
    },
    {
      text: "The investment portfolio performed well this quarter. Returns were above market average and the advisory team provided excellent guidance.",
      sentiment: "positive" as const,
      sentimentScore: 0.70,
      confidence: 0.91,
      topic: "Finance",
      summary: "The investment portfolio performed well this quarter with excellent advisory guidance.",
      entities: [],
      processingTime: 0.044,
      modelVersion: "v1.0",
    },
    {
      text: "Customer service was terrible. I waited on hold for 45 minutes and then they transferred me three times before hanging up. Never again.",
      sentiment: "negative" as const,
      sentimentScore: -0.72,
      confidence: 0.93,
      topic: "Service",
      summary: "Customer service was terrible. Never again.",
      entities: [],
      processingTime: 0.039,
      modelVersion: "v1.0",
    },
  ];

  for (const analysis of sampleAnalyses) {
    await db.insert(analyses).values(analysis);
  }
  console.log(`Inserted ${sampleAnalyses.length} sample analyses`);

  console.log("Seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
