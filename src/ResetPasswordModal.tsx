import { useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabaseClient'

export default function ResetPasswordModal() {
  const { resetPasswordOpen, setResetPasswordOpen } = useAuth()
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [loading, setLoading] = useState(false)

  if (!resetPasswordOpen) return null

  const onClose = () => setResetPasswordOpen(false)

  const updatePassword = async () => {
    if (!newPwd || newPwd.length < 6) {
      alert('新密码长度至少需要6位')
      return
    }
    if (newPwd !== confirmPwd) {
      alert('两次输入的密码不一致')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    setLoading(false)

    if (error) {
      alert(error.message)
    } else {
      alert('密码重置成功！下次请使用新密码登录。')
      setNewPwd('')
      setConfirmPwd('')
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur flex items-center justify-center p-4" onClick={onClose}>
      <div className="card max-w-[420px] w-full relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          aria-label="关闭"
          className="absolute top-3 right-3 w-10 h-10 rounded-full border-2 border-red-300 bg-red-50 text-red-600 text-[22px] leading-none font-black flex items-center justify-center hover:bg-red-100 transition-colors"
          onClick={onClose}
        >
          ×
        </button>

        <div className="py-2">
          <h3 className="text-center mb-2 text-xl font-bold text-[#2d2d5f]">设置新密码</h3>
          <p className="text-center text-[13px] text-[#8a87b8] mb-6">请为您的账号设置一个新密码</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-[13px] font-semibold text-[#2d2d5f] mb-1.5 block ml-1">新密码</label>
              <input 
                className="w-full h-12 px-4 rounded-2xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[15px] outline-none focus:border-[color:#7C3AED99] transition-all placeholder:text-[#8a87b866]" 
                type="password" 
                value={newPwd} 
                onChange={e => setNewPwd(e.target.value)} 
                placeholder="请输入至少6位新密码" 
              />
            </div>
            <div>
              <label className="text-[13px] font-semibold text-[#2d2d5f] mb-1.5 block ml-1">确认新密码</label>
              <input 
                className="w-full h-12 px-4 rounded-2xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[15px] outline-none focus:border-[color:#7C3AED99] transition-all placeholder:text-[#8a87b866]" 
                type="password" 
                value={confirmPwd} 
                onChange={e => setConfirmPwd(e.target.value)} 
                placeholder="请再次输入新密码" 
              />
            </div>
          </div>

          <button 
            className="w-full h-12 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-2xl font-bold text-[15px] px-4 border border-[color:#7C3AED66] shadow-lg mt-8 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50" 
            onClick={updatePassword}
            disabled={loading}
          >
            {loading ? '正在重置...' : '立即重置密码'}
          </button>
        </div>
      </div>
    </div>
  )
}
