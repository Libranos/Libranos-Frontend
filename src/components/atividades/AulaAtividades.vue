<script setup lang="ts">
const props = defineProps<{
  atividades: any[]
  respostasSelecionadas: Record<number, number | null>
  respostasConfirmadas: Record<number, boolean>
  respostasAcertadas: Record<number, boolean>
}>()

const emit = defineEmits<{
  selecionarResposta: [atividadeId: number, index: number]
  confirmarResposta: [atividade: any]
}>()

function classeOpcao(atividadeId: number, index: number, opcao: any) {
  const confirmado = props.respostasConfirmadas[atividadeId]
  const selecionado = props.respostasSelecionadas[atividadeId] === index

  if (!confirmado) {
    return selecionado ? 'opcao-selecionada' : ''
  }
  if (opcao.correta) return 'correta'
  if (selecionado && !opcao.correta) return 'errada'
  return ''
}
</script>

<template>
  <section v-if="atividades.length" class="atividades-section">
    <h2 class="secao-titulo">Atividades</h2>

    <div class="atividades-lista">
      <div v-for="atividade in atividades" :key="atividade.id" class="atividade-card">

        <p class="atividade-pergunta">{{ atividade.titulo }}</p>

        <div class="opcoes-grid">
          <button
            v-for="(opcao, index) in atividade.alternativas"
            :key="index"
            class="opcao-btn"
            :class="classeOpcao(atividade.id, index, opcao)"
            @click="emit('selecionarResposta', atividade.id, index)"
          >
            {{ opcao.texto }}
          </button>
        </div>

        <div class="confirmar-wrapper">
          <button class="confirmar-btn" @click="emit('confirmarResposta', atividade)">
            Confirmar
          </button>
        </div>

      </div>
    </div>
  </section>
</template>

<style scoped>
.atividades-section { margin-top: 24px; }

.secao-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #1f3852;
  margin: 0 0 10px;
}

.atividades-lista { display: flex; flex-direction: column; gap: 18px; }

.atividade-card {
  padding: 18px;
  border: 1px solid #e6eef5;
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 2px 10px rgba(15, 34, 51, 0.04);
}

.atividade-pergunta {
  font-weight: 700;
  font-size: 0.95rem;
  color: #1f3852;
  margin-bottom: 14px;
}

.opcoes-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.opcao-btn {
  padding: 12px 14px;
  border: 1px solid #d6e2ec;
  border-radius: 10px;
  cursor: pointer;
  background: #f9fbfd;
  color: #1f3852;
  font-weight: 500;
  font-size: 0.88rem;
  text-align: left;
  transition: all 0.15s ease;
  display: flex;
  align-items: center;
}
.opcao-btn:hover { background: #eef6ff; border-color: #3a9bd5; transform: translateY(-1px); }

.opcao-selecionada {
  background: #3a9bd5;
  color: white;
  border-color: #3a9bd5;
  box-shadow: 0 6px 16px rgba(58, 155, 213, 0.25);
}

.correta {
  background: #22c55e !important;
  border-color: #22c55e !important;
  color: white !important;
  animation: pop 0.25s ease;
}

.errada {
  background: #ef4444 !important;
  border-color: #ef4444 !important;
  color: white !important;
  animation: shake 0.25s ease;
}

.confirmar-wrapper { display: flex; justify-content: flex-end; margin-top: 12px; }

.confirmar-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 8px;
  background: #3a9bd5;
  color: white;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.75rem;
  display: inline-flex;
  align-items: center;
  transition: 0.2s;
}
.confirmar-btn:hover { background: #2f89c6; }

@keyframes pop {
  0% { transform: scale(0.95); }
  100% { transform: scale(1); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-4px); }
  50% { transform: translateX(4px); }
  75% { transform: translateX(-2px); }
}

@media (max-width: 768px) {
  .opcoes-grid { grid-template-columns: 1fr; }
}
</style>
