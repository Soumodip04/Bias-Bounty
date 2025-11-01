// User types
export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  points: number
  level: number
  created_at: string
  updated_at: string
}

// Dataset types
export interface Dataset {
  id: string
  name: string
  description: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  bias_score?: number
  fairness_metrics?: FairnessMetrics
  status: 'pending' | 'analyzing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  uploader?: {
    username: string
    avatar_url?: string
  }
}

// Bias Analysis types
export interface BiasAnalysisResult {
  bias_score: number
  fairness_metrics: FairnessMetrics
  recommendations: Recommendation[]
  analysis_type: string
  demographic_distribution?: Record<string, number>
  sentiment_distribution?: Record<string, number>
  toxicity_counts?: Record<string, number>
  missing_values?: Record<string, number>
  outliers?: Record<string, number>
  correlation_matrix?: Record<string, Record<string, number>>
  top_correlations?: Array<{
    feature1: string
    feature2: string
    correlation: number
  }>
  cleaned_data_info?: {
    original_rows: number
    cleaned_rows: number
    rows_removed: number
    demographic_balance?: Record<string, number>
  }
  ai_summary?: string
}

export interface FairnessMetrics {
  demographic_parity?: number
  equal_opportunity?: number
  predictive_parity?: number
  disparate_impact?: number
  statistical_parity?: number
  [key: string]: number | undefined
}

export interface Recommendation {
  id: string
  type: 'critical' | 'moderate' | 'low' | 'info'
  category: string
  title: string
  description: string
  severity?: string
  action?: string
}

// Bias Report types
export interface BiasReport {
  id: string
  dataset_id: string
  user_id: string
  bias_type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidence?: Record<string, unknown>
  status: 'pending' | 'verified' | 'rejected'
  points_awarded?: number
  created_at: string
  updated_at: string
}

// Leaderboard types
export interface LeaderboardEntry {
  user_id: string
  username: string
  avatar_url?: string
  points: number
  level: number
  reports_submitted: number
  bias_found: number
  rank: number
}

// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: ApiError | null
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, unknown>
}

// Form types
export interface UploadedFile {
  file: File
  preview?: string
}

// Chart data types
export interface ChartDataPoint {
  name: string
  value: number
  [key: string]: string | number
}

export interface CorrelationData {
  feature1: string
  feature2: string
  correlation: number
}

// Code Analysis types
export interface CodeAnalysisResult {
  bias_score: number
  issues: CodeIssue[]
  suggestions: string[]
  statistics: {
    total_lines: number
    functions_analyzed: number
    variables_analyzed: number
  }
}

export interface CodeIssue {
  line: number
  column: number
  severity: 'error' | 'warning' | 'info'
  message: string
  code?: string
}

// Notification types
export interface Notification {
  id: string
  user_id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  read: boolean
  created_at: string
}

// Export file types
export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv'
  includeCharts: boolean
  includeRecommendations: boolean
}
