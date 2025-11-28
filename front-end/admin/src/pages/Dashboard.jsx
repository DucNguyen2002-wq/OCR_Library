import Sidebar from '../components/Layout/Sidebar'
import Topbar from '../components/Layout/Topbar'
import StatsCard from '../components/StatsCard'
import { useEffect, useState } from 'react'
import { getStats } from '../api/profile'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default function Dashboard() {
  const [stats, setStats] = useState({ total: 0, approved: 0, pending: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await getStats()
        if (res?.success) setStats({ total: res.total, approved: res.approved, pending: res.pending })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const chartData = {
    labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul'],
    datasets: [
      {
        label: 'Uploads',
        data: [3,4,6,8,5,7,9],
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,0.2)'
      },
      {
        label: 'Approved',
        data: [1,3,4,6,4,6,8],
        borderColor: '#22c55e',
        backgroundColor: 'rgba(34,197,94,0.15)'
      }
    ]
  }

  return (
    <div className="layout">
      <Sidebar />
      <main>
        <Topbar title="Analytics Dashboard" />
        <div className="grid grid-3">
          <StatsCard label="Tổng sách của tôi" value={loading?'…':stats.total} trendLabel="Tổng số sách đã tạo" color="#0ea5e9" />
          <StatsCard label="Đã duyệt" value={loading?'…':stats.approved} trendLabel="Sách đã được duyệt" color="#22c55e" />
          <StatsCard label="Chờ duyệt" value={loading?'…':stats.pending} trendLabel="Đang chờ Admin" color="#eab308" />
        </div>

        <div className="panel">
          <div className="panel-header">Bandwidth Reports</div>
          <Line data={chartData} options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </main>
    </div>
  )
}
