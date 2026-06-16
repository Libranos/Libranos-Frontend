<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useAulaStore } from '@/stores/aula'
import type { Aula, AulaRequest } from '@/interfaces/aula'

const props = defineProps<{
  modelValue: boolean
  moduloId: number
  aulaParaEditar?: Aula
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const aulaStore = useAulaStore()

const form = reactive<Omit<AulaRequest, 'moduloId'>>({ titulo: '', descricao: '', ordem: 1 })

watch(
  () => props.aulaParaEditar,
  (aula) => {
    if (aula) {
      form.titulo    = aula.titulo
      form.descricao = aula.descricao ?? ''
      form.ordem     = aula.ordem
    } else {
      form.titulo    = ''
      form.descricao = ''
      form.ordem     = 1
    }
  },
  { immediate: true }
)

function fechar(): void {
  emit('update:modelValue', false)
}

async function salvar(): Promise<void> {
  try {
    const dto: AulaRequest = { ...form, moduloId: props.moduloId }
    if (props.aulaParaEditar) {
      await aulaStore.atualizar(props.aulaParaEditar.id, dto)
    } else {
      await aulaStore.criar(dto)
    }
    fechar()
  } catch {
    // erro exposto via aulaStore.error
  }
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="fechar" persistent>
    <q-card style="min-width: 380px">
      <q-card-section class="row items-center q-pb-none">
        <span class="text-h6">{{ aulaParaEditar ? 'Editar Aula' : 'Nova Aula' }}</span>
        <q-space />
        <q-btn icon="close" flat round dense @click="fechar" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="salvar" greedy>
          <q-input
            v-model="form.titulo"
            label="Título"
            outlined
            class="q-mb-md"
            :rules="aulaStore.tituloRules"
            :disable="aulaStore.isLoading"
          />

          <q-input
            v-model="form.descricao"
            label="Descrição"
            outlined
            type="textarea"
            autogrow
            class="q-mb-md"
            :disable="aulaStore.isLoading"
          />

          <q-input
            v-model.number="form.ordem"
            label="Ordem"
            outlined
            type="number"
            class="q-mb-md"
            :rules="aulaStore.ordemRules"
            :disable="aulaStore.isLoading"
          />

          <q-banner v-if="aulaStore.error" class="text-negative q-mb-md" rounded dense>
            <template #avatar><q-icon name="error_outline" /></template>
            {{ aulaStore.error }}
          </q-banner>

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" flat @click="fechar" />
            <q-btn
              type="submit"
              :label="aulaParaEditar ? 'Salvar' : 'Criar'"
              unelevated
              color="primary"
              :loading="aulaStore.isLoading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
