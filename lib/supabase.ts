// Local JSON-based auth and stubbed data layer replacing Supabase
// NOTE: This is a lightweight, client-side implementation using localStorage.
// It provides just enough behavior for the existing UI to function without Supabase.

// Types used across the app
export interface User {
  id: string
  email: string
  username: string
  avatar_url?: string
  points: number
  level: number
  created_at: string
  updated_at: string
  // internal only (not exported in getters)
  password?: string
}

export interface Dataset {
  uploader: any
  id: string
  name: string
  description: string
  file_url: string
  file_type: string
  file_size: number
  uploaded_by: string
  bias_score?: number
  fairness_metrics?: any
  status: 'pending' | 'analyzing' | 'completed' | 'failed'
  created_at: string
  updated_at: string
}

export interface BiasReport {
  id: string
  dataset_id: string
  user_id: string
  bias_type: string
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  evidence?: any
  status: 'pending' | 'verified' | 'rejected'
  points_awarded?: number
  created_at: string
  updated_at: string
}

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

// Storage keys
const USERS_KEY = 'bb_users'
const SESSION_KEY = 'bb_session'
const DATASETS_KEY = 'bb_datasets'
const RESET_TOKEN_KEY = 'bb_reset_token'

// Utilities
const now = () => new Date().toISOString()
const genId = () => crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)

function loadUsers(): User[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(USERS_KEY)
  if (!raw) {
    const seed: User[] = []
    localStorage.setItem(USERS_KEY, JSON.stringify(seed))
    return seed
  }
  try { return JSON.parse(raw) as User[] } catch { return [] }
}

function saveUsers(users: User[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadDatasets(): Dataset[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(DATASETS_KEY)
  if (!raw) return []
  try { return JSON.parse(raw) as Dataset[] } catch { return [] }
}

function saveDatasets(datasets: Dataset[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DATASETS_KEY, JSON.stringify(datasets))
}

// Auth helpers (local JSON)
export const signUp = async (email: string, password: string, username: string) => {
  if (typeof window === 'undefined') return { data: null, error: { message: 'Unavailable on server' } }
  const users = loadUsers()
  const exists = users.some(u => u.email.toLowerCase() === email.toLowerCase())
  if (exists) return { data: null, error: { message: 'Email already registered' } }

  const user: User = {
    id: genId(),
    email,
    username,
    points: 0,
    level: 1,
    created_at: now(),
    updated_at: now(),
    avatar_url: '',
    password, // simple local storage only (not secure)
  }
  users.push(user)
  saveUsers(users)
  return { data: { userId: user.id }, error: null as any }
}

export const signIn = async (email: string, password: string) => {
  if (typeof window === 'undefined') return { data: null, error: { message: 'Unavailable on server' } }
  const users = loadUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password)
  if (!user) return { data: null, error: { message: 'Invalid email or password' } }
  localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id }))
  // fire storage-like event for listeners in same tab
  window.dispatchEvent(new StorageEvent('storage', { key: SESSION_KEY }))
  return { data: { userId: user.id }, error: null as any }
}

export const signOut = async () => {
  if (typeof window === 'undefined') return { error: null as any }
  localStorage.removeItem(SESSION_KEY)
  window.dispatchEvent(new StorageEvent('storage', { key: SESSION_KEY }))
  return { error: null as any }
}

export const getCurrentUser = async () => {
  if (typeof window === 'undefined') return null
  const sessionRaw = localStorage.getItem(SESSION_KEY)
  if (!sessionRaw) return null
  try {
    const { userId } = JSON.parse(sessionRaw)
    const users = loadUsers()
    const user = users.find(u => u.id === userId) || null
    if (!user) return null
    // do not expose password
    const { password, ...safe } = user
    return safe as User
  } catch {
    return null
  }
}

export const resetPasswordForEmail = async (email: string) => {
  if (typeof window === 'undefined') return { data: null, error: { message: 'Unavailable on server' } }
  const users = loadUsers()
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
  if (!user) return { data: null, error: { message: 'If an account exists, a reset link will be sent' } }
  
  // In real app, this would send an email. For local mode, we'll store a token
  const token = genId()
  localStorage.setItem(RESET_TOKEN_KEY, JSON.stringify({ email, token, expires: Date.now() + 3600000 }))
  
  // Simulate email link - in real app this would be sent via email
  console.log(`[INFO] Password reset link (dev mode): ${window.location.origin}/auth/reset-password?token=${token}`)
  
  return { data: { message: 'Reset email sent' }, error: null as any }
}

