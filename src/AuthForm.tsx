import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function AuthForm() {
  const [tab, setTab] = useState<'login' | 'reg' | 'otp'>('login')
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otpEmail, setOtpEmail] = useState('')

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
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) alert(error.message)
    else alert('注册成功！请登录。')
    setLoading(false)
  }

  const handleSendOtp = async () => {
    if (!otpEmail) { alert('请输入邮箱'); return }
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ email: otpEmail })
    if (error) alert(error.message)
    else alert('登录链接已发送，请查收邮件')
    setLoading(false)
  }

  return (
    <div className="app-container">
      <div className="card" style={{ textAlign: 'center' }}>
        <h2 style={{ marginBottom: 20 }}>欢迎回来</h2>
        <div style={{ display: 'flex', background: '#f4f4ff', padding: 5, borderRadius: 16, marginBottom: 25, border: '1px solid rgba(123, 104, 238, 0.3)' }}>
          <button style={{ flex: 1 }} className={tab === 'login' ? 'page-btn' : ''} onClick={() => setTab('login')}>登录</button>
          <button style={{ flex: 1 }} className={tab === 'reg' ? 'page-btn' : ''} onClick={() => setTab('reg')}>注册</button>
          <button style={{ flex: 1 }} className={tab === 'otp' ? 'page-btn' : ''} onClick={() => setTab('otp')}>邮件登录</button>
        </div>
        {tab === 'login' && (
          <form>
            <div className="input-group">
              <input type="email" placeholder="电子邮箱" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="密码" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button onClick={handleLogin} disabled={loading}>{loading ? '登录中...' : '立即登录'}</button>
            <button className="text-btn" onClick={(e) => { e.preventDefault(); setTab('otp'); setOtpEmail(email) }} style={{ width: '100%', marginTop: 10 }}>忘记密码？</button>
          </form>
        )}
        {tab === 'reg' && (
          <form>
            <div className="input-group">
              <input type="email" placeholder="设置邮箱" value={email} onChange={e => setEmail(e.target.value)} />
              <input type="password" placeholder="设置密码 (至少6位)" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button onClick={handleSignup} disabled={loading}>{loading ? '注册中...' : '创建账号'}</button>
          </form>
        )}
        {tab === 'otp' && (
          <div>
            <div className="input-group">
              <input type="email" placeholder="输入注册邮箱" value={otpEmail} onChange={e => setOtpEmail(e.target.value)} />
            </div>
            <button onClick={handleSendOtp} disabled={loading}>{loading ? '发送中...' : '获取登录链接'}</button>
            <p style={{ fontSize: 12, color: '#8a87b8', textAlign: 'center', marginTop: 10 }}>点击发送后，请直接点击注册邮箱中收到的链接即可登录</p>
            <button className="text-btn" style={{ width: '100%', marginTop: 10 }} onClick={() => setTab('login')}>返回账号登录</button>
          </div>
        )}
      </div>
    </div>
  )
}
