import { useEffect, useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabaseClient'

export default function ProfileModal() {
  const { user, profileOpen, setProfileOpen, recoveryMode } = useAuth()
  const [nickname, setNickname] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  // 当 user 加载后更新昵称
  useEffect(() => {
    if (user?.user_metadata?.full_name) {
      setNickname(user.user_metadata.full_name)
    }
  }, [user])

  if (!profileOpen) return null
  const onClose = () => setProfileOpen(false)
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'U'
  const defaultAvatar = `https://ui-avatars.com/api/?name=${displayName}&background=7b68ee&color=fff&size=128&length=1&bold=true`
  const avatarUrl = file ? URL.createObjectURL(file) : (user?.user_metadata?.avatar_url || defaultAvatar)

  const saveProfile = async () => {
    let publicAvatarUrl: string | null = null
    if (file && user) {
      const ext = file.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadError) {
        alert('头像上传失败: ' + uploadError.message)
        return
      }
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      publicAvatarUrl = data.publicUrl
    }
    const updates: Record<string, string> = {}
    if (nickname) updates.full_name = nickname
    if (publicAvatarUrl) updates.avatar_url = publicAvatarUrl
    if (Object.keys(updates).length === 0) { onClose(); return }
    const { error } = await supabase.auth.updateUser({ data: updates })
    if (error) {
      alert('更新失败: ' + error.message)
    } else {
      setFile(null)
      onClose()
    }
  }

  const updatePassword = async () => {
    if (!newPwd || newPwd.length < 6) { alert('新密码长度至少需要6位'); return }
    if (newPwd !== confirmPwd) { alert('两次输入的密码不一致'); return }
    if (!recoveryMode) {
      if (!oldPwd) { alert('请输入旧密码以验证身份'); return }
      const { error: signInError } = await supabase.auth.signInWithPassword({ email: user?.email || '', password: oldPwd })
      if (signInError) { alert('旧密码错误，验证失败'); return }
    }
    const { error } = await supabase.auth.updateUser({ password: newPwd })
    if (error) {
      alert(error.message)
    } else {
      setOldPwd(''); setNewPwd(''); setConfirmPwd('')
      if (recoveryMode) {
        alert('密码重置成功！下次请使用新密码登录。')
        onClose()
      }
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

        {recoveryMode ? (
          /* 重置密码模式：仅显示新密码和确认密码 */
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
              className="w-full h-12 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-2xl font-bold text-[15px] px-4 border border-[color:#7C3AED66] shadow-lg mt-8 hover:opacity-90 active:scale-[0.98] transition-all" 
              onClick={updatePassword}
            >
              立即重置密码
            </button>
          </div>
        ) : (/* 普通个人信息设置模式 */
          <>
            <h3 className="text-center mb-5 text-xl font-bold text-[#2d2d5f]">个人信息设置</h3>
            <div className="mb-3">
              <label className="text-[13px] font-semibold text-[#2d2d5f] mb-2 block">头像设置</label>
              <div className="flex items-center gap-4">
                <img src={avatarUrl} className="w-14 h-14 rounded-full object-cover border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF14]" />
                <button
                  className="px-4 py-2 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#7C3AED] text-[13px] font-bold hover:bg-[color:#C39BFF2A] transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  更换头像
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-[13px] font-semibold text-[#2d2d5f] mb-2 block">昵称</label>
              <input className="w-full h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99]" type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="设置昵称" />
            </div>
            <button className="w-full h-11 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-xl font-bold text-[14px] px-4 border border-[color:#7C3AED66] shadow-sm" onClick={saveProfile}>保存基本信息</button>
            <div className="my-5 border-t border-[#f0f0f5]" />
            <div>
              <label className="text-[13px] font-semibold text-[#2d2d5f] mb-2 block">修改密码（留空不修改）</label>
              <input className="w-full h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99] mb-2" type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="输入旧密码 (验证身份)" />
              <input className="w-full h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99] mb-2" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="输入新密码" />
              <input className="w-full h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99]" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="确认新密码" />
            </div>
            <button className="w-full h-11 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-xl font-bold text-[14px] px-4 border border-[color:#7C3AED66] shadow-sm mt-3" onClick={updatePassword}>更新密码</button>
          </>
        )}
      </div>
    </div>
  )
}
