import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { ArrowLeft, Save, Shield, Check } from "lucide-react"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import Loader from "@/components/Loader"

export default function RoleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const isEdit = Boolean(id)

  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [permissions, setPermissions] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    permission_ids: []
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchPermissions()
    if (isEdit) {
      fetchRole()
    }
  }, [id])

  const fetchPermissions = async () => {
    try {
      const response = await apiClient.get('/admin/permissions')
      setPermissions(response.data.grouped || [])
    } catch (error) {
      console.error('Failed to fetch permissions:', error)
      toast({
        title: "Error",
        description: "Failed to load permissions",
        variant: "destructive"
      })
    }
  }

  const fetchRole = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get(`/admin/roles/${id}`)
      const role = response.data.role
      
      setFormData({
        name: role.name,
        description: role.description || '',
        permission_ids: role.permissions?.map(p => p.permission_id) || []
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load role",
        variant: "destructive"
      })
      navigate('/admin/roles')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validation
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = 'Role name is required'
    if (formData.permission_ids.length === 0) newErrors.permissions = 'At least one permission is required'
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      setSaving(true)
      
      if (isEdit) {
        await apiClient.put(`/admin/roles/${id}`, formData)
        toast({
          title: "Success",
          description: "Role updated successfully",
          variant: "success"
        })
      } else {
        await apiClient.post('/admin/roles', formData)
        toast({
          title: "Success",
          description: "Role created successfully",
          variant: "success"
        })
      }
      
      navigate('/admin/roles')
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || `Failed to ${isEdit ? 'update' : 'create'} role`,
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const togglePermission = (permissionId) => {
    const permission = permissions
      .flatMap(m => m.permissions)
      .find(p => p.permission_id === permissionId)
    
    if (!permission) return

    const module = permissions.find(m => 
      m.permissions.some(p => p.permission_id === permissionId)
    )
    
    const isCurrentlySelected = formData.permission_ids.includes(permissionId)
    
    setFormData(prev => {
      let newPermissionIds = [...prev.permission_ids]
      
      if (isCurrentlySelected) {
        // If deselecting, remove this permission
        newPermissionIds = newPermissionIds.filter(id => id !== permissionId)
        
        // If this is a view permission and other permissions exist in the module, prevent deselection
        if (permission.action === 'view') {
          const otherModulePermissions = module.permissions
            .filter(p => p.action !== 'view' && newPermissionIds.includes(p.permission_id))
          
          if (otherModulePermissions.length > 0) {
            // Don't allow deselecting view if other permissions are selected
            return prev
          }
        }
      } else {
        // If selecting, add this permission
        newPermissionIds.push(permissionId)
        
        // If selecting any non-view permission, automatically select view permission
        if (permission.action !== 'view') {
          const viewPermission = module.permissions.find(p => p.action === 'view')
          if (viewPermission && !newPermissionIds.includes(viewPermission.permission_id)) {
            newPermissionIds.push(viewPermission.permission_id)
          }
        }
      }
      
      return {
        ...prev,
        permission_ids: newPermissionIds
      }
    })
    
    setErrors(prev => ({ ...prev, permissions: '' }))
  }

  const toggleModule = (module) => {
    const modulePermissionIds = module.permissions.map(p => p.permission_id)
    const allSelected = modulePermissionIds.every(id => formData.permission_ids.includes(id))
    
    if (allSelected) {
      // Deselect all permissions in the module
      setFormData(prev => ({
        ...prev,
        permission_ids: prev.permission_ids.filter(id => !modulePermissionIds.includes(id))
      }))
    } else {
      // Select all permissions in the module (view will be included automatically)
      setFormData(prev => ({
        ...prev,
        permission_ids: [...new Set([...prev.permission_ids, ...modulePermissionIds])]
      }))
    }
    
    setErrors(prev => ({ ...prev, permissions: '' }))
  }

  const selectAll = () => {
    const allPermissionIds = permissions.flatMap(m => m.permissions.map(p => p.permission_id))
    setFormData(prev => ({ ...prev, permission_ids: allPermissionIds }))
    setErrors(prev => ({ ...prev, permissions: '' }))
  }

  const deselectAll = () => {
    setFormData(prev => ({ ...prev, permission_ids: [] }))
  }

  if (loading) {
    return <Loader />
  }

  const isModuleFullySelected = (module) => {
    return module.permissions.every(p => formData.permission_ids.includes(p.permission_id))
  }

  const isModulePartiallySelected = (module) => {
    const selected = module.permissions.filter(p => formData.permission_ids.includes(p.permission_id))
    return selected.length > 0 && selected.length < module.permissions.length
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/admin/roles')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl text-gray-900">{isEdit ? 'Edit Role' : 'Create New Role'}</h1>
            <p className="text-sm text-gray-500 mt-1">Define role and assign permissions</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-[#338291]" />
            <h2 className="text-lg text-gray-900">Role Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value })
                  setErrors({ ...errors, name: '' })
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#338291] ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., Manager, Supervisor"
                disabled={isEdit && formData.name === 'superadmin'}
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#338291]"
                placeholder="Brief description of this role"
              />
            </div>
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg text-gray-900">Permissions</h2>
              <p className="text-sm text-gray-500 mt-1">
                View permission is automatically selected when other permissions are chosen for a module
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={selectAll}
                className="px-3 py-1.5 text-sm text-[#338291] border border-[#338291] rounded-lg hover:bg-[#338291] hover:text-white transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={deselectAll}
                className="px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          {errors.permissions && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.permissions}</p>
            </div>
          )}

          <div className="space-y-4">
            {permissions.map((module) => {
              const fullySelected = isModuleFullySelected(module)
              const partiallySelected = isModulePartiallySelected(module)

              return (
                <div key={module.module_name} className="border border-gray-200 rounded-lg overflow-hidden">
                  {/* Module Header */}
                  <div
                    className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => toggleModule(module)}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-5 w-5 border-2 rounded flex items-center justify-center transition-colors ${
                        fullySelected 
                          ? 'bg-[#338291] border-[#338291]' 
                          : partiallySelected
                          ? 'bg-gray-300 border-gray-300'
                          : 'border-gray-300'
                      }`}>
                        {(fullySelected || partiallySelected) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="text-gray-900">{module.module_label}</span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {module.permissions.filter(p => formData.permission_ids.includes(p.permission_id)).length} / {module.permissions.length} selected
                    </span>
                  </div>

                  {/* Permissions Grid */}
                  <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {module.permissions
                      .sort((a, b) => {
                        // Sort so 'view' comes first, then alphabetically
                        if (a.action === 'view') return -1
                        if (b.action === 'view') return 1
                        return a.action.localeCompare(b.action)
                      })
                      .map((permission) => {
                        const isSelected = formData.permission_ids.includes(permission.permission_id)
                        const actionColors = {
                          view: 'text-blue-700 bg-blue-50 border-blue-200',
                          create: 'text-green-700 bg-green-50 border-green-200',
                          update: 'text-yellow-700 bg-yellow-50 border-yellow-200',
                          delete: 'text-red-700 bg-red-50 border-red-200'
                        }

                        // Check if this is a view permission and other permissions in module are selected
                        const isViewPermission = permission.action === 'view'
                        const otherModulePermissionsSelected = module.permissions
                          .filter(p => p.action !== 'view')
                          .some(p => formData.permission_ids.includes(p.permission_id))
                        const isViewRequired = isViewPermission && otherModulePermissionsSelected

                        return (
                          <button
                            key={permission.permission_id}
                            type="button"
                            onClick={() => togglePermission(permission.permission_id)}
                            disabled={isViewRequired}
                            className={`px-3 py-2 border-2 rounded-lg text-sm transition-all ${
                              isSelected
                                ? actionColors[permission.action] || 'text-gray-700 bg-gray-50 border-gray-300'
                                : 'text-gray-600 bg-white border-gray-200 hover:border-gray-300'
                            } ${isViewRequired ? 'opacity-75 cursor-not-allowed' : ''}`}
                            title={isViewRequired ? 'View permission is required when other permissions are selected' : ''}
                          >
                            <div className="flex items-center gap-2">
                              <div className={`h-4 w-4 border-2 rounded flex items-center justify-center ${
                                isSelected ? 'bg-current border-current' : 'border-gray-300'
                              }`}>
                                {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                              </div>
                              <span className="capitalize">{permission.action}</span>
                              {isViewRequired && (
                                <span className="text-xs text-gray-500">(required)</span>
                              )}
                            </div>
                          </button>
                        )
                      })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/admin/roles')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-[#338291] text-white rounded-lg hover:bg-[#2a6d7a] transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? 'Saving...' : isEdit ? 'Update Role' : 'Create Role'}
          </button>
        </div>
      </form>
    </div>
  )
}
