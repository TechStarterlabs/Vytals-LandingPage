import { Navigate } from "react-router-dom"
import { authService } from "@/lib/auth"
import { usePermissions } from "@/contexts/PermissionContext"

export default function ProtectedRoute({ children }) {
  const { canView } = usePermissions()

  if (!authService.isAuthenticated()) {
    return <Navigate to="/admin/login" replace />
  }

  return children
}

// Helper function to get first accessible route
export function getFirstAccessibleRoute() {
  const permissions = authService.getPermissions()
  
  // Define routes in priority order
  const routes = [
    { path: '/admin/dashboard', permission: 'dashboard.view' },
    { path: '/admin/products', permission: 'products.view' },
    { path: '/admin/batches', permission: 'batches.view' },
    { path: '/admin/serials', permission: 'serials.view' },
    { path: '/admin/coa', permission: 'coa.view' },
    { path: '/admin/scan-logs', permission: 'scan_logs.view' },
    { path: '/admin/integration-logs', permission: 'integration_logs.view' },
    { path: '/admin/customers', permission: 'customers.view' },
    { path: '/admin/users', permission: 'users.view' },
    { path: '/admin/roles', permission: 'roles.view' },
    { path: '/admin/rewards', permission: 'rewards.view' }
  ]

  // Find first route user has access to
  for (const route of routes) {
    if (permissions.includes(route.permission)) {
      return route.path
    }
  }

  // Fallback to dashboard if no permissions found
  return '/admin/dashboard'
}
