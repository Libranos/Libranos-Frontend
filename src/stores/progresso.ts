import { ref } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { concluirAula, getProgressoModulo } from '@/services/progressoService'
import type { ProgressoModuloResponse } from '@/interfaces/progresso'

// ── Chave do localStorage ─────────────────────────────────────────────────────
// Inclui o email do aluno pra não misturar dados entre contas diferentes
function storageKey(userEmail: string) {
  return `libranos_progresso_${userEmail}`
}

// ── Tipos ─────────────────────────────────────────────────────────────────────
export interface RespostasAula {
  selecionadas: Record<number, number | null>  // atividadeId → índice da alternativa
  confirmadas:  Record<number, boolean>
  acertadas:    Record<number, boolean>
  concluida:    boolean                        // aula marcada como concluída no backend
}

interface ProgressoStorage {
  aulasConcluidas: number[]                    // IDs persistidos
  respostas: Record<number, RespostasAula>     // aulaId → respostas
}

// ── Store ─────────────────────────────────────────────────────────────────────
export const useProgressoStore = defineStore('progresso', () => {

  // Email do aluno atual (definido no login)
  const userEmail = ref<string | null>(null)

  // Cache de aulas já concluídas (aulaId)
  const aulasConcluidas = ref<Set<number>>(new Set())

  // Respostas por aulaId — persiste entre trocas de aula e F5
  const respostasPorAula = ref<Record<number, RespostasAula>>({})

  // Progresso do módulo atual (percentual)
  const progressoModulo = ref<ProgressoModuloResponse | null>(null)

  const isLoading = ref(false)
  const error     = ref<string | null>(null)

  // ── Persistência ─────────────────────────────────────────────────────────

  function _carregar() {
    if (!userEmail.value) return
    try {
      const raw = localStorage.getItem(storageKey(userEmail.value))
      if (!raw) return
      const dados: ProgressoStorage = JSON.parse(raw)
      aulasConcluidas.value  = new Set(dados.aulasConcluidas ?? [])
      respostasPorAula.value = dados.respostas ?? {}
    } catch { /* ignora JSON corrompido */ }
  }

  function _salvar() {
    if (!userEmail.value) return
    try {
      const dados: ProgressoStorage = {
        aulasConcluidas: [...aulasConcluidas.value],
        respostas: respostasPorAula.value,
      }
      localStorage.setItem(storageKey(userEmail.value), JSON.stringify(dados))
    } catch { /* quota excedida — silencia */ }
  }

  // ── Inicialização ─────────────────────────────────────────────────────────

  // Chamado após login com o email do usuário
  function inicializar(email: string) {
    userEmail.value = email
    _carregar()
  }

  // Limpa ao fazer logout
  function limpar() {
    userEmail.value        = null
    aulasConcluidas.value  = new Set()
    respostasPorAula.value = {}
    progressoModulo.value  = null
  }

  // ── Getters ───────────────────────────────────────────────────────────────

  function jaConcluidou(aulaId: number): boolean {
    return aulasConcluidas.value.has(aulaId)
  }

  function getRespostasAula(aulaId: number): RespostasAula {
    if (!respostasPorAula.value[aulaId]) {
      respostasPorAula.value[aulaId] = {
        selecionadas: {},
        confirmadas:  {},
        acertadas:    {},
        concluida:    false,
      }
    }
    return respostasPorAula.value[aulaId]
  }

  // ── Ações de quiz ─────────────────────────────────────────────────────────

  function selecionarResposta(aulaId: number, atividadeId: number, alternativaIndex: number) {
    const estado = getRespostasAula(aulaId)
    if (estado.confirmadas[atividadeId]) return   // travado após confirmar
    estado.selecionadas = { ...estado.selecionadas, [atividadeId]: alternativaIndex }
    _salvar()
  }

  // Recebe a lista de atividades da aula pra calcular acertos
  async function confirmarTodas(aulaId: number, atividades: any[]) {
    const estado = getRespostasAula(aulaId)

    // Calcula acertos localmente
    for (const atividade of atividades) {
      const selecionada = estado.selecionadas[atividade.id]
      if (selecionada === null || selecionada === undefined) continue
      const acertou = !!atividade.alternativas[selecionada]?.correta
      estado.confirmadas = { ...estado.confirmadas, [atividade.id]: true }
      estado.acertadas   = { ...estado.acertadas,   [atividade.id]: acertou }
    }

    // Salva respostas no localStorage imediatamente
    _salvar()

    // Marca a aula como concluída no backend (independente de ter acertado tudo)
    await marcarConcluida(aulaId)
  }

  // ── Ação de progresso ─────────────────────────────────────────────────────

  async function marcarConcluida(aulaId: number): Promise<void> {
    if (jaConcluidou(aulaId)) return   // já marcada, sem chamada duplicada

    isLoading.value = true
    error.value     = null
    try {
      await concluirAula(aulaId)
      aulasConcluidas.value.add(aulaId)
      const estado = getRespostasAula(aulaId)
      estado.concluida = true
      _salvar()
    } catch (err) {
      // 409 = ProgressoDuplicadoException — a aula já estava concluída no banco
      if (isAxiosError(err) && err.response?.status === 409) {
        aulasConcluidas.value.add(aulaId)
        getRespostasAula(aulaId).concluida = true
        _salvar()
        return
      }
      error.value = 'Não foi possível salvar o progresso.'
    } finally {
      isLoading.value = false
    }
  }

  // Busca progresso do módulo no backend (percentual de conclusão)
  async function fetchProgressoModulo(moduloId: number): Promise<void> {
    try {
      progressoModulo.value = await getProgressoModulo(moduloId)
    } catch {
      progressoModulo.value = null
    }
  }

  return {
    userEmail,
    aulasConcluidas,
    respostasPorAula,
    progressoModulo,
    isLoading,
    error,
    // init
    inicializar,
    limpar,
    // getters
    jaConcluidou,
    getRespostasAula,
    // ações
    selecionarResposta,
    confirmarTodas,
    marcarConcluida,
    fetchProgressoModulo,
  }
})
