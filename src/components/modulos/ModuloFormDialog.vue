<script setup lang="ts">
import { reactive, watch } from 'vue'
import { useModuloStore } from '@/stores/modulo'
import type { Modulo, ModuloRequest } from '@/interfaces/modulo'

const props = defineProps<{
  modelValue: boolean
  moduloParaEditar?: Modulo
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const moduloStore = useModuloStore()

const form = reactive<ModuloRequest>({ titulo: '', descricao: '', ordem: 1 })

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
  { immediate: true },
)

watch(() => props.modelValue, (v) => {
  if (v) moduloStore.error = null
})

function fechar() { emit('update:modelValue', false) }

async function salvar() {
  try {
    if (props.moduloParaEditar) {
      await moduloStore.atualizar(props.moduloParaEditar.id, { ...form })
    } else {
      await moduloStore.criar({ ...form })
    }
    fechar()
  } catch { /* erro via moduloStore.error */ }
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="fechar" persistent>
    <q-card class="dialog-card">

      <!-- Cabeçalho -->
      <div class="dialog-header">
        <div class="header-icon">
          <q-icon name="library_books" size="22px" color="white" />
        </div>
        <div>
          <div class="header-titulo">{{ moduloParaEditar ? 'Editar módulo' : 'Novo módulo' }}</div>
          <div class="header-sub">Preencha as informações do módulo</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="white" @click="fechar" />
      </div>

      <!-- Corpo -->
      <q-card-section class="dialog-body">
        <q-form @submit="salvar" greedy>

          <!-- Título -->
          <div class="campo-grupo">
            <div class="campo-label">
              <q-icon name="title" size="16px" class="q-mr-xs" />
              Título do módulo <span class="obrigatorio">*</span>
            </div>
            <q-input
              v-model="form.titulo"
              outlined dense
              placeholder="Ex: Módulo 1 — Alfabeto em Libras"
              :rules="moduloStore.tituloRules"
              :disable="moduloStore.isLoading"
              hide-bottom-space
            />
          </div>

          <!-- Ordem -->
          <div class="campo-grupo">
            <div class="campo-label">
              <q-icon name="format_list_numbered" size="16px" class="q-mr-xs" />
              Ordem na lista <span class="obrigatorio">*</span>
            </div>
            <q-input
              v-model.number="form.ordem"
              type="number" outlined dense
              :rules="moduloStore.ordemRules"
              :disable="moduloStore.isLoading"
              hide-bottom-space
              style="max-width: 110px"
            />
          </div>

          <!-- Descrição -->
          <div class="campo-grupo">
            <div class="campo-label">
              <q-icon name="notes" size="16px" class="q-mr-xs" />
              Descrição <span class="campo-opcional">(opcional)</span>
            </div>
            <q-input
              v-model="form.descricao"
              type="textarea" outlined dense autogrow
              placeholder="Descreva brevemente o que será abordado neste módulo"
              :disable="moduloStore.isLoading"
            />
          </div>

          <!-- Erro -->
          <q-banner v-if="moduloStore.error" class="text-negative q-mb-sm" rounded dense>
            <template #avatar><q-icon name="error_outline" /></template>
            {{ moduloStore.error }}
          </q-banner>

          <!-- Ações -->
          <div class="dialog-acoes">
            <q-btn label="Cancelar" flat color="grey-7" @click="fechar" :disable="moduloStore.isLoading" />
            <q-btn
              type="submit"
              :label="moduloParaEditar ? 'Salvar alterações' : 'Criar módulo'"
              unelevated color="primary"
              :loading="moduloStore.isLoading"
            />
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-card {
  width: 480px;
  max-width: 95vw;
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 18px;
  background: linear-gradient(135deg, #1a3a5c 0%, #2563a8 100%);
  color: white;
}

.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-titulo { font-size: 1rem; font-weight: 700; line-height: 1.2; }
.header-sub    { font-size: 0.75rem; opacity: 0.75; margin-top: 2px; }

.dialog-body { padding: 20px 22px 4px; }

.campo-grupo { margin-bottom: 18px; }

.campo-label {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 7px;
}

.obrigatorio    { color: #ef4444; margin-left: 2px; }
.campo-opcional { font-weight: 400; color: #9ca3af; margin-left: 4px; }

.dialog-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 6px 0 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 6px;
}
</style>
