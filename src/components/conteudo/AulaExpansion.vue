<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAtividadeStore } from '@/stores/atividade'
import { useAuthStore } from '@/stores/auth'
import AtividadeFormDialog from '@/components/atividades/AtividadeFormDialog.vue'
import type { Aula } from '@/interfaces/aula'
import type { Atividade } from '@/interfaces/atividade'

const props = defineProps<{
  aula: Aula
  onEditarAula: (aula: Aula) => void
  onRemoverAula: (aulaId: number) => void
}>()

const atividadeStore = useAtividadeStore()
const authStore      = useAuthStore()

const carregado          = ref(false)
const dialogAberto       = ref(false)
const atividadeParaEditar = ref<Atividade | undefined>(undefined)

const atividades = computed(() => atividadeStore.atividadesByAula[props.aula.id] ?? [])

async function onExpand(aberto: boolean) {
  if (aberto && !carregado.value) {
    await atividadeStore.fetchAtividades(props.aula.id)
    carregado.value = true
  }
}

function abrirCriacao() {
  atividadeParaEditar.value = undefined
  dialogAberto.value = true
}

function abrirEdicao(atividade: Atividade) {
  atividadeParaEditar.value = atividade
  dialogAberto.value = true
}
</script>

<template>
  <q-expansion-item @update:model-value="onExpand">
    <template #header>
      <q-item-section avatar>
        <q-icon name="play_lesson" color="teal" />
      </q-item-section>
      <q-item-section>
        <q-item-label>{{ aula.titulo }}</q-item-label>
        <q-item-label caption v-if="aula.descricao">{{ aula.descricao }}</q-item-label>
      </q-item-section>
      <q-item-section side v-if="authStore.isTeacher">
        <div class="row items-center q-gutter-xs">
          <q-btn flat round dense icon="edit" size="xs" color="primary" @click.stop="onEditarAula(aula)" />
          <q-btn flat round dense icon="delete" size="xs" color="negative" :loading="atividadeStore.isLoading" @click.stop="onRemoverAula(aula.id)" />
        </div>
      </q-item-section>
    </template>

    <q-list class="q-pl-lg">

      <q-item v-if="atividadeStore.isLoading && !carregado">
        <q-item-section>
          <q-skeleton type="text" />
          <q-skeleton type="text" width="60%" />
        </q-item-section>
      </q-item>

      <q-item
        v-for="atividade in atividades"
        :key="atividade.id"
        class="atividade-item"
      >
        <q-item-section avatar>
          <q-icon name="assignment" color="blue-grey" size="18px" />
        </q-item-section>
        <q-item-section>
          <q-item-label>{{ atividade.titulo }}</q-item-label>
          <q-item-label caption v-if="atividade.descricao">{{ atividade.descricao }}</q-item-label>
          <q-item-label caption class="text-grey-6">
            {{ atividade.alternativas.length }} alternativas
          </q-item-label>
        </q-item-section>
        <q-item-section side v-if="authStore.isTeacher">
          <div class="row items-center q-gutter-xs">
            <q-btn flat round dense icon="edit" size="xs" color="primary" @click.stop="abrirEdicao(atividade)" />
            <q-btn
              flat round dense icon="delete" size="xs" color="negative"
              :loading="atividadeStore.isLoading"
              @click.stop="atividadeStore.remover(atividade.id, aula.id)"
            />
          </div>
        </q-item-section>
      </q-item>

      <q-item v-if="carregado && atividades.length === 0 && !atividadeStore.isLoading">
        <q-item-section>
          <q-item-label caption class="text-grey">Nenhuma atividade cadastrada.</q-item-label>
        </q-item-section>
      </q-item>

      <q-item v-if="authStore.isTeacher">
        <q-item-section>
          <q-btn flat icon="add" label="Nova atividade" color="teal" size="sm" align="left" @click="abrirCriacao" />
        </q-item-section>
      </q-item>

    </q-list>
  </q-expansion-item>

  <AtividadeFormDialog
    v-model="dialogAberto"
    :aula-id="aula.id"
    :atividade-para-editar="atividadeParaEditar"
  />
</template>

<style scoped>
.atividade-item {
  min-height: 40px;
}
</style>
