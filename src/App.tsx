import { useState } from 'react';
// tailwind-only styling
import { useAuth } from './AuthContext';
import AuthForm from './AuthForm';
import Header from './Header';
import DynamicBackground from './DynamicBackground';
import CalendarView from './CalendarView';
import DailyView from './DailyView';
import WrongBook from './WrongBook';
import HonorWall from './HonorWall';
import ProfileModal from './ProfileModal';
import { supabase } from './supabaseClient';
import { useEffect } from 'react';

function App() {
  const { session, loading, setProfileOpen } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    const run = async () => {
      const user = session?.user;
      if (!user) return;
      const [recordsRes, wrongsRes, honorsRes] = await Promise.all([
        supabase.from('learning_records').select('*').eq('user_id', user.id),
        supabase.from('wrong_book').select('*').eq('user_id', user.id),
        supabase.from('honor_wall').select('*').eq('user_id', user.id)
      ]);
      if (recordsRes.data) {
        type LearningRow = { date: string; math: number; reading: number; spelling: number };
        const hist: Record<string, { math: number; reading: number; spelling: number }> = {};
        (recordsRes.data as LearningRow[]).forEach((r) => { hist[r.date] = { math: r.math, reading: r.reading, spelling: r.spelling }; });
        localStorage.setItem('accuracyHistory', JSON.stringify(hist));
      }
      if (wrongsRes.data) {
        type WrongRow = { date: string; content: string };
        const wb: Record<string, string[]> = {};
        (wrongsRes.data as WrongRow[]).forEach((w) => { if (!wb[w.date]) wb[w.date] = []; wb[w.date].push(w.content); });
        localStorage.setItem('wrongBook', JSON.stringify(wb));
      }
      if (honorsRes.data) {
        type HonorRow = { date: string; medal: string };
        localStorage.setItem('honorWall', JSON.stringify((honorsRes.data as HonorRow[]).map((h) => ({ date: h.date, medal: h.medal }))));
      }
    };
    run();
  }, [session]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#8a87b8]">加载中...</div>;
  }

  const selectedISO = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;

  return (
    <div className="relative z-10 max-w-[500px] min-h-screen mx-auto p-4 box-border flex flex-col">
      <DynamicBackground />
      
      {!session ? (
        <AuthForm />
      ) : (
        <>
          <Header onProfileClick={() => setProfileOpen(true)} />
          <main className="flex flex-col gap-6 flex-grow overflow-visible">
            <CalendarView selected={selectedDate} onDateSelect={setSelectedDate} />
            <div className="flex flex-col gap-6">
              <DailyView selected={selectedDate} />
              <WrongBook selectedISO={selectedISO} onJumpDate={(iso) => {
                const [y, m, d] = iso.split('-').map(n => parseInt(n, 10));
                setSelectedDate(new Date(y, m - 1, d));
              }} />
              <HonorWall />
            </div>
          </main>
        </>
      )}

      <ProfileModal />
    </div>
  );
}

export default App;
