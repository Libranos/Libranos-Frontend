import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { concluirAula, getProgressoModulo } from '@/services/progressoService'
import type { ProgressoModuloResponse } from '@/interfaces/progresso'

export const useProgressoStore = defineStore('progresso', () => {

  // IDs de aulas já concluídas pelo aluno nesta sessão
  const aulasConcluidas = ref<Set<number>>(new Set())

  // Progresso do módulo atualmente aberto
  const progressoModulo = ref<ProgressoModuloResponse | null>(null)

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function jaConcluidou(aulaId: number): boolean {
    return aulasConcluidas.value.has(aulaId)
  }

  async function marcarConcluida(aulaId: number): Promise<void> {
    if (jaConcluidou(aulaId)) return  // evita chamada duplicada

    isLoading.value = true
    error.value = null
    try {
      await concluirAula(aulaId)
      aulasConcluidas.value.add(aulaId)
    } catch (err) {
      // 409 = já concluída no backend (ProgressoDuplicadoException) — tudo certo
      if (isAxiosError(err) && err.response?.status === 409) {
        aulasConcluidas.value.add(aulaId)
        return
      }
      error.value = 'Não foi possível salvar o progresso.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProgressoModulo(moduloId: number): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      progressoModulo.value = await getProgressoModulo(moduloId)
      // Marca localmente as aulas já concluídas que vierem do backend
    } catch {
      progressoModulo.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    aulasConcluidas,
    progressoModulo,
    isLoading,
    error,
    jaConcluidou,
    marcarConcluida,
    fetchProgressoModulo,
  }
})
