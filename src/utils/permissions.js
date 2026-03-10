/**
 * Utility functions for permission-based routing and access control
 */

/**
 * Get the first accessible route for a user based on their permissions
 * @param {Function} hasPermission - Function to check if user has a permission
 * @returns {string} - First accessible route path
 */
export const getFirstAccessibleRoute = (hasPermission) => {
  const routes = [
    { path: "/admin/dashboard", permission: "dashboard.view" },
    { path: "/admin/products", permission: "products.view" },
    { path: "/admin/batches", permission: "batches.view" },
    { path: "/admin/serials", permission: "serials.view" },
    { path: "/admin/coa", permission: "coa.view" },
    { path: "/admin/scan-logs", permission: "scan_logs.view" },
    { path: "/admin/integration-logs", permission: "integration_logs.view" },
    { path: "/admin/customers", permission: "customers.view" },
    { path: "/admin/users", permission: "users.view" },
    { path: "/admin/roles", permission: "roles.view" },
    { path: "/admin/rewards", permission: "rewards.view" }
  ]

  for (const route of routes) {
    if (hasPermission(route.permission)) {
      return route.path
    }
  }

  // If no accessible route found, return dashboard as fallback
  // This should not happen in normal circumstances since users need at least one permission
  return "/admin/dashboard"
}

/**
 * Permission mappings for different page types
 */
export const PAGE_PERMISSIONS = {
  // Products
  'products-list': 'products.view',
  'products-view': 'products.view', 
  'products-create': 'products.create',
  'products-edit': 'products.update',
  
  // Batches
  'batches-list': 'batches.view',
  'batches-view': 'batches.view',
  'batches-create': 'batches.create', 
  'batches-edit': 'batches.update',
  
  // Serial Numbers
  'serials-list': 'serials.view',
  'serials-view': 'serials.view',
  'serials-create': 'serials.create',
  'serials-edit': 'serials.update',
  
  // COA
  'coa-list': 'coa.view',
  'coa-view': 'coa.view',
  'coa-create': 'coa.create',
  'coa-edit': 'coa.update',
  
  // Users
  'users-list': 'users.view',
  'users-view': 'users.view',
  'users-create': 'users.create',
  'users-edit': 'users.update',
  
  // Roles
  'roles-list': 'roles.view',
  'roles-view': 'roles.view',
  'roles-create': 'roles.create',
  'roles-edit': 'roles.update',
  
  // Customers
  'customers-list': 'customers.view',
  'customers-view': 'customers.view',
  'customers-create': 'customers.create',
  'customers-edit': 'customers.update',
  
  // Rewards
  'rewards-list': 'rewards.view',
  'rewards-view': 'rewards.view',
  'rewards-create': 'rewards.create',
  'rewards-edit': 'rewards.update',
  
  // View-only pages
  'dashboard': 'dashboard.view',
  'scan-logs': 'scan_logs.view',
  'integration-logs': 'integration_logs.view'
}

/**
 * Get required permission for a page
 * @param {string} pageType - Type of page (e.g., 'products-create')
 * @returns {string} - Required permission
 */
export const getPagePermission = (pageType) => {
  return PAGE_PERMISSIONS[pageType]
}