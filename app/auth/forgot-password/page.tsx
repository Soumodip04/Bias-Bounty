'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowLeft, Mail, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validations'
import { PageErrorBoundary } from '@/components/error-boundary'

function ForgotPasswordPageContent() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [errors, setErrors] = useState<Partial<ForgotPasswordInput>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})
    setLoading(true)

    try {
      // Validate email
      const result = forgotPasswordSchema.safeParse({ email })
      
      if (!result.success) {
        const fieldErrors: Partial<ForgotPasswordInput> = {}
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof ForgotPasswordInput] = issue.message
          }
        })
        setErrors(fieldErrors)
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      
      if (error) {
        toast.error(error.message)
      } else {
        setEmailSent(true)
        toast.success('Password reset email sent! Check your inbox.')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              BiasBounty
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Forgot password?</h1>
          <p className="text-gray-600 dark:text-gray-300">
            {emailSent 
              ? "We've sent you a password reset link" 
              : "No worries, we'll send you reset instructions"}
          </p>
        </div>

        <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Reset your password</CardTitle>
            <CardDescription className="text-center">
              {emailSent 
                ? "Check your email for a link to reset your password" 
                : "Enter your email address and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!emailSent ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600">{errors.email}</p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </Button>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                  <div className="flex justify-center mb-2">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <Mail className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                  <p className="text-sm text-green-800 mb-2">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-sm font-medium text-green-900">{email}</p>
                </div>

                <div className="text-center text-sm text-gray-600">
                  <p>Didn't receive the email?</p>
                  <button
                    onClick={() => setEmailSent(false)}
                    className="text-blue-600 hover:text-blue-500 font-medium transition-colors mt-1"
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ForgotPasswordPage() {
  return (
    <PageErrorBoundary>
      <ForgotPasswordPageContent />
    </PageErrorBoundary>
  )
}
