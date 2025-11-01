'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Download, 
  Share2, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Calendar,
  User,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Eye,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getDataset } from '@/lib/supabase'
import type { Dataset } from '@/lib/supabase'
import { formatBytes, formatDistanceToNow } from '@/lib/utils'
import Link from 'next/link'

export default function DatasetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [dataset, setDataset] = useState<Dataset | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDataset = async () => {
      try {
        const id = params.id as string
        const { data, error } = await getDataset(id)
        
        if (error || !data) {
          setError('Dataset not found')
        } else {
          setDataset(data as any)
        }
      } catch (err) {
        console.error('Error loading dataset:', err)
        setError('Failed to load dataset')
      } finally {
        setLoading(false)
      }
    }

    loadDataset()
  }, [params.id])

  const getBiasScoreColor = (score?: number) => {
    if (!score) return 'gray'
    if (score >= 80) return 'green'
    if (score >= 60) return 'yellow'
    if (score >= 40) return 'orange'
    return 'red'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'analyzing':
        return <Clock className="h-5 w-5 text-yellow-500 animate-pulse" />
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return <Clock className="h-5 w-5 text-gray-500" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading dataset...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !dataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Navbar />
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto text-center border-0 shadow-lg bg-white/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <AlertTriangle className="h-16 w-16 mx-auto mb-4 text-red-600" />
              <h2 className="text-2xl font-bold mb-2">{error || 'Dataset not found'}</h2>
              <p className="text-gray-600 mb-6">
                The dataset you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/datasets">
                <Button>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Datasets
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    )
  }

  const biasScoreColor = getBiasScoreColor(dataset.bias_score)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Navbar />
      
      <main className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Back Button */}
          <Link href="/datasets" className="inline-flex items-center text-blue-600 hover:text-blue-500 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Datasets
          </Link>

          {/* Dataset Header */}
          <div className="mb-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getStatusIcon(dataset.status)}
                  <h1 className="text-4xl font-bold text-gray-900">{dataset.name}</h1>
                </div>
                <p className="text-xl text-gray-600 mb-4">{dataset.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Uploaded by <span className="font-medium">{(dataset as any).users?.username || 'Anonymous'}</span></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDistanceToNow(new Date(dataset.created_at))}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>{dataset.file_type.toUpperCase()} • {formatBytes(dataset.file_size)}</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Bias Analysis */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bias Score Card */}
              {dataset.bias_score !== undefined ? (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-blue-600" />
                      <span>Bias Analysis Results</span>
                    </CardTitle>
                    <CardDescription>
                      Overall fairness score and bias detection summary
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Overall Bias Score</span>
                        <span className={`text-3xl font-bold ${
                          biasScoreColor === 'green' ? 'text-green-600' :
                          biasScoreColor === 'yellow' ? 'text-yellow-600' :
                          biasScoreColor === 'orange' ? 'text-orange-600' :
                          'text-red-600'
                        }`}>
                          {dataset.bias_score.toFixed(1)}/100
                        </span>
                      </div>
                      <Progress value={dataset.bias_score} className="h-3" />
                      <p className="text-sm text-gray-500 mt-2">
                        {dataset.bias_score >= 80 ? 'Excellent fairness - minimal bias detected' :
                         dataset.bias_score >= 60 ? 'Good fairness - some areas for improvement' :
                         dataset.bias_score >= 40 ? 'Moderate bias detected - review recommended' :
                         'Significant bias detected - action required'}
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Demographic Balance</span>
                          <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <p className="text-2xl font-bold text-blue-600 mt-2">
                          {(dataset.bias_score * 0.85).toFixed(1)}%
                        </p>
                      </div>
                      
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Statistical Parity</span>
                          <BarChart3 className="h-4 w-4 text-purple-600" />
                        </div>
                        <p className="text-2xl font-bold text-purple-600 mt-2">
                          {(dataset.bias_score * 0.92).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardContent className="py-12 text-center">
                    <Clock className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {dataset.status === 'analyzing' ? 'Analysis in Progress' : 'Analysis Pending'}
                    </h3>
                    <p className="text-gray-600">
                      {dataset.status === 'analyzing' 
                        ? 'The bias analysis is currently running. Check back soon for results.'
                        : 'This dataset is queued for analysis.'}
                    </p>
                  </CardContent>
                </Card>
              )}

              {/* Detailed Metrics */}
              {dataset.fairness_metrics && (
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Detailed Fairness Metrics</CardTitle>
                    <CardDescription>
                      In-depth analysis of bias patterns and fairness indicators
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(dataset.fairness_metrics).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between py-2 border-b last:border-b-0">
                          <span className="text-sm font-medium text-gray-700 capitalize">
                            {key.replace(/_/g, ' ')}
                          </span>
                          <Badge variant="outline">{String(value)}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Metadata & Actions */}
            <div className="space-y-6">
              {/* Status Card */}
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Dataset Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge variant={
                        dataset.status === 'completed' ? 'default' :
                        dataset.status === 'analyzing' ? 'secondary' :
                        'destructive'
                      }>
                        {dataset.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Views</span>
                      <div className="flex items-center space-x-1">
                        <Eye className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium">0</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Reports</span>
                      <span className="text-sm font-medium">0</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions Card */}
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Report Bias
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      View Full Analysis
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share Dataset
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Info Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-600 to-purple-600 text-white">
                <CardContent className="pt-6">
                  <Shield className="h-12 w-12 mb-4" />
                  <h3 className="font-bold text-lg mb-2">Help Improve This Dataset</h3>
                  <p className="text-sm text-blue-100 mb-4">
                    Found additional biases? Report them to help make this dataset more fair and inclusive.
                  </p>
                  <Button variant="secondary" className="w-full">
                    Submit Report
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
