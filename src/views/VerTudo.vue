<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useModuloStore } from '@/stores/modulo'
import { useAulaStore } from '@/stores/aula'
import { useAuthStore } from '@/stores/auth'
import { getProgressoModulo } from '@/services/progressoService'
import type { ProgressoModuloResponse } from '@/interfaces/progresso'

const router      = useRouter()
const moduloStore = useModuloStore()
const aulaStore   = useAulaStore()
const authStore   = useAuthStore()

// ── Estado ────────────────────────────────────────────────────────────────────

interface ModuloProgresso {
  moduloId: number
  titulo: string
  descricao: string
  totalAulas: number
  aulasConcluidadas: number
  percentual: number
  isLoading: boolean
}

const progressos = ref<ModuloProgresso[]>([])
const isLoadingGeral = ref(false)

// ── Computed ─────────────────────────────────────────────────────────────────

const totalModulos   = computed(() => progressos.value.length)
const modulosConcluidos = computed(() =>
  progressos.value.filter(p => p.percentual === 100).length
)
const totalAulas     = computed(() =>
  progressos.value.reduce((acc, p) => acc + p.totalAulas, 0)
)
const totalConcluidas = computed(() =>
  progressos.value.reduce((acc, p) => acc + p.aulasConcluidadas, 0)
)
const percentualGeral = computed(() =>
  totalAulas.value === 0 ? 0 : Math.round((totalConcluidas.value / totalAulas.value) * 100)
)

const corGeral = computed(() => {
  if (percentualGeral.value === 100) return 'positive'
  if (percentualGeral.value >= 50)  return 'primary'
  if (percentualGeral.value >= 20)  return 'warning'
  return 'blue-grey'
})

function corModulo(p: ModuloProgresso) {
  if (p.percentual === 100) return '#22c55e'
  if (p.percentual >= 50)  return '#3a9bd5'
  if (p.percentual > 0)    return '#f59e0b'
  return '#94a3b8'
}

function mensagemGeral() {
  if (percentualGeral.value === 100) return 'Parabéns! Você concluiu todo o conteúdo! 🎉'
  if (percentualGeral.value >= 70)  return 'Ótimo progresso! Você está quase lá.'
  if (percentualGeral.value >= 30)  return 'Continue assim! Você está evoluindo bem.'
  if (percentualGeral.value > 0)    return 'Bom começo! Continue explorando os módulos.'
  return 'Que tal começar o primeiro módulo?'
}

// ── Lifecycle ─────────────────────────────────────────────────────────────────

onMounted(async () => {
  isLoadingGeral.value = true

  await moduloStore.fetchModulos()

  // Inicializa a lista com placeholders
  progressos.value = moduloStore.ativos.map(m => ({
    moduloId:         m.id,
    titulo:           m.titulo,
    descricao:        m.descricao ?? '',
    totalAulas:       0,
    aulasConcluidadas: 0,
    percentual:       0,
    isLoading:        true,
  }))

  isLoadingGeral.value = false

  // Busca progresso de cada módulo em paralelo
  // Professores não têm progresso de aluno — mostra só estrutura
  if (authStore.isTeacher) {
    // Para professores: carrega só total de aulas
    await Promise.all(
      progressos.value.map(async (p) => {
        try {
          await aulaStore.fetchAulas(p.moduloId)
          const aulas = aulaStore.aulasByModulo[p.moduloId] ?? []
          p.totalAulas = aulas.length
          p.isLoading  = false
        } catch {
          p.isLoading = false
        }
      })
    )
  } else {
    // Para alunos: carrega progresso real do backend
    await Promise.all(
      progressos.value.map(async (p) => {
        try {
          const prog: ProgressoModuloResponse = await getProgressoModulo(p.moduloId)
          p.totalAulas        = Number(prog.totalAulas)
          p.aulasConcluidadas = Number(prog.aulasConcluidadas)
          p.percentual        = Math.round(prog.percentualConclusao)
          p.isLoading         = false
        } catch {
          p.isLoading = false
        }
      })
    )
  }
})

function irParaModulo(moduloId: number) {
  router.push({ name: 'modulo-detalhe', params: { id: moduloId } })
}
</script>

