import { supabase } from './supabaseClient';
import { useAuth } from './AuthContext';

export default function Header({ onProfileClick }: { onProfileClick?: () => void }) {
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  const avatarUrl = user?.user_metadata?.avatar_url || (displayName ? `https://ui-avatars.com/api/?name=${displayName}&background=7b68ee&color=fff&size=128&length=1&bold=true` : '');

  return (
    <div className="status-bar">
      <div className="user-info-trigger" onClick={onProfileClick}>
        <img src={avatarUrl} alt="Avatar" className="status-avatar" style={{ display: avatarUrl ? 'block' : 'none' }} />
        <span className="status-name">{displayName || user?.email || '加载中...'}</span>
      </div>
      <button className="text-btn" onClick={handleLogout}>退出登录</button>
    </div>
  );
}
