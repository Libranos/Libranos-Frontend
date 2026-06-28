import { apiClient } from '@/utils/api'
import type { ProgressoResponse, ProgressoModuloResponse } from '@/interfaces/progresso'

// Marca uma aula como concluída — POST /api/progresso/aulas/{aulaId}/concluir
export async function concluirAula(aulaId: number): Promise<ProgressoResponse> {
  const { data } = await apiClient.post<ProgressoResponse>(`/api/progresso/aulas/${aulaId}/concluir`)
  return data
}

// Retorna percentual de conclusão do módulo — GET /api/progresso/modulos/{moduloId}
export async function getProgressoModulo(moduloId: number): Promise<ProgressoModuloResponse> {
  const { data } = await apiClient.get<ProgressoModuloResponse>(`/api/progresso/modulos/${moduloId}`)
  return data
}
