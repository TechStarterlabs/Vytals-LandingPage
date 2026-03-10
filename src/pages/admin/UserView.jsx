import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Edit2, Trash2, User, Mail, Phone, Shield, Calendar, Clock } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { useConfirm } from "@/hooks/use-confirm"
import AdminSkeleton from "@/components/skeletons/AdminSkeleton"

export default function UserView() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const { confirm } = useConfirm()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [id])

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/admin/users/${id}`)
      setUser(response.data.user)
    } catch (error) {
      console.error("Error fetching user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch user details",
        variant: "destructive"
      })
      navigate("/admin/users")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    const confirmed = await confirm({
      title: "Delete User",
      description: `Are you sure you want to delete "${user.name}"? This action cannot be undone.`
    })

    if (!confirmed) return

    try {
      await apiClient.delete(`/admin/users/${id}`)
      toast({
        title: "Success",
        description: "User deleted successfully"
      })
      navigate("/admin/users")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return <AdminSkeleton />
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">User not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/admin/users")}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">User Details</h1>
            <p className="text-sm text-gray-500 mt-1">View admin user information</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/admin/users/${id}/edit`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#338291] text-white rounded-lg hover:bg-[#2a6d7a] transition-colors"
          >
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>

      {/* User Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start gap-4 mb-6">
          <div className="h-16 w-16 rounded-full bg-[#338291] flex items-center justify-center flex-shrink-0">
            <User className="h-8 w-8 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
                user.is_active 
                  ? "bg-green-100 text-green-800" 
                  : "bg-red-100 text-red-800"
              }`}>
                {user.is_active ? "Active" : "Inactive"}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                {user.role?.name || "No Role"}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Mail className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Email Address</label>
              <p className="text-gray-900 mt-1">{user.email || "N/A"}</p>
            </div>
          </div>

          {/* Mobile */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Phone className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Mobile Number</label>
              <p className="text-gray-900 mt-1">{user.mobile_number || "N/A"}</p>
            </div>
          </div>

          {/* Role */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Shield className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Role</label>
              <p className="text-gray-900 mt-1">{user.role?.name || "No Role"}</p>
            </div>
          </div>

          {/* Status */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <User className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Account Status</label>
              <p className="text-gray-900 mt-1">{user.is_active ? "Active" : "Inactive"}</p>
            </div>
          </div>

          {/* Created At */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Calendar className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Created At</label>
              <p className="text-gray-900 mt-1">{formatDate(user.created_at)}</p>
            </div>
          </div>

          {/* Last Login */}
          <div className="flex items-start gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <label className="text-sm text-gray-500">Last Login</label>
              <p className="text-gray-900 mt-1">{formatDate(user.last_login_at)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role Permissions Card */}
      {user.role && user.role.permissions && user.role.permissions.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Permissions</h3>
          <div className="flex flex-wrap gap-2">
            {user.role.permissions.map(permission => {
              const [module, action] = permission.name.split('.')
              const actionColors = {
                view: "bg-blue-100 text-blue-700",
                create: "bg-green-100 text-green-700",
                update: "bg-yellow-100 text-yellow-700",
                delete: "bg-red-100 text-red-700",
                manage: "bg-purple-100 text-purple-700"
              }
              const colorClass = actionColors[action] || "bg-gray-100 text-gray-700"
              
              return (
                <span
                  key={permission.permission_id}
                  className={`px-3 py-1 rounded-full text-sm ${colorClass}`}
                >
                  {permission.name}
                </span>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
