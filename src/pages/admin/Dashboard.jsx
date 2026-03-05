import { useEffect, useState } from "react"
import { Users, Package, CheckCircle, Gift } from "lucide-react"
import { apiClient } from "@/lib/api"

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalScans: 0,
    verifiedProducts: 0,
    discountCodes: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      // TODO: Replace with actual API call
      // const response = await apiClient.get('/admin/stats')
      // setStats(response.data)
      
      // Mock data for now
      setStats({
        totalUsers: 0,
        totalScans: 13,
        verifiedProducts: 3,
        discountCodes: 0
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      bgColor: "bg-gradient-to-br from-blue-50 to-blue-100",
      iconColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Total Scans",
      value: stats.totalScans,
      icon: Package,
      bgColor: "bg-gradient-to-br from-purple-50 to-purple-100",
      iconColor: "text-purple-600",
      borderColor: "border-purple-200"
    },
    {
      title: "Verified Products",
      value: stats.verifiedProducts,
      icon: CheckCircle,
      bgColor: "bg-gradient-to-br from-green-50 to-green-100",
      iconColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Discount Codes",
      value: stats.discountCodes,
      icon: Gift,
      bgColor: "bg-gradient-to-br from-orange-50 to-orange-100",
      iconColor: "text-orange-600",
      borderColor: "border-orange-200"
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Overview of your system statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon
          return (
            <div
              key={index}
              className={`${card.bgColor} ${card.borderColor} border-2 rounded-xl p-6 transition-all hover:shadow-lg hover:scale-105`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">
                    {card.title}
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {card.value}
                  </p>
                </div>
                <div className={`${card.iconColor} bg-white p-3 rounded-lg shadow-sm`}>
                  <Icon className="h-8 w-8" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Additional sections can be added here */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <p className="text-gray-500 text-sm">No recent activity</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
              View All Users
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
              View Scan Logs
            </button>
            <button className="w-full text-left px-4 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
              Manage Products
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
