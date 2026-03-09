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
      <div className="flex items-center gap-2 mb-4">
        <span className="text-lg">🏆</span>
        <h3 className="m-0 text-xl font-bold text-[#2d2d5f]">勋章荣誉墙</h3>
      </div>

      <div className="rounded-2xl border border-[color:#7C3AED4D] bg-[color:#C39BFF14] px-4 py-3 flex items-center justify-center gap-10">
        <div className="flex items-center gap-2 text-[#2d2d5f] font-semibold">
          <span>🥇</span>
          <span>金牌: {stats.gold}</span>
        </div>
        <div className="flex items-center gap-2 text-[#2d2d5f] font-semibold">
          <span>🥈</span>
          <span>银牌: {stats.silver}</span>
        </div>
        <div className="flex items-center gap-2 text-[#2d2d5f] font-semibold">
          <span>🥉</span>
          <span>铜牌: {stats.bronze}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-5">
        {paged.length === 0 ? (
          <div className="col-span-2 text-center text-[13px] text-[#8a87b8] py-10">暂无勋章</div>
        ) : (
          paged.map(h => (
            <div
              key={`${h.date}-${h.medal}`}
              className="calendar-cell rounded-2xl border-2 border-[color:#7C3AED4D] bg-[color:#C39BFF14] backdrop-blur px-4 py-5 text-center flex flex-col items-center justify-center gap-2 min-h-[96px]"
            >
              <div className="text-[12px] text-[#8a87b8] font-semibold">{h.date}</div>
              <div className="text-[18px] font-bold text-[#2d2d5f]">{h.medal}</div>
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
