import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Filter, RefreshCw, CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react"
import DataTable from "@/components/DataTable"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const STATUS_BADGE = {
  pending:    "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-700",
  promoted:   "bg-green-100 text-green-800",
  failed:     "bg-red-100 text-red-800",
  skipped:    "bg-yellow-100 text-yellow-700",
}

const STATUS_ICON = {
  pending:    <Clock className="h-3 w-3" />,
  processing: <RefreshCw className="h-3 w-3 animate-spin" />,
  promoted:   <CheckCircle className="h-3 w-3" />,
  failed:     <XCircle className="h-3 w-3" />,
  skipped:    <AlertTriangle className="h-3 w-3" />,
}

const formatDate = (d) => d ? new Date(d).toLocaleString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", hour12: true
}) : "—"

export default function ERPSyncBuffer() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_records: 0, limit: 50 })
  const [filters, setFilters] = useState({ status: "", source_api: "" })
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchBuffer()
  }, [pagination.current_page, filters])

  const fetchBuffer = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: pagination.current_page,
        limit: pagination.limit
      })
      if (filters.status) params.append("status", filters.status)
      if (filters.source_api) params.append("source_api", filters.source_api)

      const res = await apiClient.get(`/admin/erp-sync/buffer?${params.toString()}`)
      setRecords(res.data.records || [])
      setPagination(res.data.pagination)
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch buffer records", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, current_page: 1 }))
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => (pagination.current_page - 1) * pagination.limit + index + 1
    },
    {
      header: "STATUS",
      cell: (row) => (
        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[row.status] || "bg-gray-100 text-gray-700"}`}>
          {STATUS_ICON[row.status]}
          {row.status}
        </span>
      )
    },
    {
      header: "SOURCE",
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.source_api === "qr_details" ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
        }`}>
          {row.source_api === "qr_details" ? "QR Details" : "COA Report"}
        </span>
      )
    },
    {
      header: "UNIQUE ID",
      cell: (row) => (
        <span className="font-mono text-xs text-gray-700">{row.bc_unique_id}</span>
      )
    },
    {
      header: "VALIDATION ERRORS",
      cell: (row) => {
        if (!row.validation_errors || row.validation_errors.length === 0) {
          return <span className="text-gray-400 text-xs">—</span>
        }
        return (
          <div className="space-y-1">
            {row.validation_errors.map((err, i) => (
              <p key={i} className="text-xs text-red-600">{err}</p>
            ))}
          </div>
        )
      }
    },
    {
      header: "RUN ID",
      cell: (row) => (
        <span className="font-mono text-xs text-gray-400">{row.sync_run_id?.slice(0, 8)}...</span>
      )
    },
    {
      header: "CREATED AT",
      cell: (row) => <span className="text-sm text-gray-600">{formatDate(row.created_at)}</span>
    },
    {
      header: "PROMOTED AT",
      cell: (row) => <span className="text-sm text-gray-600">{formatDate(row.promoted_at)}</span>
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/erp-sync")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Buffer Inspector</h1>
          <p className="text-sm text-gray-500 mt-1">Raw BC records staged before promotion to live tables</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-gray-600" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#338291] text-sm"
            >
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="promoted">Promoted</option>
              <option value="failed">Failed</option>
              <option value="skipped">Skipped</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source API</label>
            <select
              value={filters.source_api}
              onChange={(e) => handleFilterChange("source_api", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#338291] text-sm"
            >
              <option value="">All</option>
              <option value="qr_details">QR Details</option>
              <option value="coa_report">COA Report</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={fetchBuffer}
              className="flex items-center gap-2 px-4 py-2 bg-[#338291] text-white rounded-lg hover:bg-[#2a6d7a] transition-colors text-sm font-medium"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <DataTable
        title=""
        columns={columns}
        data={records}
        loading={loading}
        showAddButton={false}
        exportFileName="erp-sync-buffer"
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, current_page: page }))}
      />
    </div>
  )
}
