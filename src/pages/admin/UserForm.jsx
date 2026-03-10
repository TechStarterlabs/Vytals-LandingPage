import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, User } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Loader from "@/components/Loader"

export default function UserForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEditMode = Boolean(id)

  const [loading, setLoading] = useState(isEditMode)
  const [submitting, setSubmitting] = useState(false)
  const [roles, setRoles] = useState([])
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    role_id: "",
    password: "",
    is_active: true
  })

  useEffect(() => {
    fetchRoles()
    if (isEditMode) {
      fetchUser()
    }
  }, [id])

  const fetchRoles = async () => {
    try {
      const response = await apiClient.get('/admin/roles')
      // Filter to show only admin roles (exclude user/customer role)
      const adminRoles = (response.data.roles || []).filter(
        role => role.name !== 'user'
      )
      setRoles(adminRoles)
    } catch (error) {
      console.error("Error fetching roles:", error)
      toast({
        title: "Error",
        description: "Failed to load roles",
        variant: "destructive"
      })
    }
  }

  const fetchUser = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/admin/users/${id}`)
      const user = response.data.user
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile_number: user.mobile_number || "",
        role_id: String(user.role_id || ""),
        password: "", // Don't populate password
        is_active: user.is_active
      })
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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Name is required",
        variant: "destructive"
      })
      return
    }

    if (!formData.email.trim()) {
      toast({
        title: "Validation Error",
        description: "Email is required",
        variant: "destructive"
      })
      return
    }

    if (!formData.mobile_number.trim()) {
      toast({
        title: "Validation Error",
        description: "Mobile number is required",
        variant: "destructive"
      })
      return
    }

    if (!formData.role_id) {
      toast({
        title: "Validation Error",
        description: "Role is required",
        variant: "destructive"
      })
      return
    }

    if (!isEditMode && !formData.password.trim()) {
      toast({
        title: "Validation Error",
        description: "Password is required for new users",
        variant: "destructive"
      })
      return
    }

    try {
      setSubmitting(true)
      
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        mobile_number: formData.mobile_number.trim(),
        role_id: parseInt(formData.role_id, 10),
        is_active: formData.is_active
      }

      // Only include password if provided
      if (formData.password.trim()) {
        payload.password = formData.password
      }

      if (isEditMode) {
        await apiClient.put(`/admin/users/${id}`, payload)
        toast({
          title: "Success",
          description: "User updated successfully"
        })
      } else {
        await apiClient.post('/admin/users', payload)
        toast({
          title: "Success",
          description: "User created successfully"
        })
      }

      navigate("/admin/users")
    } catch (error) {
      console.error("Error saving user:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <Loader />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin/users")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {isEditMode ? "Edit User" : "Add New User"}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {isEditMode ? "Update user information" : "Create a new admin user"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#338291] focus:border-transparent"
              placeholder="Enter full name"
              required
            />
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#338291] focus:border-transparent"
              placeholder="user@example.com"
              required
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              id="mobile_number"
              name="mobile_number"
              value={formData.mobile_number}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#338291] focus:border-transparent"
              placeholder="1234567890"
              required
            />
          </div>

          {/* Role */}
          <div>
            <label htmlFor="role_id" className="block text-sm font-medium text-gray-700 mb-2">
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role_id"
              name="role_id"
              value={formData.role_id}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#338291] focus:border-transparent"
              required
            >
              <option value="">Select a role</option>
              {roles.map(role => (
                <option key={role.role_id} value={role.role_id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password {!isEditMode && <span className="text-red-500">*</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#338291] focus:border-transparent"
              placeholder={isEditMode ? "Leave blank to keep current password" : "Enter password"}
              required={!isEditMode}
            />
            {isEditMode && (
              <p className="text-sm text-gray-500 mt-1">
                Leave blank to keep the current password
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-[#338291] border-gray-300 rounded focus:ring-[#338291]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active User
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2 bg-[#338291] text-white rounded-lg hover:bg-[#2a6d7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {submitting ? "Saving..." : isEditMode ? "Update User" : "Create User"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
