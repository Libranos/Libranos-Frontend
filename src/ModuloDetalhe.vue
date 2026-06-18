<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModuloStore } from '@/stores/modulo'
import { useAulaStore }   from '@/stores/aula'
import { useAuthStore }   from '@/stores/auth'
import { getModuloById }  from '@/services/moduleService'
import AulaFormDialog     from '@/components/aulas/AulaFormDialog.vue'
import type { Aula }      from '@/interfaces/aula'
import type { Modulo }    from '@/interfaces/modulo'

// ── Sample video (placeholder – substituir pela URL real do vídeo) ─────────
const SAMPLE_VIDEO = 'https://www.youtube.com/embed/YE7VzlLtp-4'

const route       = useRoute()
const router      = useRouter()
const moduloStore = useModuloStore()
const aulaStore   = useAulaStore()
const authStore   = useAuthStore()

const moduloId = computed(() => Number(route.params.id))

const modulo     = ref<Modulo | null>(null)
const isLoadingModulo = ref(false)

const aulas = computed(() =>
  (aulaStore.aulasByModulo[moduloId.value] ?? [])
    .slice()
    .sort((a, b) => a.ordem - b.ordem)
)

const aulaAtiva      = ref<Aula | null>(null)
const dialogAberto   = ref(false)
const aulaParaEditar = ref<Aula | undefined>(undefined)

const videoSrc = computed(() =>
  (aulaAtiva.value as any)?.videoUrl ?? SAMPLE_VIDEO
)

const aulaIndex   = computed(() => aulas.value.findIndex(a => a.id === aulaAtiva.value?.id))
const aulaAnterior = computed(() => aulaIndex.value > 0 ? aulas.value[aulaIndex.value - 1] : null)
const proximaAula  = computed(() => aulaIndex.value < aulas.value.length - 1 ? aulas.value[aulaIndex.value + 1] : null)

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
  if (aulaAtiva.value?.id === aulaId) {
    aulaAtiva.value = aulas.value[0] ?? null
  }
}
</script>

