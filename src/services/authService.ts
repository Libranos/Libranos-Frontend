import { apiClient } from '@/utils/api'
import type { LoginCredentials, LoginResponse } from '@/interfaces/auth'

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', credentials)
  return data
}