<template>
  <q-page class="page-content">

    <!-- ── Cabeçalho ── -->
    <div class="page-header">
      <div class="header-texto">
        <h1 class="page-titulo">
          {{ authStore.isTeacher ? 'Visão geral do curso' : 'Meu progresso' }}
        </h1>
        <p class="page-sub">
          {{ authStore.isTeacher
            ? 'Estrutura completa de módulos e aulas do curso'
            : 'Acompanhe sua evolução em cada módulo'
          }}
        </p>
      </div>
    </div>

    <!-- ── Loading inicial ── -->
    <template v-if="isLoadingGeral">
      <div class="skeleton-resumo"></div>
      <div v-for="i in 3" :key="i" class="skeleton-card"></div>
    </template>

    <template v-else>

      <!-- ── Painel de resumo (só alunos) ── -->
      <div v-if="!authStore.isTeacher" class="resumo-card">
        <div class="resumo-principal">
          <div class="resumo-numero">
            <span class="resumo-pct">{{ percentualGeral }}%</span>
            <span class="resumo-label">concluído</span>
          </div>
          <div class="resumo-barra-wrap">
            <q-linear-progress
              :value="percentualGeral / 100"
              :color="corGeral"
              track-color="blue-grey-2"
              style="height: 10px; border-radius: 5px"
              instant-feedback
            />
            <p class="resumo-mensagem">{{ mensagemGeral() }}</p>
          </div>
        </div>

        <div class="resumo-stats">
          <div class="stat-item">
            <span class="stat-num">{{ totalConcluidas }}</span>
            <span class="stat-txt">aulas concluídas</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ totalAulas }}</span>
            <span class="stat-txt">aulas no total</span>
          </div>
          <div class="stat-divider"></div>
          <div class="stat-item">
            <span class="stat-num">{{ modulosConcluidos }}/{{ totalModulos }}</span>
            <span class="stat-txt">módulos completos</span>
          </div>
        </div>
      </div>

      <!-- ── Lista de módulos ── -->
      <div class="modulos-lista">

        <div v-if="progressos.length === 0" class="vazio">
          <q-icon name="library_books" size="48px" color="blue-grey-3" />
          <p>Nenhum módulo disponível no momento.</p>
        </div>

        <div
          v-for="prog in progressos"
          :key="prog.moduloId"
          class="modulo-card"
          @click="irParaModulo(prog.moduloId)"
        >
          <!-- Skeleton individual -->
          <template v-if="prog.isLoading">
            <div class="modulo-card-inner">
              <q-skeleton type="rect" height="14px" width="60%" />
              <q-skeleton type="rect" height="8px" width="100%" class="q-mt-sm" />
            </div>
          </template>

          <template v-else>
            <div class="modulo-card-inner">

              <!-- Topo: ícone + título + badge de status -->
              <div class="modulo-top">
                <div class="modulo-icone" :style="{ background: corModulo(prog) + '20', color: corModulo(prog) }">
                  <q-icon
                    :name="prog.percentual === 100 ? 'check_circle' : 'menu_book'"
                    size="20px"
                  />
                </div>

                <div class="modulo-info">
                  <div class="modulo-titulo">{{ prog.titulo }}</div>
                  <div v-if="prog.descricao" class="modulo-desc">{{ prog.descricao }}</div>
                </div>

                <!-- Badge de status (aluno) / contador de aulas (professor) -->
                <div v-if="!authStore.isTeacher" class="modulo-badge" :style="{ color: corModulo(prog) }">
                  <template v-if="prog.percentual === 100">
                    <q-icon name="verified" size="20px" />
                    <span>Concluído</span>
                  </template>
                  <template v-else-if="prog.percentual > 0">
                    <span>{{ prog.aulasConcluidadas }}/{{ prog.totalAulas }}</span>
                  </template>
                  <template v-else>
                    <span class="badge-inicio">Não iniciado</span>
                  </template>
                </div>

                <div v-else class="modulo-badge-teacher">
                  <q-icon name="play_lesson" size="16px" color="blue-grey-5" />
                  <span>{{ prog.totalAulas }} {{ prog.totalAulas === 1 ? 'aula' : 'aulas' }}</span>
                </div>

                <q-icon name="chevron_right" size="20px" color="blue-grey-4" class="modulo-arrow" />
              </div>

              <!-- Barra de progresso (só alunos) -->
              <div v-if="!authStore.isTeacher && prog.totalAulas > 0" class="modulo-barra-wrap">
                <q-linear-progress
                  :value="prog.percentual / 100"
                  :color="prog.percentual === 100 ? 'positive' : (prog.percentual > 0 ? 'primary' : 'blue-grey-3')"
                  track-color="blue-grey-1"
                  style="height: 5px; border-radius: 3px"
                  instant-feedback
                />
                <span class="modulo-pct">{{ prog.percentual }}%</span>
              </div>

              <!-- Aviso sem aulas -->
              <div v-if="prog.totalAulas === 0" class="modulo-sem-aulas">
                <q-icon name="info" size="14px" color="blue-grey-4" />
                Nenhuma aula cadastrada ainda
              </div>

            </div>
          </template>

        </div>
      </div>

    </template>

  </q-page>
