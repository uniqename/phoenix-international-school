"use client";
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { UserProfile, UserRole } from '@/lib/types'
import { MOCK_USERS } from '@/lib/mockData'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/useAppStore'

interface AuthContextType {
  user: UserProfile | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ error?: string }>
  loginAsRole: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadUser = useCallback(async () => {
    if (typeof window === 'undefined') return
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', session.user.id).single()
        if (profile) { setUser(profile); setLoading(false); return }
      }
    }
    const stored = localStorage.getItem('phoenix-auth-user')
    if (stored) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  useEffect(() => { loadUser() }, [loadUser])

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    // 1. Try Supabase
    if (supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error: error.message }
      if (data.user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', data.user.id).single()
        if (profile) { setUser(profile); return {} }
      }
    }

    // 2. Check admin-created accounts in the store
    const { accounts, markLoginUsed } = useAppStore.getState()
    const account = accounts.find(
      (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password && a.is_active
    )
    if (account) {
      const profile: UserProfile = { id: account.id, full_name: account.full_name, email: account.email, role: account.role }
      localStorage.setItem('phoenix-auth-user', JSON.stringify(profile))
      if (account.force_password_change) {
        localStorage.setItem('phoenix-force-pw-change', account.id)
      }
      markLoginUsed(account.id)
      setUser(profile)
      return {}
    }

    // 3. Demo fallback: match by email only (for the built-in demo accounts)
    const match = MOCK_USERS.find((u) => u.email.toLowerCase() === email.toLowerCase())
    if (match) {
      localStorage.setItem('phoenix-auth-user', JSON.stringify(match))
      setUser(match)
      return {}
    }

    return { error: 'Invalid email or password.' }
  }

  const loginAsRole = (role: UserRole) => {
    const match = MOCK_USERS.find((u) => u.role === role)!
    localStorage.setItem('phoenix-auth-user', JSON.stringify(match))
    setUser(match)
  }

  const logout = async () => {
    if (supabase) await supabase.auth.signOut()
    localStorage.removeItem('phoenix-auth-user')
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, loginAsRole, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
