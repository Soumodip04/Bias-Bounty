"use client"

import { useMemo, useState, useEffect } from "react"
import { createPortal } from "react-dom"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { X, Download, Share2, FileText, User } from "lucide-react"
import { useChartOverlayReady } from "@/hooks/use-chart-overlay-ready"
import { exportToPDF, exportToCSV, shareResults } from "@/lib/export"
import { useResource } from "@/lib/resource-context"
import marketplace from "@/services/marketplace.service"
import { useAuth } from "@/lib/auth-context"
import aptosService from "@/services/aptos.service"
import toast from "react-hot-toast"

// Brand palette
const violet600 = "#7c3aed"
const violet400 = "#a78bfa"
const pink500 = "#ec4899"
const blue500 = "#3b82f6"
const green500 = "#22c55e"
const slate700 = "#334155"
const slate500 = "#64748b"

interface AnalysisResultsProps {
  results: any
  onBack?: () => void
}

// Simple percent formatter (0..1 or 0..100 → 0..100%)
const normalizePercent = (v: number) => (v <= 1 ? v * 100 : v)
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v))

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-2">
      <h3 className="text-xl font-semibold text-slate-900">{title}</h3>
      {sub && <p className="text-sm text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

function Overlay({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true); return () => setMounted(false) }, [])

  const node = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4">
      <div className="relative w-full max-w-6xl h-[85vh] bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <Button variant="outline" onClick={onClose} className="bg-white hover:bg-slate-50">
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="w-full h-[calc(85vh-64px)] p-4 overflow-auto">{children}</div>
      </div>
    </div>
  )

  if (!mounted) return null
  return createPortal(node, document.body)
}

