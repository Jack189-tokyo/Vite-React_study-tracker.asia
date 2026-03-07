import { useEffect, useMemo, useState } from 'react'
import { Bar } from 'react-chartjs-2'
import { Chart, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js'
import { supabase } from './supabaseClient'
import { useAuth } from './AuthContext'
import MedalPopup from './MedalPopup'

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

function formatISO(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export default function DailyView({ selected }: { selected: Date }) {
  const { user } = useAuth()
  const iso = formatISO(selected)
  const [math, setMath] = useState<number | ''>('')
  const [reading, setReading] = useState<number | ''>('')
  const [spelling, setSpelling] = useState<number | ''>('')
  const [saving, setSaving] = useState(false)
  const [medalEmoji, setMedalEmoji] = useState<string | null>(null)

  useEffect(() => {
    const hist = JSON.parse(localStorage.getItem('accuracyHistory') || '{}')
    const v = hist[iso] || {}
    setMath(v.math ?? '')
    setReading(v.reading ?? '')
    setSpelling(v.spelling ?? '')
  }, [iso])

  const data = useMemo(() => ({
    labels: ['数学', '阅读', '拼写'],
    datasets: [{
      data: [Number(math || 0), Number(reading || 0), Number(spelling || 0)],
      backgroundColor: ['#7b68ee', '#84cc16', '#facc15'],
      borderRadius: 8
    }]
  }), [math, reading, spelling])

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true, max: 100 } },
    plugins: { legend: { display: false } }
  }), [])

  const clamp0to100 = (n: number) => Math.min(100, Math.max(0, n))

  const save = async () => {
    const m = clamp0to100(Number(math || 0))
    const r = clamp0to100(Number(reading || 0))
    const s = clamp0to100(Number(spelling || 0))
    const hist = JSON.parse(localStorage.getItem('accuracyHistory') || '{}')
    hist[iso] = { math: m, reading: r, spelling: s }
    localStorage.setItem('accuracyHistory', JSON.stringify(hist))
    setSaving(true)
    try {
      if (user) {
        const { data: existing } = await supabase
          .from('learning_records')
          .select('id')
          .eq('user_id', user.id)
          .eq('date', iso)
        let err
        if (existing && existing.length > 0) {
          const res = await supabase.from('learning_records').update({ math: m, reading: r, spelling: s }).eq('id', existing[0].id)
          err = res.error
        } else {
          const res = await supabase.from('learning_records').insert({ user_id: user.id, date: iso, math: m, reading: r, spelling: s })
          err = res.error
        }
        if (err) alert('保存失败: ' + err.message)
      }
    } finally {
      setSaving(false)
    }
    const scores = [m, r, s]
    const count90 = scores.filter(v => v >= 90).length
    let emoji = '', name = ''
    if (count90 === 3) { emoji = '🥇'; name = '🥇 金牌' }
    else if (count90 === 2) { emoji = '🥈'; name = '🥈 银牌' }
    else if (count90 === 1) { emoji = '🥉'; name = '🥉 铜牌' }
    if (emoji) {
      setMedalEmoji(emoji)
      setTimeout(() => setMedalEmoji(null), 800)
      const honor = JSON.parse(localStorage.getItem('honorWall') || '[]')
      const list: { date: string; medal: string }[] = honor
      if (!list.some(h => h.date === iso && h.medal === name)) {
        list.push({ date: iso, medal: name })
        localStorage.setItem('honorWall', JSON.stringify(list))
        if (user) await supabase.from('honor_wall').insert({ user_id: user.id, date: iso, medal: name })
      }
    }
  }

  return (
    <div className="card">
      <h2>当日成绩: {iso}</h2>
      <div className="daily-view-form">
        <label>数学</label>
        <input type="number" value={math} onChange={e => setMath(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0-100" />
        <label>阅读</label>
        <input type="number" value={reading} onChange={e => setReading(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0-100" />
        <label>拼写</label>
        <input type="number" value={spelling} onChange={e => setSpelling(e.target.value === '' ? '' : Number(e.target.value))} placeholder="0-100" />
        <button onClick={save} disabled={saving}>{saving ? '保存中...' : '保存今日记录'}</button>
      </div>
      <div style={{ height: 180, marginTop: 16 }}>
        <Bar data={data} options={options} />
      </div>
      <MedalPopup emoji={medalEmoji} />
    </div>
  )
}
