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
    <div className="flex justify-between items-center pb-4 text-[14px] text-[#8a87b8]">
      <div className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-xl bg-white/50 hover:bg-white/90 transition" onClick={onProfileClick}>
        {!!avatarUrl && <img src={avatarUrl} alt="Avatar" className="w-8 h-8 rounded-full object-cover border-2 border-white shadow" />}
        <span className="font-bold text-[#2d2d5f]">{displayName || user?.email || '加载中...'}</span>
      </div>
      <button
        className="h-9 px-4 rounded-xl border border-red-300 bg-red-50 text-[13px] font-bold text-red-600 hover:bg-red-100"
        onClick={handleLogout}
      >
        退出登录
      </button>
    </div>
  );
}
