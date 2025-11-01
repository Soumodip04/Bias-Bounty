import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getDatasets, getUserStats, getLeaderboard, type Dataset, type LeaderboardEntry } from '@/lib/supabase'

// Datasets
export function useDatasets(limit = 30, offset = 0) {
  return useQuery({
    queryKey: ['datasets', limit, offset],
    queryFn: async () => {
      const { data, error } = await getDatasets(limit, offset)
      if (error) throw error
      return data
    },
  })
}

// User Stats
export function useUserStats(userId: string | undefined) {
  return useQuery({
    queryKey: ['userStats', userId],
    queryFn: async () => {
      if (!userId) return null
      const { data, error } = await getUserStats(userId)
      if (error) throw error
      return data
    },
    enabled: !!userId,
  })
}

// Leaderboard
export function useLeaderboard(limit = 50) {
  return useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const { data, error } = await getLeaderboard(limit)
      if (error) throw error
      return data
    },
  })
}

// Code Analysis (example mutation)
export function useAnalyzeCode() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (code: string) => {
      const response = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
      if (!response.ok) throw new Error('Analysis failed')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analyses'] })
    },
  })
}
