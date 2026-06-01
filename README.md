# SentimentScope

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite)](https://vite.dev)
[![tRPC](https://img.shields.io/badge/tRPC-11-2596BE)](https://trpc.io)
[![Hono](https://img.shields.io/badge/Hono-4-E36049)](https://hono.dev)
[![Drizzle](https://img.shields.io/badge/Drizzle-0.45-C5F74F)](https://orm.drizzle.team)
[![Gemini](https://img.shields.io/badge/Gemini_2.0-4285F4?logo=google)](https://ai.google.dev)

A production-grade NLP + MLOps learning platform featuring real-time sentiment analysis, topic classification, text summarization, named entity recognition, model registry, experiment tracking, and performance monitoring — all wrapped in a complete MLOps pipeline.

---

## Overview

SentimentScope is a full-stack web application built as a practical learning project for AI/ML engineers. It demonstrates how to build a complete NLP pipeline with a modern tech stack, from data ingestion through model monitoring.

The platform includes two NLP engines:
- **Rule-based** — fast keyword-matching sentiment, topic, and entity analysis (works offline)
- **Gemini AI** — Google Gemini 2.0 Flash for deeper semantic understanding with automatic fallback

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS v3, shadcn/ui, Recharts, React Router v7 |
| **Backend** | Hono 4, tRPC 11, Zod 4, SuperJSON |
| **Database** | MySQL 8, Drizzle ORM 0.45, Drizzle Kit |
| **AI/ML** | Google Gemini 2.0 Flash API, Rule-based NLP engine |

## Features

- **Sentiment Analysis** — Classify text as positive, negative, neutral, or mixed with confidence scoring
- **Topic Classification** — Detect domain topics: Technology, Food, Travel, Health, Finance, Service
- **Text Summarization** — Extractive summarization that identifies key sentences
- **Named Entity Recognition** — Extract organizations, people, money, and dates from text
- **Model Registry** — Centralized model management with versioning, framework tracking, and performance benchmarking
- **Experiment Tracking** — Track hyperparameters, metrics, and training progress for ML experiments
- **Performance Metrics** — Record and visualize model accuracy, latency, and throughput over time
- **MLOps Dashboard** — Real-time analytics charts for sentiment distribution, topic breakdown, and confidence trends
- **Gemini AI Integration** — Automatic fallback from Gemini to rule-based engine when API is unavailable

## Architecture

```
Browser ──> Vite Dev Server ──> Hono (tRPC handler) ──> Drizzle ORM ──> MySQL 8
              │                       │
              │  serves static        │  /api/trpc/*
              │  + HMR                │  analysis, models,
              │                       │  experiments, metrics
```

The frontend communicates with the backend exclusively through tRPC procedures. All API endpoints are type-safe, with shared types between client and server.

## Getting Started

### Prerequisites

- **Node.js** 20+ (tested with v25)
- **Docker** (for MySQL) or a running MySQL 8 instance
- **npm** 10+

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/ArafathUIU/SentimentScope.git
   cd SentimentScope
   ```

2. **Start MySQL with Docker**
   ```bash
   docker run -d --name sentiment-mysql \
     -e MYSQL_ROOT_PASSWORD=password \
     -e MYSQL_DATABASE=sentimentscope \
     -p 3306:3306 mysql:8
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and set:
   ```env
   APP_ID=sentimentscope
   APP_SECRET=your-secret-key
   DATABASE_URL=mysql://root:password@localhost:3306/sentimentscope
   GEMINI_API_KEY=your-gemini-api-key  # optional
   ```

4. **Install dependencies**
   ```bash
   npm install
   ```

5. **Push database schema**
   ```bash
   npm run db:push
   ```

6. **(Optional) Seed sample data**
   ```bash
   npx tsx db/seed.ts
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000

## Gemini AI Integration

SentimentScope includes automatic engine selection:

1. **Request arrives** — the backend attempts to call Gemini 2.0 Flash
2. **If Gemini succeeds** — the response includes `engine: "gemini"` with AI-powered results
3. **If Gemini fails** (quota exceeded, network error, invalid key) — silently falls back to rule-based with `engine: "rule"`
4. **UI indicator** — results panel displays which engine was used

To enable Gemini, set your API key in `.env`:
```env
GEMINI_API_KEY=AIzaSy...
```

Get a free API key at [aistudio.google.com](https://aistudio.google.com/apikey).

## Project Structure

```
├── api/                    # Backend (Hono + tRPC)
│   ├── boot.ts             # Server entry point
│   ├── router.ts           # tRPC app router
│   ├── context.ts          # Request context
│   ├── middleware.ts        # tRPC initialization
│   ├── lib/
│   │   ├── env.ts          # Environment config
│   │   ├── gemini.ts       # Gemini AI client
│   │   └── vite.ts         # Static file serving
│   ├── queries/
│   │   └── connection.ts   # Drizzle DB connection
│   └── routers/
│       ├── analysis.ts     # NLP analysis endpoints
│       ├── models.ts       # Model registry CRUD
│       ├── experiments.ts  # Experiment tracking
│       └── metrics.ts      # Performance metrics
├── db/
│   ├── schema.ts           # Drizzle table definitions
│   ├── relations.ts        # Table relations
│   └── seed.ts             # Sample data seeder
├── contracts/              # Shared TypeScript types
├── src/                    # Frontend (React + Vite)
│   ├── main.tsx            # Entry point
│   ├── App.tsx             # Root component + routing
│   ├── components/ui/      # shadcn components (40+)
│   ├── pages/
│   │   ├── Home.tsx        # Landing + live analyzer
│   │   ├── Dashboard.tsx   # Analytics dashboard
│   │   ├── Models.tsx      # Model registry
│   │   ├── Pipeline.tsx    # MLOps pipeline
│   │   └── Docs.tsx        # Architecture docs
│   └── providers/
│       └── trpc.tsx        # tRPC + React Query
├── public/                 # Static assets
├── vite.config.ts          # Vite + Hono dev server
└── drizzle.config.ts       # Drizzle Kit config
```

## API Endpoints

All endpoints are tRPC procedures under `/api/trpc/*`.

### Analysis
| Procedure | Type | Description |
|---|---|---|
| `analysis.analyze` | Mutation | Analyze text for sentiment, topic, summary, entities |
| `analysis.batchAnalyze` | Mutation | Analyze up to 10 texts in parallel |
| `analysis.history` | Query | Paginated analysis history |
| `analysis.sentimentDistribution` | Query | Sentiment breakdown stats |
| `analysis.topicDistribution` | Query | Topic frequency stats |
| `analysis.analytics` | Query | Aggregate analytics summary |
| `analysis.delete` | Mutation | Delete an analysis record |

### Models
| Procedure | Type | Description |
|---|---|---|
| `models.list` | Query | List all registered models |
| `models.getById` | Query | Get model by ID |
| `models.create` | Mutation | Register a new model |
| `models.update` | Mutation | Update model metadata |
| `models.delete` | Mutation | Delete a model |
| `models.stats` | Query | Active model counts and avg accuracy |

### Experiments
| Procedure | Type | Description |
|---|---|---|
| `experiments.list` | Query | List all experiments |
| `experiments.getById` | Query | Get experiment by ID |
| `experiments.create` | Mutation | Create new experiment |
| `experiments.start` | Mutation | Start experiment training |
| `experiments.updateProgress` | Mutation | Update training progress |
| `experiments.complete` | Mutation | Complete / fail experiment |
| `experiments.delete` | Mutation | Delete experiment |
| `experiments.stats` | Query | Experiment success rates |

### Metrics
| Procedure | Type | Description |
|---|---|---|
| `metrics.record` | Mutation | Record a performance metric |
| `metrics.getByModel` | Query | Get metrics for a model |
| `metrics.latest` | Query | Latest metrics for active models |
| `metrics.trends` | Query | Metric trends over time window |
| `metrics.summary` | Query | Aggregated metric averages |

## Scripts

```bash
npm run dev          # Start Vite + Hono dev server (port 3000)
npm run build        # Build frontend + bundle backend
npm run start        # Run production server
npm run check        # TypeScript type checking
npm run lint         # ESLint
npm run format       # Prettier formatting
npm run test         # Vitest
npm run db:push      # Push schema to MySQL
npm run db:migrate   # Run Drizzle migrations
npm run db:generate  # Generate Drizzle migrations
```

## License

This project is created for educational purposes as a full-stack NLP + MLOps learning resource.
