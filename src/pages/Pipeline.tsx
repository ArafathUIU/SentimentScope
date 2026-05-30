import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Database,
  Settings,
  Brain,
  CheckCircle2,
  Rocket,
  Eye,
  ArrowRight,
  Loader2,
  Clock,
  TrendingUp,
  XCircle,
} from 'lucide-react'
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  AreaChart,
  Area,
} from 'recharts'

const pipelineStages = [
  {
    id: 'ingestion',
    title: 'Data Ingestion',
    icon: Database,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    description: 'Collect and validate raw text data from multiple sources including APIs, files, and databases.',
    status: 'completed',
  },
  {
    id: 'preprocessing',
    title: 'Preprocessing',
    icon: Settings,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    description: 'Clean, tokenize, normalize, and prepare text data for model training and inference.',
    status: 'completed',
  },
  {
    id: 'training',
    title: 'Model Training',
    icon: Brain,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    description: 'Train NLP models with hyperparameter tuning using frameworks like PyTorch and TensorFlow.',
    status: 'running',
  },
  {
    id: 'validation',
    title: 'Validation',
    icon: CheckCircle2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/30',
    description: 'Evaluate model performance on test datasets with accuracy, precision, recall, and F1 metrics.',
    status: 'pending',
  },
  {
    id: 'deployment',
    title: 'Deployment',
    icon: Rocket,
    color: 'text-amber-600',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    description: 'Deploy models to production with A/B testing, canary releases, and rollback capability.',
    status: 'pending',
  },
  {
    id: 'monitoring',
    title: 'Monitoring',
    icon: Eye,
    color: 'text-rose-600',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    description: 'Monitor model performance, drift detection, and automated alerting in real-time.',
    status: 'active',
  },
]

const statusIcons: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2,
  running: Loader2,
  active: Eye,
  pending: Clock,
  failed: XCircle,
}

const statusColors: Record<string, string> = {
  completed: 'text-emerald-600 bg-emerald-500/10 border-emerald-500/30',
  running: 'text-blue-600 bg-blue-500/10 border-blue-500/30',
  active: 'text-rose-600 bg-rose-500/10 border-rose-500/30',
  pending: 'text-slate-400 bg-slate-500/5 border-slate-300/30',
  failed: 'text-red-600 bg-red-500/10 border-red-500/30',
}

