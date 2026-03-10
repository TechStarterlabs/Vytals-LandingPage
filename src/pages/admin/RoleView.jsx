import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Edit2, Trash2, Users, Shield } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import AdminSkeleton from "@/components/skeletons/AdminSkeleton"

export default function RoleView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [role, setRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRole()
  }, [id])

  const fetchRole = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/admin/roles/${id}`)
      if (response.success) {
        setRole(response.data.role)
      }
    } catch (error) {
      console.error("Error fetching role:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch role details",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete Role",
      description: `Are you sure you want to delete "${role.name}"? This action cannot be undone.`
    })

    if (!confirmed) return

    try {
      const response = await apiClient.delete(`/admin/roles/${id}`)
      if (response.success) {
        toast({
          title: "Success",
          description: "Role deleted successfully"
        })
        navigate("/admin/roles")
      }
    } catch (error) {
      console.error("Error deleting role:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete role",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return <AdminSkeleton />
  }

  if (!role) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Role not found</p>
      </div>
    )
  }

  // Group permissions by module
  const groupedPermissions = {}
  role.permissions?.forEach(permission => {
    const [module, action] = permission.name.split('.')
    if (!groupedPermissions[module]) {
      groupedPermissions[module] = {
        module_name: module,
        module_label: module.charAt(0).toUpperCase() + module.slice(1).replace(/_/g, ' '),
        permissions: []
      }
    }
    groupedPermissions[module].permissions.push({
      ...permission,
      action
    })
  })

  const modules = Object.values(groupedPermissions).sort((a, b) => 
    a.module_label.localeCompare(b.module_label)
  )

  const canDelete = role.name !== 'superadmin' && role.name !== 'user'
  const canEdit = role.name !== 'user'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/roles")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Role Details</h1>
            <p className="text-sm text-gray-500 mt-1">View role information and permissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          {canEdit && (
            <button
              onClick={() => navigate(`/admin/roles/${id}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-[#338291] text-white rounded-lg hover:bg-[#2a6d7a] transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-500">Role Name</label>
            <p className="text-lg font-medium text-gray-900 mt-1">{role.name}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Description</label>
            <p className="text-lg text-gray-900 mt-1">{role.description || "No description"}</p>
          </div>
          <div>
            <label className="text-sm text-gray-500">Users Assigned</label>
            <div className="flex items-center gap-2 mt-1">
              <Users className="w-5 h-5 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">{role.user_count || 0}</p>
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-500">Permissions</label>
            <div className="flex items-center gap-2 mt-1">
              <Shield className="w-5 h-5 text-gray-400" />
              <p className="text-lg font-medium text-gray-900">{role.permissions?.length || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assigned Permissions</h2>
        
        {modules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No permissions assigned</p>
        ) : (
          <div className="space-y-6">
            {modules.map(module => (
              <div key={module.module_name} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-3">{module.module_label}</h3>
                <div className="flex flex-wrap gap-2">
                  {module.permissions.map(permission => {
                    const actionColors = {
                      view: "bg-blue-100 text-blue-700",
                      create: "bg-green-100 text-green-700",
                      update: "bg-yellow-100 text-yellow-700",
                      delete: "bg-red-100 text-red-700",
                      manage: "bg-purple-100 text-purple-700",
                      export: "bg-indigo-100 text-indigo-700"
                    }
                    const colorClass = actionColors[permission.action] || "bg-gray-100 text-gray-700"
                    
                    return (
                      <span
                        key={permission.permission_id}
                        className={`px-3 py-1 rounded-full text-sm ${colorClass}`}
                      >
                        {permission.action}
                      </span>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {!canDelete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            {role.name === 'superadmin' 
              ? "The superadmin role cannot be deleted as it's a system role."
              : "The user role cannot be deleted as it's the default customer role."}
          </p>
        </div>
      )}

      {!canEdit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            The user role cannot be edited as it's the default customer role.
          </p>
        </div>
      )}
    </div>
  )
}
