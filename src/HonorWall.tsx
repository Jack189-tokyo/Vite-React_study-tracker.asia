import { useMemo, useState } from 'react'

const ITEMS_PER_PAGE = 6

export default function HonorWall() {
  const [page, setPage] = useState(1)
  const all = useMemo<{ date: string; medal: string }[]>(
    () => (JSON.parse(localStorage.getItem('honorWall') || '[]') as { date: string; medal: string }[]).sort((a, b) => b.date.localeCompare(a.date)),
    []
  )
  const stats = useMemo(() => {
    const s = { gold: 0, silver: 0, bronze: 0 }
    all.forEach(h => {
      if (h.medal.includes('金')) s.gold++
      else if (h.medal.includes('银')) s.silver++
      else if (h.medal.includes('铜')) s.bronze++
    })
    return s
  }, [all])

  const total = Math.max(1, Math.ceil(all.length / ITEMS_PER_PAGE))
  const paged = all.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  return (
    <div className="card">
      <h3 style={{ marginBottom: 15 }}>🏆 勋章荣誉墙</h3>
      <div className="medal-stats-bar">
        <div className="stat-item">🥇 金牌: <span>{stats.gold}</span></div>
        <div className="stat-item">🥈 银牌: <span>{stats.silver}</span></div>
        <div className="stat-item">🥉 铜牌: <span>{stats.bronze}</span></div>
      </div>
      <div className="honor-grid">
        {paged.length === 0 ? (
          <div style={{ gridColumn: 'span 2', color: '#ccc', textAlign: 'center' }}>暂无勋章</div>
        ) : (
          paged.map(h => (
            <div key={`${h.date}-${h.medal}`} className="honor-item">
              <span style={{ fontSize: 11, color: '#8a87b8' }}>{h.date}</span>
              <div>{h.medal}</div>
            </div>
          ))
        )}
      </div>
      <div className="pagination-controls">
        <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1}>上一页</button>
        <span>第 {page} / {total} 页</span>
        <button className="page-btn" onClick={() => setPage(p => Math.min(total, p + 1))} disabled={page >= total}>下一页</button>
      </div>
    </div>
  )
}
