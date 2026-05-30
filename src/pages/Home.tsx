import { useState } from 'react'
import { Link } from 'react-router'
import { trpc } from '@/providers/trpc'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  ArrowRight,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  BarChart3,
  Cpu,
  GitBranch,
  Activity,
  Clock,
  Smile,
  Frown,
  Meh,
  AlertCircle,
  Loader2,
  Tag,
  FileText,
  Target,
  BookOpen,
  Brain,
} from 'lucide-react'

const sentimentConfig: Record<string, { icon: typeof Smile; color: string; bg: string }> = {
  positive: { icon: Smile, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/30' },
  negative: { icon: Frown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
  neutral: { icon: Meh, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-950/30' },
  mixed: { icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
}

const sampleTexts = [
  "The new restaurant in town is absolutely amazing! The food was delicious and the service was outstanding. I highly recommend it to everyone.",
  "I was really disappointed with the product quality. It broke after just one week of use and customer support was unhelpful.",
  "The hotel room was clean and comfortable. Location was convenient. However, the breakfast options were limited.",
  "Booking my flight was smooth and easy. The app interface is user-friendly and I got a great deal on the tickets.",
]

export default function Home() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<any>(null)
  const [analyzing, setAnalyzing] = useState(false)

  const analytics = trpc.analysis.analytics.useQuery()
  const sentimentDist = trpc.analysis.sentimentDistribution.useQuery()

  const analyzeMutation = trpc.analysis.analyze.useMutation({
    onSuccess: (data) => {
      setResult(data)
      setAnalyzing(false)
    },
    onError: () => setAnalyzing(false),
  })

  const handleAnalyze = () => {
    if (!text.trim()) return
    setAnalyzing(true)
    analyzeMutation.mutate({ text })
  }

  const handleSample = (sample: string) => {
    setText(sample)
    setAnalyzing(true)
    analyzeMutation.mutate({ text: sample })
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-bg.jpg" alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-24 lg:px-8 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="outline" className="mb-6 border-primary/30 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              NLP + ML + MLOps Platform
            </Badge>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              Understand Text at
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Machine Scale
              </span>
            </h1>
            <p className="mb-10 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              SentimentScope is a production-grade NLP platform featuring real-time sentiment analysis,
              topic classification, text summarization, and a complete MLOps pipeline for model monitoring
              and experiment tracking.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/dashboard">
                <Button size="lg" className="gap-2 px-8">
                  <BarChart3 className="h-4 w-4" />
                  View Dashboard
                </Button>
              </Link>
              <Link to="/models">
                <Button size="lg" variant="outline" className="gap-2 px-8">
                  <Cpu className="h-4 w-4" />
                  Explore Models
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Analysis Demo */}
      <section className="border-t border-border/60 bg-muted/30 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Try It Live</h2>
            <p className="text-muted-foreground">
              Enter any text and see real-time NLP analysis powered by our ML models
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Input Panel */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <FileText className="h-4 w-4 text-primary" />
                  Input Text
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Type or paste text here to analyze sentiment, topic, and more..."
                  className="min-h-[160px] resize-none"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={!text.trim() || analyzing}
                  className="w-full gap-2"
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Analyze Text
                    </>
                  )}
                </Button>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground uppercase">Sample Texts</p>
                  <div className="flex flex-wrap gap-2">
                    {sampleTexts.map((sample, i) => (
                      <button
                        key={i}
                        onClick={() => handleSample(sample)}
                        className="max-w-[200px] truncate rounded-md border border-border/60 bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                      >
                        {sample.slice(0, 50)}...
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <Card className="border-border/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <Activity className="h-4 w-4 text-primary" />
                  Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!result ? (
                  <div className="flex h-[260px] flex-col items-center justify-center text-muted-foreground">
                    <Target className="mb-3 h-10 w-10 opacity-30" />
                    <p className="text-sm">Results will appear here after analysis</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Sentiment */}
                    <div className={`rounded-lg p-4 ${sentimentConfig[result.sentiment]?.bg || 'bg-muted'}`}>
                      <div className="flex items-center gap-3">
                        {(() => {
                          const config = sentimentConfig[result.sentiment]
                          const Icon = config?.icon || Meh
                          return <Icon className={`h-8 w-8 ${config?.color || ''}`} />
                        })()}
                        <div>
                          <p className="text-sm font-medium capitalize">{result.sentiment} Sentiment</p>
                          <p className="text-xs text-muted-foreground">
                            Score: {result.sentimentScore.toFixed(3)} | Confidence: {(result.confidence * 100).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border border-border/60 bg-background p-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Tag className="h-3 w-3" /> Topic
                        </div>
                        <p className="mt-1 font-semibold">{result.topic}</p>
                      </div>
                      <div className="rounded-lg border border-border/60 bg-background p-3">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" /> Processing
                        </div>
                        <p className="mt-1 font-semibold">{result.processingTime.toFixed(3)}s</p>
                      </div>
                      <div className={`rounded-lg border p-3 ${
                        result.engine === 'gemini'
                          ? 'border-purple-500/30 bg-purple-500/5'
                          : 'border-slate-500/30 bg-slate-500/5'
                      }`}>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Cpu className="h-3 w-3" /> Engine
                        </div>
                        <p className={`mt-1 font-semibold capitalize ${
                          result.engine === 'gemini' ? 'text-purple-600' : 'text-slate-600'
                        }`}>
                          {result.engine === 'gemini' ? 'Gemini AI' : 'Rule-based'}
                        </p>
                      </div>
                    </div>

                    {/* Summary */}
                    {result.summary && (
                      <div className="rounded-lg border border-border/60 bg-background p-3">
                        <p className="mb-1 text-xs font-medium text-muted-foreground">Summary</p>
                        <p className="text-sm leading-relaxed">{result.summary}</p>
                      </div>
                    )}

                    {/* Entities */}
                    {result.entities && result.entities.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {result.entities.map((e: any, i: number) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {e.name} <span className="ml-1 text-muted-foreground">({e.type})</span>
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Platform Stats */}
      <section className="border-t border-border/60 px-4 py-16 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Activity className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.data?.totalAnalyses ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Total Analyses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                    <TrendingUp className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {((analytics.data?.avgConfidence ?? 0) * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Confidence</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Zap className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      {(analytics.data?.avgProcessingTime ?? 0).toFixed(3)}s
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Latency</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/60">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{analytics.data?.todayAnalyses ?? 0}</p>
                    <p className="text-xs text-muted-foreground">Today's Analyses</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sentiment Distribution */}
      {sentimentDist.data && sentimentDist.data.length > 0 && (
        <section className="border-t border-border/60 bg-muted/30 px-4 py-16 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-8 text-2xl font-bold">Sentiment Distribution</h2>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {sentimentDist.data.map((item) => {
                const config = sentimentConfig[item.sentiment]
                const total = sentimentDist.data!.reduce((acc, s) => acc + s.count, 0)
                const pct = total > 0 ? ((item.count / total) * 100).toFixed(1) : '0'
                return (
                  <div key={item.sentiment} className="flex flex-col items-center gap-2">
                    <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${config?.bg || 'bg-muted'}`}>
                      {(() => {
                        const Icon = config?.icon || Meh
                        return <Icon className={`h-8 w-8 ${config?.color || ''}`} />
                      })()}
                    </div>
                    <p className="font-semibold capitalize">{item.sentiment}</p>
                    <p className="text-2xl font-bold text-primary">{pct}%</p>
                    <p className="text-xs text-muted-foreground">{item.count} analyses</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="border-t border-border/60 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-bold tracking-tight">Platform Features</h2>
            <p className="text-muted-foreground">
              A complete NLP + MLOps stack for production-ready text analysis
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Sparkles,
                title: 'Sentiment Analysis',
                desc: 'Real-time sentiment classification with confidence scoring across positive, negative, neutral, and mixed categories.',
                color: 'text-emerald-600',
                bg: 'bg-emerald-500/10',
              },
              {
                icon: Tag,
                title: 'Topic Classification',
                desc: 'Multi-label topic detection covering Technology, Food, Travel, Health, Finance, and Service domains.',
                color: 'text-blue-600',
                bg: 'bg-blue-500/10',
              },
              {
                icon: FileText,
                title: 'Text Summarization',
                desc: 'Extractive summarization that identifies key sentences to generate concise summaries of long texts.',
                color: 'text-purple-600',
                bg: 'bg-purple-500/10',
              },
              {
                icon: Target,
                title: 'Named Entity Recognition',
                desc: 'Extract entities like organizations, people, money values, and dates from unstructured text.',
                color: 'text-amber-600',
                bg: 'bg-amber-500/10',
              },
              {
                icon: Cpu,
                title: 'Model Registry',
                desc: 'Centralized model management with versioning, framework tracking, and performance benchmarking.',
                color: 'text-cyan-600',
                bg: 'bg-cyan-500/10',
              },
              {
                icon: GitBranch,
                title: 'Experiment Tracking',
                desc: 'Track hyperparameters, metrics, and training progress across all ML experiments in one place.',
                color: 'text-rose-600',
                bg: 'bg-rose-500/10',
              },
            ].map((feature, i) => {
              const Icon = feature.icon
              return (
                <Card key={i} className="group border-border/60 transition-all hover:border-primary/30 hover:shadow-md">
                  <CardContent className="pt-6">
                    <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${feature.bg} transition-transform group-hover:scale-110`}>
                      <Icon className={`h-6 w-6 ${feature.color}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-semibold">{feature.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{feature.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* MLOps Pipeline Preview */}
      <section className="border-t border-border/60 bg-muted/30 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Badge variant="outline" className="mb-4 border-primary/30 bg-primary/5 text-primary">
                MLOps Pipeline
              </Badge>
              <h2 className="mb-4 text-3xl font-bold tracking-tight">
                End-to-End Machine Learning Operations
              </h2>
              <p className="mb-6 text-muted-foreground leading-relaxed">
                SentimentScope implements a complete MLOps pipeline covering data ingestion,
                preprocessing, model training, validation, deployment, and real-time monitoring.
                Track experiments, compare model versions, and monitor production performance
                from a unified dashboard.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link to="/pipeline">
                  <Button className="gap-2">
                    View Pipeline
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/docs">
                  <Button variant="outline" className="gap-2">
                    <BookOpen className="h-4 w-4" />
                    Architecture Docs
                  </Button>
                </Link>
              </div>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background p-2 shadow-lg">
              <img
                src="/images/mlops-pipeline.jpg"
                alt="MLOps Pipeline"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border/60 px-4 py-20 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight">
            Ready to Explore?
          </h2>
          <p className="mb-8 text-muted-foreground">
            Dive into the dashboard to see real-time analytics, explore the model registry,
            or trace the complete MLOps pipeline.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Open Dashboard
              </Button>
            </Link>
            <Link to="/models">
              <Button size="lg" variant="outline" className="gap-2">
                <Cpu className="h-4 w-4" />
                Model Registry
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-background px-4 py-10 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <span className="font-semibold">SentimentScope</span>
            </div>
            <p className="text-sm text-muted-foreground">
              A comprehensive NLP + ML + MLOps learning project for AI/ML engineers
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
