import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModuloStore } from '@/stores/modulo'
import { useAulaStore } from '@/stores/aula'
import { useAuthStore } from '@/stores/auth'
import { useAtividadeStore } from '@/stores/atividade'
import { getModuloById } from '@/services/moduleService'
import type { Aula } from '@/interfaces/aula'
import type { Modulo } from '@/interfaces/modulo'

export function useModuloDetalhe() {
  const route = useRoute()
  const router = useRouter()
  const moduloStore = useModuloStore()
  const aulaStore = useAulaStore()
  const atividadeStore = useAtividadeStore()
  const authStore = useAuthStore()

  // ── IDs e dados do módulo ────────────────────────────────────────────────

  const moduloId = computed(() => Number(route.params.id || 0))
  const modulo = ref<Modulo | null>(null)
  const isLoadingModulo = ref(false)

  // ── Aulas ────────────────────────────────────────────────────────────────

  const aulas = computed(() =>
    (aulaStore.aulasByModulo[moduloId.value] ?? [])
      .slice()
      .sort((a, b) => a.ordem - b.ordem)
  )

  const aulaAtiva = ref<Aula | null>(null)
  const aulaIndex = computed(() => aulas.value.findIndex(a => a.id === aulaAtiva.value?.id))
  const aulaAnterior = computed(() => aulaIndex.value > 0 ? aulas.value[aulaIndex.value - 1] : null)
  const proximaAula = computed(() => aulaIndex.value < aulas.value.length - 1 ? aulas.value[aulaIndex.value + 1] : null)

  const videoSrc = computed(() => aulaAtiva.value?.videoUrl ?? null)

  // ── Atividades ───────────────────────────────────────────────────────────

  const atividades = computed(() =>
    aulaAtiva.value ? (atividadeStore.atividadesByAula[aulaAtiva.value.id] ?? []) : []
  )

  const respostasSelecionadas = ref<Record<number, number | null>>({})
  const respostasAcertadas = ref<Record<number, boolean>>({})
  const respostasFeedback = ref<Record<number, boolean>>({})
  const respostasConfirmadas = ref<Record<number, boolean>>({})

  // ── Dialog ───────────────────────────────────────────────────────────────

  const dialogAberto = ref(false)
  const aulaParaEditar = ref<Aula | undefined>(undefined)

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

  watch(aulaAtiva, async (aula) => {
    if (!aula) return
    await atividadeStore.fetchAtividades(aula.id)
  })

  // ── Ações ────────────────────────────────────────────────────────────────

  function selecionarAula(aula: Aula) {
    aulaAtiva.value = aula
  }

  function abrirCriacao() {
    aulaParaEditar.value = undefined
    dialogAberto.value = true
  }

  function abrirEdicao(aula: Aula) {
    aulaParaEditar.value = aula
    dialogAberto.value = true
  }

  async function removerAula(aulaId: number) {
    await aulaStore.remover(aulaId, moduloId.value)
    await aulaStore.fetchAulas(moduloId.value)
    if (aulaAtiva.value?.id === aulaId) {
      aulaAtiva.value = aulas.value[0] ?? null
    }
  }

  function selecionarResposta(atividadeId: number, alternativaIndex: number) {
    if (respostasAcertadas.value[atividadeId]) return
    respostasSelecionadas.value[atividadeId] = alternativaIndex
  }

  function confirmarResposta(atividade: any) {
    const selecionada = respostasSelecionadas.value[atividade.id]
    if (selecionada === null || selecionada === undefined) return
    const acertou = !!atividade.alternativas[selecionada].correta
    respostasConfirmadas.value[atividade.id] = true
    respostasFeedback.value[atividade.id] = acertou
    respostasAcertadas.value[atividade.id] = acertou
  }

  function voltar() {
    router.push({ name: 'modulos' })
  }

  return {
    // dados
    moduloId, modulo, isLoadingModulo,
    aulas, aulaAtiva, aulaAnterior, proximaAula, videoSrc,
    atividades,
    // estado quiz
    respostasSelecionadas, respostasAcertadas, respostasFeedback, respostasConfirmadas,
    // dialog
    dialogAberto, aulaParaEditar,
    // stores expostos
    aulaStore, authStore,
    // ações
    selecionarAula, abrirCriacao, abrirEdicao, removerAula,
    selecionarResposta, confirmarResposta, voltar,
  }
}
