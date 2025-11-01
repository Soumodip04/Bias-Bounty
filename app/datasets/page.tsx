'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Search, 
  Filter, 
  BarChart3, 
  Calendar, 
  User, 
  Eye,
  Download,
  Share2,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  TrendingUp,
  Database,
  FileText,
  Star
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getDatasets } from '@/lib/supabase'
import type { Dataset } from '@/lib/supabase'
import { formatBytes, formatDistanceToNow } from '@/lib/utils'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { PageErrorBoundary } from '@/components/error-boundary'

function DatasetsPageContent() {
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const { user } = useAuth()

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getDatasets(30, 0)
        if (data && data.length > 0) {
          setDatasets(data)
        } else {
          // fallback to mock data if no data
          setDatasets([
            {
              id: '1',
              name: 'HR Employee Data',
              description: 'A dataset of employee records for HR bias analysis.',
              file_url: '/sample-data/hr_dataset.csv',
              file_type: 'csv',
              file_size: 204800,
              uploaded_by: 'alice',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              status: 'completed',
              bias_score: 65.2,
              uploader: { username: 'alice', avatar_url: '' },
            },
            {
              id: '2',
              name: 'Loan Applications',
              description: 'Loan application data for fairness testing.',
              file_url: '/sample-data/loan_applications.csv',
              file_type: 'csv',
              file_size: 102400,
              uploaded_by: 'bob',
              created_at: new Date(Date.now() - 86400000).toISOString(),
              updated_at: new Date(Date.now() - 86400000).toISOString(),
              status: 'analyzing',
              bias_score: undefined,
              uploader: { username: 'bob', avatar_url: '' },
            },
            {
              id: '3',
              name: 'Product Reviews',
              description: 'Product review data for sentiment and bias detection.',
              file_url: '/sample-data/product_reviews.json',
              file_type: 'json',
              file_size: 51200,
              uploaded_by: 'carol',
              created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
              updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
              status: 'failed',
              bias_score: undefined,
              uploader: { username: 'carol', avatar_url: '' },
            },
          ])
        }
      } catch (e) {
        console.error('Failed to load datasets', e)
        // fallback to mock data if error
        setDatasets([
          {
            id: '1',
            name: 'HR Employee Data',
            description: 'A dataset of employee records for HR bias analysis.',
            file_url: '/sample-data/hr_dataset.csv',
            file_type: 'csv',
            file_size: 204800,
            uploaded_by: 'alice',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            status: 'completed',
            bias_score: 65.2,
            uploader: { username: 'alice', avatar_url: '' },
          },
          {
            id: '2',
            name: 'Loan Applications',
            description: 'Loan application data for fairness testing.',
            file_url: '/sample-data/loan_applications.csv',
            file_type: 'csv',
            file_size: 102400,
            uploaded_by: 'bob',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date(Date.now() - 86400000).toISOString(),
            status: 'analyzing',
            bias_score: undefined,
            uploader: { username: 'bob', avatar_url: '' },
          },
          {
            id: '3',
            name: 'Product Reviews',
            description: 'Product review data for sentiment and bias detection.',
            file_url: '/sample-data/product_reviews.json',
            file_type: 'json',
            file_size: 51200,
            uploaded_by: 'carol',
            created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
            status: 'failed',
            bias_score: undefined,
            uploader: { username: 'carol', avatar_url: '' },
          },
        ])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || dataset.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'analyzing':
        return <Clock className="w-4 h-4 text-blue-500 animate-spin" />
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'analyzing':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getBiasScoreColor = (score: number) => {
    if (score >= 70) return 'text-red-600 bg-red-50'
    if (score >= 40) return 'text-yellow-600 bg-yellow-50'
    return 'text-green-600 bg-green-50'
  }

  const stats = {
    total: datasets.length,
    completed: datasets.filter(d => d.status === 'completed').length,
    analyzing: datasets.filter(d => d.status === 'analyzing').length,
    avgBiasScore: datasets.filter(d => d.bias_score).reduce((acc, d) => acc + (d.bias_score || 0), 0) / datasets.filter(d => d.bias_score).length || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Dataset Library
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl">
                  Explore community-uploaded datasets and their bias analysis results. 
                  Discover patterns, learn from findings, and contribute your own data.
                </p>
              </div>
              
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Button asChild size="lg" className="btn-primary">
                  <Link href="/datasets/upload">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload Dataset
                  </Link>
                </Button>
              </motion.div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {[
                { label: 'Total Datasets', value: stats.total, icon: Database, color: 'violet' },
                { label: 'Completed Analysis', value: stats.completed, icon: CheckCircle, color: 'green' },
                { label: 'Currently Analyzing', value: stats.analyzing, icon: Clock, color: 'blue' },
                { label: 'Avg Bias Score', value: stats.avgBiasScore.toFixed(1), icon: TrendingUp, color: 'purple' }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{stat.label}</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                        </div>
                        <div className={`w-12 h-12 bg-${stat.color}-100 rounded-xl flex items-center justify-center`}>
                          <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-8"
          >
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search datasets by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Tabs value={selectedStatus} onValueChange={setSelectedStatus} className="w-auto">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                      <TabsTrigger value="analyzing">Analyzing</TabsTrigger>
                      <TabsTrigger value="pending">Pending</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Datasets Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="animate-pulse space-y-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-20 bg-gray-200 rounded"></div>
                      <div className="flex justify-between">
                        <div className="h-6 bg-gray-200 rounded w-16"></div>
                        <div className="h-6 bg-gray-200 rounded w-20"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredDatasets.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Database className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                {searchTerm || selectedStatus !== 'all' ? 'No datasets found' : 'No datasets yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                {searchTerm || selectedStatus !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Be the first to upload a dataset and start the bias detection journey!'
                }
              </p>
              {(!searchTerm && selectedStatus === 'all') && (
                <Button asChild size="lg" className="btn-primary">
                  <Link href="/datasets/upload">
                    <Upload className="w-5 h-5 mr-2" />
                    Upload First Dataset
                  </Link>
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDatasets.map((dataset, index) => (
                <motion.div
                  key={dataset.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-xl transition-all duration-300 group cursor-pointer h-full">
                    <Link href={`/datasets/${dataset.id}`}>
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(dataset.status)}
                            <Badge className={`text-xs ${getStatusColor(dataset.status)}`}>
                              {dataset.status.charAt(0).toUpperCase() + dataset.status.slice(1)}
                            </Badge>
                            {(dataset as any).needs_expert_review && (
                              <Badge className="text-xs bg-gradient-to-r from-violet-600 to-purple-600 text-white border-0">
                                🔍 Expert Review
                              </Badge>
                            )}
                          </div>
                          
                          {dataset.bias_score && (
                            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getBiasScoreColor(dataset.bias_score)}`}>
                              {dataset.bias_score.toFixed(1)}
                            </div>
                          )}
                        </div>
                        
                        <CardTitle className="text-lg group-hover:text-violet-600 transition-colors duration-300 line-clamp-2">
                          {dataset.name}
                        </CardTitle>
                        <CardDescription className="line-clamp-3">
                          {dataset.description}
                        </CardDescription>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="space-y-4">
                          {/* File Info */}
                          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                            <div className="flex items-center space-x-2">
                              <FileText className="w-4 h-4" />
                              <span>{formatBytes(dataset.file_size)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDistanceToNow(new Date(dataset.created_at))}</span>
                            </div>
                          </div>

                          {/* Uploader */}
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={typeof dataset.uploader === 'object' && dataset.uploader ? dataset.uploader.avatar_url : ''} />
                              <AvatarFallback className="bg-violet-100 text-violet-600 text-xs">
                                {typeof dataset.uploader === 'object' && dataset.uploader && dataset.uploader.username ? dataset.uploader.username.charAt(0).toUpperCase() : 'U'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {typeof dataset.uploader === 'object' && dataset.uploader && dataset.uploader.username ? dataset.uploader.username : 'Anonymous'}
                              </p>
                              <p className="text-xs text-gray-500">Uploader</p>
                            </div>
                          </div>

                          {/* Bias Analysis Preview */}
                          {dataset.status === 'completed' && dataset.bias_score && (
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Bias Analysis</span>
                                <Eye className="w-4 h-4 text-gray-400" />
                              </div>
                              <Progress 
                                value={dataset.bias_score} 
                                className="h-2 mb-2"
                              />
                              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                                <span>Score: {dataset.bias_score.toFixed(1)}/100</span>
                                <span>
                                  {dataset.bias_score >= 70 ? 'High Risk' : 
                                   dataset.bias_score >= 40 ? 'Medium Risk' : 'Low Risk'}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center justify-between pt-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              className="text-violet-600 hover:text-violet-700 hover:bg-violet-50"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                            
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="p-2">
                                <Share2 className="w-4 h-4" />
                              </Button>
                              <Button variant="ghost" size="sm" className="p-2">
                                <Star className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}

          {/* Load More Button */}
          {filteredDatasets.length > 0 && filteredDatasets.length % 12 === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mt-12"
            >
              <Button variant="outline" size="lg" className="hover:bg-violet-50 hover:text-violet-600">
                Load More Datasets
              </Button>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function DatasetsPage() {
  return (
    <PageErrorBoundary>
      <DatasetsPageContent />
    </PageErrorBoundary>
  )
}