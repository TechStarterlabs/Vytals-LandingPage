const TOKEN_KEY = 'admin_token'

export const authService = {
  setToken: (token) => {
    localStorage.setItem(TOKEN_KEY, token)
  },

  getToken: () => {
    return localStorage.getItem(TOKEN_KEY)
  },

  removeToken: () => {
    localStorage.removeItem(TOKEN_KEY)
  },

  isAuthenticated: () => {
    return !!localStorage.getItem(TOKEN_KEY)
  }
}
