import { useRef, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabaseClient'

export default function ProfileModal() {
  const { user, profileOpen, setProfileOpen, recoveryMode } = useAuth()
  const [nickname, setNickname] = useState(user?.user_metadata?.full_name || '')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

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
      <div className="card max-w-[520px] w-full relative" onClick={e => e.stopPropagation()}>
        <button
          type="button"
          aria-label="关闭"
          className="absolute top-3 right-3 w-11 h-11 rounded-full border-2 border-red-300 bg-red-50 text-red-600 text-[26px] leading-none font-black flex items-center justify-center hover:bg-red-100"
          onClick={onClose}
        >
          ×
        </button>
        <h3 className="text-center mb-5 text-xl font-bold text-[#2d2d5f]">{recoveryMode ? '重置密码' : '个人信息设置'}</h3>
        {recoveryMode && (
          <div className="rounded-2xl p-3 mb-3 border border-[color:#7C3AED40] bg-[color:#7B68EE1F] text-center">
            <div className="font-extrabold text-[14px] mb-1.5 text-[#2d2d5f]">正在进行密码重置</div>
            <div className="text-[12px] text-[#8a87b8]">请直接输入新密码并保存（无需填写旧密码）。</div>
          </div>
        )}
        {!recoveryMode && (
          <>
            <div className="mb-3">
              <label className="text-[13px] font-semibold text-[#2d2d5f] mb-2 block">头像设置</label>
              <div className="flex items-center gap-4">
                <img src={avatarUrl} className="w-14 h-14 rounded-full object-cover border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF14]" />
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    className="hidden"
                    type="file"
                    accept="image/*"
                    onChange={e => { const f = e.target.files?.[0] || null; setFile(f) }}
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      className="h-11 px-5 rounded-xl border border-[color:#7C3AED4D] bg-[color:#C39BFF1A] font-bold text-[#5B21B6] hover:bg-[color:#C39BFF2A]"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      选择文件
                    </button>
                    {file && (
                      <span className="min-w-0 text-[12px] text-[#8a87b8] overflow-hidden text-ellipsis whitespace-nowrap">
                        {file.name}
                      </span>
                    )}
                  </div>
                  <div className="text-[12px] text-[#8a87b8] mt-2">支持 JPG, PNG（建议 2MB 以内）</div>
                </div>
              </div>
            </div>
            <div className="mb-3">
              <label className="text-[13px] font-semibold text-[#2d2d5f] mb-2 block">昵称</label>
              <input className="w-full h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99]" type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="设置昵称" />
            </div>
            <button className="w-full h-11 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-xl font-bold text-[14px] px-4 border border-[color:#7C3AED66] shadow-sm" onClick={saveProfile}>保存基本信息</button>
            <div className="my-5 border-t border-[#f0f0f5]" />
          </>
        )}
        <div>
          <label className="text-[13px] font-semibold text-[#2d2d5f] mb-2 block">修改密码（留空不修改）</label>
          {!recoveryMode && <input className="w-full h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99] mb-2" type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="输入旧密码 (验证身份)" />}
          <input className="w-full h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99] mb-2" type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="输入新密码" />
          <input className="w-full h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99]" type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="确认新密码" />
        </div>
        <button className="w-full h-11 bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] text-white rounded-xl font-bold text-[14px] px-4 border border-[color:#7C3AED66] shadow-sm mt-3" onClick={updatePassword}>更新密码</button>
      </div>
    </div>
  )
}
