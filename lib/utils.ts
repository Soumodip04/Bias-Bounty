import { formatDistanceToNow as formatDistanceToNowFn } from 'date-fns'

export function formatDistanceToNow(date: Date | number) {
  return formatDistanceToNowFn(date, { addSuffix: true })
}
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBytes(bytes: number, decimals = 2) {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function formatDate(date: string | Date) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}

export function calculateLevel(points: number) {
  // Level calculation: Level = floor(sqrt(points / 100))
  return Math.floor(Math.sqrt(points / 100)) + 1
}

export function getPointsForNextLevel(currentLevel: number) {
  return Math.pow(currentLevel, 2) * 100
}

export function getBiasScoreColor(score: number) {
  if (score >= 90) return 'text-green-600'
  if (score >= 70) return 'text-yellow-600'
  if (score >= 50) return 'text-orange-600'
  return 'text-red-600'
}

export function getBiasScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (score >= 90) return 'default'
  if (score >= 70) return 'secondary'
  if (score >= 50) return 'outline'
  return 'destructive'
}

export function getSeverityColor(severity: string) {
  switch (severity) {
    case 'low':
      return 'text-green-600'
    case 'medium':
      return 'text-yellow-600'
    case 'high':
      return 'text-orange-600'
    case 'critical':
      return 'text-red-600'
    default:
      return 'text-gray-600'
  }
}

export function getSeverityBadgeVariant(severity: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (severity) {
    case 'low':
      return 'default'
    case 'medium':
      return 'secondary'
    case 'high':
      return 'outline'
    case 'critical':
      return 'destructive'
    default:
      return 'outline'
  }
}