export default function BiasAnalysisResults({ results, onBack }: AnalysisResultsProps) {
  const router = useRouter()
  const { fileData } = useResource()
  const { walletData } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [postTitle, setPostTitle] = useState<string>(results?.dataset_info?.name || results?.dataset_name || "")
  const [postDescription, setPostDescription] = useState<string>(results?.ai_summary || "")
  const [postReward, setPostReward] = useState<number>(0)
  const [postDeadline, setPostDeadline] = useState<string>("")
  const handleCreateSubmit = async ({ title, description, reward, deadline }: { title: string; description?: string; reward?: number; deadline?: string }) => {
    try {
      // If reward is requested, ensure wallet has sufficient funds before posting
      if (reward && reward > 0) {
        const address = walletData?.wallet_address
        if (!address) {
          toast.error("Please create or connect your Aptos wallet before posting a rewarded task")
          return
        }
        const balRes: any = await aptosService.checkBalance(address)
        if (!balRes?.success) {
          toast.error(balRes?.error || "Could not verify wallet balance")
          return
        }
        const balanceAPT: number = typeof balRes.balance_APT === 'number' ? balRes.balance_APT : (typeof balRes.balance_octas === 'number' ? balRes.balance_octas / 1e8 : 0)
        if (reward > balanceAPT) {
          const needed = (reward - balanceAPT).toFixed(4)
          toast.error(`Insufficient tokens: need ${reward} APT, have ${balanceAPT.toFixed(4)} APT (short ${needed} APT)`) 
          return
        }

        // Convert APT → octas (u64) and transfer upfront to platform escrow before posting
        const toOctas = (apt: number) => Math.round(apt * 1e8)
        const receiverAddress = '0xd352cdfd4be4971ca3dc6a63298e69127e49d66b80d9e0e4fea2840d64bc2710'
        const transferRes: any = await aptosService.transferBetweenAccounts({
          userId: walletData.userId,
          receiverAddress,
          amount: toOctas(reward),
        })
        if (!transferRes?.success) {
          toast.error(transferRes?.error || 'Token transfer failed')
          return
        }
      }

      const payload = {
        userId: fileData?.userId || "",
        email: fileData?.email || "",
        username: fileData?.username || "",
        title,
        description,
        filename: fileData?.fileName || (results?.dataset_info?.filename || "dataset"),
        fileSize: fileData?.fileSize || 0,
        type: fileData?.type || "text/csv",
        reward: reward && reward > 0 ? reward : 0,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
      }
      const created = await marketplace.createFile(payload as any)
      if (created?._id) {
        toast.success("Dataset posted to expert marketplace")
        setShowCreateModal(false)
      } else {
        toast.success("Submitted")
        setShowCreateModal(false)
      }
    } catch (err) {
      console.error("Create file error:", err)
      const serverMsg = (err as any)?.response?.data?.message || (err as any)?.response?.data?.error
      toast.error(serverMsg ? `Failed to post: ${serverMsg}` : "Failed to post dataset")
    }
  }
  
  // Core sections used by the UI
  const biasScore: number | undefined = results?.bias_score ?? results?.analysis?.bias_score
  const fairness = results?.fairness_metrics ?? results?.analysis?.fairness_metrics
  const recs: string[] = results?.recommendations ?? results?.analysis?.recommendations ?? []
  const aiSummary: string | undefined = results?.ai_summary ?? results?.analysis?.ai_summary

  const datasetInfo = fairness?.dataset_info
  const demo = fairness?.demographic_bias || {}

  // Chart payloads from backend
  const chart = fairness?.chart_data ?? {}
  const demographicColumns: string[] = demo?.demographic_columns_found || []
  const categorical: Record<string, { label: string; count: number }[]> = chart?.categorical_distributions || {}
  const textStats = chart?.text_stats || {}
  const missingMap: Record<string, number> = fairness?.missing_values ?? fairness?.missing_by_column ?? chart?.missing_values ?? {}
  const outliersMap: Record<string, number> = fairness?.outliers ?? fairness?.outliers_by_column ?? {}

  // Normalize bias score (0–1 or 0–100)
  const rawBias = typeof biasScore === "number" ? biasScore : 0
  const normBias = clamp(normalizePercent(rawBias))
  const severity = normBias > 70 ? "High" : normBias > 40 ? "Medium" : "Low"
  const severityColor = normBias > 70 ? "#ef4444" : normBias > 40 ? "#f59e0b" : green500
  const gaugeData = [
    { name: "Bias", value: normBias },
    { name: "Remaining", value: clamp(100 - normBias) },
  ]

  // Demographic imbalance ratio from categorical distributions
  const demoImbalanceData = (demographicColumns || []).map((col: string) => {
    const items = (categorical?.[col] || []) as { label: string; count: number }[]
    const total = items.reduce((s, it) => s + (Number(it.count) || 0), 0)
    const top = items[0]?.count || 0
    return { column: col, imbalance: total ? top / total : 0 }
  })

  // Text: sentiment distribution and toxicity
  const sentimentDistribution = textStats?.sentiment_distribution || {}
  const sentimentData = Object.entries(sentimentDistribution).map(([k, v]: any) => ({ name: String(k), value: Number(v || 0) }))

  const toxicityData = Object.entries(textStats?.toxicity_by_column || {})
    .map(([name, count]: any) => ({ name: String(name), toxic: Number(count || 0) }))
    .filter((d: any) => d.toxic > 0)

  // Additional drivers
  const skewedColumns: string[] = fairness?.statistical_bias?.skewed_columns ?? []
  const topToxicColumns: string[] = [...toxicityData]
    .sort((a, b) => (b.toxic || 0) - (a.toxic || 0))
    .slice(0, 3)
    .map((d) => `${d.name} (${d.toxic})`)

  // Missing/outliers bar data
  const missingData = Object.entries(missingMap).map(([col, v]: any) => ({ column: String(col), count: Number(v) }))
  const outliersData = Object.entries(outliersMap).map(([col, v]: any) => ({ column: String(col), count: Number(v) }))

  // Reduce on-screen charts: Keep only key sections (Overall Bias, Demographic Imbalance, Text Bias, Data Quality, Recommendations)
  // Add expansion overlay for each chart
  const [expanded, setExpanded] = useState<null | { id: string; title: string }>(null)

  // Use a shared hook to ensure charts only mount after the overlay is measurable
  const overlayReady = useChartOverlayReady(!!expanded)

  // Helpful text bullets
  const keyTakeaways = useMemo(() => {
    const bullets: string[] = []
    bullets.push(
      `Overall bias is ${Math.round(normBias)}%. Severity: ${severity}.`,
    )
    if (datasetInfo?.rows && datasetInfo?.columns) {
      bullets.push(`Dataset size: ${datasetInfo.rows} rows × ${datasetInfo.columns} columns.`)
    }
    if (demographicColumns.length > 0) {
      bullets.push(`Detected demographic columns: ${demographicColumns.join(", ")}.`)
    }
    if (missingData.length > 0) bullets.push("Data quality issues found: missing values in some columns.")
    if (outliersData.length > 0) bullets.push("Potential outliers detected in numeric columns.")
    return bullets
  }, [normBias, severity, datasetInfo, demographicColumns, missingData, outliersData])

  // Expanded renderers for charts
  const renderExpanded = () => {
    if (!expanded) return null
    switch (expanded.id) {
      case "bias":
        return (
          <Overlay title="Overall Bias – Detailed View" onClose={() => setExpanded(null)}>
            {!overlayReady ? (
              <div className="h-[70vh] flex items-center justify-center text-slate-500">Preparing charts…</div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <div className="h-[60vh]">
                  <ResponsiveContainer key={`bias-${overlayReady}`} width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={gaugeData} innerRadius={140} outerRadius={200} paddingAngle={3} isAnimationActive>
                        {gaugeData.map((_, i) => (
                          <Cell key={i} fill={i === 0 ? severityColor : slate700} />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip formatter={(v: any, n: any) => [`${Math.round(v)}%`, n]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div>
                  <SectionHeader title="How to read this" />
                  <ul className="list-disc pl-6 text-slate-700 space-y-1">
                    <li>Bias shows the proportion of detected unfairness relative to the dataset/task.</li>
                    <li>Severity color: green (Low), amber (Medium), red (High).</li>
                    <li>Use recommendations below to reduce high-impact issues first.</li>
                  </ul>
                </div>
              </div>
            )}
          </Overlay>
        )
      case "demographic":
        return (
          <Overlay title="Demographic Imbalance – Detailed View" onClose={() => setExpanded(null)}>
            {!overlayReady ? (
              <div className="h-[70vh] flex items-center justify-center text-slate-500">Preparing charts…</div>
            ) : (
              <>
                <div className="h-[70vh]">
                  <ResponsiveContainer key={`demo-${overlayReady}`} width="100%" height="100%">
                    <BarChart data={demoImbalanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="column" tick={{ fill: slate700 }} />
                      <YAxis tick={{ fill: slate700 }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                      <Tooltip formatter={(v: any) => `${Math.round((v as number) * 100)}%`} />
                      <Bar dataKey="imbalance" fill={violet600} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4">
                  <SectionHeader title="Interpretation" />
                  <ul className="list-disc pl-6 text-slate-700 space-y-1">
                    <li>Imbalance ≈ share of the majority category in each demographic column.</li>
                    <li>Higher values indicate skewed representation which can drive biased outcomes.</li>
                    <li>Consider re-sampling or re-weighting to address high-imbalance columns.</li>
                  </ul>
                </div>
              </>
            )}
          </Overlay>
        )
      case "text-bias":
        return (
          <Overlay title="Text Bias – Detailed View" onClose={() => setExpanded(null)}>
            {!overlayReady ? (
              <div className="h-[70vh] flex items-center justify-center text-slate-500">Preparing charts…</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
                  {sentimentData.length > 0 && (
                    <div className="h-full">
                      <ResponsiveContainer key={`sent-${overlayReady}`} width="100%" height="100%">
                        <LineChart data={sentimentData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fill: slate700 }} />
                          <YAxis tick={{ fill: slate700 }} />
                          <Tooltip formatter={(v: any) => `${v}`} />
                          <Line type="monotone" dataKey="value" stroke={pink500} strokeWidth={3} dot={{ r: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                  {toxicityData.length > 0 && (
                    <div className="h-full">
                      <ResponsiveContainer key={`tox-${overlayReady}`} width="100%" height="100%">
                        <BarChart data={toxicityData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" tick={{ fill: slate700 }} />
                          <YAxis tick={{ fill: slate700 }} />
                          <Tooltip formatter={(v: any) => `${v}`} />
                          <Bar dataKey="toxic" fill={blue500} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <SectionHeader title="Notes" />
                  <ul className="list-disc pl-6 text-slate-700 space-y-1">
                    <li>Sentiment shows overall tone; large skew may indicate biased phrasing.</li>
                    <li>Toxicity highlights prevalence of harmful content per column.</li>
                    <li>Consider text cleaning, debiasing models, or column exclusion if necessary.</li>
                  </ul>
                </div>
              </>
            )}
          </Overlay>
        )
      case "quality":
        return (
          <Overlay title="Data Quality Issues – Detailed View" onClose={() => setExpanded(null)}>
            {!overlayReady ? (
              <div className="h-[70vh] flex items-center justify-center text-slate-500">Preparing charts…</div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[70vh]">
                  {missingData.length > 0 && (
                    <div className="h-full flex flex-col">
                      <SectionHeader title="Missing Values by Column" />
                      <div className="flex-1">
                        <ResponsiveContainer key={`miss-${overlayReady}`} width="100%" height="100%">
                          <BarChart data={missingData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="column" tick={{ fill: slate700 }} />
                            <YAxis tick={{ fill: slate700 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill={pink500} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                  {outliersData.length > 0 && (
                    <div className="h-full flex flex-col">
                      <SectionHeader title="Outliers by Column" />
                      <div className="flex-1">
                        <ResponsiveContainer key={`out-${overlayReady}`} width="100%" height="100%">
                          <BarChart data={outliersData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="column" tick={{ fill: slate700 }} />
                            <YAxis tick={{ fill: slate700 }} />
                            <Tooltip />
                            <Bar dataKey="count" fill={blue500} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}
                </div>
                <div className="mt-4">
                  <SectionHeader title="What to do" />
                  <ul className="list-disc pl-6 text-slate-700 space-y-1">
                    <li>Impute or drop columns with high missingness.</li>
                    <li>Winsorize, clip, or investigate sources of outliers.</li>
                    <li>Re-run analysis after remediation to validate improvements.</li>
                  </ul>
                </div>
              </>
            )}
          </Overlay>
        )
      case "distributions":
        return (
          <Overlay title="Data Distributions – Detailed View" onClose={() => setExpanded(null)}>
            {!overlayReady ? (
              <div className="h-[70vh] flex items-center justify-center text-slate-500">Preparing charts…</div>
            ) : (() => {
              const numericHist = chart?.numeric_histograms || {}
              const corrEdges = chart?.correlation_edges || []
              const catMap = categorical || {}
              const lengthHists = textStats?.length_histograms || {}

              const firstNumeric = Object.entries(numericHist)[0] as any
              const numericData = firstNumeric
                ? (() => {
                    const [colName, hist] = firstNumeric
                    const edges = hist?.bin_edges || []
                    const counts = hist?.counts || []
                    const rows = [] as any[]
                    for (let i = 0; i < Math.min(counts.length, edges.length - 1); i++) {
                      rows.push({
                        range: `${edges[i].toFixed(1)}–${edges[i + 1].toFixed(1)}`,
                        count: counts[i],
                      })
                    }
                    return { colName: String(colName), rows }
                  })()
                : null

              const corrData = (corrEdges as any[]).slice(0, 12).map((e) => ({
                pair: `${e.source} ↔ ${e.target}`,
                weight: Math.abs(Number(e.weight || 0)),
                sign: Number(e.weight || 0) >= 0 ? "positive" : "negative",
              }))

              const catCol = (demographicColumns && demographicColumns[0]) || Object.keys(catMap)[0]
              const catData = (catMap?.[catCol] || []).slice(0, 10).map((d: any) => ({ name: String(d.label), value: Number(d.count || 0) }))

              const firstLen = Object.entries(lengthHists)[0] as any
              const lengthData = firstLen
                ? (() => {
                    const [colName, hist] = firstLen
                    const edges = hist?.bin_edges || []
                    const counts = hist?.counts || []
                    const rows = [] as any[]
                    for (let i = 0; i < Math.min(counts.length, edges.length - 1); i++) {
                      rows.push({ range: `${edges[i]}–${edges[i + 1]}`, count: counts[i] })
                    }
                    return { colName: String(colName), rows }
                  })()
                : null

              const nothingToShow = !numericData && corrData.length === 0 && (!catData || catData.length === 0) && !lengthData

              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {nothingToShow && (
                    <div className="col-span-1 md:col-span-2 h-[60vh] flex items-center justify-center text-slate-500">
                      No distribution data available.
                    </div>
                  )}

                  {/* Numeric histogram */}
                  {numericData && (
                    <div className="h-[320px]">
                      <SectionHeader title={`Numeric Distribution (${numericData.colName})`} sub="Binned counts" />
                      <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={numericData.rows}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" tick={{ fill: slate700 }} hide={false} interval={0} angle={-20} textAnchor="end" height={60} />
                          <YAxis tick={{ fill: slate700 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill={violet600} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Top correlations */}
                  {corrData.length > 0 && (
                    <div className="h-[320px]">
                      <SectionHeader title="Top Correlations" sub="Absolute correlation strength" />
                      <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={corrData} layout="vertical" margin={{ left: 20 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 1]} tick={{ fill: slate700 }} />
                          <YAxis 
                            type="category" 
                            dataKey="pair" 
                            width={280} 
                            tick={{ fill: slate700, fontSize: 11 }} 
                            interval={0}
                            tickFormatter={(value) => {
                              // Truncate long labels to prevent overlap
                              const maxLength = 35
                              return value.length > maxLength ? value.substring(0, maxLength) + '...' : value
                            }}
                          />
                          <Tooltip 
                            formatter={(v: any, _n: any, p: any) => [`${(v as number).toFixed(2)} (${p.payload.sign})`, "corr"]}
                            contentStyle={{ fontSize: '12px' }}
                          />
                          <Bar dataKey="weight" fill={blue500} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Categorical pie */}
                  {catData.length > 0 && (
                    <div className="h-[320px]">
                      <SectionHeader title={`Categorical Overview (${catCol})`} sub="Top categories" />
                      <ResponsiveContainer width="100%" height="85%">
                        <PieChart>
                          <Pie data={catData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                            {catData.map((_d: any, i: number) => (
                              <Cell key={i} fill={i % 2 === 0 ? violet400 : slate500} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Text length hist */}
                  {lengthData && (
                    <div className="h-[320px]">
                      <SectionHeader title={`Text Lengths (${lengthData.colName})`} sub="Characters per entry" />
                      <ResponsiveContainer width="100%" height="85%">
                        <BarChart data={lengthData.rows}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="range" tick={{ fill: slate700 }} hide={false} interval={0} angle={-20} textAnchor="end" height={60} />
                          <YAxis tick={{ fill: slate700 }} />
                          <Tooltip />
                          <Bar dataKey="count" fill={pink500} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              )
            })()}
          </Overlay>
        )
      default:
        return null
    }
  }

  // Top 3 imbalanced columns for bullets
  const topImbalanced = useMemo(() => {
    return [...demoImbalanceData]
      .sort((a, b) => b.imbalance - a.imbalance)
      .slice(0, 3)
      .map((d) => `${d.column} (${Math.round(d.imbalance * 100)}%)`)
  }, [demoImbalanceData])

  return (
    <div className="space-y-8">
      {expanded && renderExpanded()}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-900">Analysis Report</h2>
        
        <div className="flex flex-wrap gap-2">
          {/* Export Buttons */}
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await exportToPDF(results, datasetInfo?.filename || 'analysis')
              toast.success('Opening PDF export...')
            }}
            className="bg-white hover:bg-violet-50 border-violet-200 hover:border-violet-400"
          >
            <FileText className="w-4 h-4 mr-2" />
            Export PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await exportToCSV(results, datasetInfo?.filename || 'analysis')
              toast.success('CSV downloaded!')
            }}
            className="bg-white hover:bg-green-50 border-green-200 hover:border-green-400"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              const success = await shareResults(results, datasetInfo?.filename || 'analysis')
              if (success) toast.success('Results shared!')
            }}
            className="bg-white hover:bg-blue-50 border-blue-200 hover:border-blue-400"
          >
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>

          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="bg-white/70 hover:bg-white"
            >
              Upload another dataset
            </Button>
          )}
        </div>
      </div>

      {/* Key Takeaways */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Key Takeaways</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-6 text-slate-700 space-y-1">
            {keyTakeaways.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Summary (simple) */}
      {showCreateModal && (
        <CreateDatasetModal
          open={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          defaultTitle={postTitle}
          defaultDescription={postDescription}
          fileData={fileData}
          onSubmit={async ({ title, description, reward, deadline }) => {
            await handleCreateSubmit({ title, description, reward, deadline })
          }}
        />
      )}

      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl">Summary</CardTitle>
        </CardHeader>
        <CardContent>
          {(() => {
            const bullets: string[] = []
            bullets.push(`Overall bias: ${severity} (${Math.round(normBias)}%).`)
            if (datasetInfo?.rows && datasetInfo?.columns) bullets.push(`Dataset: ${datasetInfo.rows} rows, ${datasetInfo.columns} columns.`)
            if (demographicColumns.length > 0) bullets.push(`Demographic columns: ${demographicColumns.slice(0,3).join(', ')}${demographicColumns.length>3?'…':''}.`)
            if (missingData.length > 0) bullets.push('Missing values found.')
            if (outliersData.length > 0) bullets.push('Outliers detected.')
            if (topToxicColumns.length > 0) bullets.push(`Text issues in: ${topToxicColumns.join(', ')}.`)
            return (
              <>
                <ul className="list-disc pl-6 text-slate-700 space-y-1">
                  {bullets.map((b, i) => (<li key={i}>{b}</li>))}
                </ul>
                {aiSummary && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-violet-700 hover:underline">Show full AI summary</summary>
                    <p className="mt-2 text-slate-700 whitespace-pre-wrap">{aiSummary}</p>
                  </details>
                )}
              </>
            )
          })()}
        </CardContent>
      </Card>

      {/* Overall Bias */}
      <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Overall Bias Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div role="button" onClick={() => setExpanded({ id: "bias", title: "Overall Bias" })} className="cursor-pointer select-none">
            <div className="h-64">
              <div className="relative h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie dataKey="value" data={gaugeData} innerRadius={70} outerRadius={100} paddingAngle={3} isAnimationActive>
                      {gaugeData.map((d, i) => (
                        <Cell key={i} fill={i === 0 ? severityColor : slate700} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(v: any, n: any) => [`${Math.round(v)}%`, n]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    className="text-3xl font-extrabold"
                    style={{ color: severityColor }}
                  >
                    {Math.round(normBias)}
                  </motion.div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">Bias Score</div>
                  <div className="text-sm mt-1 font-semibold" style={{ color: severityColor }}>
                    {severity}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4 text-sm text-slate-500 text-center">Click the chart to view full-screen details.</div>
          </div>
        </CardContent>
      </Card>

      {/* Dataset Info (bullets instead of separate metric cards for simplicity) */}
      {datasetInfo && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Dataset Info</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-6 text-slate-700 space-y-1">
              <li><strong>Rows</strong>: {datasetInfo.rows}</li>
              <li><strong>Columns</strong>: {datasetInfo.columns}</li>
              <li><strong>Demographic Columns Detected</strong>: {demographicColumns.length}</li>
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Demographic Imbalance (single concise chart) */}
      {demoImbalanceData.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Demographic Imbalance</CardTitle>
          </CardHeader>
          <CardContent>
            <div role="button" onClick={() => setExpanded({ id: "demographic", title: "Demographic Imbalance" })} className="cursor-pointer select-none">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demoImbalanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="column" tick={{ fill: slate700 }} />
                    <YAxis tick={{ fill: slate700 }} tickFormatter={(v) => `${Math.round(v * 100)}%`} />
                    <Tooltip formatter={(v: any) => `${Math.round((v as number) * 100)}%`} />
                    <Bar dataKey="imbalance" fill={violet600} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {topImbalanced.length > 0 && (
                <div className="mt-3">
                  <SectionHeader title="Most imbalanced (top 3)" />
                  <ul className="list-disc pl-6 text-slate-700 space-y-1">
                    {topImbalanced.map((t) => (
                      <li key={t}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="mt-2 text-sm text-slate-500">Click the chart to view full-screen details.</div>
            </div>
            {/* Data Distributions (compact preview) */}
            <div className="mt-6">
              <SectionHeader title="Data Distributions" sub="Quick preview of numeric, categorical, and text length patterns" />
              <div role="button" onClick={() => setExpanded({ id: "distributions", title: "Data Distributions" })} className="cursor-pointer select-none grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Numeric preview: show first numeric histogram bar count preview using counts sum */}
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const nh = (fairness?.chart_data?.numeric_histograms) || {}
                      const first = Object.entries(nh)[0] as any
                      if (!first) return []
                      const [col, hist] = first
                      const counts = (hist?.counts || []).slice(0, 5)
                      return counts.map((c: number, i: number) => ({ bin: `B${i+1}`, count: c }))
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bin" tick={{ fill: slate700 }} />
                      <YAxis tick={{ fill: slate700 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={violet600} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {/* Categorical preview: top 5 of first categorical column */}
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie dataKey="value" data={(() => {
                        const cats = fairness?.chart_data?.categorical_distributions || {}
                        const key = (demographicColumns && demographicColumns[0]) || Object.keys(cats)[0]
                        const arr = (cats?.[key] || []).slice(0, 5)
                        return arr.map((d: any) => ({ name: String(d.label), value: Number(d.count || 0) }))
                      })()} innerRadius={22} outerRadius={34}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Cell key={i} fill={i % 2 === 0 ? violet400 : slate500} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                {/* Text length preview: first column first 5 bins */}
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={(() => {
                      const lh = fairness?.chart_data?.text_stats?.length_histograms || {}
                      const first = Object.entries(lh)[0] as any
                      if (!first) return []
                      const [_col, hist] = first
                      const counts = (hist?.counts || []).slice(0, 5)
                      return counts.map((c: number, i: number) => ({ bin: `B${i+1}`, count: c }))
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bin" tick={{ fill: slate700 }} />
                      <YAxis tick={{ fill: slate700 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill={pink500} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-2 text-sm text-slate-500">Click any preview to explore full-screen distributions.</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Text Bias (combine into one concise section) */}
      {(sentimentData.length > 0 || toxicityData.length > 0) && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Text Bias Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div role="button" onClick={() => setExpanded({ id: "text-bias", title: "Text Bias" })} className="cursor-pointer select-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {sentimentData.length > 0 && (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={sentimentData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: slate700 }} />
                        <YAxis tick={{ fill: slate700 }} />
                        <Tooltip formatter={(v: any) => `${v}`} />
                        <Line type="monotone" dataKey="value" stroke={pink500} strokeWidth={2} dot={{ r: 2 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {toxicityData.length > 0 && (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={toxicityData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fill: slate700 }} />
                        <YAxis tick={{ fill: slate700 }} />
                        <Tooltip formatter={(v: any) => `${v}`} />
                        <Bar dataKey="toxic" fill={blue500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <ul className="list-disc pl-6 text-slate-700 space-y-1 mt-4">
                <li><strong>Sentiment</strong>: overall tone distribution across categories.</li>
                <li><strong>Toxicity</strong>: harmful content prevalence per column.</li>
              </ul>
              <div className="mt-2 text-sm text-slate-500">Click to view full-screen with detailed notes.</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Quality (merge Missing & Outliers) */}
      {(missingData.length > 0 || outliersData.length > 0) && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Data Quality Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div role="button" onClick={() => setExpanded({ id: "quality", title: "Data Quality" })} className="cursor-pointer select-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {missingData.length > 0 && (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={missingData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="column" tick={{ fill: slate700 }} />
                        <YAxis tick={{ fill: slate700 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill={pink500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
                {outliersData.length > 0 && (
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={outliersData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="column" tick={{ fill: slate700 }} />
                        <YAxis tick={{ fill: slate700 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill={blue500} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
              <ul className="list-disc pl-6 text-slate-700 space-y-1 mt-4">
                <li>Address missingness via imputation or dropping low-utility columns.</li>
                <li>Investigate sources of outliers; consider clipping or robust scaling.</li>
              </ul>
              <div className="mt-2 text-sm text-slate-500">Click to expand for a full-screen view and guidance.</div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recs.length > 0 && (
        <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl">Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Drivers summary */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-slate-700">
              <div className="break-words">
                <strong>Skewed Columns</strong>: {skewedColumns.length > 0 ? skewedColumns.join(", ") : "None detected"}
              </div>
              <div className="break-words">
                <strong>Top Toxic Columns</strong>: {topToxicColumns.length > 0 ? topToxicColumns.join(", ") : "None"}
              </div>
              <div className="break-words">
                <strong>Demographic Columns</strong>: {demographicColumns.length > 0 ? demographicColumns.join(", ") : "None"}
              </div>
            </div>

            <ul className="list-disc pl-6 space-y-2 text-slate-700">
              {recs.map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
            {results?.download_url && (
              <div className="pt-4">
                <a href={results.download_url}>
                  <Button className="bg-violet-600 hover:bg-violet-700">Download Improved Dataset</Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Expert Review Request Section */}
      <Card className="border-2 border-violet-200 shadow-xl bg-gradient-to-br from-violet-50 to-purple-50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-violet-600" />
            Not Satisfied with AI Results?
          </CardTitle>
          <CardDescription>
            Get your dataset reviewed by a real human expert for more accurate bias detection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-white/60 rounded-lg p-4 border border-violet-200">
              <h4 className="font-semibold text-slate-900 mb-2">Why Choose Expert Review?</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
                <li>Human experts can catch nuanced biases AI might miss</li>
                <li>Get personalized recommendations for your specific use case</li>
                <li>Detailed analysis with contextual understanding</li>
                <li>Connect with bias detection specialists in our marketplace</li>
              </ul>
            </div>
            
            <div className="flex items-center justify-between bg-violet-100/50 rounded-lg p-4">
              <div>
                <p className="text-sm font-medium text-slate-900">Request Manual Review</p>
                <p className="text-xs text-slate-600">Your dataset will be posted to the expert marketplace</p>
              </div>
              <Button 
                className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white"
                onClick={() => setShowCreateModal(true)}
              >
                Request Expert Review
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Centered overlay modal to collect dataset posting details
function CreateDatasetModal({
  open,
  onClose,
  defaultTitle,
  defaultDescription,
  fileData,
  onSubmit,
}: {
  open: boolean
  onClose: () => void
  defaultTitle?: string
  defaultDescription?: string
  fileData?: {
    userId?: string
    email?: string
    username?: string
    fileName?: string
    fileSize?: number
    type?: string
  } | null
  onSubmit: (payload: { title: string; description?: string; reward?: number; deadline?: string }) => Promise<void>
}) {
  const [title, setTitle] = useState<string>(defaultTitle || "")
  const [description, setDescription] = useState<string>(defaultDescription || "")
  const [reward, setReward] = useState<number>(0)
  const [deadline, setDeadline] = useState<string>("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setTitle(defaultTitle || "")
    setDescription(defaultDescription || "")
  }, [defaultTitle, defaultDescription])

  if (!open) return null

  return (
    <Overlay title="Post Dataset to Expert Marketplace" onClose={onClose}>
      <div className="max-w-2xl mx-auto space-y-4">
        <div className="bg-white rounded-lg p-4 border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-slate-500">Uploader</div>
              <div className="font-medium">{fileData?.username || "-"}</div>
            </div>
            <div>
              <div className="text-slate-500">Email</div>
              <div className="font-medium break-all">{fileData?.email || "-"}</div>
            </div>
            <div>
              <div className="text-slate-500">Filename</div>
              <div className="font-medium break-all">{fileData?.fileName || "-"}</div>
            </div>
            <div>
              <div className="text-slate-500">Type / Size</div>
              <div className="font-medium">{fileData?.type || "-"} {fileData?.fileSize ? `• ${fileData.fileSize} bytes` : ""}</div>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-slate-700">Title</label>
            <input
              className="mt-1 w-full rounded-md border p-2"
              placeholder="Enter a clear task title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="mt-1 w-full rounded-md border p-2 min-h-28"
              placeholder="Describe what experts should look for and any context"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Reward (optional)</label>
              <input
                type="number"
                className="mt-1 w-full rounded-md border p-2"
                placeholder="0"
                value={Number.isNaN(reward) ? 0 : reward}
                onChange={(e) => setReward(Number(e.target.value))}
                min={0}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Deadline (optional)</label>
              <input
                type="date"
                className="mt-1 w-full rounded-md border p-2"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white"
            onClick={async () => {
              try {
                setSubmitting(true)
                await onSubmit({ title, description, reward, deadline })
              } finally {
                setSubmitting(false)
              }
            }}
            disabled={submitting || !title}
          >
            {submitting ? 'Submitting…' : 'Post Dataset'}
          </Button>
        </div>
      </div>
    </Overlay>
  )
}
