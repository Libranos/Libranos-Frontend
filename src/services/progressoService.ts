import { apiClient } from '@/utils/api'
import type { ProgressoResponse, ProgressoModuloResponse } from '@/interfaces/progresso'

export async function concluirAula(aulaId: number): Promise<ProgressoResponse> {
  const { data } = await apiClient.post<ProgressoResponse>(`/api/progresso/aulas/${aulaId}/concluir`)
  return data
}

export async function getProgressoModulo(moduloId: number): Promise<ProgressoModuloResponse> {
  const { data } = await apiClient.get<ProgressoModuloResponse>(`/api/progresso/modulos/${moduloId}`)
  return data
}
