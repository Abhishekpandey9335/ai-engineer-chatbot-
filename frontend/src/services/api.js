import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
}

export const repoApi = {
  scan: (data) => api.post('/repositories/scan', data),
  getAll: () => api.get('/repositories'),
  getById: (id) => api.get(`/repositories/${id}`),
  delete: (id) => api.delete(`/repositories/${id}`),
}

export const aiApi = {
  review: (data) => api.post('/ai/review', data),
  getReports: (repoId) => api.get(`/ai/reports/${repoId}`),
  chat: (data) => api.post('/ai/chat', data),
  getChatHistory: (repoId) => api.get('/ai/chat/history', { params: { repositoryId: repoId } }),
}

export default api
