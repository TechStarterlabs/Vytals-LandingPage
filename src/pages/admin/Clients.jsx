import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, Key } from "lucide-react"
import DataTable from "@/components/DataTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useConfirm } from "@/hooks/use-confirm"

export default function Clients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/admin/clients')
      setClients(response.data.clients || [])
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to load clients",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (clientId) => {
    const confirmed = await confirm({
      title: "Delete Client",
      message: "Are you sure you want to delete this API client? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })

    if (!confirmed) return

    try {
      await apiClient.delete(`/admin/clients/${clientId}`)
      setClients(clients.filter(c => c.client_id !== clientId))
      toast({
        title: "Success",
        description: "Client deleted successfully",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete client",
        variant: "destructive"
      })
    }
  }

  const maskApiKey = (key) => {
    if (!key) return "N/A"
    return key.slice(0, 8) + "••••••••••••••••" + key.slice(-4)
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "NAME",
      cell: (row) => (
        <span className="font-medium text-gray-900">{row.client_name}</span>
      )
    },
    {
      header: "API KEY",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Key className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
          <span className="font-mono text-xs text-gray-600">{maskApiKey(row.api_key)}</span>
        </div>
      )
    },
    {
      header: "RATE LIMIT",
      cell: (row) => (
        <span className="text-sm text-gray-700">{row.rate_limit ?? 1000} req/hr</span>
      )
    },
    {
      header: "STATUS",
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.is_active
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      header: "CREATED",
      cell: (row) => {
        if (!row.created_at) return "-"
        return new Date(row.created_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit"
        })
      }
    },
    {
      header: "ACTIONS",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/clients/${row.client_id}`)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="View"
          >
            <Eye className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => navigate(`/admin/clients/${row.client_id}/edit`)}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            title="Edit"
          >
            <Edit className="h-4 w-4 text-gray-600" />
          </button>
          <button
            onClick={() => handleDelete(row.client_id)}
            className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </button>
        </div>
      )
    }
  ]

  return (
    <div>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
      <DataTable
        title="API Clients"
        subtitle="Manage external API integrations and credentials"
        columns={columns}
        data={clients}
        loading={loading}
        onAdd={() => navigate('/admin/clients/new')}
        addButtonText="Add Client"
        exportFileName="api-clients"
      />
    </div>
  )
}
