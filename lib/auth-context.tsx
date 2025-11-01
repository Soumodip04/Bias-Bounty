'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { getCurrentUser, getUserProfile as fetchUserProfile, signOut as localSignOut, type User as UserProfile } from './supabase'
import { IUser } from '@/types/aptos.types'
import aptosService from '@/services/aptos.service'

interface AuthContextType {
  user: UserProfile | null
  userProfile: UserProfile | null
  loading: boolean
  walletData: IUser | null
  setWalletData: (data: IUser | null) => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
  walletData: null,
  setWalletData: () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [walletData, setWalletData] = useState<IUser | null>(null)

  const refreshProfile = async () => {
    if (user) {
      const { data } = await fetchUserProfile(user.id)
      setUserProfile(data)
    }
  }

  console.log('AuthProvider render, user:', user,);

  const signOut = async () => {
    await localSignOut()
    setUser(null)
    setUserProfile(null)
    setWalletData(null)
  }

  useEffect(() => {
    // Initial session load
    ;(async () => {
      try {
        const current = await getCurrentUser()
        setUser(current)
      } catch (error) {
        console.error('Error loading user:', error)
        // Don't clear user on error, only set to null if explicitly no session
      } finally {
        setLoading(false)
      }
    })()

    // Listen to local session changes
    const handleStorage = async (e: StorageEvent) => {
      if (e.key === 'bb_session') {
        try {
          const current = await getCurrentUser()
          setUser(current)
        } catch (error) {
          console.error('Error updating user from storage:', error)
        }
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    if (user) {
      refreshProfile()
      ;(async () => {
        try {
          const res = await aptosService.getUserById(user.id)
          if ((res as any)?.success && (res as any)?.user) {
            setWalletData((res as any).user)
          } else {
            setWalletData(null)
          }
        } catch (error) {
          setWalletData(null)
        }
      })()
    } else {
      setUserProfile(null)
      setWalletData(null)
    }
  }, [user])

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        walletData,
        setWalletData,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}