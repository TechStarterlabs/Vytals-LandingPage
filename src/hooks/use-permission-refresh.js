import { useCallback } from "react"
import { authService } from "@/lib/auth"
import { useToast } from "@/hooks/use-toast"

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

/**
 * Hook to refresh user permissions without logout
 */
export function usePermissionRefresh() {
  const { toast } = useToast()

  const refreshPermissions = useCallback(async () => {
    try {
      const token = authService.getToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_URL}/admin/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      const data = await response.json()
      
      if (data.success && data.data.role?.permissions) {
        // Extract permission names and update stored permissions
        const permissionNames = data.data.role.permissions.map(p => p.name)
        authService.setPermissions(permissionNames)
        
        // Also update user info
        authService.setUser({
          user_id: data.data.user_id,
          name: data.data.name,
          email: data.data.email,
          role: data.data.role.name
        })
        
        toast({
          title: "Success",
          description: "Permissions updated successfully",
          variant: "success"
        })
        
        return permissionNames
      } else {
        throw new Error('Failed to fetch permissions')
      }
    } catch (error) {
      console.error('Permission refresh error:', error)
      toast({
        title: "Error",
        description: "Failed to refresh permissions",
        variant: "destructive"
      })
      return null
    }
  }, [toast])

  return { refreshPermissions }
}