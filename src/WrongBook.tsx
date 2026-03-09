import { useMemo, useState } from 'react'
import { useAuth } from './AuthContext'
import { supabase } from './supabaseClient'

export default function WrongBook({ selectedISO, onJumpDate }: { selectedISO: string; onJumpDate: (iso: string) => void }) {
  const { user } = useAuth()
  const [input, setInput] = useState('')
  const list = useMemo<string[]>(() => {
    const wb = JSON.parse(localStorage.getItem('wrongBook') || '{}')
    return wb[selectedISO] || []
  }, [selectedISO])

  const addWrong = async () => {
    const val = input.trim()
    if (!val) return
    const wb = JSON.parse(localStorage.getItem('wrongBook') || '{}')
    if (!wb[selectedISO]) wb[selectedISO] = []
    wb[selectedISO].push(val)
    localStorage.setItem('wrongBook', JSON.stringify(wb))
    setInput('')
    if (user) {
      await supabase.from('wrong_book').insert({ user_id: user.id, date: selectedISO, content: val })
    }
  }

  const delWrong = async (idx: number, content: string) => {
    const wb = JSON.parse(localStorage.getItem('wrongBook') || '{}')
    if (wb[selectedISO]) wb[selectedISO].splice(idx, 1)
    localStorage.setItem('wrongBook', JSON.stringify(wb))
    if (user) {
      await supabase.from('wrong_book').delete().match({ user_id: user.id, date: selectedISO, content })
    }
  }

  const historyDates = useMemo<string[]>(() => {
    const wb = JSON.parse(localStorage.getItem('wrongBook') || '{}')
    return Object.keys(wb).filter(d => (wb[d] || []).length > 0).sort((a, b) => b.localeCompare(a))
  }, [selectedISO, list.length])

  return (
    <div className="card">
      <h3 className="m-0 text-xl font-bold text-[#2d2d5f]">错题笔记本</h3>
      <div className="flex gap-3 my-4">
        <input
          className="flex-1 h-11 px-3 rounded-xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF1A] text-[#2d2d5f] text-[14px] outline-none focus:border-[color:#7C3AED99]"
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="输入错题内容或知识点..."
        />
        <button
          className="shrink-0 h-11 px-6 rounded-xl font-bold text-[14px] text-white bg-gradient-to-b from-[#7C3AED] to-[#5B21B6] border border-[color:#7C3AED66] shadow-sm"
          onClick={addWrong}
        >
          添加
        </button>
      </div>
      <ul className="wrong-book-list">
        {list.length === 0 ? (
          <li style={{ color: '#aaa', fontSize: 12, textAlign: 'center', padding: 10 }}>本日无错题</li>
        ) : (
          list.map((q, i) => (
            <li key={`${q}-${i}`} className="wrong-book-item">
              <span>{q}</span>
              <button className="delete-btn" onClick={() => delWrong(i, q)}>删除</button>
            </li>
          ))
        )}
      </ul>
      <hr style={{ margin: '20px 0', border: 'none', borderTop: '1px solid #f0f0f5' }} />
      <h4 style={{ color: '#8a87b8', fontSize: 13 }}>历史错题库 (点击日期查看)</h4>
      <div style={{ display: 'flex', gap: 10, padding: '10px 5px', overflowX: 'auto' }}>
        {historyDates.length ? historyDates.map(d => (
          <button
            key={d}
            className="page-btn min-w-[84px] px-3 py-2 leading-tight"
            onClick={() => onJumpDate(d)}
          >
            <span className="flex flex-col items-center">
              <span className="text-[13px] font-extrabold text-[#5B21B6]">{d.slice(0, 4)}</span>
              <span className="text-[12px] font-bold text-[#7C3AED]">{d.slice(5)}</span>
            </span>
          </button>
        )) : '暂无历史'}
      </div>
    </div>
  )
}
