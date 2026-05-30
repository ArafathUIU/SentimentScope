import { useState } from 'react'
import { trpc } from '@/providers/trpc'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import {
  Cpu,
  Activity,
  TrendingUp,
  Clock,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  BarChart3,
  GitBranch,
  Box,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
} from 'recharts'

const statusConfig: Record<string, { icon: typeof CheckCircle2; color: string; bg: string }> = {
  active: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-500/10' },
  deprecated: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-500/10' },
  training: { icon: Loader2, color: 'text-blue-600', bg: 'bg-blue-500/10' },
  failed: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-500/10' },
}

const typeColors: Record<string, string> = {
  sentiment: 'bg-emerald-500/10 text-emerald-600',
  topic: 'bg-blue-500/10 text-blue-600',
  summarization: 'bg-purple-500/10 text-purple-600',
  ner: 'bg-amber-500/10 text-amber-600',
  custom: 'bg-slate-500/10 text-slate-600',
}

export default function Models() {
  const [selectedModel, setSelectedModel] = useState<any>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('registry')

  const modelsQuery = trpc.models.list.useQuery()
  const modelStats = trpc.models.stats.useQuery()

  const handleViewDetails = (model: any) => {
    setSelectedModel(model)
    setDialogOpen(true)
  }

  const radarData = selectedModel ? [
    { metric: 'Accuracy', value: (selectedModel.accuracy || 0) * 100 },
    { metric: 'F1 Score', value: (selectedModel.f1Score || 0) * 100 },
    { metric: 'Speed', value: Math.max(0, 100 - (selectedModel.latency || 0) * 2) },
    { metric: 'Stability', value: selectedModel.status === 'active' ? 95 : 60 },
    { metric: 'Data Coverage', value: Math.min(100, ((selectedModel.trainingDataSize || 0) / 50000) * 100) },
  ] : []

  const comparisonData = modelsQuery.data
    ?.filter((m) => m.status === 'active')
    .map((m) => ({
      name: m.name,
      accuracy: (m.accuracy || 0) * 100,
      f1Score: (m.f1Score || 0) * 100,
      latency: m.latency || 0,
    })) || []

  return (
    <div className="min-h-screen bg-muted/20 px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Model Registry</h1>
          <p className="mt-1 text-muted-foreground">
            Manage, compare, and monitor all NLP models in production
          </p>
        </div>

        {modelsQuery.isLoading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-8 grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="registry">Registry</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {/* Registry Tab */}
            <TabsContent value="registry" className="space-y-6">
              {/* Stats */}
              <div className="grid gap-4 sm:grid-cols-3">
                <Card className="border-border/60">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <Box className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{modelStats.data?.totalModels ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Total Models</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                        <Activity className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{modelStats.data?.activeModels ?? 0}</p>
                        <p className="text-xs text-muted-foreground">Active Models</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-border/60">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <TrendingUp className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">
                          {((modelStats.data?.avgAccuracy ?? 0) * 100).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">Avg Accuracy</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Models Table */}
              <Card className="border-border/60">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Layers className="h-4 w-4 text-primary" />
                    All Models
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Framework</TableHead>
                        <TableHead>Version</TableHead>
                        <TableHead>Accuracy</TableHead>
                        <TableHead>Latency</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {modelsQuery.data?.map((model) => {
                        const status = statusConfig[model.status] || statusConfig.active
                        const StatusIcon = status.icon
                        return (
                          <TableRow key={model.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(model)}>
                            <TableCell className="font-medium">{model.name}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={`text-xs capitalize ${typeColors[model.type] || ''}`}>
                                {model.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{model.framework}</TableCell>
                            <TableCell className="text-sm">{model.version}</TableCell>
                            <TableCell>
                              {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : 'N/A'}
                            </TableCell>
                            <TableCell className="text-sm">
                              {model.latency ? `${model.latency.toFixed(1)}ms` : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <div className={`flex items-center gap-1.5 ${status.color}`}>
                                <StatusIcon className={`h-3.5 w-3.5 ${model.status === 'training' ? 'animate-spin' : ''}`} />
                                <span className="text-xs capitalize">{model.status}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                Details
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Model Detail Dialog */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Cpu className="h-5 w-5 text-primary" />
                      {selectedModel?.name}
                      <Badge variant="outline" className="ml-2 text-xs">
                        {selectedModel?.version}
                      </Badge>
                    </DialogTitle>
                    <DialogDescription>{selectedModel?.description}</DialogDescription>
                  </DialogHeader>

                  {selectedModel && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-4 gap-4">
                        <div className="rounded-lg border border-border/60 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Accuracy</p>
                          <p className="text-xl font-bold text-primary">
                            {selectedModel.accuracy ? `${(selectedModel.accuracy * 100).toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/60 p-3 text-center">
                          <p className="text-xs text-muted-foreground">F1 Score</p>
                          <p className="text-xl font-bold text-primary">
                            {selectedModel.f1Score ? `${(selectedModel.f1Score * 100).toFixed(1)}%` : 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/60 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Latency</p>
                          <p className="text-xl font-bold text-primary">
                            {selectedModel.latency ? `${selectedModel.latency.toFixed(1)}ms` : 'N/A'}
                          </p>
                        </div>
                        <div className="rounded-lg border border-border/60 p-3 text-center">
                          <p className="text-xs text-muted-foreground">Training Data</p>
                          <p className="text-xl font-bold text-primary">
                            {selectedModel.trainingDataSize?.toLocaleString() || 'N/A'}
                          </p>
                        </div>
                      </div>

                      <div className="h-[280px]">
                        <p className="mb-3 text-sm font-medium">Performance Radar</p>
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={radarData}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10 }} />
                            <Radar
                              name={selectedModel.name}
                              dataKey="value"
                              stroke="#3b82f6"
                              fill="#3b82f6"
                              fillOpacity={0.3}
                            />
                            <Legend />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </TabsContent>

            {/* Compare Tab */}
            <TabsContent value="compare" className="space-y-6">
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    Model Comparison
                  </CardTitle>
                  <CardDescription>Accuracy and F1 Score comparison across active models</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="accuracy" name="Accuracy (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="f1Score" name="F1 Score (%)" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Latency Comparison */}
              <Card className="border-border/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-4 w-4 text-primary" />
                    Inference Latency Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={comparisonData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip />
                        <Bar dataKey="latency" name="Latency (ms)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Performance Tab */}
            <TabsContent value="performance" className="space-y-6">
              <div className="grid gap-6 lg:grid-cols-2">
                {modelsQuery.data
                  ?.filter((m) => m.status === 'active')
                  .map((model) => {
                    const radarMetrics = [
                      { metric: 'Accuracy', value: (model.accuracy || 0) * 100 },
                      { metric: 'F1 Score', value: (model.f1Score || 0) * 100 },
                      { metric: 'Speed', value: Math.max(0, 100 - (model.latency || 0) * 2) },
                      { metric: 'Stability', value: 95 },
                      { metric: 'Coverage', value: Math.min(100, ((model.trainingDataSize || 0) / 50000) * 100) },
                    ]
                    return (
                      <Card key={model.id} className="border-border/60">
                        <CardHeader className="pb-2">
                          <CardTitle className="flex items-center gap-2 text-base">
                            <GitBranch className="h-4 w-4 text-primary" />
                            {model.name}
                            <Badge variant="outline" className="text-xs">{model.version}</Badge>
                          </CardTitle>
                          <CardDescription>{model.type} model via {model.framework}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="h-[240px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <RadarChart data={radarMetrics}>
                                <PolarGrid />
                                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                                <Radar
                                  dataKey="value"
                                  stroke="#3b82f6"
                                  fill="#3b82f6"
                                  fillOpacity={0.2}
                                />
                                <Tooltip />
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
