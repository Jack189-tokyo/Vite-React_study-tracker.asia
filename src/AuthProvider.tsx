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
  const [resetPasswordOpen, setResetPasswordOpen] = useState(false)

  useEffect(() => {
    // 初始检测恢复链接
    if (window.location.hash && window.location.hash.includes('type=recovery')) {
      setRecoveryMode(true)
      setResetPasswordOpen(true)
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event, session?.user?.email)
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      const isRecovery = window.location.hash && window.location.hash.includes('type=recovery')
      if (event === 'PASSWORD_RECOVERY' || isRecovery) {
        setRecoveryMode(true)
        setResetPasswordOpen(true)
        setProfileOpen(false) // 确保不打开个人资料弹窗
      } else if (event === 'SIGNED_IN') {
        // 如果不是恢复模式，确保重置弹窗是关闭的
        if (!isRecovery && !recoveryMode) {
          setResetPasswordOpen(false)
        }
      }
    })
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
    
    return () => subscription.unsubscribe()
  }, [recoveryMode])

  const value = { 
    session, user, loading, recoveryMode, 
    profileOpen, setProfileOpen, 
    resetPasswordOpen, setResetPasswordOpen 
  }
  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>
}
