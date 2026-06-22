import axios from 'axios'
import { getToken } from '../services/auth-storage'
import { PYTHON_API_BASE_URL } from './python-base-url'

export const apiClient = axios.create({
  baseURL: PYTHON_API_BASE_URL,
  timeout: 30000,
})

apiClient.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error)
  },
)
