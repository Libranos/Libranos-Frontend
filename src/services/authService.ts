import { apiClient } from '@/utils/api'
import type { LoginCredentials, LoginResponse, RegisterRequest } from '@/interfaces/auth'
import type { User } from '@/interfaces/auth'

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
  return data
}

export async function registerUser(dto: RegisterRequest): Promise<void> {
  await apiClient.post('/auth/signup', dto)
}
