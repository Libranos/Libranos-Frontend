<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAtividadeStore } from '@/stores/atividade'
import type { Atividade, AtividadeRequest, AlternativaRequest } from '@/interfaces/atividade'

const props = defineProps<{
  modelValue: boolean
  aulaId: number
  atividadeParaEditar?: Atividade
  proximaOrdem?: number
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const atividadeStore = useAtividadeStore()

const LETRAS = ['A', 'B', 'C', 'D', 'E']

const titulo        = ref('')
const correctIndex  = ref(0)
const alternativas  = ref<AlternativaRequest[]>([])
const erroAlternativas = ref<string | null>(null)

function resetForm() {
  titulo.value = ''
  alternativas.value = [
    { texto: '', correta: true },
    { texto: '', correta: false },
    { texto: '', correta: false },
    { texto: '', correta: false },
  ]
  correctIndex.value = 0
  erroAlternativas.value = null
}

resetForm()

function setCorrect(i: number) {
  correctIndex.value = i
  alternativas.value.forEach((a, idx) => { a.correta = idx === i })
}

function adicionarAlternativa() {
  if (alternativas.value.length < 5) {
    alternativas.value.push({ texto: '', correta: false })
  }
}

function removerAlternativa(i: number) {
  if (alternativas.value.length <= 2) return
  alternativas.value.splice(i, 1)
  if (correctIndex.value >= alternativas.value.length || correctIndex.value === i) {
    setCorrect(0)
  }
  correctIndex.value = alternativas.value.findIndex(a => a.correta)
}

watch(
  () => props.atividadeParaEditar,
  (atividade) => {
    if (atividade) {
      titulo.value = atividade.titulo
      alternativas.value = atividade.alternativas.map(a => ({
        texto: a.texto,
        midiaUrl: a.midiaUrl ?? '',
        correta: a.correta,
      }))
      correctIndex.value = alternativas.value.findIndex(a => a.correta)
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

watch(() => props.modelValue, (v) => {
  if (v) {
    atividadeStore.error = null
    if (!props.atividadeParaEditar) resetForm()
  }
})

function validar(): boolean {
  erroAlternativas.value = null
  if (!titulo.value.trim()) return false

  const preenchidas = alternativas.value.filter(a => a.texto.trim())
  if (preenchidas.length < 2) {
    erroAlternativas.value = 'Preencha pelo menos 2 alternativas'
    return false
  }
  if (!alternativas.value.some(a => a.correta)) {
    erroAlternativas.value = 'Marque a alternativa correta'
    return false
  }
  if (!alternativas.value[correctIndex.value]?.texto.trim()) {
    erroAlternativas.value = 'A alternativa correta não pode estar vazia'
    return false
  }
  return true
}

function fechar() { emit('update:modelValue', false) }

async function salvar() {
  if (!validar()) return
  try {
    const dto: AtividadeRequest = {
      titulo: titulo.value.trim(),
      aulaId: props.aulaId,
      ordem: props.atividadeParaEditar?.ordem ?? (props.proximaOrdem ?? 1),
      alternativas: alternativas.value
        .filter(a => a.texto.trim())
        .map(a => ({ texto: a.texto.trim(), correta: a.correta })),
    }
    if (props.atividadeParaEditar) {
      await atividadeStore.atualizar(props.atividadeParaEditar.id, dto)
    } else {
      await atividadeStore.criar(dto)
    }
    fechar()
  } catch { /* erro via atividadeStore.error */ }
}

const qtdPreenchidas = computed(() =>
  alternativas.value.filter(a => a.texto.trim()).length
)
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="fechar" persistent>
    <q-card class="dialog-card">

      <div class="dialog-header">
        <div class="header-icon">
          <q-icon name="quiz" size="22px" color="white" />
        </div>
        <div>
          <div class="header-titulo">{{ atividadeParaEditar ? 'Editar questão' : 'Nova questão' }}</div>
          <div class="header-sub">Crie uma pergunta de múltipla escolha</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="white" @click="fechar" />
      </div>

      <q-card-section class="dialog-body">
        <q-form @submit.prevent="salvar" greedy>

          <div class="campo-grupo">
            <div class="campo-label">
              <q-icon name="help_outline" size="16px" class="q-mr-xs" />
              Pergunta <span class="obrigatorio">*</span>
            </div>
            <q-input
              v-model="titulo"
              type="textarea" autogrow outlined dense
              placeholder="Ex: Qual é o sinal em Libras para 'bom dia'?"
              :rules="atividadeStore.tituloRules"
              :disable="atividadeStore.isLoading"
              hide-bottom-space
            />
          </div>

          <div class="campo-grupo">
            <div class="campo-label q-mb-sm">
              <q-icon name="checklist" size="16px" class="q-mr-xs" />
              Alternativas
              <span class="campo-opcional q-ml-xs">— clique no círculo para marcar a correta</span>
            </div>

            <div class="alternativas-lista">
              <div
                v-for="(alt, i) in alternativas"
                :key="i"
                class="alternativa-item"
                :class="{
                  'alternativa-correta': correctIndex === i && alt.texto.trim(),
                  'alternativa-inativa': !alt.texto.trim() && i >= 2,
                }"
              >
                <div class="alternativa-letra" :class="{ 'letra-correta': correctIndex === i }">
                  {{ LETRAS[i] }}
                </div>

                <q-input
                  v-model="alt.texto"
                  outlined dense
                  :placeholder="`Alternativa ${LETRAS[i]}${i >= 2 ? ' (opcional)' : ''}`"
                  :disable="atividadeStore.isLoading"
                  class="alt-input"
                />

                <q-btn
                  flat round dense
                  :icon="correctIndex === i ? 'check_circle' : 'radio_button_unchecked'"
                  :color="correctIndex === i ? 'positive' : 'grey-5'"
                  size="sm"
                  :disable="atividadeStore.isLoading"
                  @click="setCorrect(i)"
                >
                  <q-tooltip>{{ correctIndex === i ? 'Resposta correta' : 'Marcar como correta' }}</q-tooltip>
                </q-btn>

                <q-btn
                  v-if="i >= 2"
                  flat round dense
                  icon="close"
                  color="grey-4"
                  size="sm"
                  :disable="alternativas.length <= 2 || atividadeStore.isLoading"
                  @click="removerAlternativa(i)"
                >
                  <q-tooltip>Remover alternativa</q-tooltip>
                </q-btn>
                <div v-else style="width: 28px; flex-shrink: 0" />
              </div>
            </div>

            <div v-if="alternativas.length < 5" class="adicionar-btn" @click="adicionarAlternativa">
              <q-icon name="add_circle_outline" size="16px" />
              Adicionar alternativa {{ LETRAS[alternativas.length] }}
            </div>

            <div class="alt-contador">
              <q-icon name="info" size="13px" color="grey-5" />
              {{ qtdPreenchidas }} de {{ alternativas.length }} alternativas preenchidas
              <span v-if="correctIndex !== null" class="alt-contador-correta">
                · Correta: <strong>{{ LETRAS[correctIndex] }}</strong>
              </span>
            </div>
          </div>

          <q-banner
            v-if="erroAlternativas || atividadeStore.error"
            class="text-negative q-mb-sm"
            rounded dense
          >
            <template #avatar><q-icon name="error_outline" /></template>
            {{ erroAlternativas || atividadeStore.error }}
          </q-banner>

          <div class="dialog-acoes">
            <q-btn label="Cancelar" flat color="grey-7" @click="fechar" :disable="atividadeStore.isLoading" />
            <q-btn
              type="submit"
              :label="atividadeParaEditar ? 'Salvar alterações' : 'Criar questão'"
              unelevated color="primary"
              :loading="atividadeStore.isLoading"
            />
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-card {
  width: 560px;
  max-width: 96vw;
  border-radius: 16px;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 18px;
  background: linear-gradient(135deg, #1e3a5f 0%, #2d6a9f 100%);
  color: white;
}

.header-icon {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: rgba(255,255,255,0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.header-titulo { font-size: 1rem; font-weight: 700; line-height: 1.2; }
.header-sub    { font-size: 0.75rem; opacity: 0.75; margin-top: 2px; }

.dialog-body { padding: 20px 22px 4px; }

.campo-grupo { margin-bottom: 20px; }

.campo-label {
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
}

.obrigatorio    { color: #ef4444; margin-left: 2px; }
.campo-opcional { font-weight: 400; color: #9ca3af; }

.alternativas-lista { display: flex; flex-direction: column; gap: 8px; }

.alternativa-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border-radius: 10px;
  border: 1.5px solid #e5e7eb;
  background: #fafafa;
  transition: border-color 0.15s, background 0.15s;
}

.alternativa-correta { border-color: #22c55e; background: #f0fdf4; }
.alternativa-inativa { opacity: 0.65; }

.alternativa-letra {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #374151;
  font-size: 0.75rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}

.letra-correta { background: #22c55e; color: white; }

.alt-input { flex: 1; }

.adicionar-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 2px;
  font-size: 0.8rem;
  font-weight: 500;
  color: #2563eb;
  cursor: pointer;
  width: fit-content;
  opacity: 0.85;
  transition: opacity 0.12s;
}
.adicionar-btn:hover { opacity: 1; }

.alt-contador {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 0.72rem;
  color: #9ca3af;
}
.alt-contador-correta { color: #16a34a; }

.dialog-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 6px 0 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 6px;
}
</style>
