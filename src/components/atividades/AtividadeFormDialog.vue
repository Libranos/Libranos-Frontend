<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { useAtividadeStore } from '@/stores/atividade'
import type { Atividade, AtividadeRequest, AlternativaRequest } from '@/interfaces/atividade'

const props = defineProps<{
  modelValue: boolean
  aulaId: number
  atividadeParaEditar?: Atividade
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const atividadeStore = useAtividadeStore()

interface FormState {
  titulo: string
  descricao: string
  midiaUrl: string
  ordem: number
}

const form = reactive<FormState>({ titulo: '', descricao: '', midiaUrl: '', ordem: 1 })

const alternativas = ref<AlternativaRequest[]>([
  { texto: '', correta: true },
  { texto: '', correta: false },
])

const correctIndex = ref(0)

function setCorrect(index: number) {
  correctIndex.value = index
  alternativas.value.forEach((alt, i) => { alt.correta = i === index })
}

function adicionarAlternativa() {
  if (alternativas.value.length < 5) {
    alternativas.value.push({ texto: '', correta: false })
  }
}

function removerAlternativa(index: number) {
  if (alternativas.value.length <= 2) return
  alternativas.value.splice(index, 1)
  if (correctIndex.value >= alternativas.value.length) {
    setCorrect(0)
  } else if (correctIndex.value === index) {
    setCorrect(0)
  }
}

watch(
  () => props.atividadeParaEditar,
  (atividade) => {
    if (atividade) {
      form.titulo    = atividade.titulo
      form.descricao = atividade.descricao ?? ''
      form.midiaUrl  = atividade.midiaUrl ?? ''
      form.ordem     = atividade.ordem
      alternativas.value = atividade.alternativas.map(a => ({
        texto:    a.texto,
        midiaUrl: a.midiaUrl ?? '',
        correta:  a.correta,
      }))
      correctIndex.value = alternativas.value.findIndex(a => a.correta)
    } else {
      form.titulo    = ''
      form.descricao = ''
      form.midiaUrl  = ''
      form.ordem     = 1
      alternativas.value = [
        { texto: '', correta: true },
        { texto: '', correta: false },
      ]
      correctIndex.value = 0
    }
  },
  { immediate: true }
)

function fechar(): void {
  emit('update:modelValue', false)
}

function validarAlternativas(): string | true {
  if (alternativas.value.length < 2 || alternativas.value.length > 5) {
    return 'A atividade deve ter entre 2 e 5 alternativas'
  }
  if (!alternativas.value.some(a => a.correta)) {
    return 'Marque exatamente 1 alternativa como correta'
  }
  if (alternativas.value.some(a => !a.texto.trim())) {
    return 'Todas as alternativas precisam de texto'
  }
  return true
}

async function salvar(): Promise<void> {
  const validacao = validarAlternativas()
  if (validacao !== true) {
    atividadeStore.error = validacao
    return
  }

  try {
    const dto: AtividadeRequest = {
      ...form,
      aulaId: props.aulaId,
      alternativas: alternativas.value.map(a => ({ ...a })),
    }
    if (props.atividadeParaEditar) {
      await atividadeStore.atualizar(props.atividadeParaEditar.id, dto)
    } else {
      await atividadeStore.criar(dto)
    }
    fechar()
  } catch {
    // erro exposto via atividadeStore.error
  }
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="fechar" persistent>
    <q-card style="min-width: 440px; max-width: 560px">
      <q-card-section class="row items-center q-pb-none">
        <span class="text-h6">{{ atividadeParaEditar ? 'Editar Atividade' : 'Nova Atividade' }}</span>
        <q-space />
        <q-btn icon="close" flat round dense @click="fechar" />
      </q-card-section>

      <q-card-section>
        <q-form @submit="salvar" greedy>

          <!-- ── Dados básicos ── -->
          <q-input
            v-model="form.titulo"
            label="Título"
            outlined
            class="q-mb-md"
            :rules="atividadeStore.tituloRules"
            :disable="atividadeStore.isLoading"
          />

          <q-input
            v-model="form.descricao"
            label="Descrição"
            outlined
            type="textarea"
            autogrow
            class="q-mb-md"
            :disable="atividadeStore.isLoading"
          />

          <q-input
            v-model="form.midiaUrl"
            label="URL de mídia (opcional)"
            outlined
            class="q-mb-md"
            :disable="atividadeStore.isLoading"
          />

          <q-input
            v-model.number="form.ordem"
            label="Ordem"
            outlined
            type="number"
            class="q-mb-lg"
            :rules="atividadeStore.ordemRules"
            :disable="atividadeStore.isLoading"
          />

          <!-- ── Alternativas ── -->
          <div class="text-subtitle2 q-mb-sm">
            Alternativas
            <span class="text-caption text-grey q-ml-xs">(2–5, marque a correta)</span>
          </div>

          <div
            v-for="(alt, i) in alternativas"
            :key="i"
            class="alternativa-row q-mb-sm"
          >
            <q-radio
              :model-value="correctIndex"
              :val="i"
              color="positive"
              @update:model-value="setCorrect(i)"
            />
            <q-input
              v-model="alt.texto"
              :label="`Alternativa ${i + 1}`"
              outlined
              dense
              class="col"
              :disable="atividadeStore.isLoading"
            />
            <q-btn
              flat
              round
              dense
              icon="remove_circle_outline"
              color="negative"
              size="sm"
              :disable="alternativas.length <= 2 || atividadeStore.isLoading"
              @click="removerAlternativa(i)"
            />
          </div>

          <q-btn
            v-if="alternativas.length < 5"
            flat
            icon="add"
            label="Adicionar alternativa"
            color="primary"
            size="sm"
            class="q-mb-md"
            :disable="atividadeStore.isLoading"
            @click="adicionarAlternativa"
          />

          <q-banner v-if="atividadeStore.error" class="text-negative q-mb-md" rounded dense>
            <template #avatar><q-icon name="error_outline" /></template>
            {{ atividadeStore.error }}
          </q-banner>

          <div class="row justify-end q-gutter-sm">
            <q-btn label="Cancelar" flat @click="fechar" />
            <q-btn
              type="submit"
              :label="atividadeParaEditar ? 'Salvar' : 'Criar'"
              unelevated
              color="primary"
              :loading="atividadeStore.isLoading"
            />
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.alternativa-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
</style>
