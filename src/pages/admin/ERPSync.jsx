import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { RefreshCw, Play, CheckCircle, XCircle, Clock, AlertTriangle, Database, Activity } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

const STATUS_BADGE = {
  success:  "bg-green-100 text-green-800",
  partial:  "bg-yellow-100 text-yellow-800",
  failed:   "bg-red-100 text-red-800",
  running:  "bg-blue-100 text-blue-800",
}

const STATUS_ICON = {
  success: <CheckCircle className="h-4 w-4" />,
  partial: <AlertTriangle className="h-4 w-4" />,
  failed:  <XCircle className="h-4 w-4" />,
  running: <RefreshCw className="h-4 w-4 animate-spin" />,
}

const formatDate = (d) => d ? new Date(d).toLocaleString("en-IN", {
  day: "2-digit", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", hour12: true
}) : "Never"

const formatDuration = (ms) => {
  if (!ms) return "—"
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function ERPSync() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [triggering, setTriggering] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const pollRef = useRef(null)

  const fetchStatus = async () => {
    try {
      const res = await apiClient.get("/admin/erp-sync/status")
      setStatus(res.data)
    } catch (err) {
      toast({ title: "Error", description: "Failed to fetch sync status", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // Poll every 4s while a sync is running
  useEffect(() => {
    fetchStatus()
  }, [])

  useEffect(() => {
    if (status?.is_running) {
      pollRef.current = setInterval(fetchStatus, 4000)
    } else {
      clearInterval(pollRef.current)
    }
    return () => clearInterval(pollRef.current)
  }, [status?.is_running])

  const triggerSync = async () => {
    setTriggering(true)
    try {
      await apiClient.post("/admin/erp-sync/run")
      toast({ title: "Sync started", description: "ERP sync is running in the background.", variant: "success" })
      // Start polling immediately
      setTimeout(fetchStatus, 1000)
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message || "Failed to trigger sync", variant: "destructive" })
    } finally {
      setTriggering(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#338291]" />
      </div>
    )
  }

  const states = status?.sync_state || []
  const recentRuns = status?.recent_runs || []
  const qrState = states.find(s => s.entity === "qr_details")
  const coaState = states.find(s => s.entity === "coa_report")

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ERP Sync</h1>
          <p className="text-sm text-gray-500 mt-1">
            Auto-sync: <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded">{status?.cron_schedule}</span>
            <span className="ml-2 text-gray-400">(08:00 · 16:00 · 22:00 IST)</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStatus}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={triggerSync}
            disabled={triggering || status?.is_running}
            className="flex items-center gap-2 px-4 py-2 bg-[#338291] text-white rounded-lg hover:bg-[#2a6d7a] transition-colors text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {status?.is_running
              ? <><RefreshCw className="h-4 w-4 animate-spin" /> Syncing...</>
              : <><Play className="h-4 w-4" /> Sync Now</>
            }
          </button>
        </div>
      </div>

      {/* Running banner */}
      {status?.is_running && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-blue-600 animate-spin flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-blue-800">Sync in progress</p>
            <p className="text-xs text-blue-600 mt-0.5">Pulling from Business Central and promoting to live tables...</p>
          </div>
        </div>
      )}

      {/* State cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: "QR Details", icon: <Database className="h-5 w-5 text-blue-600" />, bg: "bg-blue-100", state: qrState },
          { label: "COA Report", icon: <Activity className="h-5 w-5 text-purple-600" />, bg: "bg-purple-100", state: coaState },
        ].map(({ label, icon, bg, state }) => (
          <div key={label} className="bg-white rounded-lg border border-gray-200 p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className={`h-10 w-10 ${bg} rounded-lg flex items-center justify-center`}>{icon}</div>
              <div>
                <p className="text-sm font-medium text-gray-900">{label}</p>
                <p className="text-xs text-gray-500">Last synced: {formatDate(state?.last_synced_at)}</p>
              </div>
              {state?.last_run_status && (
                <span className={`ml-auto inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[state.last_run_status]}`}>
                  {STATUS_ICON[state.last_run_status]}
                  {state.last_run_status}
                </span>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="bg-gray-50 rounded-lg p-2">
                <p className="text-lg font-bold text-gray-900">{state?.total_pulled ?? 0}</p>
                <p className="text-xs text-gray-500">Pulled</p>
              </div>
              <div className="bg-green-50 rounded-lg p-2">
                <p className="text-lg font-bold text-green-700">{state?.total_promoted ?? 0}</p>
                <p className="text-xs text-gray-500">Promoted</p>
              </div>
              <div className="bg-red-50 rounded-lg p-2">
                <p className="text-lg font-bold text-red-700">{state?.total_failed ?? 0}</p>
                <p className="text-xs text-gray-500">Failed</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent runs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Runs</h2>
          <button
            onClick={() => navigate("/admin/erp-sync-history")}
            className="text-xs text-[#338291] hover:underline"
          >
            View all
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {recentRuns.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No sync runs yet</p>
          ) : recentRuns.map((run) => (
            <div key={run.log_id} className="flex items-center gap-4 px-5 py-3">
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_BADGE[run.status] || "bg-gray-100 text-gray-700"}`}>
                {STATUS_ICON[run.status]}
                {run.status}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-700">
                  QR: <span className="font-medium">{run.qr_pulled}</span> pulled ·{" "}
                  COA: <span className="font-medium">{run.coa_pulled}</span> pulled ·{" "}
                  Serials: <span className="font-medium">{run.serials_upserted}</span> upserted
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{formatDate(run.started_at)}</p>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500 flex-shrink-0">
                <Clock className="h-3 w-3" />
                {formatDuration(run.duration_ms)}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0 capitalize">{run.triggered_by}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => navigate("/admin/erp-sync-history")}
          className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#338291] hover:bg-gray-50 transition-colors text-left"
        >
          <Activity className="h-5 w-5 text-[#338291]" />
          <div>
            <p className="text-sm font-medium text-gray-900">Sync History</p>
            <p className="text-xs text-gray-500">Full paginated run history with counts</p>
          </div>
        </button>
        <button
          onClick={() => navigate("/admin/erp-sync-buffer")}
          className="flex items-center gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:border-[#338291] hover:bg-gray-50 transition-colors text-left"
        >
          <Database className="h-5 w-5 text-[#338291]" />
          <div>
            <p className="text-sm font-medium text-gray-900">Buffer Inspector</p>
            <p className="text-xs text-gray-500">Inspect raw BC records and validation errors</p>
          </div>
        </button>
      </div>
    </div>
  )
}