export const updateUserPassword = async (userId: string, newPassword: string) => {
  if (typeof window === 'undefined') return { data: null, error: { message: 'Unavailable on server' } }
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { data: null, error: { message: 'User not found' } }
  
  users[idx].password = newPassword
  users[idx].updated_at = now()
  saveUsers(users)
  
  return { data: { message: 'Password updated' }, error: null as any }
}

export const getSession = async () => {
  if (typeof window === 'undefined') return { data: { session: null }, error: null as any }
  const sessionRaw = localStorage.getItem(SESSION_KEY)
  if (!sessionRaw) return { data: { session: null }, error: null as any }
  
  try {
    const { userId } = JSON.parse(sessionRaw)
    const users = loadUsers()
    const user = users.find(u => u.id === userId)
    if (!user) return { data: { session: null }, error: null as any }
    
    return { data: { session: { user: { id: userId } } }, error: null as any }
  } catch {
    return { data: { session: null }, error: null as any }
  }
}

// Database-like operations (local JSON stubs)
export const getUserProfile = async (userId: string) => {
  const users = loadUsers()
  const user = users.find(u => u.id === userId)
  if (!user) return { data: null, error: { message: 'Not found' } }
  const { password, ...safe } = user
  return { data: safe as User, error: null as any }
}

export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  const users = loadUsers()
  const idx = users.findIndex(u => u.id === userId)
  if (idx === -1) return { data: null, error: { message: 'Not found' } }
  const merged = { ...users[idx], ...updates, updated_at: now() }
  users[idx] = merged
  saveUsers(users)
  const { password, ...safe } = merged
  return { data: safe as User, error: null as any }
}

export const getDatasets = async (limit = 10, offset = 0) => {
  const list = loadDatasets()
  // Join-like info for uploader minimal shape
  const users = loadUsers()
  const enriched = list
    .sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
    .slice(offset, offset + limit)
    .map(d => ({
      ...d,
      users: { username: users.find(u => u.id === d.uploaded_by)?.username || 'anonymous', avatar_url: '' },
    }))
  return { data: enriched, error: null as any }
}

export const getDataset = async (id: string) => {
  const list = loadDatasets()
  let d = list.find(x => x.id === id)
  
  // Fallback to mock data if dataset not found in localStorage
  if (!d) {
    const mockDatasets: Dataset[] = [
      {
        id: '1',
        name: 'HR Employee Data',
        description: 'A comprehensive dataset of employee records for HR bias analysis, including demographics, performance metrics, and compensation data.',
        file_url: '/sample-data/hr_dataset.csv',
        file_type: 'csv',
        file_size: 204800,
        uploaded_by: 'demo-user',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        status: 'completed',
        bias_score: 65.2,
        fairness_metrics: {
          demographic_balance: 72.5,
          statistical_parity: 68.3,
          equal_opportunity: 71.8,
          predictive_parity: 69.1
        },
        uploader: null,
      },
      {
        id: '2',
        name: 'Loan Applications Dataset',
        description: 'Loan application data for fairness testing, containing applicant information and approval outcomes.',
        file_url: '/sample-data/loan_applications.csv',
        file_type: 'csv',
        file_size: 102400,
        uploaded_by: 'demo-user',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        updated_at: new Date(Date.now() - 86400000).toISOString(),
        status: 'analyzing',
        bias_score: undefined,
        uploader: null,
      },
      {
        id: '3',
        name: 'Product Reviews Collection',
        description: 'Product review data for sentiment and bias detection across multiple product categories.',
        file_url: '/sample-data/product_reviews.json',
        file_type: 'json',
        file_size: 51200,
        uploaded_by: 'demo-user',
        created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        status: 'failed',
        bias_score: undefined,
        uploader: null,
      },
    ]
    d = mockDatasets.find(x => x.id === id)
    if (!d) return { data: null, error: { message: 'Not found' } }
  }
  
  const users = loadUsers()
  const enriched = {
    ...d,
    users: { username: users.find(u => u.id === d.uploaded_by)?.username || 'Demo User', avatar_url: '' },
    bias_reports: [],
  }
  return { data: enriched, error: null as any }
}

export const uploadDataset = async (dataset: Omit<Dataset, 'id' | 'created_at' | 'updated_at' | 'uploader'>) => {
  const list = loadDatasets()
  const item: Dataset = {
    ...dataset,
    id: genId(),
    created_at: now(),
    updated_at: now(),
    uploader: null,
  }
  list.unshift(item)
  saveDatasets(list)
  return { data: item, error: null as any }
}

