<script setup lang="ts">
import { useRouter } from 'vue-router'
import type { Modulo } from '@/interfaces/modulo'
import { useAuthStore } from '@/stores/auth'
import { useModuloStore } from '@/stores/modulo'

const props = defineProps<{ modulo: Modulo }>()

const router      = useRouter()
const authStore   = useAuthStore()
const moduloStore = useModuloStore()

const emit = defineEmits<{ editar: [modulo: Modulo] }>()

function navegar() {
  router.push({ name: 'modulo-detalhe', params: { id: props.modulo.id } })
}
</script>

<template>
  <div class="card-aula" @click="navegar">
    <div class="aula-thumb">
      <span class="aula-numero">{{ modulo.ordem }}</span>
      <div class="thumb-overlay">
        <q-icon name="play_arrow" size="28px" color="white" />
      </div>
    </div>
    <p class="aula-titulo">{{ modulo.titulo }}</p>

    <!-- Ações exclusivas para professores -->
    <div v-if="authStore.isTeacher" class="acoes" @click.stop>
      <q-btn
        flat round dense
        icon="edit"
        size="xs"
        color="primary"
        @click="emit('editar', props.modulo)"
      />
      <q-btn
        flat round dense
        icon="delete"
        size="xs"
        color="negative"
        :loading="moduloStore.isLoading"
        @click="moduloStore.remover(modulo.id)"
      />
    </div>
  </div>
</template>

<style scoped>
.card-aula {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  position: relative;
}

.card-aula:hover .aula-thumb {
  transform: translateY(-3px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.3);
}

.card-aula:hover .thumb-overlay {
  opacity: 1;
}

.aula-thumb {
  width: 100%;
  aspect-ratio: 1 / 0.75;
  background-color: #1a1a1a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  position: relative;
  overflow: hidden;
}

.aula-numero {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  opacity: 0.85;
}

.thumb-overlay {
  position: absolute;
  inset: 0;
  background: rgba(58, 155, 213, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.15s ease;
  border-radius: 8px;
}

.aula-titulo {
  font-size: 0.82rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0;
}

.acoes {
  display: flex;
  gap: 4px;
}
</style>
