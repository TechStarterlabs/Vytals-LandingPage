import { useState, useEffect } from "react"
import { Eye, Filter } from "lucide-react"
import DataTable from "@/components/DataTable"
import { useNavigate } from "react-router-dom"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ScanLogs() {
  const [scanLogs, setScanLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  })
  const [filters, setFilters] = useState({
    status: "",
    scan_type: "",
    date_from: "",
    date_to: ""
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    fetchScanLogs()
  }, [pagination.page, filters])

  const fetchScanLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.scan_type && { scan_type: filters.scan_type }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to })
      })

      const response = await apiClient.get(`/admin/scan-logs?${params}`)
      
      // Access nested data structure - the API returns { success: true, data: { logs: [...], pagination: {...} } }
      const logsData = response.data?.logs || []
      const paginationData = response.data?.pagination || {}
      
      setScanLogs(logsData)
      setPagination(prev => ({
        ...prev,
        total: paginationData.total_records || 0,
        totalPages: paginationData.total_pages || 0
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load scan logs",
        variant: "destructive"
      })
      setScanLogs([])
    } finally {
      setLoading(false)
    }
  }

  const handleView = (log) => {
    navigate(`/admin/scan-logs/${log.scan_log_id}`)
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    })
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUCCESS: { bg: "bg-green-100", text: "text-green-800" },
      FAILED: { bg: "bg-red-100", text: "text-red-800" },
      DUPLICATE: { bg: "bg-yellow-100", text: "text-yellow-800" },
      EXPIRED: { bg: "bg-gray-100", text: "text-gray-800" },
      COA_UNLOCKED: { bg: "bg-teal-100", text: "text-teal-800" }
    }
    
    const config = statusConfig[status] || statusConfig.FAILED
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {status}
      </span>
    )
  }

  const getScanTypeBadge = (scanType) => {
    const config = scanType === "QR"
      ? { bg: "bg-blue-100", text: "text-blue-800" }
      : { bg: "bg-purple-100", text: "text-purple-800" }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
        {scanType === "QR" ? "QR Code" : "Batch"}
      </span>
    )
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => (pagination.page - 1) * pagination.limit + index + 1
    },
    {
      header: "SERIAL NUMBER",
      cell: (row) => (
        <span className="font-mono text-sm">
          {row.serial_number || "N/A"}
        </span>
      )
    },
    {
      header: "CUSTOMER",
      cell: (row) => (
        <div>
          {(row.user?.first_name || row.user?.last_name) && (
            <div className="text-sm font-medium text-gray-900">
              {[row.user.first_name, row.user.last_name].filter(Boolean).join(" ")}
            </div>
          )}
          <div className="text-sm text-gray-500 font-mono">
            {row.user?.mobile_number || "N/A"}
          </div>
        </div>
      )
    },
    {
      header: "PRODUCT",
      cell: (row) => (
        <div>
          <div className="font-medium text-gray-900">
            {row.product_name || "N/A"}
          </div>
          <div className="text-sm text-gray-500 font-mono">
            {row.batch_code || "N/A"}
          </div>
        </div>
      )
    },
    {
      header: "SCAN TYPE",
      cell: (row) => getScanTypeBadge(row.scan_type)
    },
    {
      header: "STATUS",
      cell: (row) => getStatusBadge(row.status)
    },
    {
      header: "SCANNED AT",
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {formatDate(row.created_at)}
        </span>
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
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="h-4 w-4 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11b5b2]"
            >
              <option value="">All Status</option>
              <option value="SUCCESS">Success</option>
              <option value="FAILED">Failed</option>
              <option value="DUPLICATE">Duplicate</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Scan Type</label>
            <select
              value={filters.scan_type}
              onChange={(e) => setFilters(prev => ({ ...prev, scan_type: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11b5b2]"
            >
              <option value="">All Types</option>
              <option value="QR">QR Code</option>
              <option value="BATCH">Batch</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from}
              onChange={(e) => setFilters(prev => ({ ...prev, date_from: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11b5b2]"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to}
              onChange={(e) => setFilters(prev => ({ ...prev, date_to: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#11b5b2]"
            />
          </div>
        </div>
        
        {(filters.status || filters.scan_type || filters.date_from || filters.date_to) && (
          <button
            onClick={() => setFilters({ status: "", scan_type: "", date_from: "", date_to: "" })}
            className="mt-3 text-sm text-[#11b5b2] hover:text-[#0fa09d] font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        title="Scan Logs"
        subtitle="View all product scan activities"
        columns={columns}
        data={scanLogs}
        loading={loading}
        showAddButton={false}
        exportFileName="scan-logs"
        pagination={{
          currentPage: pagination.page,
          totalPages: pagination.totalPages,
          totalRecords: pagination.total,
          onPageChange: handlePageChange
        }}
      />
    </div>
  )
}
