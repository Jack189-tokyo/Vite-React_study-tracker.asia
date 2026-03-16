import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AuthForm() {
  const [tab, setTab] = useState<'login' | 'reg' | 'otp'>('login')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpEmail, setOtpEmail] = useState('')
  const redirectTo = import.meta.env.VITE_AUTH_REDIRECT_URL || window.location.origin

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) alert(error.message)
    setLoading(false)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: redirectTo }
    })
    if (error) alert(error.message)
    else alert('注册成功！请登录。')
    setLoading(false)
  }

  const handleSendOtp = async () => {
    if (!otpEmail) { alert('请输入邮箱'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email: otpEmail,
      options: { emailRedirectTo: redirectTo }
    })
    if (error) alert(error.message)
    else alert('登录链接已发送，请查收邮件')
    setLoading(false)
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) { alert('请输入电子邮箱'); return }
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo
    })
    if (error) alert(error.message)
    else alert('重置密码链接已发送，请查收邮件')
    setLoading(false)
  }

  return (
    <div className="app-container">
      <div className="card max-w-sm w-full text-center max-h-[90vh] overflow-y-auto p-4 sm:p-5">
        <h2 className="mb-4 text-lg sm:text-xl font-bold text-[#2d2d5f]">欢迎回来</h2>
        <div className="flex gap-1.5 rounded-2xl mb-6 p-1 border border-[color:#7C3AED4D] bg-[color:#C39BFF14]">
          <button
            className={`flex-1 text-center py-2 px-2 rounded-xl font-bold text-sm transition-colors ${
              tab === 'login'
                ? 'bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white shadow-sm border border-[color:#7C3AED4D]'
                : 'bg-[color:#C39BFF1A] text-[#5B21B6] hover:bg-[color:#C39BFF2A] border border-[color:#7C3AED4D]'
            }`}
            onClick={() => setTab('login')}
          >
            登录
          </button>
          <button
            className={`flex-1 text-center py-2 px-2 rounded-xl font-bold text-sm transition-colors ${
              tab === 'reg'
                ? 'bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white shadow-sm border border-[color:#7C3AED4D]'
                : 'bg-[color:#C39BFF1A] text-[#5B21B6] hover:bg-[color:#C39BFF2A] border border-[color:#7C3AED4D]'
            }`}
            onClick={() => setTab('reg')}
          >
            注册
          </button>
          <button
            className={`flex-1 text-center py-2 px-2 rounded-xl font-bold text-sm transition-colors ${
              tab === 'otp'
                ? 'bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white shadow-sm border border-[color:#7C3AED4D]'
                : 'bg-[color:#C39BFF1A] text-[#5B21B6] hover:bg-[color:#C39BFF2A] border border-[color:#7C3AED4D]'
            }`}
            onClick={() => setTab('otp')}
          >
            邮件登录
          </button>
        </div>
        {tab === 'login' && (
          <form>
            <div className="space-y-3">
              <input className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 bg-white text-sm" type="email" placeholder="电子邮箱" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 bg-white text-sm" type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button
              className="w-full mt-4 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-xl font-bold py-3 px-4 border border-[color:#7C3AED66] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? '登录中...' : '立即登录'}
            </button>
            <button className="text-btn text-xs mt-3" onClick={handleForgotPassword}>忘记密码？</button>
          </form>
        )}
        {tab === 'reg' && (
          <form>
            <div className="space-y-3">
              <input className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 bg-white text-sm" type="email" placeholder="设置邮箱" value={email} onChange={e => setEmail(e.target.value)} />
              <input className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 bg-white text-sm" type="password" placeholder="设置密码 (至少6位)" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button
              className="w-full mt-4 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-xl font-bold py-3 px-4 border border-[color:#7C3AED66] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? '注册中...' : '创建账号'}
            </button>
          </form>
        )}
        {tab === 'otp' && (
          <div>
            <div className="mb-3">
              <input className="w-full p-3 rounded-lg border border-gray-300 text-gray-800 bg-white text-sm" type="email" placeholder="输入注册邮箱" value={otpEmail} onChange={e => setOtpEmail(e.target.value)} />
            </div>
            <button
              className="w-full mt-4 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-xl font-bold py-3 px-4 border border-[color:#7C3AED66] shadow-sm disabled:opacity-60 disabled:cursor-not-allowed text-sm"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? '发送中...' : '获取登录链接'}
            </button>
            <p className="text-xs text-[#8a87b8] text-center mt-3">点击发送后，请直接点击注册邮箱中收到的链接即可登录</p>
            <button className="text-btn text-xs mt-3 w-full" onClick={() => setTab('login')}>返回账号登录</button>
          </div>
        )}
      </div>
    </div>
  )
}
