<script setup lang="ts">
import { useModuloDetalhe } from '@/composables/useModuloDetalhe'
import AulasSidebar from '@/components/aulas/AulasSidebar.vue'
import AulaPlayer from '@/components/aulas/AulaPlayer.vue'
import AulaAtividades from '@/components/atividades/AulaAtividades.vue'
import AulaFormDialog from '@/components/aulas/AulaFormDialog.vue'
import AtividadeFormDialog from '@/components/atividades/AtividadeFormDialog.vue'

const {
  moduloId, modulo, isLoadingModulo,
  aulas, aulaAtiva, aulaAnterior, proximaAula, videoSrc,
  atividades,
  respostasSelecionadas, respostasAcertadas, respostasConfirmadas,
  dialogAulaAberto, aulaParaEditar,
  dialogAtividadeAberto, atividadeParaEditar, proximaOrdemAtividade,
  aulaStore, authStore,
  selecionarAula, abrirCriacaoAula, abrirEdicaoAula, removerAula,
  abrirCriacaoAtividade, abrirEdicaoAtividade, removerAtividade,
  selecionarResposta, confirmarTodas,
  voltar,
} = useModuloDetalhe()
</script>

<template>
  <q-page class="detalhe-page">
    <div class="detalhe-layout">

      <AulasSidebar
        :modulo="modulo"
        :is-loading-modulo="isLoadingModulo"
        :aulas="aulas"
        :aula-ativa-id="aulaAtiva?.id"
        :is-loading-aulas="aulaStore.isLoading"
        :is-teacher="authStore.isTeacher"
        @voltar="voltar"
        @selecionar-aula="selecionarAula"
        @editar-aula="abrirEdicaoAula"
        @remover-aula="removerAula"
        @adicionar-aula="abrirCriacaoAula"
      />

      <main class="main-area">

        <div v-if="!aulaAtiva && !aulaStore.isLoading" class="estado-vazio">
          <q-icon name="play_circle_outline" size="72px" color="blue-grey-7" />
          <p class="estado-vazio-titulo">Selecione uma aula</p>
          <p class="estado-vazio-sub">Escolha uma aula na lista ao lado para começar</p>
        </div>

        <div v-else-if="aulaStore.isLoading && !aulaAtiva" class="estado-vazio">
          <q-spinner-dots size="48px" color="blue-grey-7" />
          <p class="estado-vazio-sub q-mt-md">Carregando aulas...</p>
        </div>

        <AulaPlayer
          v-else-if="aulaAtiva"
          :aula="aulaAtiva"
          :modulo="modulo"
          :total-aulas="aulas.length"
          :video-src="videoSrc"
          :aula-anterior="aulaAnterior"
          :proxima-aula="proximaAula"
          :is-teacher="authStore.isTeacher"
          @editar-aula="abrirEdicaoAula"
          @navegar="selecionarAula"
        >
          <template #atividades>
            <AulaAtividades
              :atividades="atividades"
              :respostas-selecionadas="respostasSelecionadas"
              :respostas-confirmadas="respostasConfirmadas"
              :respostas-acertadas="respostasAcertadas"
              :is-teacher="authStore.isTeacher"
              @selecionar-resposta="selecionarResposta"
              @confirmar-todas="confirmarTodas"
              @adicionar-atividade="abrirCriacaoAtividade"
              @editar-atividade="abrirEdicaoAtividade"
              @remover-atividade="removerAtividade"
            />
          </template>
        </AulaPlayer>

      </main>
    </div>

    <AulaFormDialog
      v-model="dialogAulaAberto"
      :modulo-id="moduloId"
      :aula-para-editar="aulaParaEditar"
    />

    <AtividadeFormDialog
      v-model="dialogAtividadeAberto"
      :aula-id="aulaAtiva?.id ?? 0"
      :atividade-para-editar="atividadeParaEditar"
      :proxima-ordem="proximaOrdemAtividade"
    />
  </q-page>
</template>

<style scoped>
.detalhe-page { padding: 0 !important; }

.detalhe-layout {
  display: flex;
  height: calc(100vh - 50px);
  overflow: hidden;
  min-height: 0;
}

.main-area {
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow-y: auto;
  background: #111d28;
  display: flex;
  flex-direction: column;
}

.estado-vazio {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 40px;
  text-align: center;
}

.estado-vazio-titulo {
  font-size: 1.1rem;
  font-weight: 600;
  color: #4a6e87;
  margin: 0;
}

.estado-vazio-sub {
  font-size: 0.85rem;
  color: #2e4b5e;
  margin: 0;
}

@media (max-width: 768px) {
  .detalhe-layout { flex-direction: column; height: auto; overflow: visible; }
  .main-area { background: #111d28; }
}
</style>
