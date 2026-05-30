import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Layers,
  Cpu,
  Database,
  GitBranch,
  Code2,
  Terminal,
  FileJson,
  Server,
  Shield,
  Zap,
} from 'lucide-react'

const techStack = [
  { category: 'Frontend', items: ['React 19', 'TypeScript', 'Tailwind CSS', 'shadcn/ui', 'Recharts', 'React Router v7'] },
  { category: 'Backend', items: ['Hono', 'tRPC 11', 'Zod', 'SuperJSON', 'Node.js'] },
  { category: 'Database', items: ['MySQL', 'Drizzle ORM', 'Drizzle Kit'] },
  { category: 'NLP/ML', items: ['Rule-based Engine', 'BERT Architecture', 'T5 Model', 'BiLSTM-CRF', 'DistilBERT'] },
  { category: 'MLOps', items: ['Experiment Tracking', 'Model Registry', 'Metrics Monitoring', 'CI/CD Pipeline'] },
]

const apiEndpoints = [
  {
    method: 'POST',
    path: '/api/trpc/analysis.analyze',
    description: 'Analyze text for sentiment, topic, summary, and entities',
    input: '{ text: string, modelVersion?: string }',
    output: '{ sentiment, sentimentScore, confidence, topic, summary, entities, processingTime }',
  },
  {
    method: 'POST',
    path: '/api/trpc/analysis.batchAnalyze',
    description: 'Batch analyze up to 10 texts simultaneously',
    input: '{ texts: string[] }',
    output: 'Array of analysis results',
  },
  {
    method: 'GET',
    path: '/api/trpc/analysis.history',
    description: 'Get paginated analysis history',
    input: '{ limit?: number, offset?: number }',
    output: '{ items: Analysis[], total: number }',
  },
  {
    method: 'GET',
    path: '/api/trpc/models.list',
    description: 'List all registered models',
    input: '{}',
    output: 'Model[]',
  },
  {
    method: 'POST',
    path: '/api/trpc/models.create',
    description: 'Register a new model',
    input: '{ name, version, type, framework, accuracy?, f1Score?, latency?, status?, description?, trainingDataSize? }',
    output: 'InsertResult',
  },
  {
    method: 'GET',
    path: '/api/trpc/experiments.list',
    description: 'List all ML experiments',
    input: '{}',
    output: 'Experiment[]',
  },
  {
    method: 'POST',
    path: '/api/trpc/experiments.create',
    description: 'Create a new experiment',
    input: '{ name, modelType, hyperparameters?, epochs? }',
    output: 'InsertResult',
  },
  {
    method: 'GET',
    path: '/api/trpc/metrics.latest',
    description: 'Get latest metrics for all active models',
    input: '{}',
    output: 'Array of model metrics',
  },
]

const architectureLayers = [
  {
    title: 'Presentation Layer',
    icon: Layers,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    items: [
      'React 19 SPA with Vite build system',
      'Tailwind CSS + shadcn/ui component library',
      'Recharts for data visualization',
      'Responsive design with mobile support',
      'Dark/light theme support',
    ],
  },
  {
    title: 'API Gateway Layer',
    icon: Server,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    items: [
      'Hono HTTP framework for API server',
      'tRPC 11 for end-to-end type-safe APIs',
      'Zod schema validation on all inputs',
      'SuperJSON for serialization',
      'Batch link for efficient requests',
    ],
  },
  {
    title: 'Business Logic Layer',
    icon: Cpu,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    items: [
      'NLP Analysis Engine (rule-based + ML)',
      'Sentiment analysis with confidence scoring',
      'Topic classification across 6 domains',
      'Extractive text summarization',
      'Named Entity Recognition (NER)',
      'Model registry and experiment tracking',
    ],
  },
  {
    title: 'Data Access Layer',
    icon: Database,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    items: [
      'Drizzle ORM for type-safe queries',
      'MySQL database with relational schema',
      'Schema migrations with Drizzle Kit',
      'Seed data for development/testing',
      'Lazy database connection',
    ],
  },
]

const features = [
  {
    title: 'Sentiment Analysis',
    icon: Zap,
    description: 'Classifies text into positive, negative, neutral, or mixed sentiment with confidence scores. Uses a lexicon-based approach with word scoring.',
    tags: ['NLP', 'Classification'],
  },
  {
    title: 'Topic Classification',
    icon: Layers,
    description: 'Identifies the dominant topic from Technology, Food, Travel, Health, Finance, or Service domains using keyword-based classification.',
    tags: ['NLP', 'Multi-label'],
  },
  {
    title: 'Text Summarization',
    icon: FileJson,
    description: 'Extractive summarization that scores sentences by position, keyword presence, and structural importance to generate concise summaries.',
    tags: ['NLP', 'Generation'],
  },
  {
    title: 'Named Entity Recognition',
    icon: Shield,
    description: 'Extracts entities including organizations (ORG), people (PERSON), monetary values (MONEY), and dates from unstructured text.',
    tags: ['NLP', 'NER'],
  },
  {
    title: 'Model Registry',
    icon: Cpu,
    description: 'Centralized registry for managing ML models with versioning, framework tracking, performance metrics, and deployment status.',
    tags: ['MLOps', 'Registry'],
  },
  {
    title: 'Experiment Tracking',
    icon: GitBranch,
    description: 'Track ML experiments with hyperparameters, training metrics, epoch progress, and experiment outcomes in a unified interface.',
    tags: ['MLOps', 'Tracking'],
  },
]

