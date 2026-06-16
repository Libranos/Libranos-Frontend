<script setup lang="ts">
import type { Modulo } from '@/interfaces/modulo'
import { useAuthStore } from '@/stores/auth'
import { useModuloStore } from '@/stores/modulo'

const props = defineProps<{ modulo: Modulo }>()

const authStore   = useAuthStore()
const moduloStore = useModuloStore()

const emit = defineEmits<{ editar: [modulo: Modulo] }>()
</script>

<template>
  <div class="card-aula">
    <div class="aula-thumb">
      <span class="aula-numero">{{ modulo.ordem }}</span>
    </div>
    <p class="aula-titulo">{{ modulo.titulo }}</p>

    <!-- Ações exclusivas para professores -->
    <div v-if="authStore.isTeacher" class="acoes">
      <q-btn
        flat
        round
        dense
        icon="edit"
        size="xs"
        color="primary"
        @click.stop="emit('editar', props.modulo)"
      />
      <q-btn
        flat
        round
        dense
        icon="delete"
        size="xs"
        color="negative"
        :loading="moduloStore.isLoading"
        @click.stop="moduloStore.remover(modulo.id)"
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
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
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
}

.aula-numero {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  opacity: 0.85;
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
