import axios from 'axios'
import { getAuthToken } from '@/utils/cookies'

export const apiClient = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const token = getAuthToken()
  const isPublicRoute =
    config.url?.includes('/auth/login') ||
    config.url?.includes('/auth/signup')

  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
