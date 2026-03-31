import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Edit, Trash2, Key, Copy, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import ConfirmDialog from "@/components/ConfirmDialog"
import { useConfirm } from "@/hooks/use-confirm"

export default function ClientView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()
  const [client, setClient] = useState(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState(false)
  const [newKey, setNewKey] = useState(null)

  useEffect(() => {
    fetchClient()
  }, [id])

  const fetchClient = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/admin/clients/${id}`)
      setClient(response.data.client)
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to load client details",
        variant: "destructive"
      })
      navigate("/admin/clients")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Client",
      message: "Are you sure you want to delete this API client? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })

    if (!confirmed) return

    try {
      await apiClient.delete(`/admin/clients/${id}`)
      toast({ title: "Success", description: "Client deleted successfully", variant: "success" })
      navigate("/admin/clients")
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive"
      })
    }
  }

  const handleRegenerateKey = async () => {
    const confirmed = await confirm({
      title: "Regenerate API Key",
      message: "This will invalidate the current API key. Any integrations using it will stop working until updated.",
      confirmText: "Regenerate",
      cancelText: "Cancel"
    })

    if (!confirmed) return

    setRegenerating(true)
    try {
      const response = await apiClient.post(`/admin/clients/${id}/regenerate-key`)
      setNewKey(response.data.api_key)
      setClient(prev => ({ ...prev, api_key: response.data.api_key }))
      toast({ title: "Success", description: "API key regenerated", variant: "success" })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to regenerate key",
        variant: "destructive"
      })
    } finally {
      setRegenerating(false)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: `${label} copied to clipboard`, variant: "success" })
  }

  const maskApiKey = (key) => {
    if (!key) return "N/A"
    return key.slice(0, 8) + "••••••••••••••••" + key.slice(-4)
  }

  const formatDate = (dateStr) =>
    dateStr
      ? new Date(dateStr).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      : "-"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  if (!client) return null

  return (
    <div className="space-y-6">
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("/admin/clients")}
            className="border-gray-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Client Details</h1>
            <p className="text-sm text-gray-500 mt-1">API Client ID: {client.client_id}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/admin/clients/${id}/edit`)}
            className="border-gray-300"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="border-red-300 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* New key banner */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <Key className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-green-800">New API Key — copy now</p>
            <code className="text-sm font-mono text-green-900 break-all">{newKey}</code>
          </div>
          <button
            onClick={() => copyToClipboard(newKey, "New API Key")}
            className="p-2 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0"
          >
            <Copy className="h-4 w-4 text-green-700" />
          </button>
        </div>
      )}

      {/* Client details */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
            <Key className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">{client.client_name}</h2>
            <p className="text-sm text-white/80">
              {client.is_active ? "Active" : "Inactive"}
            </p>
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-medium text-gray-500">Client Name</label>
            <p className="mt-1 text-base text-gray-900">{client.client_name}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Status</label>
            <p className="mt-1">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                client.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}>
                {client.is_active ? "Active" : "Inactive"}
              </span>
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Rate Limit</label>
            <p className="mt-1 text-base text-gray-900">{client.rate_limit ?? 1000} req/hr</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Webhook URL</label>
            <p className="mt-1 text-base text-gray-900 break-all">{client.webhook_url || "-"}</p>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-500">API Key</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 break-all">
                {maskApiKey(client.api_key)}
              </code>
              <button
                onClick={() => copyToClipboard(client.api_key, "API Key")}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                title="Copy full key"
              >
                <Copy className="h-4 w-4 text-gray-600" />
              </button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Created</label>
            <p className="mt-1 text-base text-gray-900">{formatDate(client.created_at)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Last Updated</label>
            <p className="mt-1 text-base text-gray-900">{formatDate(client.updated_at)}</p>
          </div>
        </div>
      </div>

      {/* Key management */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-base font-semibold text-gray-900">API Key Management</h2>
          <p className="text-sm text-gray-500 mt-1">Regenerate the API key if it has been compromised</p>
        </div>
        <div className="p-6">
          <Button
            type="button"
            variant="outline"
            onClick={handleRegenerateKey}
            disabled={regenerating}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${regenerating ? "animate-spin" : ""}`} />
            {regenerating ? "Regenerating..." : "Regenerate API Key"}
          </Button>
        </div>
      </div>
    </div>
  )
}
