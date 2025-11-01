'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, Award, TrendingUp, Users, Target } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getLeaderboard } from '@/lib/supabase'
import type { LeaderboardEntry } from '@/lib/supabase'
import { PageErrorBoundary } from '@/components/error-boundary'

function LeaderboardPageContent() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [])

  const loadLeaderboard = async () => {
    try {
      const { data } = await getLeaderboard(50)
      if (data) {
        setLeaderboard(data)
      }
    } catch (error) {
      console.error('Error loading leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-6 w-6 text-yellow-500" />
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-lg font-bold text-gray-600 dark:text-gray-400">#{rank}</span>
    }
  }

  const getRankBadgeVariant = (rank: number) => {
    if (rank <= 3) return 'default'
    if (rank <= 10) return 'secondary'
    return 'outline'
  }

  const topThree = leaderboard.slice(0, 3)
  const restOfLeaderboard = leaderboard.slice(3)

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
            className="text-center mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Leaderboard
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Top contributors making AI more fair and unbiased. Earn points by uploading datasets, 
              finding bias, and helping the community build better AI systems.
            </p>
          </motion.div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-center">
                <CardHeader>
                  <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-blue-600">
                    {leaderboard.length}
                  </CardTitle>
                  <CardDescription>Active Contributors</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-center">
                <CardHeader>
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-green-600">
                    {leaderboard.reduce((sum, user) => sum + user.bias_found, 0)}
                  </CardTitle>
                  <CardDescription>Bias Cases Found</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-center">
                <CardHeader>
                  <TrendingUp className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <CardTitle className="text-2xl font-bold text-purple-600">
                    {leaderboard.reduce((sum, user) => sum + user.points, 0).toLocaleString()}
                  </CardTitle>
                  <CardDescription>Total Points Earned</CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[...Array(10)].map((_, i) => (
                <Card key={i} className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="animate-pulse flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {/* Top 3 Podium */}
              {topThree.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="mb-12"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* 2nd Place */}
                    {topThree[1] && (
                      <div className="order-1 md:order-1">
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700/40 dark:to-gray-600/40 text-center transform hover:scale-105 transition-transform duration-300">
                          <CardContent className="p-8">
                            <div className="relative mb-4">
                              <Avatar className="h-20 w-20 mx-auto border-4 border-gray-400">
                                <AvatarImage src={topThree[1].avatar_url} />
                                <AvatarFallback className="text-xl font-bold">
                                  {topThree[1].username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -top-2 -right-2">
                                <Medal className="h-8 w-8 text-gray-400" />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                              {topThree[1].username}
                            </h3>
                            <p className="text-3xl font-bold text-gray-600 dark:text-gray-300 mb-2">
                              {topThree[1].points.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">points</p>
                            <div className="mt-4 space-y-1 text-sm text-gray-600 dark:text-gray-400">
                              <p>{topThree[1].reports_submitted} reports</p>
                              <p>{topThree[1].bias_found} bias found</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* 1st Place */}
                    {topThree[0] && (
                      <div className="order-2 md:order-2">
                        <Card className="border-0 shadow-2xl bg-gradient-to-br from-yellow-100 to-yellow-200 dark:from-yellow-900/40 dark:to-yellow-800/40 text-center transform hover:scale-105 transition-transform duration-300 relative">
                          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                            <div className="bg-yellow-500 text-white px-4 py-2 rounded-full text-sm font-bold">
                              CHAMPION
                            </div>
                          </div>
                          <CardContent className="p-8 pt-12">
                            <div className="relative mb-4">
                              <Avatar className="h-24 w-24 mx-auto border-4 border-yellow-500">
                                <AvatarImage src={topThree[0].avatar_url} />
                                <AvatarFallback className="text-2xl font-bold">
                                  {topThree[0].username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -top-2 -right-2">
                                <Trophy className="h-10 w-10 text-yellow-500" />
                              </div>
                            </div>
                            <h3 className="text-2xl font-bold text-yellow-800 dark:text-yellow-200 mb-2">
                              {topThree[0].username}
                            </h3>
                            <p className="text-4xl font-bold text-yellow-600 dark:text-yellow-300 mb-2">
                              {topThree[0].points.toLocaleString()}
                            </p>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400">points</p>
                            <div className="mt-4 space-y-1 text-sm text-yellow-700 dark:text-yellow-400">
                              <p>{topThree[0].reports_submitted} reports</p>
                              <p>{topThree[0].bias_found} bias found</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}

                    {/* 3rd Place */}
                    {topThree[2] && (
                      <div className="order-3 md:order-3">
                        <Card className="border-0 shadow-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 text-center transform hover:scale-105 transition-transform duration-300">
                          <CardContent className="p-8">
                            <div className="relative mb-4">
                              <Avatar className="h-20 w-20 mx-auto border-4 border-amber-600">
                                <AvatarImage src={topThree[2].avatar_url} />
                                <AvatarFallback className="text-xl font-bold">
                                  {topThree[2].username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="absolute -top-2 -right-2">
                                <Award className="h-8 w-8 text-amber-600" />
                              </div>
                            </div>
                            <h3 className="text-xl font-bold text-amber-800 dark:text-amber-200 mb-2">
                              {topThree[2].username}
                            </h3>
                            <p className="text-3xl font-bold text-amber-600 dark:text-amber-300 mb-2">
                              {topThree[2].points.toLocaleString()}
                            </p>
                            <p className="text-sm text-amber-700 dark:text-amber-400">points</p>
                            <div className="mt-4 space-y-1 text-sm text-amber-700 dark:text-amber-400">
                              <p>{topThree[2].reports_submitted} reports</p>
                              <p>{topThree[2].bias_found} bias found</p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {/* Rest of Leaderboard */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle>Full Rankings</CardTitle>
                    <CardDescription>
                      Complete leaderboard of all contributors
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {restOfLeaderboard.map((user, index) => (
                        <motion.div
                          key={user.user_id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center justify-center w-12 h-12">
                              {getRankIcon(user.rank)}
                            </div>
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.username.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-semibold text-gray-900 dark:text-white">{user.username}</h4>
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Level {user.level} • {user.reports_submitted} reports • {user.bias_found} bias found
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={getRankBadgeVariant(user.rank)} className="mb-2">
                              #{user.rank}
                            </Badge>
                            <p className="text-lg font-bold text-blue-600">
                              {user.points.toLocaleString()}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">points</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {leaderboard.length === 0 && (
                      <div className="text-center py-12">
                        <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                          No contributors yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          Be the first to upload a dataset and earn points!
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function LeaderboardPage() {
  return (
    <PageErrorBoundary>
      <LeaderboardPageContent />
    </PageErrorBoundary>
  )
}