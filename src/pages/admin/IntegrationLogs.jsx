import { useState, useEffect } from "react"
import { Eye, Filter, RefreshCw, Activity, CheckCircle, XCircle, Clock } from "lucide-react"
import DataTable from "@/components/DataTable"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function IntegrationLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_records: 0,
    limit: 50
  })
  const [filters, setFilters] = useState({
    status: '',
    method: '',
    client_id: ''
  })
  const [stats, setStats] = useState({
    total_logs: 0,
    success_logs: 0,
    error_logs: 0,
    success_rate: 0,
    active_clients: 0,
    avg_processing_time_ms: 0
  })
  const [serverError, setServerError] = useState(false)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [pagination.current_page, filters])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      setServerError(false)
      const queryParams = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.limit
      })
      
      // Add filters if they exist
      if (filters.status) queryParams.append('status', filters.status)
      if (filters.method) queryParams.append('method', filters.method)
      if (filters.client_id) queryParams.append('client_id', filters.client_id)

      const response = await apiClient.get(`/admin/integration-logs?${queryParams.toString()}`)
      setLogs(response.data.logs || [])
      setPagination(response.data.pagination || {
        current_page: 1,
        total_pages: 1,
        total_records: 0,
        limit: 50
      })
    } catch (error) {
      console.error('Fetch logs error:', error)
      
      // Check if it's a network error
      if (error.message.includes('Network error') || error.message.includes('server is running')) {
        setServerError(true)
        toast({
          title: "Server Error",
          description: "Backend server is not running. Please start the server.",
          variant: "destructive"
        })
      } else {
        toast({
          title: "Error",
          description: error.message || "Failed to fetch integration logs",
          variant: "destructive"
        })
      }
      
      // Set empty data on error
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/integration-stats')
      setStats(response.data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
      // Don't show error toast for stats, just log it
    }
  }

  const handleView = (log) => {
    navigate(`/admin/integration-logs/${log.log_id}`)
  }

  const handleRefresh = () => {
    fetchLogs()
    fetchStats()
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const getStatusBadge = (status) => {
    if (status < 400) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="h-3 w-3" />
          {status}
        </span>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
        <XCircle className="h-3 w-3" />
        {status}
      </span>
    )
  }

  const getMethodBadge = (method) => {
    const colors = {
      GET: 'bg-blue-100 text-blue-800',
      POST: 'bg-green-100 text-green-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[method] || 'bg-gray-100 text-gray-800'}`}>
        {method}
      </span>
    )
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => (pagination.current_page - 1) * pagination.limit + index + 1
    },
    {
      header: "CLIENT",
      cell: (row) => (
        <div>
          <div className="text-gray-900">{row.client?.client_name || 'N/A'}</div>
          <div className="text-xs text-gray-500">ID: {row.client_id || 'N/A'}</div>
        </div>
      )
    },
    {
      header: "METHOD",
      cell: (row) => getMethodBadge(row.method)
    },
    {
      header: "ENDPOINT",
      cell: (row) => (
        <div className="max-w-xs truncate text-sm text-gray-700" title={row.endpoint}>
          {row.endpoint}
        </div>
      )
    },
    {
      header: "STATUS",
      cell: (row) => getStatusBadge(row.response_status)
    },
    {
      header: "PROCESSING TIME",
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="h-3 w-3" />
          {row.processing_time_ms}ms
        </div>
      )
    },
    {
      header: "IP ADDRESS",
      accessor: "ip_address",
      cell: (row) => (
        <span className="text-sm text-gray-600">{row.ip_address || 'N/A'}</span>
      )
    },
    {
      header: "TIMESTAMP",
      cell: (row) => (
        <span className="text-sm text-gray-600">{formatDate(row.created_at)}</span>
      )
    },
    {
      header: "ACTIONS",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleView(row)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      {/* Server Error Alert */}
      {serverError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Backend Server Not Running</h3>
              <p className="text-sm text-red-700 mt-1">
                Please start the backend server to view integration logs.
                <br />
                <code className="bg-red-100 px-2 py-1 rounded text-xs mt-2 inline-block">
                  cd Vytals-Backend && npm start
                </code>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Requests</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total_logs}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.success_rate}%</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Failed Requests</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats.error_logs}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats.avg_processing_time_ms}ms</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#338291] text-sm"
            >
              <option value="">All</option>
              <option value="success">Success</option>
              <option value="error">Error</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Method</label>
            <select
              value={filters.method}
              onChange={(e) => handleFilterChange('method', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#338291] text-sm"
            >
              <option value="">All</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-[#338291] text-white rounded-lg hover:bg-[#2a6d7a] transition-colors text-sm font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Data Table */}
      <DataTable
        title="Integration Logs"
        subtitle="View all API integration requests and responses"
        columns={columns}
        data={logs}
        loading={loading}
        showAddButton={false}
        exportFileName="integration-logs"
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, current_page: page }))}
      />
    </div>
  )
}
