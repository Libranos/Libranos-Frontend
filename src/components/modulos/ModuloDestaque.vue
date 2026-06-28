<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Modulo } from '@/interfaces/modulo'

const props  = defineProps<{ modulo: Modulo }>()
const router = useRouter()

function navegar() {
  router.push({ name: 'modulo-detalhe', params: { id: props.modulo.id } })
}
</script>

<template>
  <div class="card-destaque" @click="navegar">
    <h2 class="destaque-titulo">{{ modulo.titulo }}</h2>
    <div class="destaque-corpo">

      <!-- Thumbnail clicável -->
      <div class="destaque-thumb">
        <div class="thumb-placeholder">
          <span class="thumb-icone">▶</span>
          <span class="thumb-tempo">Assistir agora</span>
        </div>
        <div class="thumb-hover-overlay">
          <q-icon name="play_circle" size="42px" color="white" />
        </div>
      </div>

      <div class="destaque-info">
        <p class="destaque-descricao">{{ modulo.descricao }}</p>
        <div class="progresso-barra">
          <div class="progresso-fill" style="width: 65%"></div>
        </div>
        <q-btn
          class="btn-continuar"
          color="primary"
          label="Continuar assistindo"
          icon="play_arrow"
          unelevated
          @click.stop="navegar"
        />
      </div>

    </div>
  </div>
</template>

<style scoped>
.card-destaque {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 32px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  cursor: pointer;
  transition: box-shadow 0.15s ease, transform 0.15s ease;
}

.card-destaque:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.14);
  transform: translateY(-1px);
}

.card-destaque:hover .thumb-hover-overlay {
  opacity: 1;
}

.destaque-titulo {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1f3852;
  margin: 0 0 16px 0;
}

.destaque-corpo {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.destaque-thumb {
  flex: 0 0 220px;
  position: relative;
  border-radius: 8px;
  overflow: hidden;
}

.thumb-placeholder {
  background-color: #1a2a3a;
  border-radius: 8px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
  transition: background 0.15s;
}

.card-destaque:hover .thumb-placeholder {
  background-color: #0f1e2d;
}

.thumb-icone {
  font-size: 1.4rem;
  opacity: 0.7;
}

.thumb-tempo {
  font-size: 0.75rem;
  opacity: 0.6;
}

.thumb-hover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(58, 155, 213, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
  border-radius: 8px;
}

.destaque-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.destaque-descricao {
  font-size: 0.9rem;
  color: #444;
  line-height: 1.5;
  margin: 0;
}

.progresso-barra {
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progresso-fill {
  height: 100%;
  background-color: #3a9bd5;
  border-radius: 3px;
}

.btn-continuar {
  align-self: flex-start;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
}

@media (max-width: 600px) {
  .destaque-corpo {
    flex-direction: column;
  }

  .destaque-thumb {
    flex: none;
    width: 100%;
  }

  .thumb-placeholder {
    height: 160px;
  }
}
</style>
