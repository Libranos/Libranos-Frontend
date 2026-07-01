import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { getModulos, createModulo, updateModulo, deleteModulo } from '@/services/moduleService'
import type { Modulo, ModuloRequest } from '@/interfaces/modulo'

export const useModuloStore = defineStore('modulo', () => {
  const modulos   = ref<Modulo[]>([])
  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  const ativos   = computed(() => [...modulos.value].filter(m => m.ativo).sort((a, b) => a.ordem - b.ordem))
  const destaque = computed(() => ativos.value[0] ?? null)
  const proximos = computed(() => ativos.value.slice(1))

  const tituloRules = [(v: string) => !!v || 'Título é obrigatório']
  const ordemRules  = [
    (v: number | null) => v !== null || 'Ordem é obrigatória',
    (v: number) => v > 0 || 'Ordem deve ser maior que zero',
  ]

  async function fetchModulos(): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      modulos.value = await getModulos()
    } catch (err) {
      error.value = isAxiosError(err) ? 'Erro ao carregar módulos.' : 'Erro inesperado.'
    } finally {
      isLoading.value = false
    }
  }

  async function criar(dto: ModuloRequest): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      modulos.value.push(await createModulo(dto))
    } catch (err) {
      error.value = isAxiosError(err) && err.response?.status === 403
        ? 'Apenas professores podem criar módulos.'
        : 'Erro ao criar módulo.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function atualizar(id: number, dto: ModuloRequest): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const atualizado = await updateModulo(id, dto)
      const idx = modulos.value.findIndex(m => m.id === id)
      if (idx !== -1) modulos.value[idx] = atualizado
    } catch (err) {
      error.value = 'Erro ao atualizar módulo.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function remover(id: number): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      await deleteModulo(id)
      modulos.value = modulos.value.filter(m => m.id !== id)
    } catch (err) {
      error.value = 'Erro ao remover módulo.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    modulos, isLoading, error,
    ativos, destaque, proximos,
    tituloRules, ordemRules,
    fetchModulos, criar, atualizar, remover,
  }
})
