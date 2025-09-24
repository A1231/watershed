import axios from 'axios'

// Use environment variable for API base URL, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/watershed_api'

// Debug: Log the API base URL being used
console.log('API Base URL:', API_BASE_URL)
console.log('Environment variable:', import.meta.env.VITE_API_BASE_URL)

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 100000000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`Making API request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`API response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('Response error:', error.response?.data || error.message)
    return Promise.reject(error)
  }
)

export const watershedAPI = {
  // Get watershed by HUC code
  getWatershedByHUC: async (hucCode) => {
    try {
      const response = await api.get(`/watershed/huc/${hucCode}/`)
      return response.data
    } catch (error) {
      throw new Error(error.response?.data?.error || 'Failed to get watershed by HUC')
    }
  },

  // Get watersheds in basin
  getWatershedsInBasin: async (basinName) => {
    try {
      const response = await api.get(`/watersheds/basin/${basinName}/`)
      return response.data
    } catch (error) {
        console.log('Error:', error)
      console.log('Response error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to get watersheds in basin')
    }
  },

  // Get watersheds by HUC-12 name
  getWatershedsByHu12Name: async (hu12Name) => {
    try {
      const response = await api.get(`/watersheds/hu12name/${hu12Name}/`)
      return response.data
    } catch (error) {
      console.log('Error:', error)
      console.log('Response error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to get watersheds by HUC-12 name')
    }
  },

  // Autocomplete functions
  autocompleteBasinNames: async (query) => {
    try {
      const response = await api.get(`/autocomplete/basin/?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.log('Error:', error)
      console.log('Response error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to get basin autocomplete suggestions')
    }
  },

  autocompleteHu12Names: async (query) => {
    try {
      const response = await api.get(`/autocomplete/hu12name/?q=${encodeURIComponent(query)}`)
      return response.data
    } catch (error) {
      console.log('Error:', error)
      console.log('Response error:', error.response?.data || error.message)
      throw new Error(error.response?.data?.error || 'Failed to get HUC-12 name autocomplete suggestions')
    }
  }
}

export default api
