<script setup lang="ts">
import { reactive, ref, computed, watch } from 'vue'
import { useAulaStore } from '@/stores/aula'
import type { Aula, AulaRequest } from '@/interfaces/aula'

const props = defineProps<{
  modelValue: boolean
  moduloId: number
  aulaParaEditar?: Aula
}>()

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const aulaStore = useAulaStore()

const form = reactive<Omit<AulaRequest, 'moduloId'>>({
  titulo: '',
  descricao: '',
  ordem: 1,
  videoUrl: '',
})

const urlRaw = ref('')

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?/]+)/)
  return match ? match[1] : null
}

const previewSrc = computed(() => {
  const id = extractYoutubeId(urlRaw.value)
  return id ? `https://www.youtube.com/embed/${id}` : null
})

watch(urlRaw, (v) => { form.videoUrl = v })

watch(
  () => props.aulaParaEditar,
  (aula) => {
    if (aula) {
      form.titulo    = aula.titulo
      form.descricao = aula.descricao ?? ''
      form.ordem     = aula.ordem
      urlRaw.value   = aula.videoUrl ?? ''
      form.videoUrl  = aula.videoUrl ?? ''
    } else {
      form.titulo    = ''
      form.descricao = ''
      form.ordem     = 1
      urlRaw.value   = ''
      form.videoUrl  = ''
    }
  },
  { immediate: true },
)

watch(() => props.modelValue, (v) => {
  if (v) aulaStore.error = null
})

function fechar() { emit('update:modelValue', false) }

async function salvar() {
  try {
    const id = extractYoutubeId(form.videoUrl)
    const dto: AulaRequest = {
      ...form,
      videoUrl: id ? `https://www.youtube.com/embed/${id}` : form.videoUrl,
      moduloId: props.moduloId,
    }
    if (props.aulaParaEditar) {
      await aulaStore.atualizar(props.aulaParaEditar.id, dto)
    } else {
      await aulaStore.criar(dto)
    }
    await aulaStore.fetchAulas(props.moduloId)
    fechar()
  } catch { /* erro exposto via aulaStore.error */ }
}
</script>

<template>
  <q-dialog :model-value="modelValue" @update:model-value="fechar" persistent>
    <q-card class="dialog-card">

      <div class="dialog-header">
        <div class="header-icon">
          <q-icon name="play_lesson" size="22px" color="white" />
        </div>
        <div>
          <div class="header-titulo">{{ aulaParaEditar ? 'Editar aula' : 'Nova aula' }}</div>
          <div class="header-sub">Preencha as informações da aula abaixo</div>
        </div>
        <q-space />
        <q-btn icon="close" flat round dense color="white" @click="fechar" />
      </div>

      <q-card-section class="dialog-body">
        <q-form @submit="salvar" greedy>

          <div class="campo-grupo">
            <div class="campo-label">
              <q-icon name="title" size="16px" class="q-mr-xs" />
              Título da aula <span class="obrigatorio">*</span>
            </div>
            <q-input
              v-model="form.titulo"
              outlined dense
              placeholder="Ex: Introdução ao alfabeto em Libras"
              :rules="aulaStore.tituloRules"
              :disable="aulaStore.isLoading"
              hide-bottom-space
            />
          </div>

          <div class="campo-grupo">
            <div class="campo-label">
              <q-icon name="format_list_numbered" size="16px" class="q-mr-xs" />
              Ordem na lista
            </div>
            <q-input
              v-model.number="form.ordem"
              type="number" outlined dense
              :rules="aulaStore.ordemRules"
              :disable="aulaStore.isLoading"
              hide-bottom-space
              style="max-width: 110px"
            />
          </div>

          <div class="campo-grupo">
            <div class="campo-label">
              <q-icon name="notes" size="16px" class="q-mr-xs" />
              Descrição <span class="campo-opcional">(opcional)</span>
            </div>
            <q-input
              v-model="form.descricao"
              type="textarea" outlined dense autogrow
              placeholder="Explique brevemente o que o aluno vai aprender nesta aula"
              :disable="aulaStore.isLoading"
            />
          </div>

          <div class="campo-grupo">
            <div class="campo-label">
              <q-icon name="smart_display" size="16px" class="q-mr-xs" />
              Link do YouTube <span class="campo-opcional">(opcional)</span>
            </div>
            <q-input
              v-model="urlRaw"
              outlined dense
              placeholder="https://www.youtube.com/watch?v=..."
              :disable="aulaStore.isLoading"
            >
              <template #prepend>
                <q-icon name="link" color="grey-6" />
              </template>
            </q-input>

            <div v-if="previewSrc" class="video-preview">
              <div class="video-preview-label">
                <q-icon name="check_circle" color="positive" size="14px" />
                Prévia do vídeo
              </div>
              <div class="video-wrapper">
                <iframe
                  :src="previewSrc"
                  frameborder="0"
                  allow="accelerometer; autoplay; encrypted-media"
                  allowfullscreen
                />
              </div>
            </div>

            <div v-else-if="urlRaw && !previewSrc" class="video-aviso">
              <q-icon name="info" size="14px" color="warning" />
              URL não reconhecida como YouTube. Cole o link completo do vídeo.
            </div>
          </div>

          <q-banner v-if="aulaStore.error" class="text-negative q-mb-md" rounded dense>
            <template #avatar><q-icon name="error_outline" /></template>
            {{ aulaStore.error }}
          </q-banner>

          <div class="dialog-acoes">
            <q-btn label="Cancelar" flat color="grey-7" @click="fechar" :disable="aulaStore.isLoading" />
            <q-btn
              type="submit"
              :label="aulaParaEditar ? 'Salvar alterações' : 'Criar aula'"
              unelevated color="primary"
              :loading="aulaStore.isLoading"
            />
          </div>

        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<style scoped>
.dialog-card {
  width: 520px;
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

.video-preview {
  margin-top: 10px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.video-preview-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.72rem;
  font-weight: 600;
  color: #374151;
  padding: 7px 10px;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.video-wrapper {
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
}
.video-wrapper iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.video-aviso {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 6px;
  font-size: 0.75rem;
  color: #92400e;
}

.dialog-acoes {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 6px 0 16px;
  border-top: 1px solid #f0f0f0;
  margin-top: 6px;
}
</style>
