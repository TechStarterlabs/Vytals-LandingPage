import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, User, Package, Hash, Calendar, MapPin, Monitor, CheckCircle, XCircle, AlertCircle, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ScanLogView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [scanLog, setScanLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchScanLog()
  }, [id])

  const fetchScanLog = async () => {
    try {
      const response = await apiClient.get(`/admin/scan-logs/${id}`)
      setScanLog(response.data)
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load scan log details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      SUCCESS: { bg: "bg-green-100", text: "text-green-800", icon: CheckCircle },
      FAILED: { bg: "bg-red-100", text: "text-red-800", icon: XCircle },
      DUPLICATE: { bg: "bg-yellow-100", text: "text-yellow-800", icon: AlertCircle },
      EXPIRED: { bg: "bg-gray-100", text: "text-gray-800", icon: Clock },
      COA_UNLOCKED: { bg: "bg-teal-100", text: "text-teal-800", icon: CheckCircle }
    }
    
    const config = statusConfig[status] || statusConfig.FAILED
    const Icon = config.icon
    
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="h-4 w-4" />
        {status}
      </span>
    )
  }

  const getScanTypeBadge = (scanType) => {
    const isQR = scanType === "QR"
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        isQR ? "bg-blue-100 text-blue-800" : "bg-purple-100 text-purple-800"
      }`}>
        {scanType}
      </span>
    )
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#11b5b2]"></div>
      </div>
    )
  }

  if (!scanLog) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="text-gray-500 text-lg">Scan log not found</div>
        <Button onClick={() => navigate("/admin/scan-logs")} variant="outline">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Scan Logs
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/scan-logs")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Scan Log Details</h1>
            <p className="text-sm text-gray-500 mt-1">View scan activity information</p>
          </div>
        </div>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#11b5b2] to-[#0fa09d] border-b">
          <h2 className="text-lg font-semibold text-white">Scan Status</h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <div className="mt-2">
              {getStatusBadge(scanLog.status)}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Scan Type</label>
            <div className="mt-2">
              {getScanTypeBadge(scanLog.scan_type)}
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500">Scanned At</label>
            <p className="mt-2 text-base text-gray-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              {formatDate(scanLog.created_at)}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Information */}
      {scanLog.user && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <User className="h-5 w-5 text-[#11b5b2]" />
              Customer Information
            </h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-500">Name</label>
              <p className="mt-1 text-base text-gray-900">
                {[scanLog.user.first_name, scanLog.user.last_name].filter(Boolean).join(" ") || "N/A"}
              </p>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Customer Email</label>
              <p className="mt-1 text-base text-gray-900">{scanLog.user.email || "N/A"}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Mobile Number</label>
              <p className="mt-1 text-base text-gray-900 font-mono">{scanLog.user.mobile_number || "N/A"}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Customer ID</label>
              <p className="mt-1 text-base text-gray-900">#{scanLog.user.user_id}</p>
            </div>
          </div>
        </div>
      )}

      {/* Product Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package className="h-5 w-5 text-[#11b5b2]" />
            Product Information
          </h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {scanLog.serial_number && (
            <div>
              <label className="text-sm font-medium text-gray-500">Serial Number</label>
              <p className="mt-1 text-base text-gray-900 font-mono">{scanLog.serial_number.serial_number}</p>
            </div>
          )}
          
          {scanLog.batch && (
            <>
              <div>
                <label className="text-sm font-medium text-gray-500">Batch Code</label>
                <p className="mt-1 text-base text-gray-900 font-mono">{scanLog.batch.batch_code}</p>
              </div>
              
              {scanLog.batch.product && (
                <>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Product Name</label>
                    <p className="mt-1 text-base text-gray-900">{scanLog.batch.product.name}</p>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-500">Product ID</label>
                    <p className="mt-1 text-base text-gray-900">#{scanLog.batch.product.product_id}</p>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {/* Technical Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Monitor className="h-5 w-5 text-[#11b5b2]" />
            Technical Information
          </h2>
        </div>
        
        <div className="p-6 grid grid-cols-1 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              IP Address
            </label>
            <p className="mt-1 text-base text-gray-900 font-mono">{scanLog.ip_address || "N/A"}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              User Agent
            </label>
            <p className="mt-1 text-sm text-gray-900 break-all bg-gray-50 p-3 rounded-lg border border-gray-200">
              {scanLog.user_agent || "N/A"}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Hash className="h-4 w-4" />
              Scan Log ID
            </label>
            <p className="mt-1 text-base text-gray-900">#{scanLog.scan_log_id}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
