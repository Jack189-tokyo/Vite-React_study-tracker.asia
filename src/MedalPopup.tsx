export default function MedalPopup({ emoji }: { emoji: string | null }) {
  if (!emoji) return null
  return (
    <div style={{
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      width: 140, height: 140, borderRadius: 35,
      border: '2px solid rgba(123, 104, 238, 0.4)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 3000
    }}>
      <span style={{ fontSize: 64, filter: 'drop-shadow(0 10px 15px rgba(123, 104, 238, 0.3))' }}>{emoji}</span>
    </div>
  )
}
