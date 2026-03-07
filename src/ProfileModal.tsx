import { useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabaseClient'

export default function ProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user } = useAuth()
  const [nickname, setNickname] = useState(user?.user_metadata?.full_name || '')
  const [file, setFile] = useState<File | null>(null)
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const recoveryMode = !!(window.location.hash && window.location.hash.includes('type=magiclink'))

  if (!open) return null
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
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h3 style={{ textAlign: 'center', marginBottom: 20 }}>{recoveryMode ? '重置密码' : '个人信息设置'}</h3>
        {recoveryMode && (
          <div style={{ borderRadius: 18, padding: 14, marginBottom: 14, background: 'linear-gradient(135deg, rgba(123,104,238,0.12) 0%, rgba(255,156,110,0.10) 100%)', border: '1px solid rgba(123,104,238,0.25)', textAlign: 'center' }}>
            <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 4 }}>正在进行密码重置</div>
            <div style={{ fontSize: 12, color: '#8a87b8' }}>请直接输入新密码并保存（无需填写旧密码）。</div>
          </div>
        )}
        {!recoveryMode && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#8a87b8', marginBottom: 5, display: 'block' }}>头像设置</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                <img src={avatarUrl} style={{ width: 50, height: 50, borderRadius: '50%', objectFit: 'cover', border: '2px solid #eee', background: '#f0f0f5' }} />
                <div style={{ flex: 1 }}>
                  <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0] || null; setFile(f) }} />
                  <div style={{ fontSize: 10, color: '#aaa', marginTop: 4 }}>支持 JPG, PNG (建议 2MB 以内)</div>
                </div>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 12, color: '#8a87b8', marginBottom: 5, display: 'block' }}>昵称</label>
              <input type="text" value={nickname} onChange={e => setNickname(e.target.value)} placeholder="设置昵称" />
            </div>
            <button onClick={saveProfile}>保存基本信息</button>
            <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f0f0f5' }} />
          </>
        )}
        <div>
          <label style={{ fontSize: 12, color: '#8a87b8', marginBottom: 5, display: 'block' }}>修改密码 (留空不修改)</label>
          {!recoveryMode && <input type="password" value={oldPwd} onChange={e => setOldPwd(e.target.value)} placeholder="输入旧密码 (验证身份)" />}
          <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="输入新密码" />
          <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="确认新密码" />
        </div>
        <button onClick={updatePassword} style={{ background: 'linear-gradient(135deg, #ff9c6e 0%, #ff7875 100%)', marginTop: 10 }}>更新密码</button>
        <button onClick={onClose} style={{ width: '100%', marginTop: 15, background: 'none', color: '#8a87b8' }}>关闭</button>
      </div>
    </div>
  )
}
