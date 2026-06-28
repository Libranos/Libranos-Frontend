<script setup lang="ts">
import type { Aula } from '@/interfaces/aula'
import type { Modulo } from '@/interfaces/modulo'

const props = defineProps<{
  aula: Aula
  modulo: Modulo | null
  totalAulas: number
  videoSrc: string | null
  aulaAnterior: Aula | null
  proximaAula: Aula | null
  isTeacher: boolean
}>()

const emit = defineEmits<{
  editarAula: [aula: Aula]
  navegar: [aula: Aula]
}>()
</script>

<template>
  <!-- Player de vídeo -->
  <div class="video-section">
    <div class="video-wrapper">
      <iframe
        v-if="videoSrc"
        :key="aula.id"
        :src="videoSrc"
        title="Vídeo da aula"
        frameborder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowfullscreen
      ></iframe>
      <div v-else class="video-placeholder">
        <q-icon name="videocam_off" size="48px" color="grey-6" />
        <span>Nenhum vídeo cadastrado para esta aula</span>
      </div>
    </div>
  </div>

  <!-- Informações da aula -->
  <div class="aula-info">

    <!-- Breadcrumb -->
    <nav class="breadcrumb">
      <span class="breadcrumb-item">{{ modulo?.titulo }}</span>
      <q-icon name="chevron_right" size="16px" class="breadcrumb-sep" />
      <span class="breadcrumb-item breadcrumb-item--active">Aula {{ aula.ordem }}</span>
    </nav>

    <!-- Título -->
    <h1 class="aula-titulo">{{ aula.titulo }}</h1>

    <!-- Chips de meta -->
    <div class="aula-chips">
      <q-chip dense icon="sign_language" label="Libras" color="blue-1" text-color="blue-9" size="sm" />
      <q-chip dense icon="menu_book" :label="`Módulo ${modulo?.ordem ?? ''}`" color="indigo-1" text-color="indigo-9" size="sm" />
      <q-chip dense icon="list_alt" :label="`Aula ${aula.ordem} de ${totalAulas}`" color="teal-1" text-color="teal-9" size="sm" />
    </div>

    <!-- Botão editar (professor) -->
    <div v-if="isTeacher" class="acoes-professor">
      <q-btn outline dense icon="edit" label="Editar esta aula" color="primary" size="sm" @click="emit('editarAula', aula)" />
    </div>

    <q-separator class="separador" />

    <!-- Descrição -->
    <section v-if="aula.descricao" class="descricao-section">
      <h2 class="secao-titulo">Sobre esta aula</h2>
      <p class="descricao-texto">{{ aula.descricao }}</p>
    </section>

    <!-- Slot para atividades -->
    <slot name="atividades" />

    <!-- Navegação anterior / próxima -->
    <div class="nav-aulas">
      <q-btn
        v-if="aulaAnterior"
        flat icon="arrow_back_ios"
        color="primary"
        class="nav-btn"
        @click="emit('navegar', aulaAnterior)"
      >
        <div class="nav-btn-content">
          <span class="nav-btn-label">Anterior</span>
          <span class="nav-btn-titulo">{{ aulaAnterior.titulo }}</span>
        </div>
      </q-btn>

      <div class="nav-spacer" />

      <q-btn
        v-if="proximaAula"
        flat icon-right="arrow_forward_ios"
        color="primary"
        class="nav-btn nav-btn--right"
        @click="emit('navegar', proximaAula)"
      >
        <div class="nav-btn-content nav-btn-content--right">
          <span class="nav-btn-label">Próxima</span>
          <span class="nav-btn-titulo">{{ proximaAula.titulo }}</span>
        </div>
      </q-btn>
    </div>

  </div>
</template>

<style scoped>
/* Player */
.video-section { background: #000; flex-shrink: 0; }

.video-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
}
.video-wrapper iframe {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  border: 0;
  display: block;
}

.video-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background: #1a2a38;
  color: #4a6880;
  font-size: 0.88rem;
}

/* Info da aula */
.aula-info {
  background: #fff;
  padding: 28px 36px 48px;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 14px;
}
.breadcrumb-item { font-size: 0.78rem; color: #8fa9be; }
.breadcrumb-item--active { color: #3a9bd5; font-weight: 600; }
.breadcrumb-sep { color: #c0cdd6; }

.aula-titulo {
  font-size: 1.55rem;
  font-weight: 800;
  color: #0f2233;
  margin: 0 0 16px;
  line-height: 1.3;
}

.aula-chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 8px; }

.acoes-professor { margin-top: 12px; }

.separador { margin: 24px 0; }

.descricao-section { margin-bottom: 32px; }

.secao-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #1f3852;
  margin: 0 0 10px;
}

.descricao-texto {
  font-size: 0.92rem;
  color: #3c5167;
  line-height: 1.75;
  margin: 0;
  max-width: 680px;
}

/* Navegação */
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
.nav-btn:hover { background: #f0f7ff; border-color: #3a9bd5; }

.nav-btn-content { display: flex; flex-direction: column; align-items: flex-start; }
.nav-btn-content--right { align-items: flex-end; }

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

.nav-spacer { flex: 1; }

/* Mobile */
@media (max-width: 768px) {
  .aula-info { padding: 20px 18px 36px; }
  .aula-titulo { font-size: 1.2rem; }
  .nav-btn { max-width: none; flex: 1; }
  .nav-btn-titulo { max-width: 120px; }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .aula-info { padding: 24px 28px 40px; }
  .aula-titulo { font-size: 1.3rem; }
}
</style>
