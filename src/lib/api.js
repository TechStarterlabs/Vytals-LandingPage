import { authService } from './auth'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1'

class ApiClient {
  async request(endpoint, options = {}) {
    const token = options.customToken || authService.getToken()
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

    const response = await fetch(`${API_URL}${endpoint}`, config)
    const data = await response.json()

    if (!response.ok) {
      // Only redirect to login for admin routes with 401 errors
      if (response.status === 401 && isAdminRoute) {
        authService.removeToken()
        window.location.href = '/admin/login'
      }
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  get(endpoint, customToken = null) {
    return this.request(endpoint, { method: 'GET', customToken })
  }

  post(endpoint, data, customToken = null) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      customToken,
    })
  }

  put(endpoint, data, customToken = null) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      customToken,
    })
  }

  delete(endpoint, customToken = null) {
    return this.request(endpoint, { method: 'DELETE', customToken })
  }
}

export const apiClient = new ApiClient()

// Verification API Service (Public - No Auth Required)
export const verificationApi = {
  // Verify product with serial number only
  async verifyProduct(serialNumber) {
    return apiClient.post('/verify/product', { serial_number: serialNumber })
  },

  // Send OTP for verification
  async sendOTP(mobileNumber, serialNumber) {
    return apiClient.post('/auth/send-otp', { 
      mobile_number: mobileNumber, 
      serial_number: serialNumber 
    })
  },

  // Verify OTP and complete verification
  async verifyOTP(mobileNumber, otp, serialNumber) {
    return apiClient.post('/auth/verify-otp', { 
      mobile_number: mobileNumber, 
      otp, 
      serial_number: serialNumber 
    })
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

// Rewards API Service
export const rewardsApi = {
  // Redeem reward
  async redeemReward(rewardId) {
    return apiClient.post('/rewards/redeem', { reward_id: rewardId })
  }
}
