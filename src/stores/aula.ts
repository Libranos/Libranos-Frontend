import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getAulasByModulo, createAula, updateAula, deleteAula } from '@/services/aulaService'
import type { Aula, AulaRequest } from '@/interfaces/aula'

export const useAulaStore = defineStore('aula', () => {
  const aulasByModulo = ref<Record<number, Aula[]>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const tituloRules = [(v: string) => !!v || 'Título é obrigatório']
  const ordemRules  = [(v: number) => v >= 1 || 'Ordem deve ser positiva']

  async function fetchAulas(moduloId: number) {
    isLoading.value = true
    error.value = null
    try {
      aulasByModulo.value[moduloId] = await getAulasByModulo(moduloId)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Erro ao carregar aulas'
    } finally {
      isLoading.value = false
    }
  }

  async function criar(dto: AulaRequest) {
    isLoading.value = true
    error.value = null
    try {
      const nova = await createAula(dto)
      const lista = aulasByModulo.value[dto.moduloId] ?? []
      aulasByModulo.value[dto.moduloId] = [...lista, nova].sort((a, b) => a.ordem - b.ordem)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Erro ao criar aula'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function atualizar(id: number, dto: AulaRequest) {
    isLoading.value = true
    error.value = null
    try {
      const atualizada = await updateAula(id, dto)
      const lista = aulasByModulo.value[dto.moduloId] ?? []
      aulasByModulo.value[dto.moduloId] = lista
        .map(a => (a.id === id ? atualizada : a))
        .sort((a, b) => a.ordem - b.ordem)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Erro ao atualizar aula'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function remover(id: number, moduloId: number) {
    isLoading.value = true
    error.value = null
    try {
      await deleteAula(id)
      aulasByModulo.value[moduloId] = (aulasByModulo.value[moduloId] ?? []).filter(a => a.id !== id)
    } catch (e: any) {
      error.value = e?.response?.data?.message ?? 'Erro ao remover aula'
    } finally {
      isLoading.value = false
    }
  }

  return { aulasByModulo, isLoading, error, fetchAulas, criar, atualizar, remover, tituloRules, ordemRules }
})
