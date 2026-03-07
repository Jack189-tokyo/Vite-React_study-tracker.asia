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
    <div className="card">
      <div className="calendar-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={() => { const m2 = month - 1; if (m2 < 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m2) }}>上一月</button>
          <h2 style={{ margin: 0 }}>{year}年{month + 1}月</h2>
          <button onClick={() => { const m2 = month + 1; if (m2 > 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m2) }}>下一月</button>
        </div>
        <div className="subject-select-wrap">
          <div className="custom-select-trigger" onClick={() => setOpen(o => !o)}>
            <span>{subject === 'math' ? '数学热力图' : subject === 'reading' ? '阅读热力图' : '拼写热力图'}</span>
            <span style={{ fontSize: 10, marginLeft: 5 }}>▼</span>
          </div>
          <div className={`custom-options ${open ? 'show' : ''}`}>
            <div className={`custom-option ${subject === 'math' ? 'active' : ''}`} onClick={() => { setSubject('math'); setOpen(false) }}>数学热力图</div>
            <div className={`custom-option ${subject === 'reading' ? 'active' : ''}`} onClick={() => { setSubject('reading'); setOpen(false) }}>阅读热力图</div>
            <div className={`custom-option ${subject === 'spelling' ? 'active' : ''}`} onClick={() => { setSubject('spelling'); setOpen(false) }}>拼写热力图</div>
          </div>
        </div>
      </div>
      <div className="calendar-grid">
        {['一', '二', '三', '四', '五', '六', '日'].map(w => (
          <div key={w} className="calendar-weekday">{w}</div>
        ))}
        {matrix.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />
          const iso = formatISO(date)
          const data = hist[iso]
          const v = data?.[subject]
          const isSelected = iso === selectedISO
          const isToday = iso === todayISO
          const bg = v !== undefined ? levelColor(v) : undefined
          const style = {
            backgroundColor: isSelected ? '#646cff' : bg,
            color: isSelected ? '#fff' : undefined,
            border: isToday ? '2px solid #646cff' : undefined
          }
          return (
            <div
              key={iso}
              className={`calendar-day${v !== undefined ? ' has-record' : ''}${isSelected ? ' selected' : ''}${isToday ? ' today' : ''}`}
              style={style}
              onClick={() => onDateSelect(date)}
            >
              {date.getDate()}
            </div>
          )
        })}
      </div>
      <div className="legend">
        <span style={{ marginRight: 5 }}>低正确率</span>
        <div className="legend-box lv1"></div>
        <div className="legend-box lv2"></div>
        <div className="legend-box lv3"></div>
        <div className="legend-box lv4"></div>
        <span style={{ marginLeft: 5 }}>高正确率</span>
      </div>
    </div>
  )
}
