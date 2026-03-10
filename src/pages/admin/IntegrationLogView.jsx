import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Calendar, Clock, Server, User, CheckCircle, XCircle, Code } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Loader from "@/components/Loader"

export default function IntegrationLogView() {
  const { logId } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [log, setLog] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogDetails()
  }, [logId])

  const fetchLogDetails = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/admin/integration-logs/${logId}`)
      setLog(response.data.log)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to fetch log details",
        variant: "destructive"
      })
      navigate('/admin/integration-logs')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    })
  }

  const formatJSON = (jsonString) => {
    try {
      const parsed = JSON.parse(jsonString)
      return JSON.stringify(parsed, null, 2)
    } catch {
      return jsonString || 'N/A'
    }
  }

  const getStatusColor = (status) => {
    if (status < 400) return 'text-green-600 bg-green-100'
    return 'text-red-600 bg-red-100'
  }

  const getMethodColor = (method) => {
    const colors = {
      GET: 'text-blue-600 bg-blue-100',
      POST: 'text-green-600 bg-green-100',
      PUT: 'text-yellow-600 bg-yellow-100',
      DELETE: 'text-red-600 bg-red-100'
    }
    return colors[method] || 'text-gray-600 bg-gray-100'
  }

  if (loading) {
    return <Loader />
  }

  if (!log) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Log not found</p>
      </div>
    )
  }

  const isSuccess = log.response_status < 400

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/integration-logs')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Integration Log Details</h1>
            <p className="text-sm text-gray-500 mt-1">Log ID: {log.log_id}</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(log.response_status)}`}>
          {isSuccess ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{isSuccess ? 'Success' : 'Failed'}</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Server className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Method</p>
              <p className={`text-sm px-2 py-0.5 rounded ${getMethodColor(log.method)} inline-block mt-1`}>
                {log.method}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${isSuccess ? 'bg-green-100' : 'bg-red-100'}`}>
              {isSuccess ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
            </div>
            <div>
              <p className="text-xs text-gray-500">Status Code</p>
              <p className="text-lg text-gray-900 mt-1">{log.response_status}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Processing Time</p>
              <p className="text-lg text-gray-900 mt-1">{log.processing_time_ms}ms</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <User className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Client</p>
              <p className="text-sm text-gray-900 mt-1 truncate" title={log.client?.client_name}>
                {log.client?.client_name || 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Request Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Request Details</h2>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Endpoint</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg break-all">
                {log.endpoint}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-700">IP Address</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {log.ip_address || 'N/A'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamp
              </label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {formatDate(log.created_at)}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-700">Client ID</label>
              <p className="mt-1 text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                {log.client_id || 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700 flex items-center gap-2 mb-2">
              <Code className="h-4 w-4" />
              Request Body
            </label>
            <pre className="text-xs text-gray-900 bg-gray-50 px-4 py-3 rounded-lg overflow-x-auto border border-gray-200">
              {formatJSON(log.request_body)}
            </pre>
          </div>
        </div>
      </div>

      {/* Response Details */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg text-gray-900 mb-4">Response Details</h2>
        <div className="space-y-4">
          {log.error_message && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <label className="text-sm text-red-700 flex items-center gap-2 mb-2">
                <XCircle className="h-4 w-4" />
                Error Message
              </label>
              <p className="text-sm text-red-900">{log.error_message}</p>
            </div>
          )}

          <div>
            <label className="text-sm text-gray-700 flex items-center gap-2 mb-2">
              <Code className="h-4 w-4" />
              Response Body
            </label>
            <pre className="text-xs text-gray-900 bg-gray-50 px-4 py-3 rounded-lg overflow-x-auto border border-gray-200 max-h-96">
              {formatJSON(log.response_body)}
            </pre>
          </div>
        </div>
      </div>

      {/* Client Information */}
      {log.client && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg text-gray-900 mb-4">Client Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-gray-700">Client Name</label>
              <p className="mt-1 text-sm text-gray-900">{log.client.client_name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-700">Client ID</label>
              <p className="mt-1 text-sm text-gray-900">{log.client.client_id}</p>
            </div>
            <div>
              <label className="text-sm text-gray-700">Status</label>
              <p className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
                  log.client.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {log.client.is_active ? 'Active' : 'Inactive'}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
