import { useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { usePermissions } from "@/contexts/PermissionContext"
import { useToast } from "@/hooks/use-toast"
import { getFirstAccessibleRoute } from "@/utils/permissions"

/**
 * Component to protect routes based on permissions
 * Redirects to first accessible page if user doesn't have required permission
 */
export default function PermissionRoute({ 
  children, 
  permission, 
  fallbackPath = "/admin/dashboard" 
}) {
  const { hasPermission, permissions, isLoading } = usePermissions()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  useEffect(() => {
    // Don't check permissions while still loading
    if (isLoading) return

    if (permission && !hasPermission(permission)) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive"
      })
      
      // Try to go back to previous page first
      if (window.history.length > 1 && window.history.state) {
        navigate(-1)
        return
      }
      
      // Find first accessible page
      const route = getFirstAccessibleRoute(hasPermission)
      
      // Only redirect to login if absolutely no permissions exist
      if (permissions.length === 0) {
        navigate('/admin/login', { replace: true })
      } else {
        navigate(route, { replace: true })
      }
    }
  }, [permission, hasPermission, navigate, toast, location, permissions, isLoading])

  // Show loading while permissions are being loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  // If no permission required or user has permission, render children
  if (!permission || hasPermission(permission)) {
    return children
  }

  // Show loading while redirecting
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-gray-500">Checking permissions...</div>
    </div>
  )
}