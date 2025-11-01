'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  Code,
  FileText,
  AlertTriangle,
  CheckCircle,
  Zap,
  Brain,
  Target,
  BarChart3,
  Download,
  Copy,
  Play,
  RefreshCw,
  Eye,
  EyeOff,
  Sparkles,
  Award,
  TrendingUp,
  Users,
  Globe,
  Shield,
  ArrowRight,
  FileCode,
  Bug,
  Lightbulb,
  Star,
  Trophy,
  Clock,
  X,
  Plus,
  Minus,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { useAuth } from '@/lib/auth-context'
import toast from 'react-hot-toast'
import CountUp from 'react-countup'

interface BiasIssue {
  id: string
  type: 'gender' | 'race' | 'age' | 'socioeconomic' | 'algorithmic' | 'data'
  severity: 'low' | 'medium' | 'high' | 'critical'
  line: number
  column: number
  message: string
  suggestion: string
  code: string
  fixedCode: string
  category: string
}

interface BiasAnalysisResult {
  biasScore: number
  totalIssues: number
  issues: BiasIssue[]
  language: string
  fileSize: number
  analysisTime: number
  suggestions: string[]
  heatmap: { line: number; bias: number }[]
  biasDistribution: { type: string; count: number; percentage: number }[]
}

interface UploadedFile {
  file: File
  content: string
  language: string
}

import { PageErrorBoundary } from '@/components/error-boundary'

