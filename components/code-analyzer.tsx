'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import {
  Upload,
  Code,
  AlertTriangle,
  CheckCircle,
  Zap,
  Target,
  Brain,
  Eye,
  Download,
  Copy,
  RefreshCw,
  Star,
  Trophy,
  Sparkles,
  FileText,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import toast from 'react-hot-toast'

interface BiasIssue {
  id: string
  line: number
  column: number
  severity: 'low' | 'medium' | 'high' | 'critical'
  type: 'gender' | 'race' | 'age' | 'demographic' | 'statistical' | 'algorithmic'
  message: string
  suggestion: string
  code: string
  fixedCode: string
}

interface BiasAnalysis {
  score: number
  issues: BiasIssue[]
  summary: {
    totalIssues: number
    criticalIssues: number
    highIssues: number
    mediumIssues: number
    lowIssues: number
  }
  biasTypes: {
    [key: string]: number
  }
}

interface CodeAnalyzerProps {
  onAnalysisComplete?: (analysis: BiasAnalysis) => void
}

export default function CodeAnalyzer({ onAnalysisComplete }: CodeAnalyzerProps) {
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('python')
  const [fileName, setFileName] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysis, setAnalysis] = useState<BiasAnalysis | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [appliedFixes, setAppliedFixes] = useState<Set<string>>(new Set())
  const [currentScore, setCurrentScore] = useState(0)
  const [showCelebration, setShowCelebration] = useState(false)

  const editorRef = useRef<HTMLTextAreaElement>(null)

  // Detect language from file extension
  const detectLanguage = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase()
    const languageMap: { [key: string]: string } = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'cpp': 'cpp',
      'c': 'c',
      'java': 'java',
      'r': 'r',
      'scala': 'scala',
      'go': 'go',
      'rs': 'rust',
      'php': 'php',
      'rb': 'ruby',
      'swift': 'swift',
      'kt': 'kotlin',
    }
    return languageMap[ext || ''] || 'python'
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setFileName(file.name)
      setLanguage(detectLanguage(file.name))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setCode(content)
        setShowResults(false)
        setAnalysis(null)
        setAppliedFixes(new Set())
        setCurrentScore(0)
      }
      reader.readAsText(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/x-python': ['.py'],
      'application/javascript': ['.js'],
      'application/typescript': ['.ts'],
      'text/x-c++src': ['.cpp', '.c'],
      'text/x-java': ['.java'],
      'text/x-r': ['.r'],
      'text/x-scala': ['.scala'],
      'text/x-go': ['.go'],
      'text/x-rust': ['.rs'],
      'application/x-php': ['.php'],
      'text/x-ruby': ['.rb'],
      'text/x-swift': ['.swift'],
      'text/x-kotlin': ['.kt'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: false,
  })

  // Simulate bias analysis
  const analyzeCode = async () => {
    if (!code.trim()) {
      toast.error('Please upload or paste code first')
      return
    }

    setAnalyzing(true)
    setAnalysisProgress(0)
    setShowResults(false)

    try {
      // Simulate analysis progress
      const progressInterval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + Math.random() * 15
        })
      }, 200)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate mock analysis results
      const mockAnalysis: BiasAnalysis = {
        score: Math.floor(Math.random() * 40) + 30, // 30-70 range
        issues: [
          {
            id: '1',
            line: 15,
            column: 8,
            severity: 'high',
            type: 'gender',
            message: 'Potential gender bias in variable naming',
            suggestion: 'Use gender-neutral variable names',
            code: 'male_score = calculate_score(male_data)',
            fixedCode: 'person_score = calculate_score(person_data)'
          },
          {
            id: '2',
            line: 23,
            column: 12,
            severity: 'medium',
            type: 'demographic',
            message: 'Hardcoded demographic assumptions',
            suggestion: 'Make demographic categories configurable',
            code: 'if age > 65: category = "senior"',
            fixedCode: 'if age > senior_threshold: category = "senior"'
          },
          {
            id: '3',
            line: 31,
            column: 5,
            severity: 'critical',
            type: 'algorithmic',
            message: 'Algorithmic bias in scoring function',
            suggestion: 'Implement fairness constraints',
            code: 'score = weight1 * feature1 + weight2 * feature2',
            fixedCode: 'score = fair_scoring(feature1, feature2, fairness_params)'
          }
        ],
        summary: {
          totalIssues: 3,
          criticalIssues: 1,
          highIssues: 1,
          mediumIssues: 1,
          lowIssues: 0
        },
        biasTypes: {
          gender: 1,
          demographic: 1,
          algorithmic: 1
        }
      }

      clearInterval(progressInterval)
      setAnalysisProgress(100)
      setAnalysis(mockAnalysis)
      setCurrentScore(mockAnalysis.score)
      setShowResults(true)
      
      if (onAnalysisComplete) {
        onAnalysisComplete(mockAnalysis)
      }
      
      toast.success('Analysis completed successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Analysis failed. Please try again.')
    } finally {
      setAnalyzing(false)
      setTimeout(() => setAnalysisProgress(0), 800)
    }
  }

  const applyFix = (issueId: string) => {
    if (!analysis) return

    const issue = analysis.issues.find(i => i.id === issueId)
    if (!issue) return

    // Apply the fix to the code
    const lines = code.split('\n')
    const lineIndex = issue.line - 1
    
    if (lineIndex >= 0 && lineIndex < lines.length) {
      lines[lineIndex] = issue.fixedCode
      setCode(lines.join('\n'))
      setAppliedFixes(prev => new Set([...prev, issueId]))
      
      // Update score
      const scoreIncrease = issue.severity === 'critical' ? 20 : 
                          issue.severity === 'high' ? 15 :
                          issue.severity === 'medium' ? 10 : 5
      setCurrentScore(prev => Math.min(100, prev + scoreIncrease))
      
      // Check for celebration
      if (currentScore + scoreIncrease >= 90) {
        setShowCelebration(true)
        setTimeout(() => setShowCelebration(false), 3000)
      }
      
      toast.success('Fix applied successfully!')
    }
  }

  const resetAnalysis = () => {
    setShowResults(false)
    setAnalysis(null)
    setAppliedFixes(new Set())
    setCurrentScore(0)
    setShowCelebration(false)
  }

  const exportReport = () => {
    if (!analysis) return
    
    const report = {
      fileName,
      language,
      analysisDate: new Date().toISOString(),
      biasScore: currentScore,
      issues: analysis.issues,
      appliedFixes: Array.from(appliedFixes)
    }
    
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bias-report-${fileName || 'code'}.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success('Report exported successfully!')
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500'
      case 'high': return 'bg-orange-500'
      case 'medium': return 'bg-yellow-500'
      case 'low': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 70) return 'text-yellow-600'
    if (score >= 50) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-2"> Code Bias Analyzer</h2>
        <p className="text-gray-600">
          Upload AI/ML code files or paste code directly to detect bias and unfair logic
        </p>
      </div>

      {/* Celebration Animation */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-2xl p-8 text-center shadow-2xl"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl mb-4"
              >
                
              </motion.div>
              <h3 className="text-2xl font-bold text-green-600 mb-2">
                Congratulations!
              </h3>
              <p className="text-gray-600">
                Your code is now bias-free! Score: {currentScore}/100
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Panel - Code Input */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-violet-600 to-purple-600 text-white">
            <CardTitle className="flex items-center">
              <Code className="w-5 h-5 mr-2" />
              Code Editor
            </CardTitle>
            <CardDescription className="text-violet-100">
              Upload files or paste code directly
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {!code ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
                  isDragActive ? 'border-violet-500 bg-violet-50 scale-105' : 'border-gray-300 hover:border-violet-400 hover:bg-violet-50/50'
                }`}
              >
                <input {...getInputProps()} />
                <motion.div animate={isDragActive ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.2 }}>
                  <Upload className="h-12 w-12 text-violet-400 mx-auto mb-4" />
                  {isDragActive ? (
                    <p className="text-violet-600 text-lg font-semibold">Drop your code file here!</p>
                  ) : (
                    <div>
                      <p className="text-gray-700 text-lg font-semibold mb-2">Drag & drop code files here</p>
                      <p className="text-gray-500 mb-4">or click to browse files</p>
                      <p className="text-sm text-gray-400">Supports Python, JavaScript, C++, Java, R, and more</p>
                    </div>
                  )}
                </motion.div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* File Info */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-violet-600" />
                    <div>
                      <p className="font-medium text-gray-900">{fileName || 'Untitled'}</p>
                      <p className="text-sm text-gray-500">{language.toUpperCase()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setCode('')
                    setFileName('')
                    resetAnalysis()
                  }}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>

                {/* Code Editor */}
                <div className="relative">
                  <textarea
                    ref={editorRef}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    className="w-full h-96 p-4 border border-gray-300 rounded-lg font-mono text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    placeholder="Paste your code here or upload a file..."
                    spellCheck={false}
                  />
                  
                  {/* Bias Markers */}
                  {analysis && (
                    <div className="absolute left-0 top-0 w-full h-full pointer-events-none">
                      {analysis.issues.map((issue) => (
                        <TooltipProvider key={issue.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div
                                className="absolute w-2 h-2 rounded-full cursor-pointer"
                                style={{
                                  top: `${(issue.line - 1) * 20 + 16}px`,
                                  left: `${issue.column * 8 + 16}px`,
                                }}
                              >
                                <div className={`w-2 h-2 rounded-full ${getSeverityColor(issue.severity)} animate-pulse`} />
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="max-w-xs">
                                <p className="font-semibold text-red-600">{issue.message}</p>
                                <p className="text-sm text-gray-600 mt-1">{issue.suggestion}</p>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      ))}
                    </div>
                  )}
                </div>

                {/* Analyze Button */}
                <div className="text-center">
                  <Button 
                    onClick={analyzeCode} 
                    disabled={!code.trim() || analyzing} 
                    size="lg" 
                    className="btn-primary"
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

                {/* Analysis Progress */}
                {analyzing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <div className="inline-flex items-center space-x-2 bg-violet-100 px-4 py-2 rounded-full">
                        <div className="w-3 h-3 bg-violet-600 rounded-full animate-pulse" />
                        <span className="text-violet-700 font-medium">Analyzing your code...</span>
                      </div>
                    </div>
                    <Progress value={analysisProgress} className="h-3" />
                  </motion.div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          {/* Bias Score */}
          {showResults && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white">
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Target className="w-5 h-5 mr-2" />
                      Bias-Free Score
                    </span>
                    <Badge className="bg-white/20 text-white">
                      {appliedFixes.size} fixes applied
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="text-center">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5 }}
                      className={`text-6xl font-bold mb-4 ${getScoreColor(currentScore)}`}
                    >
                      {currentScore}
                    </motion.div>
                    <p className="text-gray-600 mb-4">out of 100</p>
                    <Progress value={currentScore} className="h-4 mb-4" />
                    <div className="flex justify-center space-x-4 text-sm">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span>Critical</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-orange-500 rounded-full" />
                        <span>High</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        <span>Medium</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-500 rounded-full" />
                        <span>Low</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Bias Issues */}
          {showResults && analysis && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="border-0 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Bias Issues Found
                    </span>
                    <Badge variant="destructive">
                      {analysis.summary.totalIssues} issues
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {analysis.issues.map((issue) => (
                      <motion.div
                        key={issue.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-lg border-l-4 ${
                          issue.severity === 'critical' ? 'border-red-500 bg-red-50' :
                          issue.severity === 'high' ? 'border-orange-500 bg-orange-50' :
                          issue.severity === 'medium' ? 'border-yellow-500 bg-yellow-50' :
                          'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <Badge className={`${getSeverityColor(issue.severity)} text-white`}>
                                {issue.severity}
                              </Badge>
                              <Badge variant="outline">{issue.type}</Badge>
                              <span className="text-sm text-gray-500">Line {issue.line}</span>
                            </div>
                            <p className="font-medium text-gray-900 mb-2">{issue.message}</p>
                            <p className="text-sm text-gray-600 mb-3">{issue.suggestion}</p>
                            <div className="bg-gray-100 rounded p-2 font-mono text-sm">
                              <code>{issue.code}</code>
                            </div>
                          </div>
                          <div className="ml-4">
                            {appliedFixes.has(issue.id) ? (
                              <Badge className="bg-green-500 text-white">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Fixed
                              </Badge>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => applyFix(issue.id)}
                                className="bg-violet-600 hover:bg-violet-700"
                              >
                                <Zap className="w-3 h-3 mr-1" />
                                Apply Fix
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Actions */}
          {showResults && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex space-x-3"
            >
              <Button onClick={exportReport} variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button onClick={resetAnalysis} variant="outline" className="flex-1">
                <RotateCcw className="w-4 h-4 mr-2" />
                New Analysis
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
