import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getAtividadesByAula, createAtividade, updateAtividade, deleteAtividade } from '@/services/atividadeService'
import type { Atividade, AtividadeRequest } from '@/interfaces/atividade'

export const useAtividadeStore = defineStore('atividade', () => {
  const atividadesByAula = ref<Record<number, Atividade[]>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const tituloRules = [(v: string) => !!v || 'Título é obrigatório']
  const ordemRules  = [(v: number) => v >= 1 || 'Ordem deve ser positiva']

  async function fetchAtividades(aulaId: number) {
    isLoading.value = true
    error.value = null
    try {
      atividadesByAula.value[aulaId] = await getAtividadesByAula(aulaId)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Erro ao carregar atividades'
    } finally {
      isLoading.value = false
    }
  }

  async function criar(dto: AtividadeRequest) {
    isLoading.value = true
    error.value = null
    try {
      const nova = await createAtividade(dto)
      const lista = atividadesByAula.value[dto.aulaId] ?? []
      atividadesByAula.value[dto.aulaId] = [...lista, nova].sort((a, b) => a.ordem - b.ordem)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Erro ao criar atividade'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function atualizar(id: number, dto: AtividadeRequest) {
    isLoading.value = true
    error.value = null
    try {
      const atualizada = await updateAtividade(id, dto)
      const lista = atividadesByAula.value[dto.aulaId] ?? []
      atividadesByAula.value[dto.aulaId] = lista
        .map(a => (a.id === id ? atualizada : a))
        .sort((a, b) => a.ordem - b.ordem)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Erro ao atualizar atividade'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function remover(id: number, aulaId: number) {
    isLoading.value = true
    error.value = null
    try {
      await deleteAtividade(id)
      atividadesByAula.value[aulaId] = (atividadesByAula.value[aulaId] ?? []).filter(a => a.id !== id)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Erro ao remover atividade'
    } finally {
      isLoading.value = false
    }
  }

  return { atividadesByAula, isLoading, error, fetchAtividades, criar, atualizar, remover, tituloRules, ordemRules }
})
