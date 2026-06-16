<script setup lang="ts">
import type { Modulo } from '@/interfaces/modulo'

defineProps<{ modulo: Modulo }>()
</script>

<template>
  <div class="card-destaque">
    <h2 class="destaque-titulo">{{ modulo.titulo }}</h2>
    <div class="destaque-corpo">
      <div class="destaque-thumb">
        <div class="thumb-placeholder">
          <span class="thumb-icone">▶</span>
          <span class="thumb-tempo">00:00 / 00:00</span>
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
}

.thumb-placeholder {
  background-color: #2a2a2a;
  border-radius: 8px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
}

.thumb-icone {
  font-size: 1.4rem;
  opacity: 0.7;
}

.thumb-tempo {
  font-size: 0.75rem;
  opacity: 0.6;
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
  background-color: #1f3852;
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
}
</style>