</template>

<style scoped>
.page-content {
  padding: 28px 32px 60px;
  background: #f4f6f9;
  min-height: 100%;
}

/* Header */
.page-header {
  margin-bottom: 24px;
}

.page-titulo {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1f3852;
  margin: 0 0 4px;
}

.page-sub {
  font-size: 0.85rem;
  color: #6b7280;
  margin: 0;
}

/* Resumo geral */
.resumo-card {
  background: white;
  border-radius: 16px;
  padding: 22px 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(15, 34, 51, 0.06);
  border: 1px solid #e8edf2;
}

.resumo-principal {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 18px;
}

.resumo-numero {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 80px;
}

.resumo-pct {
  font-size: 2.2rem;
  font-weight: 800;
  color: #1f3852;
  line-height: 1;
}

.resumo-label {
  font-size: 0.7rem;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-top: 2px;
}

.resumo-barra-wrap { flex: 1; }

.resumo-mensagem {
  font-size: 0.8rem;
  color: #6b7280;
  margin: 8px 0 0;
}

.resumo-stats {
  display: flex;
  align-items: center;
  gap: 0;
  padding-top: 16px;
  border-top: 1px solid #f0f4f8;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.stat-num {
  font-size: 1.3rem;
  font-weight: 800;
  color: #1f3852;
}

.stat-txt {
  font-size: 0.72rem;
  color: #6b7280;
  text-align: center;
}

.stat-divider {
  width: 1px;
  height: 36px;
  background: #e8edf2;
  flex-shrink: 0;
}

/* Lista de módulos */
.modulos-lista {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modulo-card {
  background: white;
  border-radius: 14px;
  border: 1.5px solid #e8edf2;
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.14s, box-shadow 0.14s, transform 0.1s;
  box-shadow: 0 1px 6px rgba(15, 34, 51, 0.04);
}

.modulo-card:hover {
  border-color: #3a9bd5;
  box-shadow: 0 4px 18px rgba(58, 155, 213, 0.12);
  transform: translateY(-1px);
}

.modulo-card-inner {
  padding: 16px 18px;
}

.modulo-top {
  display: flex;
  align-items: center;
  gap: 14px;
}

.modulo-icone {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.modulo-info { flex: 1; min-width: 0; }

.modulo-titulo {
  font-size: 0.92rem;
  font-weight: 700;
  color: #1f3852;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modulo-desc {
  font-size: 0.76rem;
  color: #6b7280;
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.modulo-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.badge-inicio {
  font-size: 0.75rem;
  color: #94a3b8;
  font-weight: 500;
}

.modulo-badge-teacher {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.78rem;
  color: #6b7280;
  flex-shrink: 0;
}

.modulo-arrow { flex-shrink: 0; }

.modulo-barra-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 12px;
}

.modulo-pct {
  font-size: 0.72rem;
  font-weight: 600;
  color: #6b7280;
  flex-shrink: 0;
  width: 34px;
  text-align: right;
}

.modulo-sem-aulas {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 10px;
  font-size: 0.75rem;
  color: #94a3b8;
}

/* Skeletons */
.skeleton-resumo {
  background: #e5e7eb;
  border-radius: 16px;
  height: 140px;
  margin-bottom: 24px;
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-card {
  background: #e5e7eb;
  border-radius: 14px;
  height: 72px;
  margin-bottom: 12px;
  animation: pulse 1.4s ease-in-out infinite;
}

/* Vazio */
.vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 60px 20px;
  color: #94a3b8;
  font-size: 0.9rem;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.5; }
}

@media (max-width: 600px) {
  .page-content    { padding: 20px 16px 50px; }
  .resumo-pct      { font-size: 1.8rem; }
  .resumo-principal { gap: 14px; }
  .modulo-desc     { display: none; }
}
</style>
