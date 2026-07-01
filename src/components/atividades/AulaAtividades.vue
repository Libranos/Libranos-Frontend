<script setup lang="ts">
import { computed } from 'vue'
import type { Atividade, Alternativa } from '@/interfaces/atividade'

const props = defineProps<{
  atividades: Atividade[]
  respostasSelecionadas: Record<number, number | null>
  respostasConfirmadas: Record<number, boolean>
  respostasAcertadas: Record<number, boolean>
  isTeacher?: boolean
}>()

const emit = defineEmits<{
  selecionarResposta: [atividadeId: number, index: number]
  confirmarTodas: []
  adicionarAtividade: []
  editarAtividade: [atividade: Atividade]
  removerAtividade: [atividadeId: number]
}>()

const LETRAS = ['A', 'B', 'C', 'D', 'E']

const qtdMarcadas = computed(() =>
  props.atividades.filter(a =>
    props.respostasSelecionadas[a.id] !== undefined &&
    props.respostasSelecionadas[a.id] !== null,
  ).length
)

const todasMarcadas = computed(() =>
  props.atividades.length > 0 && qtdMarcadas.value === props.atividades.length
)

const todasConfirmadas = computed(() =>
  props.atividades.length > 0 &&
  props.atividades.every(a => props.respostasConfirmadas[a.id])
)

const totalAcertos = computed(() =>
  props.atividades.filter(a => props.respostasAcertadas[a.id]).length
)

const percentual = computed(() =>
  props.atividades.length > 0
    ? Math.round((totalAcertos.value / props.atividades.length) * 100)
    : 0
)

const placarCor = computed(() => {
  if (percentual.value >= 70) return 'positive'
  if (percentual.value >= 40) return 'warning'
  return 'negative'
})

const placarMensagem = computed(() => {
  if (percentual.value === 100) return 'Perfeito! Você acertou tudo! 🎉'
  if (percentual.value >= 70)  return 'Muito bem! Bom aproveitamento!'
  if (percentual.value >= 40)  return 'Quase lá! Continue praticando.'
  return 'Não desanime! Revise o conteúdo e tente novamente.'
})

function classeOpcao(atividadeId: number, index: number, opcao: Alternativa) {
  const confirmado = props.respostasConfirmadas[atividadeId]
  const selecionado = props.respostasSelecionadas[atividadeId] === index
  if (!confirmado) return selecionado ? 'opcao-selecionada' : ''
  if (opcao.correta) return 'correta'
  if (selecionado && !opcao.correta) return 'errada'
  return ''
}
</script>

<template>
  <section v-if="atividades.length || isTeacher" class="atividades-section">

    <div class="secao-header">
      <div class="secao-titulo-wrap">
        <div class="secao-icone">
          <q-icon name="quiz" size="18px" color="white" />
        </div>
        <div>
          <h2 class="secao-titulo">Atividades</h2>
          <span class="secao-sub">{{ atividades.length }} {{ atividades.length === 1 ? 'questão' : 'questões' }}</span>
        </div>
      </div>

      <q-btn
        v-if="isTeacher"
        unelevated dense icon="add" label="Nova questão"
        color="primary" size="sm"
        @click="emit('adicionarAtividade')"
      />
    </div>

    <div v-if="todasConfirmadas" class="placar-card" :class="`placar-${placarCor}`">
      <div class="placar-numero">
        <span class="placar-acertos">{{ totalAcertos }}</span>
        <span class="placar-total">/{{ atividades.length }}</span>
      </div>
      <div class="placar-info">
        <div class="placar-porcentagem">{{ percentual }}% de aproveitamento</div>
        <div class="placar-mensagem">{{ placarMensagem }}</div>
      </div>
      <q-icon :name="percentual >= 70 ? 'emoji_events' : 'school'" size="36px" class="placar-icone" />
    </div>

    <div v-else-if="atividades.length > 0" class="progresso-barra-wrap">
      <div class="progresso-texto">
        <span>{{ qtdMarcadas }}</span>
        de {{ atividades.length }} marcadas
      </div>
      <q-linear-progress
        :value="qtdMarcadas / atividades.length"
        color="primary" track-color="blue-grey-2"
        style="height: 6px; border-radius: 3px"
        instant-feedback
      />
    </div>

    <div class="atividades-lista">
      <div
        v-for="(atividade, qi) in atividades"
        :key="atividade.id"
        class="atividade-card"
        :class="{
          'card-respondida': respostasConfirmadas[atividade.id],
          'card-acertou': respostasConfirmadas[atividade.id] && respostasAcertadas[atividade.id],
          'card-errou': respostasConfirmadas[atividade.id] && !respostasAcertadas[atividade.id],
        }"
      >
        <div class="questao-header">
          <div class="questao-num">{{ qi + 1 }}</div>
          <p class="questao-texto">{{ atividade.titulo }}</p>

          <div v-if="respostasConfirmadas[atividade.id]" class="questao-resultado">
            <q-icon
              :name="respostasAcertadas[atividade.id] ? 'check_circle' : 'cancel'"
              :color="respostasAcertadas[atividade.id] ? 'positive' : 'negative'"
              size="20px"
            />
          </div>

          <div v-if="isTeacher" class="questao-acoes" @click.stop>
            <q-btn flat round dense icon="edit" size="xs" color="primary" @click="emit('editarAtividade', atividade)">
              <q-tooltip>Editar questão</q-tooltip>
            </q-btn>
            <q-btn flat round dense icon="delete" size="xs" color="negative" @click="emit('removerAtividade', atividade.id)">
              <q-tooltip>Remover questão</q-tooltip>
            </q-btn>
          </div>
        </div>

        <div class="alternativas-grid">
          <button
            v-for="(opcao, index) in atividade.alternativas"
            :key="index"
            class="opcao-btn"
            :class="classeOpcao(atividade.id, index, opcao)"
            :disabled="!!respostasConfirmadas[atividade.id]"
            @click="emit('selecionarResposta', atividade.id, index)"
          >
            <span class="opcao-letra">{{ LETRAS[index] }}</span>
            <span class="opcao-texto">{{ opcao.texto }}</span>
            <q-icon
              v-if="respostasConfirmadas[atividade.id] && opcao.correta"
              name="check_circle"
              class="opcao-icone-correta"
              size="16px"
            />
          </button>
        </div>
      </div>
    </div>

    <div v-if="!todasConfirmadas && atividades.length > 0" class="confirmar-wrapper">
      <div v-if="!todasMarcadas" class="confirmar-aviso">
        <q-icon name="info" size="14px" color="grey-5" />
        Responda todas as questões para confirmar
      </div>
      <q-btn
        v-else
        unelevated icon="check_circle" label="Confirmar respostas"
        color="positive" size="md"
        class="confirmar-btn"
        @click="emit('confirmarTodas')"
      />
    </div>

  </section>
