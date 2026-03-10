import { useState, useEffect } from "react"
import { authService } from "@/lib/auth"

/**
 * Hook to check user permissions
 */
export function usePermissions() {
  const [permissions, setPermissions] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Load permissions from localStorage
    const loadedPermissions = authService.getPermissions()
    setPermissions(loadedPermissions)
    setIsLoading(false)

    // Listen for storage changes (in case permissions are updated)
    const handleStorageChange = () => {
      const updatedPermissions = authService.getPermissions()
      setPermissions(updatedPermissions)
    }

    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom event when permissions are set
    window.addEventListener('permissionsUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('permissionsUpdated', handleStorageChange)
    }
  }, [])

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
    const permission = `${module}.create`
    const result = permissions.includes(permission)
    console.log(`canCreate(${module}): checking ${permission} in`, permissions, '=', result)
    return result
  }

  const canUpdate = (module) => {
    return hasPermission(`${module}.update`)
  }

  const canDelete = (module) => {
    return hasPermission(`${module}.delete`)
  }

  return {
    permissions,
    isLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    canView,
    canCreate,
    canUpdate,
    canDelete
  }
}
