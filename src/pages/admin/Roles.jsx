import { useEffect, useState } from "react"
import { Eye, Edit, Trash2, Shield, RotateCcw } from "lucide-react"
import DataTable from "@/components/DataTable"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useNavigate } from "react-router-dom"
import { usePermissions } from "@/contexts/PermissionContext"
import { useConfirm } from "@/hooks/use-confirm"
import ConfirmDialog from "@/components/ConfirmDialog"

export default function Roles() {
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [showDeleted, setShowDeleted] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()
  const { canCreate, canUpdate, canDelete } = usePermissions()
  const { confirm, isOpen, config, handleConfirm, handleCancel } = useConfirm()

  useEffect(() => {
    fetchRoles()
  }, [showDeleted])

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/admin/roles', {
        params: { include_deleted: showDeleted }
      })
      // Filter out user/customer role from the list (superadmin already filtered by backend)
      const filteredRoles = (response.data.roles || []).filter(
        role => role.name !== 'user'
      )
      setRoles(filteredRoles)
    } catch (error) {
      console.error('Failed to fetch roles:', error)
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleView = (role) => {
    navigate(`/admin/roles/${role.role_id}`)
  }

  const handleEdit = (role) => {
    navigate(`/admin/roles/${role.role_id}/edit`)
  }

  const handleDelete = async (roleId, roleName) => {
    const confirmed = await confirm({
      title: "Delete Role",
      message: "Are you sure you want to delete this role? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.delete(`/admin/roles/${roleId}`)
      toast({
        title: "Success",
        description: "Role deleted successfully",
        variant: "success"
      })
      fetchRoles()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete role. It may have assigned users.",
        variant: "destructive"
      })
    }
  }

  const handleRestore = async (roleId) => {
    const confirmed = await confirm({
      title: "Restore Role",
      message: "Are you sure you want to restore this role?",
      confirmText: "Restore",
      cancelText: "Cancel"
    })
    
    if (!confirmed) return
    
    try {
      await apiClient.post(`/admin/roles/${roleId}/restore`)
      toast({
        title: "Success",
        description: "Role restored successfully",
        variant: "success"
      })
      fetchRoles()
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to restore role",
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
      header: "ROLE NAME",
      cell: (row) => (
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-[#338291]" />
          <span className="text-gray-900">{row.name}</span>
        </div>
      )
    },
    {
      header: "DESCRIPTION",
      cell: (row) => (
        <span className="text-gray-600">{row.description || '-'}</span>
      )
    },
    {
      header: "PERMISSIONS",
      cell: (row) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800">
          {row.permissions?.length || 0} permissions
        </span>
      )
    },
    {
      header: "USERS",
      cell: (row) => (
        <span className="text-gray-900">{row.user_count || 0}</span>
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
              {canUpdate('roles') && (
                <button
                  onClick={() => handleEdit(row)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Edit"
                  disabled={row.name === 'user'}
                >
                  <Edit className={`h-4 w-4 ${row.name === 'user' ? 'text-gray-300' : 'text-gray-600'}`} />
                </button>
              )}
              {canDelete('roles') && (
                <button
                  onClick={() => handleDelete(row.role_id, row.name)}
                  className="p-1.5 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete"
                  disabled={row.name === 'user'}
                >
                  <Trash2 className={`h-4 w-4 ${row.name === 'user' ? 'text-gray-300' : 'text-red-600'}`} />
                </button>
              )}
            </>
          ) : (
            <>
              {canDelete('roles') && (
                <button
                  onClick={() => handleRestore(row.role_id)}
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
        title="Roles & Permissions"
        subtitle="Manage user roles and their permissions"
        columns={columns}
        data={roles}
        onAdd={canCreate('roles') ? () => navigate('/admin/roles/new') : undefined}
        addButtonText="Add Role"
        exportFileName="roles"
        customHeaderActions={canDelete('roles') ? (
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
