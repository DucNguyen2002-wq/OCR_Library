import axios from 'axios'

const api = axios.create({
  baseURL: '/api'
})

// Attach token on each request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Simple 401 handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // Clear auth and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('currentUser')
      if (location.pathname !== '/login') {
        location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
