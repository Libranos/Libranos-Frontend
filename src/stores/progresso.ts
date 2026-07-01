import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { concluirAula, getProgressoModulo } from '@/services/progressoService'
import type { ProgressoModuloResponse } from '@/interfaces/progresso'

export interface RespostasAula {
  selecionadas: Record<number, number | null>
  confirmadas:  Record<number, boolean>
  acertadas:    Record<number, boolean>
  concluida:    boolean
}

interface ProgressoStorage {
  aulasConcluidas: number[]
  respostas: Record<number, RespostasAula>
}

function storageKey(userEmail: string) {
  return `libranos_progresso_${userEmail}`
}

export const useProgressoStore = defineStore('progresso', () => {
  const userEmail       = ref<string | null>(null)
  const aulasConcluidas = ref<Set<number>>(new Set())
  const respostasPorAula = ref<Record<number, RespostasAula>>({})
  const progressoModulo  = ref<ProgressoModuloResponse | null>(null)
  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  function carregar() {
    if (!userEmail.value) return
    try {
      const raw = localStorage.getItem(storageKey(userEmail.value))
      if (!raw) return
      const dados: ProgressoStorage = JSON.parse(raw)
      aulasConcluidas.value  = new Set(dados.aulasConcluidas ?? [])
      respostasPorAula.value = dados.respostas ?? {}
    } catch { /* ignora JSON corrompido */ }
  }

  function salvar() {
    if (!userEmail.value) return
    try {
      localStorage.setItem(storageKey(userEmail.value), JSON.stringify({
        aulasConcluidas: [...aulasConcluidas.value],
        respostas: respostasPorAula.value,
      }))
    } catch { /* ignora falha de quota */ }
  }

  function inicializar(email: string) {
    userEmail.value = email
    carregar()
  }

  function limpar() {
    userEmail.value        = null
    aulasConcluidas.value  = new Set()
    respostasPorAula.value = {}
    progressoModulo.value  = null
  }

  function jaConcluidou(aulaId: number): boolean {
    return aulasConcluidas.value.has(aulaId)
  }

  function getRespostasAula(aulaId: number): RespostasAula {
    if (!respostasPorAula.value[aulaId]) {
      respostasPorAula.value[aulaId] = { selecionadas: {}, confirmadas: {}, acertadas: {}, concluida: false }
    }
    return respostasPorAula.value[aulaId]
  }

  function selecionarResposta(aulaId: number, atividadeId: number, alternativaIndex: number) {
    const estado = getRespostasAula(aulaId)
    if (estado.confirmadas[atividadeId]) return
    estado.selecionadas = { ...estado.selecionadas, [atividadeId]: alternativaIndex }
    salvar()
  }

  async function confirmarTodas(aulaId: number, atividades: any[]) {
    const estado = getRespostasAula(aulaId)
    for (const atividade of atividades) {
      const selecionada = estado.selecionadas[atividade.id]
      if (selecionada === null || selecionada === undefined) continue
      const acertou = !!atividade.alternativas[selecionada]?.correta
      estado.confirmadas = { ...estado.confirmadas, [atividade.id]: true }
      estado.acertadas   = { ...estado.acertadas,   [atividade.id]: acertou }
    }
    salvar()
    await marcarConcluida(aulaId)
  }

  async function marcarConcluida(aulaId: number): Promise<void> {
    if (jaConcluidou(aulaId)) return
    isLoading.value = true
    error.value     = null
    try {
      await concluirAula(aulaId)
      aulasConcluidas.value.add(aulaId)
      getRespostasAula(aulaId).concluida = true
      salvar()
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 409) {
        aulasConcluidas.value.add(aulaId)
        getRespostasAula(aulaId).concluida = true
        salvar()
        return
      }
      error.value = 'Não foi possível salvar o progresso.'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchProgressoModulo(moduloId: number): Promise<void> {
    try {
      progressoModulo.value = await getProgressoModulo(moduloId)
    } catch {
      progressoModulo.value = null
    }
  }

  return {
    userEmail, aulasConcluidas, respostasPorAula, progressoModulo, isLoading, error,
    inicializar, limpar,
    jaConcluidou, getRespostasAula,
    selecionarResposta, confirmarTodas, marcarConcluida, fetchProgressoModulo,
  }
})