export const requestExpertReview = async (datasetId: string, userId?: string, analysisResults?: any) => {
  const list = loadDatasets()
  let dataset = list.find(d => d.id === datasetId)
  
  // If dataset doesn't exist, create it from analysis results
  if (!dataset && analysisResults) {
    dataset = {
      id: datasetId,
      name: analysisResults.fairness_metrics?.dataset_info?.filename || 'Analyzed Dataset',
      description: `Dataset analyzed on ${new Date().toLocaleDateString()}`,
      file_url: analysisResults.download_url || '',
      file_type: 'csv',
      file_size: 0,
      uploaded_by: userId || 'anonymous',
      created_at: now(),
      updated_at: now(),
      status: 'completed',
      bias_score: analysisResults.bias_score,
      fairness_metrics: analysisResults.fairness_metrics,
      uploader: null,
    }
    list.unshift(dataset)
  }
  
  if (!dataset) {
    return { data: null, error: { message: 'Dataset not found' } }
  }
  
  // Mark dataset as needing expert review
  dataset.status = 'pending' as any
  ;(dataset as any).needs_expert_review = true
  ;(dataset as any).expert_review_requested_at = now()
  ;(dataset as any).expert_review_requested_by = userId || 'anonymous'
  dataset.updated_at = now()
  
  saveDatasets(list)
  
  return { data: dataset, error: null as any }
}

export const submitBiasReport = async (_report: Omit<BiasReport, 'id' | 'created_at' | 'updated_at'>) => {
  // Not implemented in local mode
  return { data: null, error: { message: 'Not implemented in local mode' } }
}

export const getLeaderboard = async (limit = 50) => {
  const users = loadUsers()
  const sorted = [...users]
    .sort((a, b) => (b.points || 0) - (a.points || 0))
    .slice(0, limit)
  const data: LeaderboardEntry[] = sorted.map((u, i) => ({
    user_id: u.id,
    username: u.username,
    avatar_url: u.avatar_url,
    points: u.points || 0,
    level: u.level || 1,
    reports_submitted: 0,
    bias_found: 0,
    rank: i + 1,
  }))
  return { data, error: null as any }
}

export const getUserStats = async (userId: string) => {
  const users = loadUsers()
  const user = users.find(u => u.id === userId)
  const datasets = loadDatasets().filter(d => d.uploaded_by === userId)
  const stats = {
    user_id: userId,
    points: user?.points || 0,
    datasets_uploaded: datasets.length,
    reports_submitted: 0,
    bias_found: 0,
  }
  return { data: stats, error: null as any }
}

// Dummy supabase export to avoid import breakages in some files (realtime/storage not supported)
export const supabase = {
  auth: {
    getSession: getSession,
    resetPasswordForEmail: async (email: string, options?: { redirectTo?: string }) => {
      const result = await resetPasswordForEmail(email)
      if (!result.error) {
        // Create a session for password reset
        const users = loadUsers()
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase())
        if (user) {
          localStorage.setItem(SESSION_KEY, JSON.stringify({ userId: user.id, resetMode: true }))
        }
      }
      return result
    },
    updateUser: async (updates: { password?: string }) => {
      if (typeof window === 'undefined') return { data: null, error: { message: 'Unavailable' } }
      const sessionRaw = localStorage.getItem(SESSION_KEY)
      if (!sessionRaw) return { data: null, error: { message: 'No session' } }
      
      try {
        const { userId } = JSON.parse(sessionRaw)
        if (updates.password) {
          return await updateUserPassword(userId, updates.password)
        }
        return { data: { message: 'Updated' }, error: null as any }
      } catch {
        return { data: null, error: { message: 'Invalid session' } }
      }
    },
  },
  channel: (_name: string) => ({
    on: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    subscribe: () => ({}),
  }),
  removeChannel: (_chan: any) => {},
  storage: {
    from: (_bucket: string) => ({
      upload: async (_path: string, _file: File) => ({ 
        data: { path: _path }, 
        error: null as any 
      }),
      getPublicUrl: (path: string) => ({ 
        data: { publicUrl: `https://mock-storage.local/${path}` } 
      }),
    }),
  },
  from: (_table: string) => ({
    update: (_updates: any) => ({
      eq: async (_col: string, _val: any) => ({ data: {}, error: null as any }),
    }),
  }),
}