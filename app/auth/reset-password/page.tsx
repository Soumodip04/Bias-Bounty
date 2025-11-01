'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Shield, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations'
import { PageErrorBoundary } from '@/components/error-boundary'

function ResetPasswordPageContent() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isValidSession, setIsValidSession] = useState(false)
  const [errors, setErrors] = useState<Partial<ResetPasswordInput & { confirmPassword: string }>>({})
  const router = useRouter()

  useEffect(() => {
    // Check if we have a valid session (from the email link)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        toast.error('Invalid or expired reset link')
        router.push('/auth/forgot-password')
      }
    }

    checkSession()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' })
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      // Validate password
      const result = resetPasswordSchema.safeParse({ password })
      
      if (!result.success) {
        const fieldErrors: Partial<ResetPasswordInput> = {}
        result.error.issues.forEach((issue) => {
          if (issue.path[0]) {
            fieldErrors[issue.path[0] as keyof ResetPasswordInput] = issue.message
          }
        })
        setErrors(fieldErrors)
        setLoading(false)
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      })
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Password updated successfully!')
        router.push('/auth/signin')
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = () => {
    if (password.length === 0) return null
    if (password.length < 6) return { text: 'Too weak', color: 'text-red-500' }
    if (password.length < 8) return { text: 'Weak', color: 'text-orange-500' }
    if (password.length < 12) return { text: 'Good', color: 'text-yellow-500' }
    return { text: 'Strong', color: 'text-green-500' }
  }

  const strength = passwordStrength()

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Verifying reset link...</p>
        </div>
      </div>
    )
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Set new password</h1>
          <p className="text-gray-600 dark:text-gray-300">Enter your new password below</p>
        </div>

        <Card className="border-0 shadow-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create new password</CardTitle>
            <CardDescription className="text-center">
              Your new password must be different from previous passwords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-600">{errors.password}</p>
                )}
                {strength && !errors.password && (
                  <p className={`text-xs ${strength.color} flex items-center space-x-1`}>
                    <span>Password strength: {strength.text}</span>
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-red-600">{errors.confirmPassword}</p>
                )}
                {confirmPassword && password === confirmPassword && !errors.confirmPassword && (
                  <p className="text-xs text-green-500 flex items-center space-x-1">
                    <Check className="h-3 w-3" />
                    <span>Passwords match</span>
                  </p>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-800">
                <p className="font-medium mb-1">Password requirements:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>At least 6 characters long</li>
                  <li>Recommended: Use a mix of letters, numbers, and symbols</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || password !== confirmPassword || password.length < 6}
              >
                {loading ? 'Updating password...' : 'Reset password'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors"
              >
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <PageErrorBoundary>
      <ResetPasswordPageContent />
    </PageErrorBoundary>
  )
}
