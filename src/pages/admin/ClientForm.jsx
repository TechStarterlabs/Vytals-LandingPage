import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { ArrowLeft, Save, RefreshCw, Copy, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = id && id !== "new"

  const [createdCredentials, setCreatedCredentials] = useState(null)
  const [showSecret, setShowSecret] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [newKey, setNewKey] = useState(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm({
    defaultValues: {
      client_name: "",
      rate_limit: 1000,
      webhook_url: "",
      is_active: true
    }
  })

  useEffect(() => {
    if (isEdit) fetchClient()
  }, [id])

  const fetchClient = async () => {
    try {
      const response = await apiClient.get(`/admin/clients/${id}`)
      const c = response.data.client
      reset({
        client_name: c.client_name,
        rate_limit: c.rate_limit,
        webhook_url: c.webhook_url || "",
        is_active: c.is_active
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load client details",
        variant: "destructive"
      })
    }
  }

  const onSubmit = async (data) => {
    try {
      const payload = {
        client_name: data.client_name,
        rate_limit: Number(data.rate_limit),
        webhook_url: data.webhook_url || null,
        is_active: data.is_active === true || data.is_active === "true"
      }

      if (isEdit) {
        await apiClient.put(`/admin/clients/${id}`, payload)
        toast({ title: "Success", description: "Client updated successfully", variant: "success" })
        navigate(`/admin/clients/${id}`)
      } else {
        const response = await apiClient.post('/admin/clients', payload)
        const client = response.data.client
        setCreatedCredentials({
          api_key: client.api_key,
          api_secret: client.api_secret,
          client_id: client.client_id
        })
        toast({ title: "Success", description: "Client created successfully", variant: "success" })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save client",
        variant: "destructive"
      })
    }
  }

  const handleRegenerateKey = async () => {
    setRegenerating(true)
    try {
      const response = await apiClient.post(`/admin/clients/${id}/regenerate-key`)
      setNewKey(response.data.api_key)
      toast({ title: "Success", description: "API key regenerated successfully", variant: "success" })
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

  // One-time credentials display after creation
  if (createdCredentials) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate("/admin/clients")} className="border-gray-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Clients
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Client Created</h1>
            <p className="text-sm text-gray-500 mt-1">Save these credentials — they won't be shown again</p>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-amber-600 text-sm font-bold">!</span>
            </div>
            <div>
              <p className="font-semibold text-amber-800">One-time display</p>
              <p className="text-sm text-amber-700 mt-1">
                The API secret is only shown once. Copy and store it securely before leaving this page.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-700">API Key</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 break-all">
                  {createdCredentials.api_key}
                </code>
                <button
                  onClick={() => copyToClipboard(createdCredentials.api_key, "API Key")}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors flex-shrink-0"
                  title="Copy"
                >
                  <Copy className="h-4 w-4 text-amber-700" />
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">API Secret</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm font-mono text-gray-900 break-all">
                  {showSecret ? createdCredentials.api_secret : "••••••••••••••••••••••••••••••••"}
                </code>
                <button
                  onClick={() => setShowSecret(!showSecret)}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors flex-shrink-0"
                  title={showSecret ? "Hide" : "Show"}
                >
                  {showSecret ? <EyeOff className="h-4 w-4 text-amber-700" /> : <Eye className="h-4 w-4 text-amber-700" />}
                </button>
                <button
                  onClick={() => copyToClipboard(createdCredentials.api_secret, "API Secret")}
                  className="p-2 hover:bg-amber-100 rounded-lg transition-colors flex-shrink-0"
                  title="Copy"
                >
                  <Copy className="h-4 w-4 text-amber-700" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={() => navigate(`/admin/clients/${createdCredentials.client_id}`)}
            className="bg-[#338291] hover:bg-[#2a6d7a] text-white"
          >
            View Client
          </Button>
          <Button variant="outline" onClick={() => navigate("/admin/clients")} className="border-gray-300">
            Back to List
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate("/admin/clients")} className="border-gray-300">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? "Edit Client" : "Add New Client"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEdit ? "Update API client settings" : "Create a new API client with generated credentials"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-gradient-to-r from-[#338291] to-[#2a6d7a] border-b">
            <h2 className="text-lg font-semibold text-white">Client Information</h2>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Client Name <span className="text-red-500">*</span>
                </label>
                <Input
                  {...register("client_name", { required: "Client name is required" })}
                  className={errors.client_name ? "border-red-500" : "border-gray-300"}
                  placeholder="e.g. Shopify Integration"
                />
                {errors.client_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.client_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rate Limit (requests/hour)
                </label>
                <Input
                  type="number"
                  {...register("rate_limit", { min: { value: 1, message: "Must be at least 1" } })}
                  className={errors.rate_limit ? "border-red-500" : "border-gray-300"}
                  placeholder="1000"
                />
                {errors.rate_limit && (
                  <p className="mt-1 text-sm text-red-600">{errors.rate_limit.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Webhook URL
                </label>
                <Input
                  {...register("webhook_url", {
                    pattern: {
                      value: /^https?:\/\/.+/,
                      message: "Must be a valid URL starting with http:// or https://"
                    }
                  })}
                  className={errors.webhook_url ? "border-red-500" : "border-gray-300"}
                  placeholder="https://example.com/webhook"
                />
                {errors.webhook_url && (
                  <p className="mt-1 text-sm text-red-600">{errors.webhook_url.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  {...register("is_active")}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#338291] focus:border-transparent"
                >
                  <option value={true}>Active</option>
                  <option value={false}>Inactive</option>
                </select>
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/admin/clients")}
              className="border-gray-300 w-full sm:w-auto"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-[#338291] hover:bg-[#2a6d7a] text-white w-full sm:w-auto"
              disabled={isSubmitting}
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? "Saving..." : isEdit ? "Update Client" : "Create Client"}
            </Button>
          </div>
        </div>
      </form>

      {/* Regenerate Key section — edit mode only */}
      {isEdit && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b">
            <h2 className="text-base font-semibold text-gray-900">API Key Management</h2>
            <p className="text-sm text-gray-500 mt-1">Regenerate the API key if it has been compromised</p>
          </div>
          <div className="p-6 space-y-4">
            {newKey && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm font-medium text-green-800 mb-2">New API Key (copy now):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-sm font-mono text-green-900 break-all">{newKey}</code>
                  <button
                    onClick={() => copyToClipboard(newKey, "New API Key")}
                    className="p-2 hover:bg-green-100 rounded-lg transition-colors flex-shrink-0"
                    title="Copy"
                  >
                    <Copy className="h-4 w-4 text-green-700" />
                  </button>
                </div>
              </div>
            )}
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
      )}
    </div>
  )
}
