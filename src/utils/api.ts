import axios from 'axios'
import { getAuthToken } from '@/utils/cookies'

// Instância compartilhada por todos os services da aplicação.
// baseURL vazia: em dev o proxy Vite encaminha /auth e /api para :8005.
export const apiClient = axios.create({
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
})

// Injeta o JWT em toda requisição autenticada automaticamente
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