<template>
  <q-page class="detalhe-page">
    <div class="detalhe-layout">

      <!-- ══════════════════════════════════════════════════════════════
           SIDEBAR — lista de aulas
      ══════════════════════════════════════════════════════════════ -->
      <aside class="sidebar">

        <!-- Cabeçalho -->
        <div class="sidebar-header">
          <q-btn
            flat round dense
            icon="arrow_back"
            color="white"
            class="back-btn"
            @click="router.push({ name: 'modulos' })"
          >
            <q-tooltip>Voltar</q-tooltip>
          </q-btn>
          <div class="modulo-meta">
            <span class="modulo-label">
              <template v-if="modulo">MÓDULO {{ modulo.ordem }}</template>
              <template v-else>MÓDULO</template>
            </span>
            <span class="modulo-nome">
              <template v-if="isLoadingModulo">Carregando...</template>
              <template v-else>{{ modulo?.titulo ?? 'Módulo não encontrado' }}</template>
            </span>
            <span v-if="modulo?.descricao" class="modulo-desc">{{ modulo.descricao }}</span>
          </div>
        </div>

        <!-- Divisor com contagem -->
        <div class="sidebar-counter">
          <span>{{ aulas.length }} {{ aulas.length === 1 ? 'aula' : 'aulas' }}</span>
        </div>

        <!-- Lista rolável de aulas -->
        <div class="aulas-lista">

          <!-- Skeleton de loading -->
          <template v-if="aulaStore.isLoading && aulas.length === 0">
            <div v-for="i in 6" :key="i" class="aula-item aula-item--skeleton">
              <div class="aula-badge skeleton-badge"></div>
              <div class="aula-item-info">
                <div class="skeleton-line"></div>
                <div class="skeleton-line skeleton-line--sm"></div>
              </div>
            </div>
          </template>

          <!-- Items reais -->
          <div
            v-for="aula in aulas"
            :key="aula.id"
            class="aula-item"
            :class="{ 'aula-item--ativa': aulaAtiva?.id === aula.id }"
            @click="selecionarAula(aula)"
          >
            <div
              class="aula-badge"
              :class="{ 'aula-badge--ativa': aulaAtiva?.id === aula.id }"
            >
              <q-icon v-if="aulaAtiva?.id === aula.id" name="play_arrow" size="14px" />
              <span v-else>{{ aula.ordem }}</span>
            </div>

            <div class="aula-item-info">
              <span class="aula-item-titulo">{{ aula.titulo }}</span>
              <span v-if="aula.descricao" class="aula-item-desc">{{ aula.descricao }}</span>
            </div>

            <!-- Ações do professor (visíveis no hover) -->
            <div v-if="authStore.isTeacher" class="aula-acoes" @click.stop>
              <q-btn
                flat round dense
                icon="edit"
                size="xs"
                color="blue-grey-3"
                @click="abrirEdicao(aula)"
              >
                <q-tooltip>Editar aula</q-tooltip>
              </q-btn>
              <q-btn
                flat round dense
                icon="delete"
                size="xs"
                color="red-3"
                :loading="aulaStore.isLoading"
                @click="removerAula(aula.id)"
              >
                <q-tooltip>Remover aula</q-tooltip>
              </q-btn>
            </div>
          </div>

          <!-- Estado vazio -->
          <div v-if="!aulaStore.isLoading && aulas.length === 0" class="sidebar-vazio">
            <q-icon name="video_library" size="36px" />
            <span>Nenhuma aula cadastrada</span>
          </div>

        </div>

        <!-- Rodapé: nova aula (professor) -->
        <div v-if="authStore.isTeacher" class="sidebar-footer" @click="abrirCriacao">
          <q-icon name="add_circle_outline" size="18px" />
          <span>Adicionar aula</span>
        </div>

      </aside>

      <!-- ══════════════════════════════════════════════════════════════
           ÁREA PRINCIPAL — player + informações
      ══════════════════════════════════════════════════════════════ -->
      <main class="main-area">

        <!-- Estado: sem aula selecionada -->
        <div
          v-if="!aulaAtiva && !aulaStore.isLoading"
          class="estado-vazio"
        >
          <q-icon name="play_circle_outline" size="72px" color="blue-grey-7" />
          <p class="estado-vazio-titulo">Selecione uma aula</p>
          <p class="estado-vazio-subtitulo">Escolha uma aula na lista ao lado para começar</p>
        </div>

        <!-- Estado: carregando (ainda sem aula) -->
        <div v-else-if="aulaStore.isLoading && !aulaAtiva" class="estado-vazio">
          <q-spinner-dots size="48px" color="blue-grey-7" />
          <p class="estado-vazio-subtitulo q-mt-md">Carregando aulas...</p>
        </div>

        <!-- Player + conteúdo -->
        <template v-else-if="aulaAtiva">

          <!-- Área do vídeo -->
          <div class="video-section">
            <div class="video-wrapper">
              <iframe
                :key="aulaAtiva.id"
                :src="videoSrc"
                title="Vídeo da aula"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen
              ></iframe>
            </div>
          </div>

          <!-- Informações da aula -->
          <div class="aula-info">

            <!-- Breadcrumb -->
            <nav class="breadcrumb">
              <span class="breadcrumb-item">{{ modulo?.titulo }}</span>
              <q-icon name="chevron_right" size="16px" class="breadcrumb-sep" />
              <span class="breadcrumb-item breadcrumb-item--active">Aula {{ aulaAtiva.ordem }}</span>
            </nav>

            <!-- Título da aula -->
            <h1 class="aula-titulo">{{ aulaAtiva.titulo }}</h1>

            <!-- Chips de meta -->
            <div class="aula-chips">
              <q-chip dense icon="sign_language" label="Libras" color="blue-1" text-color="blue-9" size="sm" />
              <q-chip
                dense
                icon="menu_book"
                :label="`Módulo ${modulo?.ordem ?? ''}`"
                color="indigo-1"
                text-color="indigo-9"
                size="sm"
              />
              <q-chip
                dense
                icon="list_alt"
                :label="`Aula ${aulaAtiva.ordem} de ${aulas.length}`"
                color="teal-1"
                text-color="teal-9"
                size="sm"
              />
            </div>

            <!-- Botões professor: editar aula atual -->
            <div v-if="authStore.isTeacher" class="acoes-professor">
              <q-btn
                outline
                dense
                icon="edit"
                label="Editar esta aula"
                color="primary"
                size="sm"
                @click="abrirEdicao(aulaAtiva)"
              />
            </div>

            <q-separator class="separador" />

            <!-- Descrição -->
            <section v-if="aulaAtiva.descricao" class="descricao-section">
              <h2 class="descricao-titulo">Sobre esta aula</h2>
              <p class="descricao-texto">{{ aulaAtiva.descricao }}</p>
            </section>

            <!-- Navegação entre aulas -->
            <div class="nav-aulas">
              <q-btn
                v-if="aulaAnterior"
                flat
                icon="arrow_back_ios"
                color="primary"
                class="nav-btn"
                @click="selecionarAula(aulaAnterior)"
              >
                <div class="nav-btn-content">
                  <span class="nav-btn-label">Anterior</span>
                  <span class="nav-btn-titulo">{{ aulaAnterior.titulo }}</span>
                </div>
              </q-btn>

              <div class="nav-spacer" />

              <q-btn
                v-if="proximaAula"
                flat
                icon-right="arrow_forward_ios"
                color="primary"
                class="nav-btn nav-btn--right"
                @click="selecionarAula(proximaAula)"
              >
                <div class="nav-btn-content nav-btn-content--right">
                  <span class="nav-btn-label">Próxima</span>
                  <span class="nav-btn-titulo">{{ proximaAula.titulo }}</span>
                </div>
              </q-btn>
            </div>

          </div>
        </template>

      </main>
    </div>

    <!-- Dialog de criação/edição de aula -->
    <AulaFormDialog
      v-model="dialogAberto"
      :modulo-id="moduloId"
      :aula-para-editar="aulaParaEditar"
    />

  </q-page>
