import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react"
import DataTable from "@/components/DataTable"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const STATUS_BADGE = {
  success: "bg-green-100 text-green-800",
  partial: "bg-yellow-100 text-yellow-800",
  failed:  "bg-red-100 text-red-800",
  running: "bg-blue-100 text-blue-800",
}

const STATUS_ICON = {
  success: <CheckCircle className="h-3 w-3" />,
  partial: <AlertTriangle className="h-3 w-3" />,
  failed:  <XCircle className="h-3 w-3" />,
  running: <RefreshCw className="h-3 w-3 animate-spin" />,
}

const formatDate = (d) => d ? new Date(d).toLocaleString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", hour12: true
}) : "—"

const formatDuration = (ms) => {
  if (!ms) return "—"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function ERPSyncHistory() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({ current_page: 1, total_pages: 1, total_records: 0, limit: 20 })
  const { toast } = useToast()
  const navigate = useNavigate()

  useEffect(() => {
    fetchHistory()
  }, [pagination.current_page])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const res = await apiClient.get(`/admin/erp-sync/history?page=${pagination.current_page}&limit=${pagination.limit}`)
      setLogs(res.data.logs || [])
      setPagination(res.data.pagination)
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch sync history", variant: "destructive" })
    } finally {
      setLoading(false)
    }
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
      header: "TRIGGERED BY",
      cell: (row) => (
        <span className="capitalize text-sm text-gray-700">{row.triggered_by}</span>
      )
    },
    {
      header: "PULLED",
      cell: (row) => (
        <div className="text-sm text-gray-700">
          <span className="text-blue-700 font-medium">{row.qr_pulled}</span> QR ·{" "}
          <span className="text-purple-700 font-medium">{row.coa_pulled}</span> COA
        </div>
      )
    },
    {
      header: "PROMOTED",
      cell: (row) => (
        <div className="text-xs text-gray-600 space-y-0.5">
          <div>Products: <span className="font-medium">{row.products_upserted}</span></div>
          <div>Batches: <span className="font-medium">{row.batches_upserted}</span></div>
          <div>Serials: <span className="font-medium">{row.serials_upserted}</span></div>
          <div>COA: <span className="font-medium">{row.coa_upserted}</span></div>
        </div>
      )
    },
    {
      header: "FAILURES",
      cell: (row) => {
        const total = (row.validation_failed || 0) + (row.promotion_failed || 0)
        return (
          <span className={`text-sm font-medium ${total > 0 ? "text-red-600" : "text-gray-400"}`}>
            {total > 0 ? total : "—"}
          </span>
        )
      }
    },
    {
      header: "DURATION",
      cell: (row) => (
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock className="h-3 w-3" />
          {formatDuration(row.duration_ms)}
        </div>
      )
    },
    {
      header: "STARTED AT",
      cell: (row) => <span className="text-sm text-gray-600">{formatDate(row.started_at)}</span>
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/admin/erp-sync")} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <ArrowLeft className="h-5 w-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sync History</h1>
          <p className="text-sm text-gray-500 mt-1">All ERP sync runs</p>
        </div>
      </div>

      <DataTable
        title=""
        columns={columns}
        data={logs}
        loading={loading}
        showAddButton={false}
        exportFileName="erp-sync-history"
        pagination={pagination}
        onPageChange={(page) => setPagination(prev => ({ ...prev, current_page: page }))}
      />
    </div>
  )
}
