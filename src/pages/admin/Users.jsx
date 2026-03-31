import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, X, RotateCcw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"
import DataTable from "@/components/DataTable"
import { useNavigate } from "react-router-dom"
import { useConfirm } from "@/hooks/use-confirm"
import ConfirmDialog from "@/components/ConfirmDialog"
import { usePermissions } from "@/contexts/PermissionContext"

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()
  const { canCreate, canUpdate, canDelete } = usePermissions()

  useEffect(() => {
    fetchUsers()
  }, [showDeleted])

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get('/admin/users', {
        params: { include_deleted: showDeleted }
      })
      setUsers(data.data.users)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleView = (user) => {
    navigate(`/admin/users/${user.user_id}`)
  }

  const handleEdit = (user) => {
    navigate(`/admin/users/${user.user_id}/edit`)
  }

  const handleDelete = async (userId) => {
    const confirmed = await confirm({
      title: "Delete User",
      message: "Are you sure you want to delete this user?",
      confirmText: "Delete",
      cancelText: "Cancel"
    })

    if (!confirmed) return

    try {
      await apiClient.delete(`/admin/users/${userId}`)
      toast({
        title: "Success",
        description: "User deleted successfully!",
        variant: "success",
      })
      fetchUsers()
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleRestore = async (userId) => {
    const confirmed = await confirm({
      title: "Restore User",
      message: "Are you sure you want to restore this user?",
      confirmText: "Restore",
      cancelText: "Cancel"
    })

    if (!confirmed) return

    try {
      await apiClient.post(`/admin/users/${userId}/restore`)
      toast({
        title: "Success",
        description: "User restored successfully!",
        variant: "success",
      })
      fetchUsers()
    } catch (err) {
      toast({
        title: "Error",
        description: err.message || "Failed to restore user",
        variant: "destructive",
      })
    }
  }

  const columns = [
    {
      header: "#",
      cell: (row, index) => index + 1
    },
    {
      header: "NAME",
      cell: (row) => [row.first_name, row.last_name].filter(Boolean).join(" ") || "-"
    },
    {
      header: "EMAIL",
      cell: (row) => row.email || "-"
    },
    {
      header: "MOBILE",
      accessor: "mobile_number"
    },
    {
      header: "ROLE",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
          {row.role?.name || "No Role"}
        </span>
      )
    },
    {
      header: "STATUS",
      cell: (row) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs ${
          row.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
        }`}>
          {row.is_active ? "Active" : "Inactive"}
        </span>
      )
    },
    {
      header: "CREATED",
      cell: (row) => {
        if (!row.created_at) return "-"
        const date = new Date(row.created_at)
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })
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
              {canUpdate('users') && (
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="h-4 w-4 text-gray-600" />
                </button>
              )}
              {canDelete('users') && (
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
              {canDelete('users') && (
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
        title="Admin Users"
        subtitle="Manage all admin users in the system"
        columns={columns}
        data={users}
        onAdd={canCreate('users') ? () => navigate('/admin/users/new') : undefined}
        addButtonText="Add User"
        exportFileName="admin-users"
        customHeaderActions={canDelete('users') ? (
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