</template>

<style scoped>
/* ════════════════════════════════════════════════
   RESET DO Q-PAGE
════════════════════════════════════════════════ */
.detalhe-page {
  padding: 0 !important;
}

/* ════════════════════════════════════════════════
   LAYOUT PRINCIPAL (dois painéis)
════════════════════════════════════════════════ */
.detalhe-layout {
  display: flex;
  height: calc(100vh - 50px); /* 50px = altura do q-header */
  overflow: hidden;
}

/* ════════════════════════════════════════════════
   SIDEBAR
════════════════════════════════════════════════ */
.sidebar {
  width: 296px;
  flex-shrink: 0;
  background: #0d1f30;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

/* — Cabeçalho da sidebar — */
.sidebar-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 18px 16px 16px;
  background: #081624;
  flex-shrink: 0;
}

.back-btn {
  margin-top: 2px;
  flex-shrink: 0;
}

.modulo-meta {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
}

.modulo-label {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 1.2px;
  color: #3a9bd5;
  text-transform: uppercase;
}

.modulo-nome {
  font-size: 0.92rem;
  font-weight: 700;
  color: #dde8f0;
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.modulo-desc {
  font-size: 0.75rem;
  color: #4a6880;
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  margin-top: 2px;
}

/* — Contador de aulas — */
.sidebar-counter {
  padding: 8px 16px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #3a6280;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  background: #0d1f30;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  flex-shrink: 0;
}

/* — Lista de aulas (rolável) — */
.aulas-lista {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.aulas-lista::-webkit-scrollbar {
  width: 4px;
}
.aulas-lista::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
}

/* — Item de aula — */
.aula-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.12s ease;
  border-bottom: 1px solid rgba(255, 255, 255, 0.03);
  position: relative;
}

.aula-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.aula-item:hover .aula-acoes {
  display: flex;
}

.aula-item--ativa {
  background: rgba(58, 155, 213, 0.14);
  border-left: 3px solid #3a9bd5;
  padding-left: 13px;
}

.aula-item--ativa:hover {
  background: rgba(58, 155, 213, 0.2);
}

/* — Badge de ordem — */
.aula-badge {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.07);
  color: #7a9ab0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.82rem;
  font-weight: 700;
  transition: background 0.12s, color 0.12s;
}

.aula-badge--ativa {
  background: #3a9bd5;
  color: #fff;
}

/* — Info do item — */
.aula-item-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.aula-item-titulo {
  font-size: 0.85rem;
  font-weight: 500;
  color: #b8cdd9;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 0.12s;
}

.aula-item--ativa .aula-item-titulo {
  color: #e5f2fb;
  font-weight: 600;
}

.aula-item-desc {
  font-size: 0.72rem;
  color: #3d5e72;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* — Ações (visíveis no hover) — */
.aula-acoes {
  display: none;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

/* — Skeleton — */
.aula-item--skeleton {
  cursor: default;
  animation: pulse 1.4s ease-in-out infinite;
  pointer-events: none;
}

.skeleton-badge {
  background: rgba(255, 255, 255, 0.06) !important;
  color: transparent !important;
}

.skeleton-line {
  height: 9px;
  background: rgba(255, 255, 255, 0.07);
  border-radius: 4px;
  margin-bottom: 5px;
  width: 85%;
}

.skeleton-line--sm {
  width: 55%;
}

/* — Empty state da sidebar — */
.sidebar-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 16px;
  color: #2e4b5e;
  font-size: 0.82rem;
}

/* — Rodapé: adicionar aula — */
.sidebar-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  color: #3a9bd5;
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
  background: #0d1f30;
  flex-shrink: 0;
  transition: background 0.12s;
}

.sidebar-footer:hover {
  background: rgba(58, 155, 213, 0.1);
}

/* ════════════════════════════════════════════════
   ÁREA PRINCIPAL
════════════════════════════════════════════════ */
.main-area {
  flex: 1;
  overflow-y: auto;
  background: #111d28;
  display: flex;
  flex-direction: column;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.12) transparent;
}