export default function Pipeline() {
  const [activeTab, setActiveTab] = useState('pipeline')
  const experiments = trpc.experiments.list.useQuery()

  const generateLossData = (exp: any) => {
    if (!exp) return []
    const epochs = exp.epochs || 10
    const data = []
    for (let i = 1; i <= Math.min(epochs, exp.currentEpoch || epochs); i++) {
      const progress = i / epochs
      data.push({
        epoch: i,
        loss: (exp.loss || 0.5) * (1 - progress * 0.8) + Math.random() * 0.05,
        valLoss: (exp.valLoss || 0.6) * (1 - progress * 0.7) + Math.random() * 0.05,
        accuracy: Math.min(0.95, (exp.accuracy || 0.5) + progress * 0.4 + Math.random() * 0.02),
      })
    }
    return data
  }

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">MLOps Pipeline</h1>
          <p className="mt-1 text-muted-foreground">
            End-to-end machine learning operations from data to deployment
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="pipeline">Pipeline</TabsTrigger>
            <TabsTrigger value="experiments">Experiments</TabsTrigger>
            <TabsTrigger value="logs">Training Logs</TabsTrigger>
          </TabsList>

          {/* Pipeline Visualization */}
          <TabsContent value="pipeline" className="space-y-6">
            <div className="grid gap-4">
              {pipelineStages.map((stage, index) => {
                const Icon = stage.icon
                const StatusIcon = statusIcons[stage.status] || Clock
                return (
                  <div key={stage.id} className="relative">
                    <Card className={`border ${stage.border} transition-all hover:shadow-md`}>
                      <CardContent className="flex items-start gap-5 p-5">
                        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${stage.bg}`}>
                          <Icon className={`h-7 w-7 ${stage.color}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{stage.title}</h3>
                            <Badge
                              variant="outline"
                              className={`text-xs capitalize ${statusColors[stage.status]}`}
                            >
                              <StatusIcon className={`mr-1 h-3 w-3 ${stage.status === 'running' ? 'animate-spin' : ''}`} />
                              {stage.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground leading-relaxed">{stage.description}</p>
                        </div>
                        <div className="hidden shrink-0 sm:flex">
                          <ArrowRight className="h-5 w-5 text-muted-foreground/40" />
                        </div>
                      </CardContent>
                    </Card>
                    {index < pipelineStages.length - 1 && (
                      <div className="my-2 flex justify-center">
                        <div className="h-6 w-0.5 bg-border" />
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Pipeline Image */}
            <Card className="border-border/60 overflow-hidden">
              <CardContent className="p-0">
                <img
                  src="/images/mlops-pipeline.jpg"
                  alt="MLOps Pipeline Architecture"
                  className="w-full"
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Experiments Tab */}
          <TabsContent value="experiments" className="space-y-6">
            {experiments.isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4">
                {experiments.data?.map((exp) => {
                  const StatusIcon = statusIcons[exp.status] || Clock
                  return (
                    <Card key={exp.id} className="border-border/60">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${statusColors[exp.status].split(' ').slice(1).join(' ')}`}>
                          <StatusIcon className={`h-6 w-6 ${statusColors[exp.status].split(' ')[0]} ${exp.status === 'running' ? 'animate-spin' : ''}`} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="mb-2 flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{exp.name}</h3>
                            <Badge variant="outline" className={`text-xs capitalize ${statusColors[exp.status]}`}>
                              {exp.status}
                            </Badge>
                            <Badge variant="outline" className="text-xs capitalize">
                              {exp.modelType}
                            </Badge>
                          </div>
                          <p className="mb-3 text-sm text-muted-foreground">
                            {exp.currentEpoch !== null && exp.epochs !== null
                              ? `Epoch ${exp.currentEpoch}/${exp.epochs} | `
                              : ''}
                            {exp.loss !== null ? `Loss: ${exp.loss.toFixed(4)} | ` : ''}
                            {exp.accuracy !== null ? `Accuracy: ${(exp.accuracy * 100).toFixed(1)}%` : ''}
                          </p>
                          {exp.hyperparameters && (
                            <div className="flex flex-wrap gap-2">
                              {Object.entries(exp.hyperparameters as Record<string, string | number>).map(([key, value]) => (
                                <Badge key={key} variant="secondary" className="text-xs">
                                  {key}: {value}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </TabsContent>

          {/* Training Logs Tab */}
          <TabsContent value="logs" className="space-y-6">
            {experiments.data?.filter((e) => e.status === 'completed' || e.status === 'running').slice(0, 3).map((exp) => {
              const lossData = generateLossData(exp)
              return (
                <Card key={exp.id} className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      {exp.name}
                    </CardTitle>
                    <CardDescription>
                      Training metrics over {lossData.length} epochs
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={lossData}>
                          <defs>
                            <linearGradient id={`loss-${exp.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id={`valLoss-${exp.id}`} x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="epoch" tick={{ fontSize: 12 }} />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="loss"
                            name="Training Loss"
                            stroke="#ef4444"
                            fill={`url(#loss-${exp.id})`}
                          />
                          <Area
                            type="monotone"
                            dataKey="valLoss"
                            name="Validation Loss"
                            stroke="#f59e0b"
                            fill={`url(#valLoss-${exp.id})`}
                          />
                          <Line
                            type="monotone"
                            dataKey="accuracy"
                            name="Accuracy"
                            stroke="#3b82f6"
                            strokeWidth={2}
                            dot={false}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
