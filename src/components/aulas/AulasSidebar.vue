<script setup lang="ts">
import type { Aula } from '@/interfaces/aula'

const props = defineProps<{
  modulo: { titulo?: string; descricao?: string; ordem?: number } | null
  isLoadingModulo: boolean
  aulas: Aula[]
  aulaAtivaId: number | undefined
  isLoadingAulas: boolean
  isTeacher: boolean
}>()

const emit = defineEmits<{
  voltar: []
  selecionarAula: [aula: Aula]
  editarAula: [aula: Aula]
  removerAula: [aulaId: number]
  adicionarAula: []
}>()
</script>

<template>
  <aside class="sidebar">

    <!-- Cabeçalho -->
    <div class="sidebar-header">
      <q-btn flat round dense icon="arrow_back" color="white" class="back-btn" @click="emit('voltar')">
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

    <!-- Contador -->
    <div class="sidebar-counter">
      <span>{{ aulas.length }} {{ aulas.length === 1 ? 'aula' : 'aulas' }}</span>
    </div>

    <!-- Lista de aulas -->
    <div class="aulas-lista">

      <!-- Skeleton loading -->
      <template v-if="isLoadingAulas && aulas.length === 0">
        <div v-for="i in 6" :key="i" class="aula-item aula-item--skeleton">
          <div class="aula-badge skeleton-badge"></div>
          <div class="aula-item-info">
            <div class="skeleton-line"></div>
            <div class="skeleton-line skeleton-line--sm"></div>
          </div>
        </div>
      </template>

      <!-- Itens reais -->
      <div
        v-for="aula in aulas"
        :key="aula.id"
        class="aula-item"
        :class="{ 'aula-item--ativa': aulaAtivaId === aula.id }"
        @click="emit('selecionarAula', aula)"
      >
        <div class="aula-badge" :class="{ 'aula-badge--ativa': aulaAtivaId === aula.id }">
          <q-icon v-if="aulaAtivaId === aula.id" name="play_arrow" size="14px" />
          <span v-else>{{ aula.ordem }}</span>
        </div>

        <div class="aula-item-info">
          <span class="aula-item-titulo">{{ aula.titulo }}</span>
          <span v-if="aula.descricao" class="aula-item-desc">{{ aula.descricao }}</span>
        </div>

        <!-- Ações professor (hover) -->
        <div v-if="isTeacher" class="aula-acoes" @click.stop>
          <q-btn flat round dense icon="edit" size="xs" color="blue-grey-3" @click="emit('editarAula', aula)">
            <q-tooltip>Editar aula</q-tooltip>
          </q-btn>
          <q-btn flat round dense icon="delete" size="xs" color="red-3" :loading="isLoadingAulas" @click="emit('removerAula', aula.id)">
            <q-tooltip>Remover aula</q-tooltip>
          </q-btn>
        </div>
      </div>

      <!-- Vazio -->
      <div v-if="!isLoadingAulas && aulas.length === 0" class="sidebar-vazio">
        <q-icon name="video_library" size="36px" />
        <span>Nenhuma aula cadastrada</span>
      </div>

    </div>

    <!-- Rodapé: adicionar aula (professor) -->
    <div v-if="isTeacher" class="sidebar-footer" @click="emit('adicionarAula')">
      <q-icon name="add_circle_outline" size="18px" />
      <span>Adicionar aula</span>
    </div>

  </aside>
</template>

<style scoped>
.sidebar {
  width: 296px;
  flex-shrink: 0;
  background: #0d1f30;
  display: flex;
  flex-direction: column;
  border-right: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
}

.sidebar-header {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 18px 16px 16px;
  background: #081624;
  flex-shrink: 0;
}

.back-btn { margin-top: 2px; flex-shrink: 0; }

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

.aulas-lista {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
.aulas-lista::-webkit-scrollbar { width: 4px; }
.aulas-lista::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.12); border-radius: 2px; }

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
.aula-item:hover { background: rgba(255, 255, 255, 0.05); }
.aula-item:hover .aula-acoes { display: flex; }

.aula-item--ativa {
  background: rgba(58, 155, 213, 0.14);
  border-left: 3px solid #3a9bd5;
  padding-left: 13px;
}
.aula-item--ativa:hover { background: rgba(58, 155, 213, 0.2); }

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
.aula-badge--ativa { background: #3a9bd5; color: #fff; }

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
.aula-item--ativa .aula-item-titulo { color: #e5f2fb; font-weight: 600; }

.aula-item-desc {
  font-size: 0.72rem;
  color: #3d5e72;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.aula-acoes {
  display: none;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

/* Skeleton */
.aula-item--skeleton {
  cursor: default;
  animation: pulse 1.4s ease-in-out infinite;
  pointer-events: none;
}
.skeleton-badge { background: rgba(255, 255, 255, 0.06) !important; color: transparent !important; }
.skeleton-line { height: 9px; background: rgba(255, 255, 255, 0.07); border-radius: 4px; margin-bottom: 5px; width: 85%; }
.skeleton-line--sm { width: 55%; }

.sidebar-vazio {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 16px;
  color: #2e4b5e;
  font-size: 0.82rem;
}

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
.sidebar-footer:hover { background: rgba(58, 155, 213, 0.1); }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.45; }
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar { width: 100%; height: auto; border-right: none; border-bottom: 1px solid rgba(255, 255, 255, 0.06); }
  .sidebar-header { padding: 14px 14px 12px; }
  .sidebar-counter { padding: 6px 14px; }

  .aulas-lista { flex-direction: row; display: flex; overflow-x: auto; overflow-y: hidden; scrollbar-width: thin; }

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
  .aula-item:hover .aula-acoes { display: none; }
  .aula-item--ativa { border-left: none; border-top: 3px solid #3a9bd5; padding-left: 8px; }
  .aula-item-titulo { font-size: 0.7rem; white-space: normal; text-overflow: unset; overflow: visible; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; text-align: center; }
  .aula-item-desc { display: none; }
  .aula-acoes { display: none !important; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .sidebar { width: 240px; }
}
</style>
