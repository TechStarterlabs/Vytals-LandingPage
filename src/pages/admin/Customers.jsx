import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, RotateCcw } from "lucide-react"
import DataTable from "@/components/DataTable"
import ConfirmDialog from "@/components/ConfirmDialog"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { useConfirm } from "@/hooks/use-confirm"
import { usePermissions } from "@/contexts/PermissionContext"

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    fetchCustomers()
  }, [showDeleted])

  const fetchCustomers = async () => {
    try {
      const response = await apiClient.get('/admin/customers', {
        params: { 
          limit: 100,
          include_deleted: showDeleted 
        }
      })
      setCustomers(response.data.users || [])
    } catch (error) {
      console.error('Failed to fetch customers:', error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (customer) => {
    navigate(`/admin/customers/${customer.user_id}/edit`)
  }

  const handleView = (customer) => {
    navigate(`/admin/customers/${customer.user_id}`)
  }

  const handleRestore = async (customerId) => {
    const confirmed = await confirm({
      title: "Restore Customer",
      message: "Are you sure you want to restore this customer?",
      confirmText: "Restore",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.post(`/admin/users/${customerId}/restore`)
      toast({
        title: "Success",
        description: "Customer restored successfully",
        variant: "success"
      })
      fetchCustomers()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore customer",
        variant: "destructive"
      })
    }
  }

  const handleDelete = async (customerId) => {
    const confirmed = await confirm({
      title: "Delete Customer",
      message: "Are you sure you want to delete this customer?",
      confirmText: "Delete",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.delete(`/admin/users/${customerId}`)
      setCustomers(customers.filter(c => c.user_id !== customerId))
      toast({
        title: "Success",
        description: "Customer deleted successfully",
        variant: "success"
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete customer",
        variant: "destructive"
      })
    }
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "MOBILE",
      cell: (row) => row.mobile_number
    },
    {
      header: "EMAIL",
      cell: (row) => row.email || "-"
    },
    {
      header: "POINTS",
      cell: (row) => (
        <span className="text-sm font-medium text-gray-900">
          {row.points_balance || 0}
        </span>
      )
    },
    {
      header: "SCANS",
      cell: (row) => (
        <span className="text-sm text-gray-600">
          {row.scan_count || 0}
        </span>
      )
    },
    {
      header: "STATUS",
      cell: (row) => (
        <div className="flex flex-col gap-1">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
            row.is_active 
              ? "bg-green-100 text-green-800" 
              : "bg-red-100 text-red-800"
          }`}>
            {row.is_active ? "Active" : "Inactive"}
          </span>
          {row.deleted_at && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-gray-100 text-gray-800">
              Deleted
            </span>
          )}
        </div>
      )
    },
    {
      header: "LAST LOGIN",
      cell: (row) => {
        if (!row.last_login_at) return "-"
        const date = new Date(row.last_login_at)
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        })
      }
    },
    {
      header: "CREATED",
      cell: (row) => {
        if (!row.created_at) return "-"
        const date = new Date(row.created_at)
        return date.toLocaleDateString('en-GB', { 
          day: '2-digit', 
          month: '2-digit', 
          year: '2-digit' 
        })
      }
    },
    {
      header: "ACTIONS",
      cell: (row) => (
        <div className="flex items-center gap-2">
          {!row.deleted_at ? (
            <>
              <button
                onClick={() => handleView(row)}
                className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                title="View"
              >
                <Eye className="h-4 w-4 text-gray-600" />
              </button>
              {canUpdate('customers') && (
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              )}
              {canDelete('customers') && (
                <button
                  onClick={() => handleDelete(row.user_id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </button>
              )}
            </>
          ) : (
            <>
              {canDelete('customers') && (
                <button
                  onClick={() => handleRestore(row.user_id)}
                  className="p-1.5 hover:bg-green-50 rounded-lg transition-colors"
                  title="Restore"
                >
                  <RotateCcw className="h-4 w-4 text-green-600" />
                </button>
              )}
              <span className="text-xs text-red-600 font-medium">Deleted</span>
            </>
          )}
        </div>
      )
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <ConfirmDialog
        isOpen={isOpen}
        onClose={handleCancel}
        onConfirm={handleConfirm}
        {...config}
      />
      <DataTable
        title="Customers"
        subtitle="Manage all customers in the system"
        columns={columns}
        data={customers}
        onAdd={canCreate('customers') ? () => navigate('/admin/customers/new') : undefined}
        addButtonText="Add Customer"
        exportFileName="customers"
        customHeaderActions={canDelete('customers') ? (
          <button
            onClick={() => setShowDeleted(!showDeleted)}
            className={`px-4 py-2 rounded-lg border transition-colors ${
              showDeleted 
                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' 
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {showDeleted ? 'Hide Deleted' : 'Show Deleted'}
          </button>
        ) : undefined}
      />
    </div>
  )
}
