'use client'

import React from 'react'
import { ErrorBoundary as ReactErrorBoundary, FallbackProps } from 'react-error-boundary'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<FallbackProps>
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="max-w-lg w-full border-red-200 bg-red-50/50">
        <CardHeader>
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <CardTitle className="text-red-900">Something went wrong</CardTitle>
          </div>
          <CardDescription className="text-red-700">
            An unexpected error occurred. Don't worry, we're working on fixing it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-red-200">
            <p className="text-sm font-mono text-red-800 break-all">
              {error.message}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={resetErrorBoundary}
              variant="default"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && error.stack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-red-700 hover:text-red-800 font-medium">
                Error Stack (Development Only)
              </summary>
              <pre className="mt-2 text-xs bg-white p-3 rounded border border-red-200 overflow-auto max-h-60">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function ErrorBoundary({ children, fallback, onError }: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error Boundary caught an error:', error, errorInfo)
    }
    
    // Call custom error handler if provided
    if (onError) {
      onError(error, errorInfo)
    }
    
    // In production, you would send this to an error tracking service like Sentry
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } })
  }

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback || DefaultErrorFallback}
      onError={handleError}
      onReset={() => {
        // Reset app state here if needed
        window.location.reload()
      }}
    >
      {children}
    </ReactErrorBoundary>
  )
}

// Specialized error boundaries for different sections

export function PageErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full border-red-200 bg-white">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="h-8 w-8 text-red-600" />
                </div>
              </div>
              <CardTitle className="text-2xl text-red-900">Page Error</CardTitle>
              <CardDescription className="text-red-700">
                This page encountered an error and couldn't be displayed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-sm font-mono text-red-800 break-all">
                  {error.message}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={resetErrorBoundary}
                  variant="default"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Page
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1"
                >
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

export function ComponentErrorBoundary({ 
  children, 
  componentName 
}: { 
  children: React.ReactNode
  componentName?: string 
}) {
  return (
    <ErrorBoundary
      fallback={({ error, resetErrorBoundary }) => (
        <Card className="border-red-200 bg-red-50/50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-red-900 mb-1">
                  {componentName ? `${componentName} Error` : 'Component Error'}
                </h3>
                <p className="text-sm text-red-700 mb-3">
                  This component couldn't be displayed due to an error.
                </p>
                <Button
                  onClick={resetErrorBoundary}
                  size="sm"
                  variant="outline"
                  className="border-red-300 text-red-700 hover:bg-red-100"
                >
                  <RefreshCw className="h-3 w-3 mr-2" />
                  Retry
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    >
      {children}
    </ErrorBoundary>
  )
}

// Hook to throw errors from async functions
export function useErrorHandler() {
  const [, setError] = React.useState()
  
  return React.useCallback(
    (error: Error) => {
      setError(() => {
        throw error
      })
    },
    [setError]
  )
}
