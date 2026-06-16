<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useModuloStore } from '@/stores/modulo'
import type { Modulo, ModuloRequest } from '@/interfaces/modulo'

const props = defineProps<{
  modelValue: boolean           // controla visibilidade (v-model)
  moduloParaEditar?: Modulo     // undefined → criação | preenchido → edição
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const moduloStore = useModuloStore()

const form = reactive<ModuloRequest>({ titulo: '', descricao: '', ordem: 1 })

// Preenche o formulário quando um módulo é passado para edição
watch(
  () => props.moduloParaEditar,
  (modulo) => {
    if (modulo) {
      form.titulo    = modulo.titulo
      form.descricao = modulo.descricao ?? ''
      form.ordem     = modulo.ordem
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
    if (props.moduloParaEditar) {
      await moduloStore.atualizar(props.moduloParaEditar.id, { ...form })
    } else {
      await moduloStore.criar({ ...form })
    }
    fechar()
  } catch {
    // erro já exposto via moduloStore.error
  }
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="fechar" persistent>
    <q-card style="min-width: 380px">
      <q-card-section class="row items-center q-pb-none">
        <span class="text-h6">
          {{ moduloParaEditar ? 'Editar Módulo' : 'Novo Módulo' }}
        </span>
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
            :rules="moduloStore.tituloRules"
            :disable="moduloStore.isLoading"
          />

          <q-input
            v-model="form.descricao"
            label="Descrição"
            outlined
            type="textarea"
            autogrow
            class="q-mb-md"
            :disable="moduloStore.isLoading"
          />

          <q-input
            v-model.number="form.ordem"
            label="Ordem"
            outlined
            type="number"
            class="q-mb-md"
            :rules="moduloStore.ordemRules"
            :disable="moduloStore.isLoading"
          />

          <q-banner
            v-if="moduloStore.error"
            class="text-negative q-mb-md"
            rounded
            dense
          >
            <template #avatar><q-icon name="error_outline" /></template>
            {{ moduloStore.error }}
          </q-banner>

          <div class="row justify-end gap-sm">
            <q-btn label="Cancelar" flat @click="fechar" />
            <q-btn
              type="submit"
              :label="moduloParaEditar ? 'Salvar' : 'Criar'"
              unelevated
              color="primary"
              :loading="moduloStore.isLoading"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>
