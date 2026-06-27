<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useModuloStore } from '@/stores/modulo'
import ModuloDestaque from '@/components/modulos/ModuloDestaque.vue'
import ModuloCard from '@/components/modulos/ModuloCard.vue'
import ModuloFormDialog from '@/components/modulos/ModuloFormDialog.vue'
import type { Modulo } from '@/interfaces/modulo'

const authStore = useAuthStore()
const moduloStore = useModuloStore()

const dialogAberto = ref(false)
const moduloParaEditar = ref<Modulo | undefined>(undefined)

function abrirCriacao() {
  moduloParaEditar.value = undefined
  dialogAberto.value = true
}

function abrirEdicao(modulo: Modulo) {
  moduloParaEditar.value = modulo
  dialogAberto.value = true
}

onMounted(() => moduloStore.fetchModulos())
</script>

<template>
  <q-page class="page-content">

    <p class="boas-vindas">
      Bem vindo{{ authStore.isTeacher ? ', Professor' : '' }}!
    </p>

    <!-- Skeleton -->
    <template v-if="moduloStore.isLoading && moduloStore.modulos.length === 0">
      <div class="skeleton-destaque"></div>
      <div class="skeleton-grid">
        <div v-for="i in 3" :key="i" class="skeleton-card"></div>
      </div>
    </template>

    <template v-else>
      <ModuloDestaque v-if="moduloStore.destaque" :modulo="moduloStore.destaque" />

      <div v-if="moduloStore.proximos.length > 0" class="proximas-section">
        <h3 class="proximas-titulo">Próximas aulas:</h3>
        <div class="proximas-grid">
          <ModuloCard
            v-for="modulo in moduloStore.proximos"
            :key="modulo.id"
            :modulo="modulo"
            @editar="abrirEdicao"
          />
        </div>
      </div>

      <div v-if="!moduloStore.destaque && moduloStore.proximos.length === 0" class="vazio">
        <p>Nenhum módulo disponível no momento.</p>
      </div>
    </template>

    <!-- FAB — canto inferior direito, padrão Material Design -->
    <q-page-sticky v-if="authStore.isTeacher" position="bottom-right" :offset="[24, 24]">
      <q-btn fab icon="add" color="primary" @click="abrirCriacao">
        <q-tooltip anchor="top middle" self="bottom middle">Criar novo módulo</q-tooltip>
      </q-btn>
    </q-page-sticky>

    <ModuloFormDialog v-model="dialogAberto" :modulo-para-editar="moduloParaEditar" />

  </q-page>
</template>

<style scoped>
.page-content {
  padding: 28px 32px;
  /* padding-bottom generoso pra não esconder conteúdo atrás do FAB */
  padding-bottom: 90px;
  width: 100%;
  background-color: #f4f6f9;
}

.boas-vindas {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f3852;
  margin: 0 0 20px;
}

.proximas-section { margin-top: 8px; }

.proximas-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #1f3852;
  margin: 0 0 16px;
}

.proximas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.skeleton-destaque {
  background: #e0e0e0;
  border-radius: 12px;
  height: 180px;
  margin-bottom: 32px;
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; }

.skeleton-card {
  background: #e0e0e0;
  border-radius: 8px;
  height: 110px;
  animation: pulse 1.4s ease-in-out infinite;
}

.vazio { color: #888; font-size: 0.95rem; margin-top: 40px; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@media (max-width: 600px) {
  .page-content { padding: 20px 16px 80px; }
}
</style>
