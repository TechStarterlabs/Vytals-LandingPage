const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'
const PERMISSIONS_KEY = 'admin_permissions'

export const authService = {
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem(PERMISSIONS_KEY)
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY)
  },

  setUser: (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  },

  getUser: () => {
    const user = localStorage.getItem(USER_KEY)
    return user ? JSON.parse(user) : null
  },

  setPermissions: (permissions) => {
    localStorage.setItem(PERMISSIONS_KEY, JSON.stringify(permissions))
    // Dispatch custom event to notify components
    window.dispatchEvent(new Event('permissionsUpdated'))
  },

  getPermissions: () => {
    const permissions = localStorage.getItem(PERMISSIONS_KEY)
    return permissions ? JSON.parse(permissions) : []
  },

  hasPermission: (permission) => {
    const permissions = authService.getPermissions()
    return permissions.includes(permission)
  },

  hasAnyPermission: (permissionList) => {
    const permissions = authService.getPermissions()
    return permissionList.some(p => permissions.includes(p))
  }
}