</template>

<style scoped>
.atividades-section {
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e8edf2;
}

.secao-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}

.secao-titulo-wrap { display: flex; align-items: center; gap: 12px; }

.secao-icone {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, #1e3a5f, #2d6a9f);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.secao-titulo { font-size: 1rem; font-weight: 700; color: #1f3852; margin: 0; line-height: 1.2; }
.secao-sub    { font-size: 0.75rem; color: #6b7280; }

.placar-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 18px 22px;
  border-radius: 14px;
  margin-bottom: 20px;
  border: 2px solid transparent;
  position: relative;
  overflow: hidden;
}

.placar-positive { background: #f0fdf4; border-color: #86efac; }
.placar-warning  { background: #fffbeb; border-color: #fcd34d; }
.placar-negative { background: #fef2f2; border-color: #fca5a5; }

.placar-numero { display: flex; align-items: baseline; gap: 2px; flex-shrink: 0; }
.placar-acertos { font-size: 2.8rem; font-weight: 800; line-height: 1; color: #1f3852; }
.placar-total   { font-size: 1.3rem; font-weight: 600; color: #6b7280; }

.placar-info { flex: 1; }
.placar-porcentagem { font-size: 0.9rem; font-weight: 700; color: #1f3852; }
.placar-mensagem    { font-size: 0.8rem; color: #6b7280; margin-top: 2px; }

.placar-icone { opacity: 0.2; position: absolute; right: 16px; color: #1f3852; }

.progresso-barra-wrap { margin-bottom: 16px; display: flex; flex-direction: column; gap: 6px; }
.progresso-texto      { font-size: 0.75rem; color: #6b7280; }
.progresso-texto span { font-weight: 700; color: #1f3852; }

.atividades-lista { display: flex; flex-direction: column; gap: 14px; }

.atividade-card {
  padding: 18px;
  border: 1.5px solid #e6eef5;
  border-radius: 14px;
  background: #fff;
  transition: border-color 0.2s;
}

.card-acertou { border-color: #86efac; background: #f0fdf4; }
.card-errou   { border-color: #fca5a5; background: #fef2f2; }

.questao-header { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 14px; }

.questao-num {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #1e3a5f;
  color: white;
  font-size: 0.72rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 1px;
}

.questao-texto   { flex: 1; font-weight: 600; font-size: 0.92rem; color: #1f3852; margin: 0; line-height: 1.5; }
.questao-resultado { flex-shrink: 0; margin-top: 2px; }
.questao-acoes   { display: flex; gap: 2px; flex-shrink: 0; }

.alternativas-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

.opcao-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 13px;
  border: 1.5px solid #d6e2ec;
  border-radius: 10px;
  cursor: pointer;
  background: #f9fbfd;
  color: #1f3852;
  font-size: 0.85rem;
  text-align: left;
  transition: all 0.14s ease;
  position: relative;
}
.opcao-btn:hover:not(:disabled) { background: #eef6ff; border-color: #3a9bd5; transform: translateY(-1px); }
.opcao-btn:disabled              { cursor: default; transform: none; }

.opcao-letra {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #e5e7eb;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.opcao-texto        { flex: 1; font-weight: 500; }
.opcao-icone-correta { flex-shrink: 0; color: #16a34a; }

.opcao-selecionada {
  background: #1e3a5f;
  border-color: #1e3a5f;
  color: white;
  box-shadow: 0 4px 14px rgba(30, 58, 95, 0.22);
}
.opcao-selecionada .opcao-letra { background: rgba(255,255,255,0.2); color: white; }

.correta { background: #f0fdf4 !important; border-color: #22c55e !important; color: #14532d !important; }
.correta .opcao-letra { background: #22c55e; color: white; }

.errada  { background: #fef2f2 !important; border-color: #ef4444 !important; color: #7f1d1d !important; }
.errada .opcao-letra  { background: #ef4444; color: white; }

.confirmar-wrapper { display: flex; flex-direction: column; align-items: center; margin-top: 24px; gap: 10px; }

.confirmar-aviso {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 0.8rem;
  color: #9ca3af;
}

.confirmar-btn { padding: 0 28px; height: 44px; font-weight: 600; font-size: 0.92rem; border-radius: 10px; }

@media (max-width: 600px) {
  .alternativas-grid { grid-template-columns: 1fr; }
  .placar-acertos    { font-size: 2.2rem; }
  .placar-icone      { display: none; }
}
</style>