export default function Docs() {
  return (
    <div className="min-h-screen bg-muted/20 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
          <p className="mt-1 text-muted-foreground">
            Architecture, API reference, and feature documentation
          </p>
        </div>

        <Tabs defaultValue="architecture" className="space-y-8">
          <TabsList className="grid w-full max-w-lg grid-cols-4">
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="api">API</TabsTrigger>
            <TabsTrigger value="stack">Stack</TabsTrigger>
          </TabsList>

          {/* Architecture Tab */}
          <TabsContent value="architecture" className="space-y-6">
            <div className="rounded-2xl border border-border/60 bg-background p-2 shadow-lg mb-8">
              <img
                src="/images/dashboard-preview.jpg"
                alt="System Architecture"
                className="rounded-xl"
              />
            </div>

            <div className="space-y-4">
              {architectureLayers.map((layer) => {
                const Icon = layer.icon
                return (
                  <Card key={layer.title} className="border-border/60">
                    <CardContent className="flex items-start gap-5 p-5">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${layer.bg}`}>
                        <Icon className={`h-6 w-6 ${layer.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="mb-2 text-lg font-semibold">{layer.title}</h3>
                        <ul className="space-y-1.5">
                          {layer.items.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                              <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* Features Tab */}
          <TabsContent value="features" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {features.map((feature) => {
                const Icon = feature.icon
                return (
                  <Card key={feature.title} className="border-border/60">
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold">{feature.title}</h3>
                      </div>
                      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
                        {feature.description}
                      </p>
                      <div className="flex gap-2">
                        {feature.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </TabsContent>

          {/* API Tab */}
          <TabsContent value="api" className="space-y-6">
            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Terminal className="h-4 w-4 text-primary" />
                  API Endpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {apiEndpoints.map((endpoint, i) => (
                  <div
                    key={i}
                    className="rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="mb-2 flex items-center gap-3">
                      <Badge
                        variant={endpoint.method === 'GET' ? 'default' : 'secondary'}
                        className="text-xs font-mono"
                      >
                        {endpoint.method}
                      </Badge>
                      <code className="text-sm font-mono text-primary">{endpoint.path}</code>
                    </div>
                    <p className="mb-2 text-sm text-muted-foreground">{endpoint.description}</p>
                    <div className="space-y-1 text-xs">
                      <p className="font-mono text-muted-foreground">
                        <span className="text-emerald-600 font-semibold">Input:</span> {endpoint.input}
                      </p>
                      <p className="font-mono text-muted-foreground">
                        <span className="text-blue-600 font-semibold">Output:</span> {endpoint.output}
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stack Tab */}
          <TabsContent value="stack" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {techStack.map((group) => (
                <Card key={group.category} className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{group.category}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <Badge
                          key={item}
                          variant="outline"
                          className="px-3 py-1 text-sm font-medium"
                        >
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Code2 className="h-4 w-4 text-primary" />
                  Project Structure
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="overflow-x-auto rounded-lg bg-muted/50 p-4 text-sm font-mono">
{`sentimentscope/
├── api/                    # Backend API
│   ├── routers/           # tRPC routers
│   │   ├── analysis.ts    # NLP analysis endpoints
│   │   ├── models.ts      # Model registry endpoints
│   │   ├── experiments.ts # Experiment tracking endpoints
│   │   └── metrics.ts     # Performance metrics endpoints
│   ├── middleware.ts      # tRPC middleware
│   ├── context.ts         # Request context
│   └── boot.ts           # Server entry point
├── db/                     # Database
│   ├── schema.ts          # Drizzle ORM schema
│   └── seed.ts           # Database seed data
├── contracts/              # Shared types
├── src/                    # Frontend
│   ├── pages/             # Page components
│   │   ├── Home.tsx       # Landing page with demo
│   │   ├── Dashboard.tsx  # MLOps dashboard
│   │   ├── Models.tsx     # Model registry
│   │   ├── Pipeline.tsx   # MLOps pipeline
│   │   └── Docs.tsx       # Documentation
│   ├── components/        # Reusable components
│   ├── providers/         # Context providers
│   └── App.tsx           # App root with routing
└── public/images/          # Static assets`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
