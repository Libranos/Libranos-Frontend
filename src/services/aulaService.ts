import { apiClient } from '@/utils/api'
import type { Aula, AulaRequest } from '@/interfaces/aula'

export async function getAulasByModulo(moduloId: number): Promise<Aula[]> {
  const { data } = await apiClient.get<Aula[]>(`/api/aulas/modulo/${moduloId}`)
  return data
}

export async function createAula(dto: AulaRequest): Promise<Aula> {
  const { data } = await apiClient.post<Aula>('/api/aulas', dto)
  return data
}

export async function updateAula(id: number, dto: AulaRequest): Promise<Aula> {
  const { data } = await apiClient.put<Aula>(`/api/aulas/${id}`, dto)
  return data
}

export async function deleteAula(id: number): Promise<void> {
  await apiClient.delete(`/api/aulas/${id}`)
}
