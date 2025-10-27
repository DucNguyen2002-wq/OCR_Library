export default function StatsCard({ label, value, trendLabel, color = '#0ea5e9' }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {trendLabel && <div className="stat-trend" style={{color}}>{trendLabel}</div>}
    </div>
  )
}
