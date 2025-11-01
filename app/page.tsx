'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  Zap,
  Shield,
  Users,
  TrendingUp,
  Brain,
  Eye,
  Target,
  CheckCircle,
  BarChart3,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Award,
  Globe,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Footer } from '@/components/footer'

// IMPORTANT: these are assumed to be default exports.
// If your files use named exports, switch back to: { Navbar } / { BiasAnalysisResults }
import { Navbar } from '@/components/navbar'
import BiasAnalysisResults from '@/components/bias-analysis-results'

import { formatBytes } from '@/lib/utils'
import toast from 'react-hot-toast'
import CountUp from 'react-countup'
import { useAnalysisNotification } from '@/lib/notifications'
import { useResource } from '@/lib/resource-context'
import { useAuth } from '@/lib/auth-context'

interface UploadedFile {
  file: File
  preview?: string
}

export default function HomePage() {

  // Notification hook
  const { notifyAnalysisComplete } = useAnalysisNotification()
  const {user}  = useAuth();
  const { setFileData } = useResource()

  // Remove file handler for file preview
  const removeFile = () => {
    setFiles([])
    setUploadedFile(null)
    setAnalysisResults(null)
    setShowResults(false)
  };
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const [showResults, setShowResults] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  // Store the uploaded file for later use outside the dropzone flow
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const heroRef = useRef<HTMLDivElement | null>(null)
  const statsRef = useRef<HTMLDivElement | null>(null)
  const featuresRef = useRef<HTMLDivElement | null>(null)

  const heroInView = useInView(heroRef, { once: true })
  const statsInView = useInView(statsRef, { once: true })
  const featuresInView = useInView(featuresRef, { once: true })

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.map((file) => ({
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    }))
    setFiles(newFiles.slice(0, 1)) // Only allow one file
    setUploadedFile(acceptedFiles[0] ?? null)
    setShowResults(false)
    setAnalysisResults(null)
  }, [])


  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/plain': ['.txt'],
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: false,
  })
  // Stats for the stats section
  const stats = [
    { icon: Brain, label: 'AI Models Analyzed', value: 1247, suffix: '+' },
    { icon: Eye, label: 'Bias Cases Found', value: 3891, suffix: '+' },
    { icon: Users, label: 'Active Hunters', value: 892, suffix: '+' },
    { icon: Award, label: 'Accuracy Rate', value: 94, suffix: '%' },
  ]

  const analyzeFile = async () => {
    if (files.length === 0) {
      toast.error('Please upload a file first')
      return
    }

    const fileData = {
      userId: user?.id,
      email: user?.email,
      username: user?.username,
      fileName: uploadedFile?.name,
      fileSize: uploadedFile?.size,
      type: uploadedFile?.type,
    }
    console.log("File Data: ", fileData)
    // Store in Resource Context for later use (e.g., marketplace post)
    setFileData(fileData)

    setAnalyzing(true)
    setAnalysisProgress(10)
    setShowResults(false)

    // Simulate progress while backend processes
    const progressInterval = setInterval(() => {
      setAnalysisProgress((prev) => {
        if (prev >= 90) return prev // Stop at 90%, wait for real completion
        const next = prev + Math.random() * 15
        return Math.min(next, 90) // Cap at 90% to prevent overflow
      })
    }, 800)

    try {
      const file = files[0].file
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/analyze', {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!res.ok) {
        const msg = await res.text().catch(() => '')
        throw new Error(msg || 'Failed to analyze dataset')
      }

      const results = await res.json()
      setAnalysisProgress(100)
      setAnalysisResults(results)
      setShowResults(true)
      
      // Trigger notification
      notifyAnalysisComplete(results.bias_score || 0)
      
      toast.success('Analysis completed successfully!')
    } catch (err) {
      clearInterval(progressInterval)
      console.error(err)
      toast.error('Analysis failed. Please try again.')
    } finally {
      clearInterval(progressInterval)
      setAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 800)
    }
  }

  const scrollToAnalyzer = () => {
    document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadSampleDataset = async (filename: string, displayName: string) => {
    try {
      toast.loading(`Loading ${displayName}...`)
      
      const response = await fetch(`/sample-data/${filename}`)
      if (!response.ok) throw new Error('Failed to fetch sample dataset')
      
      const blob = await response.blob()
      const file = new File([blob], filename, { type: 'text/csv' })
      
      setFiles([{ file }])
  setUploadedFile(file)
      setShowResults(false)
      setAnalysisResults(null)
      
      toast.dismiss()
      toast.success(`${displayName} loaded! Click "Analyze for Bias" to begin.`)
    } catch (error) {
      console.error('Error loading sample:', error)
      toast.dismiss()
      toast.error('Failed to load sample dataset')
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 cosmic-bg opacity-90" />
        <div className="absolute inset-0 mesh-bg opacity-30" />

        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-float" />
        <div
          className="absolute top-40 right-20 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-float"
          style={{ animationDelay: '2s' }}
        />
        <div
          className="absolute bottom-20 left-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-float"
          style={{ animationDelay: '4s' }}
        />

        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="max-w-5xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={heroInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-8"
            >
              <Badge className="bg-white/20 text-white border-white/30 px-6 py-2 text-lg backdrop-blur-sm">
                <Sparkles className="w-4 h-4 mr-2" />
                AI Bias Detection Platform
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-5xl md:text-7xl font-bold text-white mb-6 text-shadow-lg"
            >
              Hunt Down
              <span className="block bg-gradient-to-r from-yellow-300 via-pink-300 to-purple-300 bg-clip-text text-transparent">
                AI Bias
              </span>
              Together
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              Crowdsourced bias detection platform that gamifies fairness. Upload datasets, discover bias, earn rewards,
              and help build a more equitable AI future.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <Button onClick={scrollToAnalyzer} size="lg" className="btn-primary text-lg px-8 py-4 group">
                <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                Try Free Analysis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>

              <Button variant="outline" size="lg" className="bg-white/10 border-white/30 text-white hover:bg-white/20 text-lg px-8 py-4 backdrop-blur-sm">
                <Users className="w-5 h-5 mr-2" />
                Join Community
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={heroInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 text-white/70"
            >
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>No Signup Required</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                <span>Privacy Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span>Instant Results</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={statsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 30 }}
                animate={statsInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="text-center"
              >
                <Card className="border-0 shadow-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 card-hover">
                  <CardContent className="p-8">
                    <stat.icon className="w-12 h-12 mx-auto mb-4 text-violet-600 dark:text-violet-400" />
                    <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                      {statsInView && <CountUp end={stat.value} duration={2} delay={index * 0.2} suffix={stat.suffix} />}
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">{stat.label}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Bias Analyzer Section */}
      <section id="analyzer" className="py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-pink-50">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-6">Free Bias Analysis</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Upload your dataset and get instant AI-powered bias detection. No signup required - see the magic happen
              in real-time!
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="border-0 shadow-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl flex items-center">
                    <Target className="w-6 h-6 mr-3" />
                    AI Bias Detector
                  </CardTitle>
                  <Button
                    variant="outline"
                    onClick={() => setFullscreen((v) => !v)}
                    className="bg-white/10 border-white/30 text-white hover:bg-white/20"
                  >
                    {fullscreen ? (
                      <>
                        <Minimize2 className="w-4 h-4 mr-2" /> Exit Full Screen
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-4 h-4 mr-2" /> Full Screen
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription className="text-violet-100">Upload CSV, JSON, Excel files up to 10MB for instant analysis</CardDescription>
              </CardHeader>

              <CardContent className="p-8">
                {!showResults ? (
                  <div className="space-y-8">
                    {/* File Upload */}
                    <div
                      {...getRootProps()}
                      className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                        isDragActive ? 'border-violet-500 bg-violet-50 scale-105' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/50'
                      } ${analyzing ? 'pointer-events-none opacity-50' : ''}`}
                    >
                      <input {...getInputProps()} />
                      <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}>
                        <Upload className="h-16 w-16 text-violet-400 mx-auto mb-6" />
                        {isDragActive ? (
                          <p className="text-violet-600 text-xl font-semibold">Drop your dataset here!</p>
                        ) : (
                          <div>
                            <p className="text-gray-700 text-xl font-semibold mb-2">Drag & drop your dataset here</p>
                            <p className="text-gray-500 mb-4">or click to browse files</p>
                            <p className="text-sm text-gray-400">Supports CSV, JSON, Excel, TXT files up to 10MB</p>
                          </div>
                        )}
                      </motion.div>
                    </div>

                    {/* File Preview */}
                    {files.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                              <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{files[0].file.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(files[0].file.size)}</p>
                            </div>
                          </div>
                          {!analyzing && (
                            <Button variant="ghost" size="sm" onClick={removeFile} className="text-gray-500 hover:text-red-500">
                              Remove
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Quick Demo Samples */}
                    {files.length === 0 && !analyzing && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="text-center">
                          <p className="text-sm text-gray-500 font-medium mb-4">
                            Or try a sample dataset:
                          </p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Button
                            variant="outline"
                            onClick={() => loadSampleDataset('loan_approvals_extended.csv', 'Loan Approvals')}
                            className="justify-start h-auto py-3 px-4 hover:bg-violet-50 hover:border-violet-300 transition-all"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <TrendingUp className="w-5 h-5 text-green-600" />
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-gray-900 dark:text-white">Financial Lending</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Loan approval bias by demographics</p>
                              </div>
                            </div>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => loadSampleDataset('healthcare_outcomes.csv', 'Healthcare Outcomes')}
                            className="justify-start h-auto py-3 px-4 hover:bg-violet-50 hover:border-violet-300 transition-all"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 bg-gradient-to-br from-red-100 to-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Shield className="w-5 h-5 text-red-600" />
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-gray-900 dark:text-white">Healthcare</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Treatment disparities analysis</p>
                              </div>
                            </div>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => loadSampleDataset('recruitment_decisions.csv', 'Recruitment Decisions')}
                            className="justify-start h-auto py-3 px-4 hover:bg-violet-50 hover:border-violet-300 transition-all"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Users className="w-5 h-5 text-blue-600" />
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-gray-900 dark:text-white">Hiring Process</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Recruitment bias detection</p>
                              </div>
                            </div>
                          </Button>

                          <Button
                            variant="outline"
                            onClick={() => loadSampleDataset('bail_decisions.csv', 'Bail Decisions')}
                            className="justify-start h-auto py-3 px-4 hover:bg-violet-50 hover:border-violet-300 transition-all"
                          >
                            <div className="flex items-center gap-3 w-full">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-100 to-violet-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Globe className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="text-left">
                                <p className="font-semibold text-gray-900 dark:text-white">Criminal Justice</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Bail decision fairness</p>
                              </div>
                            </div>
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {/* Analysis Progress */}
                    {analyzing && (
                      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                        <div className="text-center">
                          <div className="inline-flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
                            <div className="w-3 h-3 bg-violet-600 rounded-full animate-pulse" />
                            <span className="text-violet-700 font-medium">Analyzing your dataset...</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                            <span>Analysis Progress</span>
                            <span>{Math.round(analysisProgress)}%</span>
                          </div>
                          <Progress value={analysisProgress} className="h-3" />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className={`flex items-center space-x-2 ${analysisProgress > 20 ? 'text-green-600' : 'text-gray-400'}`}>
                            <CheckCircle className="w-4 h-4" />
                            <span>File Processing</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysisProgress > 60 ? 'text-green-600' : 'text-gray-400'}`}>
                            <Brain className="w-4 h-4" />
                            <span>AI Analysis</span>
                          </div>
                          <div className={`flex items-center space-x-2 ${analysisProgress > 90 ? 'text-green-600' : 'text-gray-400'}`}>
                            <BarChart3 className="w-4 h-4" />
                            <span>Generating Report</span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Analyze Button */}
                    <div className="text-center">
                      <Button onClick={analyzeFile} disabled={files.length === 0 || analyzing} size="lg" className="btn-primary text-lg px-12 py-4">
                        {analyzing ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-5 h-5 mr-2" />
                            Analyze for Bias
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <BiasAnalysisResults
                    results={analysisResults}
                    onBack={() => {
                      setShowResults(false)
                      setFiles([])
                      setUploadedFile(null)
                      setAnalysisResults(null)
                      setAnalysisProgress(0)
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Fullscreen overlay for the whole detector */}
            {fullscreen && (
              <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
                <div className="relative w-full h-full max-w-7xl max-h-[95vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
                    <div className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
                      <Target className="w-5 h-5 mr-2 text-violet-600 dark:text-violet-400" /> AI Bias Detector
                    </div>
                    <Button variant="outline" onClick={() => setFullscreen(false)} className="bg-white dark:bg-gray-700 hover:bg-slate-50 dark:hover:bg-gray-600">
                      <Minimize2 className="w-4 h-4 mr-2" /> Close
                    </Button>
                  </div>
                  <div className="p-6 overflow-auto h-[calc(95vh-64px)]">
                    {!showResults ? (
                      <div className="space-y-8">
                        {/* Reuse upload + preview + progress + button inside overlay */}
                        <div
                          {...getRootProps()}
                          className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-300 ${
                            isDragActive ? 'border-violet-500 bg-violet-50 scale-105' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/50'
                          } ${analyzing ? 'pointer-events-none opacity-50' : ''}`}
                        >
                          <input {...getInputProps()} />
                          <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}>
                            <Upload className="h-16 w-16 text-violet-400 mx-auto mb-6" />
                            {isDragActive ? (
                              <p className="text-violet-600 text-xl font-semibold">Drop your dataset here!</p>
                            ) : (
                              <div>
                                <p className="text-gray-700 text-xl font-semibold mb-2">Drag & drop your dataset here</p>
                                <p className="text-gray-500 mb-4">or click to browse files</p>
                                <p className="text-sm text-gray-400">Supports CSV, JSON, Excel, TXT files up to 10MB</p>
                              </div>
                            )}
                          </motion.div>
                        </div>

                        {files.length > 0 && (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-6">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 rounded-lg flex items-center justify-center">
                                  <BarChart3 className="w-6 h-6 text-violet-600 dark:text-violet-400" />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900 dark:text-white">{files[0].file.name}</p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">{formatBytes(files[0].file.size)}</p>
                                </div>
                              </div>
                              {!analyzing && (
                                <Button variant="ghost" size="sm" onClick={removeFile} className="text-gray-500 hover:text-red-500">
                                  Remove
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        )}

                        {analyzing && (
                          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                            <div className="text-center">
                              <div className="inline-flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
                                <div className="w-3 h-3 bg-violet-600 rounded-full animate-pulse" />
                                <span className="text-violet-700 font-medium">Analyzing your dataset...</span>
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                                <span>Analysis Progress</span>
                                <span>{Math.round(analysisProgress)}%</span>
                              </div>
                              <Progress value={analysisProgress} className="h-3" />
                            </div>
                          </motion.div>
                        )}

                        <div className="text-center">
                          <Button onClick={analyzeFile} disabled={files.length === 0 || analyzing} size="lg" className="btn-primary text-lg px-12 py-4">
                            {analyzing ? (
                              <>
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                Analyzing...
                              </>
                            ) : (
                              <>
                                <Zap className="w-5 h-5 mr-2" />
                                Analyze for Bias
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <BiasAnalysisResults
                        results={analysisResults}
                        onBack={() => {
                          setShowResults(false)
                          setFiles([])
                          setAnalysisResults(null)
                          setAnalysisProgress(0)
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 bg-gradient-to-br from-gray-50 to-slate-100">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={featuresInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose BiasBounty?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI-powered bias detection with gamification that makes fairness fun and rewarding
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI-Powered Detection',
                description:
                  'Advanced machine learning models detect multiple types of bias including demographic, statistical, and text-based bias patterns.',
                color: 'violet',
              },
              {
                icon: Zap,
                title: 'Instant Analysis',
                description: 'Get comprehensive bias reports in seconds. No waiting, no queues - just upload and analyze immediately.',
                color: 'blue',
              },
              {
                icon: Shield,
                title: 'Privacy First',
                description:
                  'Your data stays secure. We analyze without storing sensitive information, ensuring complete privacy protection.',
                color: 'green',
              },
              {
                icon: Users,
                title: 'Community Driven',
                description: 'Join thousands of bias hunters working together to make AI more fair and equitable for everyone.',
                color: 'purple',
              },
              {
                icon: TrendingUp,
                title: 'Gamified Experience',
                description: 'Earn points, unlock achievements, and climb leaderboards while contributing to AI fairness.',
                color: 'pink',
              },
              {
                icon: Globe,
                title: 'Global Impact',
                description:
                  'Your contributions help build a database of bias patterns that benefits the entire AI community worldwide.',
                color: 'cyan',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="border-0 shadow-xl bg-white hover:shadow-2xl transition-all duration-300 card-hover h-full">
                  <CardContent className="p-8">
                    {/* Tailwind note: dynamic color classes may be purged unless safelisted in tailwind.config */}
                    <div className={`w-16 h-16 bg-${feature.color}-100 rounded-2xl flex items-center justify-center mb-6`}>
                      <feature.icon className={`w-8 h-8 text-${feature.color}-600`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 cosmic-bg relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Hunt Some Bias?</h2>
            <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto">
              Join the movement to make AI more fair and unbiased. Start analyzing datasets today and earn rewards for
              your contributions.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button 
                onClick={scrollToAnalyzer}
                className="inline-flex items-center justify-center h-14 px-8 py-4 text-lg font-semibold text-violet-600 bg-white hover:bg-gray-100 hover:text-violet-700 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Free Analysis
              </button>

              <button 
                className="inline-flex items-center justify-center h-14 px-8 py-4 text-lg font-semibold bg-white/10 border-2 border-white/30 text-white hover:bg-white/20 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 backdrop-blur-sm"
              >
                <Star className="w-5 h-5 mr-2" />
                Join Community
              </button>
            </div>
          </motion.div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
