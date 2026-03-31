import { authService } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

class ApiClient {
  async request(endpoint, options = {}) {
    // Use customToken if provided (including null), otherwise fall back to authService
    const token = options.hasOwnProperty('customToken') ? options.customToken : authService.getToken()
    const isAdminRoute = endpoint.startsWith('/admin')
    
    const config = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    }

    // Remove customToken from config as it's not a valid fetch option
    delete config.customToken

    try {
      const response = await fetch(`${API_URL}${endpoint}`, config)
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type')
      if (!contentType || !contentType.includes('application/json')) {
        console.error('Non-JSON response received:', response.status, response.statusText)
        throw new Error('Server returned non-JSON response')
      }
      
      const data = await response.json()

      if (!response.ok) {
        // Only redirect to login for admin routes with 401 errors AND valid error response
        if (response.status === 401 && isAdminRoute && data.message) {
          authService.removeToken()
          window.location.href = '/admin/login'
        }
        throw new Error(data.message || `Request failed with status ${response.status}`)
      }

      return data
    } catch (error) {
      // Network errors or JSON parse errors - don't logout
      if (error.message === 'Failed to fetch') {
        console.error('Network error - server may be down')
        throw new Error('Network error. Please check if the server is running.')
      }
      if (error.name === 'SyntaxError') {
        console.error('JSON parse error - server returned invalid JSON')
        throw new Error('Server error. Please try again later.')
      }
      throw error
    }
  }

  get(endpoint, options = {}) {
    // Handle query parameters
    if (options.params) {
      const queryParams = new URLSearchParams()
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value)
        }
      })
      const queryString = queryParams.toString()
      if (queryString) {
        endpoint += (endpoint.includes('?') ? '&' : '?') + queryString
      }
    }
    
    const requestOptions = { method: 'GET' }
    // Only pass customToken if it was explicitly provided
    if (options.hasOwnProperty('customToken')) {
      requestOptions.customToken = options.customToken
    }
    
    return this.request(endpoint, requestOptions)
  }

  post(endpoint, data, options = {}) {
    const requestOptions = {
      method: 'POST',
      body: JSON.stringify(data),
      ...(options.headers && { headers: options.headers }),
    }
    if (options.hasOwnProperty('customToken')) {
      requestOptions.customToken = options.customToken
    }
    return this.request(endpoint, requestOptions)
  }

  put(endpoint, data, options = {}) {
    const requestOptions = {
      method: 'PUT',
      body: JSON.stringify(data),
    }
    // Only pass customToken if it was explicitly provided
    if (options.hasOwnProperty('customToken')) {
      requestOptions.customToken = options.customToken
    }
    
    return this.request(endpoint, requestOptions)
  }

  delete(endpoint, options = {}) {
    const requestOptions = { method: 'DELETE' }
    // Only pass customToken if it was explicitly provided
    if (options.hasOwnProperty('customToken')) {
      requestOptions.customToken = options.customToken
    }
    
    return this.request(endpoint, requestOptions)
  }
}

export const apiClient = new ApiClient()

// Verification API Service (Public - No Auth Required)
export const verificationApi = {
  // Get public products list (products with slugs)
  async getProducts() {
    return apiClient.get('/verify/products', { customToken: null })
  },

  // Verify batch (Batch_Flow) with batch_code and product_slug
  async verifyBatch(batchCode, productSlug, sessionId = null) {
    const userToken = localStorage.getItem('vytals-user-token')
    const headers = {}
    if (userToken) headers['Authorization'] = `Bearer ${userToken}`
    if (sessionId) headers['X-Session-Id'] = sessionId

    return apiClient.request('/verify/batch', {
      method: 'POST',
      body: JSON.stringify({ batch_code: batchCode, product_slug: productSlug }),
      headers,
      customToken: userToken || null,
    })
  },

  // Verify product with serial number only
  async verifyProduct(serialNumber) {
    // Get user token from localStorage if available
    const userToken = localStorage.getItem('vytals-user-token')
    
    return apiClient.request('/verify/product', {
      method: 'POST',
      body: JSON.stringify({ serial_number: serialNumber }),
      headers: userToken ? { Authorization: `Bearer ${userToken}` } : {},
      customToken: userToken || null // Explicitly pass null to prevent admin token fallback
    })
  },

  // Send OTP for verification
  async sendOTP(mobileNumber, serialNumber, batchCode = null) {
    const body = { mobile_number: mobileNumber }
    if (batchCode) {
      body.batch_code = batchCode
    } else {
      body.serial_number = serialNumber
    }
    return apiClient.post('/auth/send-otp', body)
  },

  // Verify OTP and complete verification
  async verifyOTP(mobileNumber, otp, serialNumber, firstName, lastName, batchCode = null, sessionId = null) {
    const body = {
      mobile_number: mobileNumber,
      otp,
      ...(batchCode ? { batch_code: batchCode } : { serial_number: serialNumber }),
      ...(firstName && { first_name: firstName }),
      ...(lastName && { last_name: lastName }),
    }
    const headers = {}
    if (sessionId) headers['X-Session-Id'] = sessionId
    return apiClient.post('/auth/verify-otp', body, { headers })
  },

  // Get COA for batch (requires customer token from verify-otp)
  async getCOA(batchCode, customerToken) {
    return apiClient.get(`/coa/${batchCode}`, customerToken)
  },

  // Email COA certificate (requires customer token from verify-otp)
  async emailCOA(email, batchCode, customerToken) {
    return apiClient.post('/coa/email', { email, batch_code: batchCode }, customerToken)
  }
}

// User API Service
export const userApi = {
  // Get user profile
  async getProfile() {
    return apiClient.get('/user/profile')
  },

  // Get user rewards
  async getRewards() {
    return apiClient.get('/user/rewards')
  },

  // Get scan history
  async getScans(page = 1, limit = 10) {
    return apiClient.get(`/user/scans?page=${page}&limit=${limit}`)
  }
}

// Admin Shopify API
export const shopifyApi = {
  async getCustomerOrders(customerId) {
    return apiClient.get(`/admin/customers/${customerId}/shopify-orders`)
  }
}

// Rewards API Service
export const rewardsApi = {
  // Redeem reward
  async redeemReward(rewardId) {
    return apiClient.post('/rewards/redeem', { reward_id: rewardId })
  }
}
