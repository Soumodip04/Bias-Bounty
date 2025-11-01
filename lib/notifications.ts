'use client'

import { useEffect } from 'react'
import toast from 'react-hot-toast'

interface NotificationProps {
  type: 'success' | 'error' | 'info' | 'warning'
  title: string
  message: string
  duration?: number
}

export function showNotification({ type, title, message, duration = 4000 }: NotificationProps) {
  const getMessage = () => {
    const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️'
    return `${emoji} ${title}: ${message}`
  }

  if (type === 'success') {
    toast.success(getMessage(), { duration })
  } else if (type === 'error') {
    toast.error(getMessage(), { duration })
  } else {
    toast(getMessage(), { duration })
  }
}

// Request browser notification permission
export function requestNotificationPermission() {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission()
  }
}

// Show browser notification
export function showBrowserNotification(title: string, options?: NotificationOptions) {
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      icon: '/icon-192.png',
      badge: '/icon-192.png',
      ...options
    })
  }
}

// Notification hook for analysis completion
export function useAnalysisNotification() {
  useEffect(() => {
    requestNotificationPermission()
  }, [])

  const notifyAnalysisComplete = (biasScore: number) => {
    const severity = biasScore > 70 ? 'High' : biasScore > 40 ? 'Medium' : 'Low'
    const emoji = biasScore > 70 ? '🚨' : biasScore > 40 ? '⚠️' : '✅'
    
    showNotification({
      type: biasScore > 70 ? 'error' : biasScore > 40 ? 'warning' : 'success',
      title: `${emoji} Analysis Complete!`,
      message: `Bias score: ${Math.round(biasScore)}% (${severity} severity)`,
      duration: 6000
    })

    showBrowserNotification('BiasBounty - Analysis Complete', {
      body: `Bias score: ${Math.round(biasScore)}% (${severity} severity)`,
      tag: 'analysis-complete',
      requireInteraction: true
    })
  }

  return { notifyAnalysisComplete }
}
