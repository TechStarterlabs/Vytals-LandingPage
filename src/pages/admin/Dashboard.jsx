import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    totalVerifiedSerials: 0,
    totalDiscountCodes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const data = await apiClient.get('/admin/stats')
      setStats(data.data)
    } catch (err) {
      console.error('Failed to fetch stats:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Total Scans</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalScans}</p>
        </div>
        <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Verified Products</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalVerifiedSerials}</p>
        </div>
        <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md p-6 shadow-lg">
          <h3 className="text-sm font-medium text-muted-foreground">Discount Codes</h3>
          <p className="mt-2 text-3xl font-bold">{stats.totalDiscountCodes}</p>
        </div>
      </div>
    </div>
  )
}
