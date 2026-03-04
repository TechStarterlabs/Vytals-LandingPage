const TOKEN_KEY = 'admin_token'
const USER_KEY = 'admin_user'

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
  }
}