function CodeAnalyzerPageContent() {
  const { user } = useAuth()
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [pastedCode, setPastedCode] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisResults, setAnalysisResults] = useState<BiasAnalysisResult | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [activeTab, setActiveTab] = useState('upload')
  const [selectedIssue, setSelectedIssue] = useState<BiasIssue | null>(null)
  const [showFixedCode, setShowFixedCode] = useState(false)
  const [biasScore, setBiasScore] = useState(0)
  const [celebration, setCelebration] = useState(false)

  const editorRef = useRef<HTMLDivElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Mock bias detection for demo
  const detectBiasInCode = async (code: string, language: string): Promise<BiasAnalysisResult> => {
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Mock bias issues based on common patterns
    const mockIssues: BiasIssue[] = []
    const lines = code.split('\n')
    
    lines.forEach((line, index) => {
      const lineNum = index + 1
      
      // Check for gender bias patterns
      if (line.toLowerCase().includes('gender') && line.includes('==')) {
        mockIssues.push({
          id: `gender-${index}`,
          type: 'gender',
          severity: 'high',
          line: lineNum,
          column: line.indexOf('gender'),
          message: 'Hard-coded gender comparison detected',
          suggestion: 'Use gender-neutral comparisons or remove gender-based logic',
          code: line.trim(),
          fixedCode: line.replace(/gender\s*==\s*['"]male['"]/gi, 'isEligible()'),
          category: 'Gender Bias'
        })
      }
      
      // Check for age bias
      if (line.includes('age') && (line.includes('<') || line.includes('>'))) {
        mockIssues.push({
          id: `age-${index}`,
          type: 'age',
          severity: 'medium',
          line: lineNum,
          column: line.indexOf('age'),
          message: 'Age-based discrimination detected',
          suggestion: 'Consider age-neutral criteria or use age ranges instead of hard limits',
          code: line.trim(),
          fixedCode: line.replace(/age\s*[<>]\s*\d+/gi, 'ageInRange(18, 65)'),
          category: 'Age Bias'
        })
      }
      
      // Check for racial bias
      if (line.toLowerCase().includes('race') || line.toLowerCase().includes('ethnicity')) {
        mockIssues.push({
          id: `race-${index}`,
          type: 'race',
          severity: 'critical',
          line: lineNum,
          column: line.toLowerCase().indexOf('race'),
          message: 'Race-based logic detected',
          suggestion: 'Remove race-based criteria entirely',
          code: line.trim(),
          fixedCode: '// Race-based logic removed for fairness',
          category: 'Racial Bias'
        })
      }
      
      // Check for socioeconomic bias
      if (line.toLowerCase().includes('income') || line.toLowerCase().includes('salary')) {
        mockIssues.push({
          id: `socio-${index}`,
          type: 'socioeconomic',
          severity: 'medium',
          line: lineNum,
          column: line.toLowerCase().indexOf('income'),
          message: 'Income-based discrimination detected',
          suggestion: 'Use income brackets or remove income requirements',
          code: line.trim(),
          fixedCode: line.replace(/income\s*[<>]\s*\d+/gi, 'incomeInBracket()'),
          category: 'Socioeconomic Bias'
        })
      }
    })

    const biasScore = Math.max(0, 100 - (mockIssues.length * 15))
    const biasDistribution = [
      { type: 'Gender', count: mockIssues.filter(i => i.type === 'gender').length, percentage: 0 },
      { type: 'Age', count: mockIssues.filter(i => i.type === 'age').length, percentage: 0 },
      { type: 'Race', count: mockIssues.filter(i => i.type === 'race').length, percentage: 0 },
      { type: 'Socioeconomic', count: mockIssues.filter(i => i.type === 'socioeconomic').length, percentage: 0 },
    ].filter(d => d.count > 0)

    // Calculate percentages
    biasDistribution.forEach(d => {
      d.percentage = (d.count / mockIssues.length) * 100
    })

    return {
      biasScore,
      totalIssues: mockIssues.length,
      issues: mockIssues,
      language,
      fileSize: code.length,
      analysisTime: 2.1,
      suggestions: [
        'Remove hard-coded demographic comparisons',
        'Use inclusive data collection methods',
        'Implement bias testing in your pipeline',
        'Consider using synthetic data for training'
      ],
      heatmap: lines.map((_, index) => ({
        line: index + 1,
        bias: Math.random() * 100
      })),
      biasDistribution
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const language = getLanguageFromExtension(file.name)
        setUploadedFile({ file, content, language })
        setPastedCode('')
        setShowResults(false)
        setAnalysisResults(null)
      }
      reader.readAsText(file)
    }
  }, [])

  const getLanguageFromExtension = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    switch (ext) {
      case 'py': return 'python'
      case 'js': return 'javascript'
      case 'ts': return 'typescript'
      case 'cpp': return 'cpp'
      case 'c': return 'c'
      case 'java': return 'java'
      case 'r': return 'r'
      case 'scala': return 'scala'
      default: return 'text'
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python': ['.py'],
      'application/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'text/x-c++src': ['.cpp'],
      'text/x-csrc': ['.c'],
      'text/x-java': ['.java'],
      'text/x-r': ['.r'],
      'text/x-scala': ['.scala'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  })

  const analyzeCode = async () => {
    const codeToAnalyze = uploadedFile?.content || pastedCode
    if (!codeToAnalyze.trim()) {
      toast.error('Please upload a file or paste code first')
      return
    }

    setAnalyzing(true)
    setAnalysisProgress(0)
    setShowResults(false)

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      const language = uploadedFile?.language || 'text'
      const results = await detectBiasInCode(codeToAnalyze, language)
      
      clearInterval(progressInterval)
      setAnalysisProgress(100)
      setAnalysisResults(results)
      setBiasScore(results.biasScore)
      setShowResults(true)
      
      // Trigger celebration if score is high
      if (results.biasScore >= 90) {
        setCelebration(true)
        setTimeout(() => setCelebration(false), 3000)
      }
      
      toast.success('Code analysis completed!')
    } catch (err) {
      console.error(err)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 800)
    }
  }

  const applyFix = (issue: BiasIssue) => {
    if (!analysisResults) return
    
    const updatedIssues = analysisResults.issues.filter(i => i.id !== issue.id)
    const newBiasScore = Math.min(100, biasScore + 15)
    
    setAnalysisResults({
      ...analysisResults,
      issues: updatedIssues,
      biasScore: newBiasScore,
      totalIssues: updatedIssues.length
    })
    setBiasScore(newBiasScore)
    
    if (newBiasScore >= 90) {
      setCelebration(true)
      setTimeout(() => setCelebration(false), 3000)
    }
    
    toast.success('Fix applied! Bias score improved.')
  }

  const exportReport = () => {
    if (!analysisResults) return
    
    const report = {
      biasScore: analysisResults.biasScore,
      totalIssues: analysisResults.totalIssues,
      issues: analysisResults.issues,
      language: analysisResults.language,
      timestamp: new Date().toISOString(),
      suggestions: analysisResults.suggestions
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bias-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Report exported successfully!')
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <Navbar />
        <div className="pt-20 flex items-center justify-center min-h-screen">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Please sign in to access the code analyzer</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button asChild>
                <a href="/auth/signin">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      {/* Celebration Animation */}
      <AnimatePresence>
        {celebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: -100 }}
              animate={{ y: 0 }}
              className="bg-white rounded-2xl p-8 shadow-2xl text-center max-w-md mx-4"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl mb-4"
              >
                
              </motion.div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">Congratulations!</h2>
              <p className="text-gray-600 mb-4">Your code is now bias-free!</p>
              <Badge className="bg-green-100 text-green-800 text-lg px-4 py-2">
                <Award className="w-5 h-5 mr-2" />
                Bias-Free Score: {biasScore}%
              </Badge>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Code className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">AI Code Bias Analyzer</h1>
                <p className="text-gray-600">Detect and fix bias in your AI/ML code</p>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Panel - Code Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
                  <CardTitle className="text-2xl flex items-center">
                    <Target className="w-6 h-6 mr-3" />
                    Code Bias Detector
                  </CardTitle>
                  <CardDescription className="text-violet-100">
                    Upload Python, JavaScript, C++, Java files or paste code directly
                  </CardDescription>
                </CardHeader>

                <CardContent className="p-6">
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-6">
                      <TabsTrigger value="upload" className="flex items-center space-x-2">
                        <Upload className="w-4 h-4" />
                        <span>Upload File</span>
                      </TabsTrigger>
                      <TabsTrigger value="paste" className="flex items-center space-x-2">
                        <FileText className="w-4 h-4" />
                        <span>Paste Code</span>
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="upload" className="space-y-6">
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                          isDragActive ? 'border-violet-500 bg-violet-50 scale-105' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/50'
                        } ${analyzing ? 'pointer-events-none opacity-50' : ''}`}
                      >
                        <input {...getInputProps()} />
                        <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}>
                          <Upload className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                          {isDragActive ? (
                            <p className="text-violet-600 text-lg font-semibold">Drop your code file here!</p>
                          ) : (
                            <div>
                              <p className="text-gray-700 text-lg font-semibold mb-2">Drag & drop your code file here</p>
                              <p className="text-gray-500 mb-4">or click to browse files</p>
                              <p className="text-sm text-gray-400">Supports .py, .js, .ts, .cpp, .c, .java, .r, .scala files up to 5MB</p>
                            </div>
                          )}
                        </motion.div>
                      </div>

                      {uploadedFile && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-xl p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                                <FileCode className="w-5 h-5 text-violet-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{uploadedFile.file.name}</p>
                                <p className="text-sm text-gray-500">{uploadedFile.language.toUpperCase()}  {(uploadedFile.file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            {!analyzing && (
                              <Button variant="ghost" size="sm" onClick={() => setUploadedFile(null)} className="text-gray-500 hover:text-red-500">
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </TabsContent>

                    <TabsContent value="paste" className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium text-gray-700">Paste your code here</label>
                          <Badge variant="outline" className="text-xs">
                            Auto-detect language
                          </Badge>
                        </div>
                        <textarea
                          value={pastedCode}
                          onChange={(e) => setPastedCode(e.target.value)}
                          placeholder="Paste your AI/ML code here for bias analysis..."
                          className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                          disabled={analyzing}
                        />
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{pastedCode.length} characters</span>
                          <span>Language: Auto-detect</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>

                  {/* Analysis Progress */}
                  {analyzing && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="text-center">
                        <div className="inline-flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
                          <div className="w-3 h-3 bg-violet-600 rounded-full animate-pulse" />
                          <span className="text-violet-700 font-medium">Analyzing code for bias...</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Analysis Progress</span>
                          <span>{Math.round(analysisProgress)}%</span>
                        </div>
                        <Progress value={analysisProgress} className="h-3" />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className={`flex items-center space-x-2 ${analysisProgress > 20 ? 'text-green-600' : 'text-gray-400'}`}>
                          <CheckCircle className="w-4 h-4" />
                          <span>Code Parsing</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${analysisProgress > 60 ? 'text-green-600' : 'text-gray-400'}`}>
                          <Brain className="w-4 h-4" />
                          <span>Bias Detection</span>
                        </div>
                        <div className={`flex items-center space-x-2 ${analysisProgress > 90 ? 'text-green-600' : 'text-gray-400'}`}>
                          <BarChart3 className="w-4 h-4" />
                          <span>Generating Report</span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Analyze Button */}
                  <div className="text-center pt-6">
                    <Button 
                      onClick={analyzeCode} 
                      disabled={(!uploadedFile && !pastedCode.trim()) || analyzing} 
                      size="lg" 
                      className="btn-primary text-lg px-12 py-4"
                    >
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
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Panel - Results */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="lg:col-span-1"
            >
              {showResults && analysisResults ? (
                <div className="space-y-6">
                  {/* Bias Score */}
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <CardTitle className="text-xl flex items-center justify-between">
                        <span>Bias-Free Score</span>
                        <Badge className="bg-white/20 text-white border-white/30">
                          {biasScore >= 90 ? 'Excellent' : biasScore >= 70 ? 'Good' : biasScore >= 50 ? 'Fair' : 'Poor'}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-2">
                          <CountUp end={biasScore} duration={2} suffix="%" />
                        </div>
                        <Progress value={biasScore} className="h-3 mb-4" />
                        <p className="text-sm text-gray-600">
                          {analysisResults.totalIssues} bias issues found
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Bias Distribution */}
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-violet-600" />
                        Bias Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        {analysisResults.biasDistribution.map((item, index) => (
                          <div key={item.type} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-red-500' :
                                index === 1 ? 'bg-orange-500' :
                                index === 2 ? 'bg-yellow-500' : 'bg-blue-500'
                              }`} />
                              <span className="text-sm font-medium">{item.type}</span>
                            </div>
                            <div className="text-sm text-gray-600">
                              {item.count} ({item.percentage.toFixed(1)}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Actions */}
                  <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 space-y-3">
                      <Button onClick={exportReport} variant="outline" className="w-full justify-start">
                        <Download className="w-4 h-4 mr-2" />
                        Export Report
                      </Button>
                      <Button onClick={() => setShowFixedCode(!showFixedCode)} variant="outline" className="w-full justify-start">
                        <Eye className="w-4 h-4 mr-2" />
                        {showFixedCode ? 'Hide' : 'Show'} Fixed Code
                      </Button>
                      <Button onClick={() => {
                        setShowResults(false)
                        setAnalysisResults(null)
                        setUploadedFile(null)
                        setPastedCode('')
                      }} variant="outline" className="w-full justify-start">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        New Analysis
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Target className="w-8 h-8 text-violet-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
                    <p className="text-gray-600 text-sm">
                      Upload a code file or paste your AI/ML code to start bias detection
                    </p>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Results Section */}
          {showResults && analysisResults && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-8"
            >
              <Card className="border-0 shadow-xl bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <CardTitle className="text-2xl flex items-center justify-between">
                    <span className="flex items-center">
                      <AlertTriangle className="w-6 h-6 mr-3" />
                      Bias Issues Found
                    </span>
                    <Badge className="bg-white/20 text-white border-white/30">
                      {analysisResults.totalIssues} Issues
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  {analysisResults.issues.length > 0 ? (
                    <div className="space-y-4">
                      {analysisResults.issues.map((issue, index) => (
                        <motion.div
                          key={issue.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <Badge variant={
                                  issue.severity === 'critical' ? 'destructive' :
                                  issue.severity === 'high' ? 'destructive' :
                                  issue.severity === 'medium' ? 'secondary' : 'outline'
                                }>
                                  {issue.severity.toUpperCase()}
                                </Badge>
                                <Badge variant="outline">{issue.category}</Badge>
                                <span className="text-sm text-gray-500">Line {issue.line}</span>
                              </div>
                              <p className="text-gray-900 font-medium mb-2">{issue.message}</p>
                              <div className="bg-gray-50 rounded p-3 mb-3">
                                <code className="text-sm text-gray-800">{issue.code}</code>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">
                                <Lightbulb className="w-4 h-4 inline mr-1" />
                                <strong>Suggestion:</strong> {issue.suggestion}
                              </p>
                              {showFixedCode && (
                                <div className="bg-green-50 rounded p-3 mb-3">
                                  <p className="text-sm font-medium text-green-800 mb-1">Fixed Code:</p>
                                  <code className="text-sm text-green-700">{issue.fixedCode}</code>
                                </div>
                              )}
                            </div>
                            <Button
                              onClick={() => applyFix(issue)}
                              size="sm"
                              className="ml-4 bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Apply Fix
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-green-600 mb-2">No Bias Issues Found!</h3>
                      <p className="text-gray-600">Your code appears to be bias-free. Great job!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default function CodeAnalyzerPage() {
  return (
    <PageErrorBoundary>
      <CodeAnalyzerPageContent />
    </PageErrorBoundary>
  )
}
