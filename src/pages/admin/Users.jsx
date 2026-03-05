import { useEffect, useState } from "react"
import { Plus, Pencil, Trash2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile_number: "",
    role_id: "",
    password: ""
  })
  const [error, setError] = useState("")

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      const data = await apiClient.get('/admin/users')
      setUsers(data.data.users)
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await apiClient.get('/admin/roles')
      setRoles(data.data.roles)
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        name: user.name || "",
        email: user.email || "",
        mobile_number: user.mobile_number || "",
        role_id: user.role_id || "",
        password: ""
      })
    } else {
      setEditingUser(null)
      setFormData({
        name: "",
        email: "",
        mobile_number: "",
        role_id: "",
        password: ""
      })
    }
    setError("")
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setError("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      if (editingUser) {
        await apiClient.put(`/admin/users/${editingUser.user_id}`, {
          name: formData.name,
          email: formData.email,
          role_id: parseInt(formData.role_id)
        })
        toast({
          title: "Success",
          description: "User updated successfully!",
          variant: "success",
        })
      } else {
        await apiClient.post('/admin/users', {
          ...formData,
          role_id: parseInt(formData.role_id)
        })
        toast({
          title: "Success",
          description: "User created successfully!",
          variant: "success",
        })
      }
      
      fetchUsers()
      handleCloseModal()
    } catch (err) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      })
      setError(err.message)
    }
  }

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return

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

  if (loading) {
    return <div className="text-center">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <Button onClick={() => handleOpenModal()} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/20 bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium">Name</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Mobile</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {users.map((user) => (
                <tr key={user.user_id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-sm">{user.name || '-'}</td>
                  <td className="px-4 py-3 text-sm">{user.email || '-'}</td>
                  <td className="px-4 py-3 text-sm">{user.mobile_number}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs">
                      {user.role?.name || 'No Role'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className={`rounded-full px-2 py-1 text-xs ${
                      user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(user)}
                        className="rounded p-1 hover:bg-muted"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.user_id)}
                        className="rounded p-1 text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button onClick={handleCloseModal} className="rounded p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium">Mobile Number</label>
                  <input
                    type="tel"
                    value={formData.mobile_number}
                    onChange={(e) => setFormData({ ...formData, mobile_number: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    placeholder="+919876543210"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium">Role</label>
                <select
                  value={formData.role_id}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value })}
                  className="mt-1 w-full rounded-md border px-3 py-2"
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role.role_id} value={role.role_id}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-sm font-medium">Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    minLength={6}
                    required
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Minimum 6 characters required
                  </p>
                </div>
              )}

              {error && (
                <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={handleCloseModal} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingUser ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
