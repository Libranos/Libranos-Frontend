import { apiClient } from '@/utils/api'
import type { Atividade, AtividadeRequest } from '@/interfaces/atividade'

export async function getAtividadesByAula(aulaId: number): Promise<Atividade[]> {
  const { data } = await apiClient.get<Atividade[]>(`/api/atividades/aula/${aulaId}`)
  return data
}

export async function createAtividade(dto: AtividadeRequest): Promise<Atividade> {
  const { data } = await apiClient.post<Atividade>('/api/atividades', dto)
  return data
}

export async function updateAtividade(id: number, dto: AtividadeRequest): Promise<Atividade> {
  const { data } = await apiClient.put<Atividade>(`/api/atividades/${id}`, dto)
  return data
}

export async function deleteAtividade(id: number): Promise<void> {
  await apiClient.delete(`/api/atividades/${id}`)
}
