'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Database, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Award,
  Code
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Navbar } from '@/components/navbar'
import { useAuth } from '@/lib/auth-context'
import { supabase, getDatasets, getUserStats } from '@/lib/supabase'
import { formatDate, calculateLevel, getPointsForNextLevel } from '@/lib/utils'
import Link from 'next/link'
import { PageErrorBoundary } from '@/components/error-boundary'
import { useUserStats, useDatasets } from '@/hooks/use-queries'
import { DashboardStatsSkeleton, DatasetCardSkeleton } from '@/components/ui/skeleton'
import { Footer } from '@/components/footer'

interface DashboardStats {
  totalDatasets: number
  totalReports: number
  totalPoints: number
  biasFound: number
  level: number
  nextLevelPoints: number
}

function DashboardPageContent() {
  const { user, userProfile } = useAuth()
  
  // Use React Query for data fetching
  const { data: userStats, isLoading: statsLoading } = useUserStats(user?.id)
  const { data: recentDatasets, isLoading: datasetsLoading } = useDatasets(5, 0)

  // Calculate stats from React Query data
  const stats: DashboardStats | null = userStats ? {
    totalDatasets: userStats.datasets_uploaded || 0,
    totalReports: userStats.reports_submitted || 0,
    totalPoints: userStats.points || 0,
    biasFound: userStats.bias_found || 0,
    level: calculateLevel(userStats.points),
    nextLevelPoints: getPointsForNextLevel(calculateLevel(userStats.points)),
  } : null

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Please sign in to access the dashboard</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <Link href="/auth/signin">Sign In</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const progressToNextLevel = stats ? ((stats.totalPoints % 100) / 100) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <h1 className="text-5xl font-bold bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 tracking-tight">
              Welcome back, {userProfile?.username}! 👋
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Here's your bias detection activity and progress
            </p>
          </motion.div>

          {/* Stats Cards */}
          {statsLoading ? (
            <DashboardStatsSkeleton />
          ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border border-blue-200/50 dark:border-blue-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-blue-50/80 to-white/80 dark:from-blue-900/20 dark:to-gray-800/80 backdrop-blur-md group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Points</CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Award className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    {stats?.totalPoints || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Level {stats?.level || 1} • Keep going!
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border border-green-200/50 dark:border-green-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-green-50/80 to-white/80 dark:from-green-900/20 dark:to-gray-800/80 backdrop-blur-md group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Datasets Uploaded</CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Database className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    {stats?.totalDatasets || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Ready for analysis
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border border-orange-200/50 dark:border-orange-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-orange-50/80 to-white/80 dark:from-orange-900/20 dark:to-gray-800/80 backdrop-blur-md group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Reports Submitted</CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent">
                    {stats?.totalReports || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Bias cases found
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -4 }}
            >
              <Card className="border border-red-200/50 dark:border-red-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 bg-gradient-to-br from-red-50/80 to-white/80 dark:from-red-900/20 dark:to-gray-800/80 backdrop-blur-md group">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Bias Found</CardTitle>
                  <div className="h-10 w-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
                    {stats?.biasFound || 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Issues identified
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
          )}

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Level Progress */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="lg:col-span-1"
            >
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span>Level Progress</span>
                  </CardTitle>
                  <CardDescription>
                    Your journey to the next level
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      Level {stats?.level || 1}
                    </div>
                    <p className="text-sm text-gray-600">
                      {stats?.totalPoints || 0} / {stats?.nextLevelPoints || 100} points
                    </p>
                  </div>
                  <Progress value={progressToNextLevel} className="w-full" />
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      {(stats?.nextLevelPoints || 100) - (stats?.totalPoints || 0)} points to next level
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="lg:col-span-2"
            >
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Recent Datasets</span>
                    <Button asChild size="sm">
                      <Link href="/datasets/upload">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Dataset
                      </Link>
                    </Button>
                  </CardTitle>
                  <CardDescription>
                    Latest datasets uploaded to the platform
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {datasetsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <DatasetCardSkeleton key={i} />
                      ))}
                    </div>
                  ) : recentDatasets && recentDatasets.length > 0 ? (
                    <div className="space-y-4">
                      {recentDatasets.map((dataset) => (
                        <div key={dataset.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{dataset.name}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{dataset.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                by {dataset.users?.username}
                              </span>
                              <span className="text-xs text-gray-400"></span>
                              <span className="text-xs text-gray-500">
                                {formatDate(dataset.created_at)}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant={
                              dataset.status === 'completed' ? 'default' :
                              dataset.status === 'analyzing' ? 'secondary' :
                              dataset.status === 'failed' ? 'destructive' : 'outline'
                            }>
                              {dataset.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                              {dataset.status === 'analyzing' && <Clock className="h-3 w-3 mr-1" />}
                              {dataset.status === 'failed' && <AlertTriangle className="h-3 w-3 mr-1" />}
                              {dataset.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">No datasets uploaded yet</p>
                      <Button asChild>
                        <Link href="/datasets/upload">Upload Your First Dataset</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-8"
          >
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Get started with these common tasks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Button asChild className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/datasets/upload">
                      <Upload className="h-8 w-8" />
                      <span>Upload Dataset</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/code-analyzer">
                      <Code className="h-8 w-8" />
                      <span>Code Analyzer</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/datasets">
                      <Database className="h-8 w-8" />
                      <span>Browse Datasets</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
                    <Link href="/leaderboard">
                      <Users className="h-8 w-8" />
                      <span>View Leaderboard</span>
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function DashboardPage() {
  return (
    <PageErrorBoundary>
      <DashboardPageContent />
    </PageErrorBoundary>
  )
}
