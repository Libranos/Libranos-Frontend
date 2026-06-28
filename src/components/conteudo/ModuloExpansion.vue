<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAulaStore } from '@/stores/aula'
import { useAuthStore } from '@/stores/auth'
import AulaExpansion from './AulaExpansion.vue'
import AulaFormDialog from '@/components/aulas/AulaFormDialog.vue'
import type { Modulo } from '@/interfaces/modulo'
import type { Aula } from '@/interfaces/aula'

const props = defineProps<{
  modulo: Modulo
  onEditarModulo: (modulo: Modulo) => void
  onRemoverModulo: (moduloId: number) => void
}>()

const aulaStore = useAulaStore()
const authStore = useAuthStore()

const carregado      = ref(false)
const dialogAberto   = ref(false)
const aulaParaEditar = ref<Aula | undefined>(undefined)

const aulas = computed(() => aulaStore.aulasByModulo[props.modulo.id] ?? [])

async function onExpand(aberto: boolean) {
  if (aberto && !carregado.value) {
    await aulaStore.fetchAulas(props.modulo.id)
    carregado.value = true
  }
}

function abrirCriacao() {
  aulaParaEditar.value = undefined
  dialogAberto.value = true
}

function abrirEdicao(aula: Aula) {
  aulaParaEditar.value = aula
  dialogAberto.value = true
}

function removerAula(aulaId: number) {
  aulaStore.remover(aulaId, props.modulo.id)
}
</script>

<template>
  <q-expansion-item @update:model-value="onExpand">
    <template #header>
      <q-item-section avatar>
        <q-icon name="menu_book" color="primary" />
      </q-item-section>
      <q-item-section>
        <q-item-label class="text-weight-medium">{{ modulo.titulo }}</q-item-label>
        <q-item-label caption v-if="modulo.descricao">{{ modulo.descricao }}</q-item-label>
      </q-item-section>
      <q-item-section side v-if="authStore.isTeacher">
        <div class="row items-center q-gutter-xs">
          <q-btn flat round dense icon="edit" size="xs" color="primary" @click.stop="onEditarModulo(modulo)" />
          <q-btn flat round dense icon="delete" size="xs" color="negative" :loading="aulaStore.isLoading" @click.stop="onRemoverModulo(modulo.id)" />
        </div>
      </q-item-section>
    </template>

    <q-list separator>

      <q-item v-if="aulaStore.isLoading && !carregado">
        <q-item-section>
          <q-skeleton type="text" />
          <q-skeleton type="text" width="60%" />
        </q-item-section>
      </q-item>

      <AulaExpansion
        v-for="aula in aulas"
        :key="aula.id"
        :aula="aula"
        :on-editar-aula="abrirEdicao"
        :on-remover-aula="removerAula"
      />

      <q-item v-if="carregado && aulas.length === 0 && !aulaStore.isLoading">
        <q-item-section>
          <q-item-label caption class="text-grey">Nenhuma aula cadastrada.</q-item-label>
        </q-item-section>
      </q-item>

      <q-item v-if="authStore.isTeacher">
        <q-item-section>
          <q-btn flat icon="add" label="Nova aula" color="primary" size="sm" align="left" @click="abrirCriacao" />
        </q-item-section>
      </q-item>

    </q-list>
  </q-expansion-item>

  <AulaFormDialog
    v-model="dialogAberto"
    :modulo-id="modulo.id"
    :aula-para-editar="aulaParaEditar"
  />
</template>
