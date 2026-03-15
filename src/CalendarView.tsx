import { useEffect, useMemo, useState } from 'react'

type Subject = 'math' | 'reading' | 'spelling'

function formatISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function getMonthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1)
  const startOffset = ((first.getDay() || 7) - 1)
  const days = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d))
  return cells
}

export default function CalendarView({ selected, onDateSelect }: { selected: Date; onDateSelect: (d: Date) => void }) {
  const [year, setYear] = useState(selected.getFullYear())
  const [month, setMonth] = useState(selected.getMonth())
  const [subject, setSubject] = useState<Subject>('math')
  const [open, setOpen] = useState(false)
  const todayISO = formatISO(new Date())
  const selectedISO = formatISO(selected)

  useEffect(() => {
    setYear(selected.getFullYear())
    setMonth(selected.getMonth())
  }, [selected])

  const matrix = useMemo(() => getMonthMatrix(year, month), [year, month])
  const hist = useMemo<Record<string, { math?: number; reading?: number; spelling?: number }>>(
    () => JSON.parse(localStorage.getItem('accuracyHistory') || '{}'),
    [year, month, subject]
  )

  const levelColor = (v: number | undefined) => {
    if (v === undefined || v === null) return ''
    if (v < 30) return '#ef4444'
    if (v < 60) return '#facc15'
    if (v < 90) return '#84cc16'
    return '#166534'
  }

  return (
    <div className="card p-4 sm:p-5">
      <div className="flex justify-between items-center mb-4 gap-2 sm:gap-3 px-1 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3 flex-nowrap min-w-0">
          <button className="page-btn flex items-center justify-center min-w-[36px] sm:min-w-[64px] h-9 sm:h-10 px-0 sm:px-4"
            onClick={() => { const m2 = month - 1; if (m2 < 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m2) }}>
            <span className="sm:hidden text-sm">{"<"}</span>
            <span className="hidden sm:inline">上一月</span>
          </button>
          <h2 className="m-0 text-base sm:text-xl font-bold whitespace-nowrap shrink-0">{year}年{month + 1}月</h2>
          <button className="page-btn flex items-center justify-center min-w-[36px] sm:min-w-[64px] h-9 sm:h-10 px-0 sm:px-4"
            onClick={() => { const m2 = month + 1; if (m2 > 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m2) }}>
            <span className="sm:hidden text-sm">{">"}</span>
            <span className="hidden sm:inline">下一月</span>
          </button>
        </div>
        <div className="relative w-[110px] sm:w-[140px] shrink-0">
          <div className="bg-white border-2 border-[color:#7C3AED4D] h-9 sm:h-10 px-3 rounded-xl text-[12px] sm:text-[13px] font-semibold text-[#2d2d5f] cursor-pointer flex justify-between items-center gap-1.5 sm:gap-2"
               onClick={() => setOpen(o => !o)}>
            <span className="min-w-0 overflow-hidden text-ellipsis whitespace-nowrap">
              {subject === 'math' ? '数学' : subject === 'reading' ? '阅读' : '拼写'}
            </span>
            <span className="text-[8px] sm:text-[10px] shrink-0 opacity-60">▼</span>
          </div>
          {open && (
            <div className="absolute top-[calc(100%+8px)] right-0 w-[120px] sm:w-full bg-white rounded-2xl shadow-xl z-50 overflow-hidden border-2 border-[color:#7C3AED4D] animate-[fadeInMenu_0.25s_ease-out]">
              <div className={`py-3 text-center text-[12px] sm:text-[13px] text-[#2d2d5f] cursor-pointer ${subject === 'math' ? 'bg-[color:#C39BFF1A] text-[#7C3AED] font-bold' : ''}`}
                   onClick={() => { setSubject('math'); setOpen(false) }}>数学热力图</div>
              <div className={`py-3 text-center text-[12px] sm:text-[13px] text-[#2d2d5f] cursor-pointer ${subject === 'reading' ? 'bg-[color:#C39BFF1A] text-[#7C3AED] font-bold' : ''}`}
                   onClick={() => { setSubject('reading'); setOpen(false) }}>阅读热力图</div>
              <div className={`py-3 text-center text-[12px] sm:text-[13px] text-[#2d2d5f] cursor-pointer ${subject === 'spelling' ? 'bg-[color:#C39BFF1A] text-[#7C3AED] font-bold' : ''}`}
                   onClick={() => { setSubject('spelling'); setOpen(false) }}>拼写热力图</div>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {['一', '二', '三', '四', '五', '六', '日'].map(w => (
          <div key={w} className="calendar-weekday text-[12px] sm:text-sm">{w}</div>
        ))}
        {matrix.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} className="calendar-cell aspect-square rounded-lg sm:rounded-xl border border-[color:#7C3AED33] bg-[color:#C39BFF1A] flex items-center justify-center" />
          const iso = formatISO(date)
          const data = hist[iso]
          const v = data?.[subject]
          const isSelected = iso === selectedISO
          const isToday = iso === todayISO
          const bg = v !== undefined ? levelColor(v) : 'rgba(195, 155, 255, 0.10)'
          const style: React.CSSProperties = {
            backgroundColor: bg,
            color: isSelected ? '#2d2d5f' : undefined,
            border: isSelected ? '2px solid #5B21B6' : undefined,
            boxShadow: isToday ? 'inset 0 0 0 2px rgba(124, 58, 237, 0.35)' : undefined
          }
          return (
            <div
              key={iso}
              className={`calendar-cell aspect-square rounded-lg sm:rounded-xl cursor-pointer flex items-center justify-center border text-sm sm:text-base ${v !== undefined ? 'border-[#84cc16]' : 'border-[color:#7C3AED33]'} ${isSelected ? 'font-bold' : ''}`}
              style={style}
              onClick={() => onDateSelect(date)}
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>
      <div className="flex items-center justify-center text-[11px] text-[#8a87b8] mt-4 gap-1.5">
        <span className="mr-1">低正确率</span>
        <div className="w-3 h-3 rounded bg-[#ef4444]"></div>
        <div className="w-3 h-3 rounded bg-[#facc15]"></div>
        <div className="w-3 h-3 rounded bg-[#84cc16]"></div>
        <div className="w-3 h-3 rounded bg-[#166534]"></div>
        <span className="ml-1">高正确率</span>
      </div>
    </div>
  )
}
