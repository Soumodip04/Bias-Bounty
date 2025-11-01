'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, Clock, FileText, Filter, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getCurrentUser } from '@/lib/supabase'
import Link from 'next/link'

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all')

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
      setLoading(false)
    }
    loadUser()
  }, [])

  // Mock reports data - in production this would come from the database
  const mockReports = [
    {
      id: '1',
      datasetName: 'Customer Demographics Dataset',
      biasType: 'Gender Bias',
      severity: 'high',
      status: 'verified',
      points: 150,
      createdAt: '2024-03-15',
      description: 'Significant gender imbalance detected in hiring data'
    },
    {
      id: '2',
      datasetName: 'Loan Application Data',
      biasType: 'Age Discrimination',
      severity: 'critical',
      status: 'pending',
      points: 0,
      createdAt: '2024-03-18',
      description: 'Age-based bias in loan approval patterns'
    },
    {
      id: '3',
      datasetName: 'Healthcare Dataset',
      biasType: 'Racial Bias',
      severity: 'medium',
      status: 'rejected',
      points: 0,
      createdAt: '2024-03-10',
      description: 'Potential racial bias in treatment recommendations'
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'rejected':
        return <AlertTriangle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const filteredReports = mockReports.filter(report => {
    const matchesSearch = report.datasetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.biasType.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filterStatus === 'all' || report.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <Navbar />
        <main className="container mx-auto px-4 py-12">
          <Card className="max-w-md mx-auto text-center border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
            <CardContent className="pt-6">
              <FileText className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-2xl font-bold mb-2">Sign in to view reports</h2>
              <p className="text-gray-600 mb-6">
                Access your bias detection reports and track your contributions
              </p>
              <Link href="/auth/signin">
                <Button className="w-full">Sign In</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Bias Reports</h1>
            <p className="text-gray-600">Track and manage your bias detection reports</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Reports</p>
                    <p className="text-3xl font-bold text-gray-900">{mockReports.length}</p>
                  </div>
                  <FileText className="h-10 w-10 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Verified</p>
                    <p className="text-3xl font-bold text-green-600">
                      {mockReports.filter(r => r.status === 'verified').length}
                    </p>
                  </div>
                  <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {mockReports.filter(r => r.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-10 w-10 text-yellow-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Points Earned</p>
                    <p className="text-3xl font-bold text-purple-600">
                      {mockReports.reduce((sum, r) => sum + r.points, 0)}
                    </p>
                  </div>
                  <AlertTriangle className="h-10 w-10 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search and Filter */}
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search reports..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('all')}
                    className="flex items-center space-x-2"
                  >
                    <Filter className="h-4 w-4" />
                    <span>All</span>
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('pending')}
                  >
                    Pending
                  </Button>
                  <Button
                    variant={filterStatus === 'verified' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('verified')}
                  >
                    Verified
                  </Button>
                  <Button
                    variant={filterStatus === 'rejected' ? 'default' : 'outline'}
                    onClick={() => setFilterStatus('rejected')}
                  >
                    Rejected
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reports List */}
          <div className="space-y-4">
            {filteredReports.length === 0 ? (
              <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
                <CardContent className="py-12 text-center">
                  <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600 mb-6">
                    {searchQuery || filterStatus !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'Start analyzing datasets to create your first bias report'}
                  </p>
                  <Link href="/datasets">
                    <Button>Browse Datasets</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              filteredReports.map((report) => (
                <motion.div
                  key={report.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            {getStatusIcon(report.status)}
                            <h3 className="text-lg font-semibold text-gray-900">{report.datasetName}</h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mb-3">
                            <span className={`text-xs font-medium px-3 py-1 rounded-full border ${getSeverityColor(report.severity)}`}>
                              {report.severity.toUpperCase()}
                            </span>
                            <span className="text-sm text-gray-600">{report.biasType}</span>
                            <span className="text-sm text-gray-500">
                              {new Date(report.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-gray-700 mb-3">{report.description}</p>
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600">
                              Status: <span className="font-medium capitalize">{report.status}</span>
                            </span>
                            {report.points > 0 && (
                              <span className="text-green-600 font-medium">
                                +{report.points} points earned
                              </span>
                            )}
                          </div>
                        </div>
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
