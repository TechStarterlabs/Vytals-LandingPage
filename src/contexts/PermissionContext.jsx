import { createContext, useContext, useState, useEffect } from "react"
import { authService } from "@/lib/auth"

const PermissionContext = createContext()

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export function PermissionProvider({ children }) {
  const [permissions, setPermissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchPermissions = async () => {
    try {
      const token = authService.getToken()
      if (!token) {
        setPermissions([])
        setIsLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired, clear auth and redirect to login
          authService.removeToken()
          window.location.href = '/admin/login'
          return
        }
        throw new Error('Failed to fetch permissions')
      }

      const data = await response.json()
      
      if (data.success && data.data.role?.permissions) {
        const permissionNames = data.data.role.permissions.map(p => p.name)
        setPermissions(permissionNames)
        setError(null)
      } else {
        setPermissions([])
      }
    } catch (err) {
      console.error('Permission fetch error:', err)
      setError(err.message)
      setPermissions([])
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch permissions on mount and when token changes
  useEffect(() => {
    fetchPermissions()
  }, [])

  // Refresh permissions function
  const refreshPermissions = () => {
    setIsLoading(true)
    fetchPermissions()
  }

  const hasPermission = (permission) => {
    return permissions.includes(permission)
  }

  const hasAnyPermission = (permissionList) => {
    return permissionList.some(p => permissions.includes(p))
  }

  const hasAllPermissions = (permissionList) => {
    return permissionList.every(p => permissions.includes(p))
  }

  const canView = (module) => {
    return hasPermission(`${module}.view`)
  }

  const canCreate = (module) => {
    return hasPermission(`${module}.create`)
  }

  const canUpdate = (module) => {
    return hasPermission(`${module}.update`)
  }

  const canDelete = (module) => {
    return hasPermission(`${module}.delete`)
  }

  const value = {
    permissions,
    isLoading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canUpdate,
    canDelete,
    refreshPermissions
  }

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionProvider')
  }
  return context
}