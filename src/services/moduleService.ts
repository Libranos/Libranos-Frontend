import { apiClient } from '@/utils/api'
import type { Modulo, ModuloRequest } from '@/interfaces/modulo'

export async function getModulos(): Promise<Modulo[]> {
  const { data } = await apiClient.get<Modulo[]>('/api/modulos')
  return data
}

export async function createModulo(dto: ModuloRequest): Promise<Modulo> {
  const { data } = await apiClient.post<Modulo>('/api/modulos', dto)
  return data
}

export async function updateModulo(id: number, dto: ModuloRequest): Promise<Modulo> {
  const { data } = await apiClient.put<Modulo>(`/api/modulos/${id}`, dto)
  return data
}

export async function deleteModulo(id: number): Promise<void> {
  await apiClient.delete(`/api/modulos/${id}`)
}
