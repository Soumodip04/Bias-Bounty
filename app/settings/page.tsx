'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Camera, Lock, Mail, Save, User, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Navbar } from '@/components/navbar'
import { Footer } from '@/components/footer'
import { getCurrentUser, updateUserProfile } from '@/lib/supabase'
import toast from 'react-hot-toast'
import Image from 'next/image'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    avatar_url: '',
  })
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        router.push('/auth/signin')
        return
      }
      setUser(currentUser)
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        avatar_url: currentUser.avatar_url || '',
      })
      setLoading(false)
    }

    loadUser()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await updateUserProfile(user.id, formData)
      
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Profile updated successfully!')
        setUser({ ...user, ...formData })
      }
    } catch (error) {
      toast.error('Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-12 pt-24 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
            <p className="text-gray-600 dark:text-gray-300">Manage your account settings and preferences</p>
          </div>

          <div className="grid gap-6">
            {/* Profile Settings */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-blue-600" />
                  <span>Profile Information</span>
                </CardTitle>
                <CardDescription>
                  Update your personal information and avatar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Avatar */}
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg overflow-hidden">
                        {formData.avatar_url ? (
                          <Image
                            src={formData.avatar_url}
                            alt="Avatar"
                            width={96}
                            height={96}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          formData.username.charAt(0).toUpperCase()
                        )}
                      </div>
                      <button
                        type="button"
                        className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={() => {
                          const url = prompt('Enter avatar URL:')
                          if (url) setFormData({ ...formData, avatar_url: url })
                        }}
                      >
                        <Camera className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                      </button>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Profile Picture</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Click the camera icon to update your avatar URL
                      </p>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="space-y-2">
                    <label htmlFor="username" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <User className="h-4 w-4" />
                      <span>Username</span>
                    </label>
                    <Input
                      id="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      required
                      className="w-full"
                    />
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                      <Mail className="h-4 w-4" />
                      <span>Email</span>
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full"
                      disabled
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400">Email cannot be changed</p>
                  </div>

                  <div className="flex justify-end pt-4">
                    <Button
                      type="submit"
                      disabled={saving}
                      className="flex items-center space-x-2"
                    >
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Save Changes</span>
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <span>Security</span>
                </CardTitle>
                <CardDescription>
                  Manage your password and security preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-4 border-b">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">Password</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Last updated: {new Date(user?.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => router.push('/auth/forgot-password')}
                    >
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Security Tips</h4>
                    <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                      <li>Use a strong, unique password</li>
                      <li>Enable two-factor authentication (coming soon)</li>
                      <li>Keep your email address up to date</li>
                      <li>Review your account activity regularly</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Account Stats */}
            <Card className="border-0 shadow-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Account Statistics</CardTitle>
                <CardDescription>
                  Your activity and achievements on BiasBounty
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{user?.points || 0}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Points</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{user?.level || 1}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Level</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400">0</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Datasets</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30 rounded-lg">
                    <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">0</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Reports</div>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Member since {new Date(user?.created_at).toLocaleDateString()}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  )
}