/* — Estados vazios / loading — */
.estado-vazio {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  text-align: center;
}

.estado-vazio-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a6e87;
  margin: 0;
}

.estado-vazio-subtitulo {
  font-size: 0.85rem;
  color: #2e4b5e;
  margin: 0;
}

/* ════════════════════════════════════════════════
   PLAYER DE VÍDEO
════════════════════════════════════════════════ */
.video-section {
  background: #000;
  flex-shrink: 0;
}

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}

.video-wrapper iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
}

/* ════════════════════════════════════════════════
   PAINEL DE INFORMAÇÕES DA AULA
════════════════════════════════════════════════ */
.aula-info {
  background: #fff;
  flex: 1;
  padding: 28px 36px 48px;
  min-height: 0;
}

/* — Breadcrumb — */
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 14px;
}

.breadcrumb-item {
  font-size: 0.78rem;
  color: #8fa9be;
}

.breadcrumb-item--active {
  color: #3a9bd5;
  font-weight: 600;
}

.breadcrumb-sep {
  color: #c0cdd6;
}

/* — Título — */
.aula-titulo {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f2233;
  margin: 0 0 16px 0;
  line-height: 1.3;
}

/* — Chips — */
.aula-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 8px;
}

/* — Ações do professor — */
.acoes-professor {
  margin-top: 12px;
}

/* — Separador — */
.separador {
  margin: 24px 0;
}

/* — Descrição — */
.descricao-section {
  margin-bottom: 32px;
}

.descricao-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #1f3852;
  margin: 0 0 10px 0;
}

.descricao-texto {
  font-size: 0.92rem;
  color: #3c5167;
  line-height: 1.75;
  margin: 0;
  max-width: 680px;
}

/* — Navegação anterior / próxima — */
.nav-aulas {
  display: flex;
  align-items: stretch;
  gap: 12px;
  margin-top: 16px;
  border-top: 1px solid #e8edf2;
  padding-top: 24px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #dce5ed;
  border-radius: 10px;
  transition: background 0.12s, border-color 0.12s;
  max-width: 240px;
}

.nav-btn:hover {
  background: #f0f7ff;
  border-color: #3a9bd5;
}

.nav-btn-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.nav-btn-content--right {
  align-items: flex-end;
}

.nav-btn-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #8fa9be;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.nav-btn-titulo {
  font-size: 0.82rem;
  font-weight: 600;
  color: #1f3852;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 180px;
}

.nav-spacer {
  flex: 1;
}

/* ════════════════════════════════════════════════
   KEYFRAMES
════════════════════════════════════════════════ */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.45; }
}

/* ════════════════════════════════════════════════
   RESPONSIVO — mobile (≤ 768px)
════════════════════════════════════════════════ */
@media (max-width: 768px) {

  .detalhe-layout {
    flex-direction: column;
    height: auto;
    overflow: visible;
  }

  .sidebar {
    width: 100%;
    height: auto;
    border-right: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  }

  .sidebar-header {
    padding: 14px 14px 12px;
  }

  .sidebar-counter {
    padding: 6px 14px;
  }

  .aulas-lista {
    display: flex;
    flex-direction: row;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: thin;
  }

  .aula-item {
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    min-width: 90px;
    max-width: 90px;
    padding: 12px 8px;
    text-align: center;
    border-bottom: none;
    border-right: 1px solid rgba(255, 255, 255, 0.04);
    gap: 8px;
  }

  .aula-item:hover .aula-acoes {
    display: none; /* esconde no mobile */
  }

  .aula-item--ativa {
    border-left: none;
    border-top: 3px solid #3a9bd5;
    padding-left: 8px;
  }

  .aula-item-titulo {
    font-size: 0.7rem;
    white-space: normal;
    text-overflow: unset;
    overflow: visible;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    text-align: center;
  }

  .aula-item-desc {
    display: none;
  }

  .aula-acoes {
    display: none !important;
  }

  .main-area {
    background: #111d28;
  }

  .aula-info {
    padding: 20px 18px 36px;
  }

  .aula-titulo {
    font-size: 1.2rem;
  }

  .nav-btn {
    max-width: none;
    flex: 1;
  }

  .nav-btn-titulo {
    max-width: 120px;
  }
}

/* ════════════════════════════════════════════════
   RESPONSIVO — tablet (769px–1024px)
════════════════════════════════════════════════ */
@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar {
    width: 240px;
  }

  .aula-info {
    padding: 24px 28px 40px;
  }

  .aula-titulo {
    font-size: 1.3rem;
  }
}
</style>
