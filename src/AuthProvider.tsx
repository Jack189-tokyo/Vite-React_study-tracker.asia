import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { AuthContext } from './AuthContext'
import { supabase } from './supabaseClient'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [recoveryMode, setRecoveryMode] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  useEffect(() => {
    // 初始检测魔术链接
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setRecoveryMode(true)
      setProfileOpen(true)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      const isRecovery = window.location.hash && window.location.hash.includes('type=recovery')
      if (event === 'PASSWORD_RECOVERY' || isRecovery) {
        setRecoveryMode(true)
        setProfileOpen(true)
      } else if (event === 'SIGNED_IN') {
        // 普通登录（如魔术链接），不进入重置模式，确保弹窗关闭
        setRecoveryMode(false)
      }
    })
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    return () => subscription.unsubscribe()
  }, [])

  const value = { session, user, loading, recoveryMode, profileOpen, setProfileOpen }
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
