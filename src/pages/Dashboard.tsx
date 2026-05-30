import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Activity,
  TrendingUp,
  Zap,
  Shield,
  Clock,
  BarChart3,
  PieChart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCw,
  Loader2,
  Smile,
  Frown,
  Meh,
  AlertCircle,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from 'recharts'

const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#64748b',
  mixed: '#f59e0b',
}

const TOPIC_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899']

const sentimentConfig: Record<string, { icon: typeof Smile; color: string }> = {
  positive: { icon: Smile, color: 'text-emerald-600' },
  negative: { icon: Frown, color: 'text-red-600' },
  neutral: { icon: Meh, color: 'text-slate-600' },
  mixed: { icon: AlertCircle, color: 'text-amber-600' },
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('overview')

  const analytics = trpc.analysis.analytics.useQuery()
  const sentimentDist = trpc.analysis.sentimentDistribution.useQuery()
  const topicDist = trpc.analysis.topicDistribution.useQuery()
  const history = trpc.analysis.history.useQuery({ limit: 50, offset: 0 })
  const modelStats = trpc.models.stats.useQuery()
  const experimentStats = trpc.experiments.stats.useQuery()

  const sentimentChartData = sentimentDist.data?.map((s) => ({
    name: s.sentiment.charAt(0).toUpperCase() + s.sentiment.slice(1),
    value: s.count,
    color: SENTIMENT_COLORS[s.sentiment as keyof typeof SENTIMENT_COLORS] || '#94a3b8',
  })) || []

  const topicChartData = topicDist.data?.map((t, i) => ({
    name: t.topic || 'Unknown',
    value: t.count,
    color: TOPIC_COLORS[i % TOPIC_COLORS.length],
  })) || []

  const confidenceData = history.data?.items.slice(0, 20).map((item, i) => ({
    index: i + 1,
    confidence: (item.confidence * 100).toFixed(1),
    processingTime: (item.processingTime * 1000).toFixed(1),
  })) || []

  const isLoading = analytics.isLoading || sentimentDist.isLoading || topicDist.isLoading ||
    history.isLoading || modelStats.isLoading || experimentStats.isLoading

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MLOps Dashboard</h1>
            <p className="mt-1 text-muted-foreground">
              Real-time monitoring and analytics for NLP models
            </p>
          </div>
          <Badge variant="outline" className="gap-1.5 border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </Badge>
        </div>

        {isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Key Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card className="border-border/60">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Total Analyses</p>
                        <p className="mt-1 text-3xl font-bold">{analytics.data?.totalAnalyses ?? 0}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Activity className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Avg Confidence</p>
                        <p className="mt-1 text-3xl font-bold">
                          {((analytics.data?.avgConfidence ?? 0) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <TrendingUp className="h-5 w-5 text-emerald-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Active Models</p>
                        <p className="mt-1 text-3xl font-bold">{modelStats.data?.activeModels ?? 0}</p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <Zap className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60">
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="mt-1 text-3xl font-bold">
                          {((experimentStats.data?.successRate ?? 0) * 100).toFixed(0)}%
                        </p>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                        <Shield className="h-5 w-5 text-purple-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Row */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Sentiment Distribution */}
                <Card className="border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <PieChart className="h-4 w-4 text-primary" />
                      Sentiment Distribution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <RePieChart>
                          <Pie
                            data={sentimentChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {sentimentChartData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </RePieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Topic Distribution */}
                <Card className="border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-base">
                      <BarChart3 className="h-4 w-4 text-primary" />
                      Topic Classification
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[280px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topicChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                            {topicChartData.map((entry, index) => (
                              <Cell key={index} fill={entry.color} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Model & Experiment Status */}
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Model Registry Summary</CardTitle>
                    <CardDescription>Active and deprecated models</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-sm">
                          <span>Active Models</span>
                          <span className="font-semibold">{modelStats.data?.activeModels ?? 0}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-emerald-500 transition-all"
                            style={{
                              width: `${modelStats.data?.totalModels ? (modelStats.data.activeModels / modelStats.data.totalModels) * 100 : 0}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="mb-1 flex justify-between text-sm">
                          <span>Average Accuracy</span>
                          <span className="font-semibold">
                            {((modelStats.data?.avgAccuracy ?? 0) * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-blue-500 transition-all"
                            style={{ width: `${(modelStats.data?.avgAccuracy ?? 0) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Experiment Status</CardTitle>
                    <CardDescription>Training experiment overview</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                          <RotateCw className="h-5 w-5 text-blue-600" />
                        </div>
                        <p className="text-xl font-bold">{experimentStats.data?.total ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                        </div>
                        <p className="text-xl font-bold">{experimentStats.data?.completed ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Completed</p>
                      </div>
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                          <Clock className="h-5 w-5 text-amber-600" />
                        </div>
                        <p className="text-xl font-bold">{experimentStats.data?.running ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Running</p>
                      </div>
                      <div className="text-center">
                        <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/10">
                          <XCircle className="h-5 w-5 text-red-600" />
                        </div>
                        <p className="text-xl font-bold">{experimentStats.data?.failed ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Failed</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Confidence & Latency Trends
                  </CardTitle>
                  <CardDescription>Recent analysis performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={confidenceData}>
                        <defs>
                          <linearGradient id="colorConfidence" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" tick={{ fontSize: 12 }} />
                        <YAxis yAxisId="left" tick={{ fontSize: 12 }} domain={[80, 100]} />
                        <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="confidence"
                          name="Confidence (%)"
                          stroke="#3b82f6"
                          fillOpacity={1}
                          fill="url(#colorConfidence)"
                        />
                        <Area
                          yAxisId="right"
                          type="monotone"
                          dataKey="processingTime"
                          name="Latency (ms)"
                          stroke="#10b981"
                          fillOpacity={1}
                          fill="url(#colorLatency)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Processing Time Distribution */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Latency Distribution</CardTitle>
                  <CardDescription>Analysis processing time across recent requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={confidenceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="index" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Bar dataKey="processingTime" name="Latency (ms)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity Tab */}
            <TabsContent value="activity" className="space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="text-base">Recent Analyses</CardTitle>
                  <CardDescription>Latest text analysis results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {history.data?.items.map((item) => {
                      const config = sentimentConfig[item.sentiment]
                      const Icon = config?.icon || Meh
                      return (
                        <div
                          key={item.id}
                          className="flex items-start gap-4 rounded-lg border border-border/60 bg-background p-4"
                        >
                          <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                            item.sentiment === 'positive' ? 'bg-emerald-500/10' :
                            item.sentiment === 'negative' ? 'bg-red-500/10' :
                            item.sentiment === 'mixed' ? 'bg-amber-500/10' : 'bg-slate-500/10'
                          }`}>
                            <Icon className={`h-5 w-5 ${config?.color || ''}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{item.text}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <Badge variant="outline" className="text-xs capitalize">
                                {item.sentiment}
                              </Badge>
                              <span>Topic: {item.topic}</span>
                              <span>Confidence: {(item.confidence * 100).toFixed(1)}%</span>
                              <span>{item.processingTime.toFixed(3)}s</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                    {(!history.data?.items || history.data.items.length === 0) && (
                      <div className="py-12 text-center text-muted-foreground">
                        <AlertTriangle className="mx-auto mb-2 h-8 w-8 opacity-40" />
                        <p>No analyses yet. Try analyzing some text on the home page!</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
