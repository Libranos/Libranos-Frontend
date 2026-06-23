<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModuloStore } from '@/stores/modulo'
import { useAuthStore }   from '@/stores/auth'
import ModuloExpansion    from '@/components/conteudo/ModuloExpansion.vue'
import ModuloFormDialog   from '@/components/modulos/ModuloFormDialog.vue'
import type { Modulo }    from '@/interfaces/modulo'

const moduloStore = useModuloStore()
const authStore   = useAuthStore()

const dialogAberto     = ref(false)
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

    <p class="page-titulo">Conteúdo</p>

    <template v-if="moduloStore.isLoading && moduloStore.modulos.length === 0">
      <q-list bordered class="rounded-borders">
        <q-item v-for="i in 3" :key="i">
          <q-item-section avatar><q-skeleton type="QAvatar" size="28px" /></q-item-section>
          <q-item-section>
            <q-skeleton type="text" />
            <q-skeleton type="text" width="50%" />
          </q-item-section>
        </q-item>
      </q-list>
    </template>

    <template v-else>
      <q-list bordered separator class="rounded-borders">
        <ModuloExpansion
          v-for="modulo in moduloStore.ativos"
          :key="modulo.id"
          :modulo="modulo"
          :on-editar-modulo="abrirEdicao"
          :on-remover-modulo="(id) => moduloStore.remover(id)"
        />
        <q-item v-if="moduloStore.ativos.length === 0">
          <q-item-section>
            <q-item-label caption class="text-grey">Nenhum módulo disponível.</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </template>

    <!-- FAB criação de módulo: somente professores -->
    <q-btn
      v-if="authStore.isTeacher"
      fab
      fixed
      icon="add"
      color="primary"
      style="bottom: 32px; right: 32px"
      @click="abrirCriacao"
    >
      <q-tooltip>Criar novo módulo</q-tooltip>
    </q-btn>

    <ModuloFormDialog
      v-model="dialogAberto"
      :modulo-para-editar="moduloParaEditar"
    />

  </q-page>
</template>

<style scoped>
.page-content {
  padding: 28px 32px;
  width: 100%;
  background-color: #f4f6f9;
}

.page-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f3852;
  margin: 0 0 20px 0;
}

@media (max-width: 600px) {
  .page-content { padding: 20px 16px; }
}
</style>
