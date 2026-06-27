import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModuloStore } from '@/stores/modulo'
import { useAulaStore } from '@/stores/aula'
import { useAuthStore } from '@/stores/auth'
import { useAtividadeStore } from '@/stores/atividade'
import { getModuloById } from '@/services/moduleService'
import type { Aula } from '@/interfaces/aula'
import type { Modulo } from '@/interfaces/modulo'
import type { Atividade } from '@/interfaces/atividade'

// ── Tipos ─────────────────────────────────────────────────────────────────────

interface RespostasAula {
  selecionadas:  Record<number, number | null>  // atividadeId → índice da alternativa
  confirmadas:   Record<number, boolean>
  acertadas:     Record<number, boolean>
}

// ── Estado global do progresso (fora do composable, persiste entre re-renders) ─

const progressoPorAula = ref<Record<number, RespostasAula>>({})

function getRespostasAula(aulaId: number): RespostasAula {
  if (!progressoPorAula.value[aulaId]) {
    progressoPorAula.value[aulaId] = {
      selecionadas: {},
      confirmadas:  {},
      acertadas:    {},
    }
  }
  return progressoPorAula.value[aulaId]
}

// ─────────────────────────────────────────────────────────────────────────────

export function useModuloDetalhe() {
  const route = useRoute()
  const router = useRouter()
  const moduloStore = useModuloStore()
  const aulaStore = useAulaStore()
  const atividadeStore = useAtividadeStore()
  const authStore = useAuthStore()

  // ── Módulo ───────────────────────────────────────────────────────────────

  const moduloId = computed(() => Number(route.params.id || 0))
  const modulo = ref<Modulo | null>(null)
  const isLoadingModulo = ref(false)

  // ── Aulas ────────────────────────────────────────────────────────────────

  const aulas = computed(() =>
    (aulaStore.aulasByModulo[moduloId.value] ?? [])
      .slice()
      .sort((a, b) => a.ordem - b.ordem),
  )

  const aulaAtiva = ref<Aula | null>(null)
  const aulaIndex = computed(() => aulas.value.findIndex(a => a.id === aulaAtiva.value?.id))
  const aulaAnterior = computed(() => aulaIndex.value > 0 ? aulas.value[aulaIndex.value - 1] : null)
  const proximaAula  = computed(() => aulaIndex.value < aulas.value.length - 1 ? aulas.value[aulaIndex.value + 1] : null)
  const videoSrc     = computed(() => aulaAtiva.value?.videoUrl ?? null)

  // ── Atividades ───────────────────────────────────────────────────────────

  const atividades = computed(() =>
    aulaAtiva.value ? (atividadeStore.atividadesByAula[aulaAtiva.value.id] ?? []) : [],
  )

  // Respostas COMPUTADAS da aula ativa — lê do cache persistido
  const respostasSelecionadas = computed(() =>
    aulaAtiva.value ? getRespostasAula(aulaAtiva.value.id).selecionadas : {},
  )
  const respostasConfirmadas = computed(() =>
    aulaAtiva.value ? getRespostasAula(aulaAtiva.value.id).confirmadas : {},
  )
  const respostasAcertadas = computed(() =>
    aulaAtiva.value ? getRespostasAula(aulaAtiva.value.id).acertadas : {},
  )

  // ── Dialogs ──────────────────────────────────────────────────────────────

  const dialogAulaAberto     = ref(false)
  const aulaParaEditar       = ref<Aula | undefined>(undefined)

  const dialogAtividadeAberto = ref(false)
  const atividadeParaEditar   = ref<Atividade | undefined>(undefined)
  const proximaOrdemAtividade = computed(() =>
    atividades.value.length > 0
      ? Math.max(...atividades.value.map(a => a.ordem)) + 1
      : 1,
  )

  // ── Lifecycle ────────────────────────────────────────────────────────────

  onMounted(async () => {
    isLoadingModulo.value = true
    try {
      const found = moduloStore.modulos.find(m => m.id === moduloId.value)
      modulo.value = found ?? await getModuloById(moduloId.value)
    } catch {
      modulo.value = null
    } finally {
      isLoadingModulo.value = false
    }

    await aulaStore.fetchAulas(moduloId.value)
    if (aulas.value.length > 0 && !aulaAtiva.value) {
      aulaAtiva.value = aulas.value[0]
    }
  })

  watch(aulas, (lista) => {
    if (lista.length > 0 && !aulaAtiva.value) {
      aulaAtiva.value = lista[0]
    }
  })

  // Ao trocar de aula: carrega atividades MAS não limpa respostas — elas ficam no cache
  watch(aulaAtiva, async (aula) => {
    if (!aula) return
    await atividadeStore.fetchAtividades(aula.id)
  })

  // ── Ações — aulas ────────────────────────────────────────────────────────

  function selecionarAula(aula: Aula) {
    aulaAtiva.value = aula
  }

  function abrirCriacaoAula() {
    aulaParaEditar.value   = undefined
    dialogAulaAberto.value = true
  }

  function abrirEdicaoAula(aula: Aula) {
    aulaParaEditar.value   = aula
    dialogAulaAberto.value = true
  }

  async function removerAula(aulaId: number) {
    await aulaStore.remover(aulaId, moduloId.value)
    await aulaStore.fetchAulas(moduloId.value)
    if (aulaAtiva.value?.id === aulaId) {
      aulaAtiva.value = aulas.value[0] ?? null
    }
  }

  // ── Ações — atividades ───────────────────────────────────────────────────

  function abrirCriacaoAtividade() {
    atividadeParaEditar.value   = undefined
    dialogAtividadeAberto.value = true
  }

  function abrirEdicaoAtividade(atividade: Atividade) {
    atividadeParaEditar.value   = atividade
    dialogAtividadeAberto.value = true
  }

  async function removerAtividade(atividadeId: number) {
    if (!aulaAtiva.value) return
    await atividadeStore.remover(atividadeId, aulaAtiva.value.id)
  }

  // ── Ações — quiz ─────────────────────────────────────────────────────────

  function selecionarResposta(atividadeId: number, alternativaIndex: number) {
    if (!aulaAtiva.value) return
    const estado = getRespostasAula(aulaAtiva.value.id)
    // Não permite alterar após confirmar
    if (estado.confirmadas[atividadeId]) return
    estado.selecionadas = { ...estado.selecionadas, [atividadeId]: alternativaIndex }
  }

  // Confirma TODAS as respostas da aula de uma vez
  function confirmarTodas() {
    if (!aulaAtiva.value) return
    const estado = getRespostasAula(aulaAtiva.value.id)

    for (const atividade of atividades.value) {
      const selecionada = estado.selecionadas[atividade.id]
      if (selecionada === null || selecionada === undefined) continue

      const acertou = !!atividade.alternativas[selecionada]?.correta
      estado.confirmadas = { ...estado.confirmadas, [atividade.id]: true }
      estado.acertadas   = { ...estado.acertadas,   [atividade.id]: acertou }
    }
  }

  // ── Navegação ────────────────────────────────────────────────────────────

  function voltar() {
    router.push({ name: 'modulos' })
  }

  return {
    // dados
    moduloId, modulo, isLoadingModulo,
    aulas, aulaAtiva, aulaAnterior, proximaAula, videoSrc,
    atividades,
    // quiz (computados do cache)
    respostasSelecionadas, respostasConfirmadas, respostasAcertadas,
    // dialogs
    dialogAulaAberto, aulaParaEditar,
    dialogAtividadeAberto, atividadeParaEditar, proximaOrdemAtividade,
    // stores
    aulaStore, authStore, atividadeStore,
    // ações aula
    selecionarAula, abrirCriacaoAula, abrirEdicaoAula, removerAula,
    // ações atividade
    abrirCriacaoAtividade, abrirEdicaoAtividade, removerAtividade,
    // ações quiz
    selecionarResposta, confirmarTodas,
    // nav
    voltar,
  }
}
