<script setup lang="ts">
import { useRouter }    from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const router    = useRouter()
</script>

<template>
  <div class="drawer-container">

    <!-- Cabeçalho -->
    <div class="drawer-brand">
      <q-icon name="sign_language" size="28px" color="white" />
      <span class="brand-text">Libranos</span>
    </div>

    <!-- Usuário -->
    <div class="drawer-user">
      <q-avatar icon="account_circle" color="blue-grey-3" text-color="white" size="40px" />
      <div class="user-info">
        <span class="user-role">{{ authStore.isTeacher ? 'Professor' : 'Aluno' }}</span>
      </div>
    </div>

    <q-separator dark />

    <!-- Navegação -->
    <div class="drawer-scroll">
      <q-list padding>
        <q-item-label header class="nav-label">Módulos</q-item-label>

        <q-item
          clickable v-ripple
          active-class="nav-item-active"
          class="nav-item"
          :to="{ name: 'modulos' }"
          exact
        >
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Início</q-item-section>
        </q-item>

        <q-item
          clickable v-ripple
          active-class="nav-item-active"
          class="nav-item"
          :to="{ name: 'conteudo' }"
          exact
        >
          <q-item-section avatar><q-icon name="menu_book" /></q-item-section>
          <q-item-section>Conteúdo</q-item-section>
        </q-item>

        <q-separator spaced dark />

        <q-item-label header class="nav-label">Atividades</q-item-label>

        <!-- Ver tudo agora aponta para a rota correta -->
        <q-item
          clickable v-ripple
          active-class="nav-item-active"
          class="nav-item"
          :to="{ name: 'ver-tudo' }"
          exact
        >
          <q-item-section avatar><q-icon name="assignment" /></q-item-section>
          <q-item-section>{{ authStore.isTeacher ? 'Visão geral' : 'Meu progresso' }}</q-item-section>
        </q-item>

      </q-list>
    </div>

    <!-- Rodapé: logout -->
    <div class="drawer-footer">
      <q-separator dark />
      <q-item clickable v-ripple class="nav-item logout-item" @click="authStore.logout">
        <q-item-section avatar><q-icon name="logout" /></q-item-section>
        <q-item-section>Sair</q-item-section>
      </q-item>
    </div>

  </div>
</template>

<style scoped>
.drawer-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100vh;
  background-color: #1f3852;
  color: white;
}

.drawer-scroll {
  flex: 1;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.2) transparent;
}

.drawer-brand {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px 16px 14px;
}

.brand-text {
  font-size: 1.4rem;
  font-weight: 800;
  color: white;
  letter-spacing: 0.5px;
}

.drawer-user {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px 16px;
}

.user-info { display: flex; flex-direction: column; }

.user-role {
  font-size: 0.78rem;
  color: #a0b4c8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-label {
  color: #7a96ad !important;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  padding-top: 12px;
}

.nav-item {
  color: #cdd9e3;
  border-radius: 8px;
  margin: 1px 8px;
  min-height: 42px;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.08);
  color: white;
}

.nav-item-active {
  background-color: rgba(255, 255, 255, 0.15) !important;
  color: white !important;
}

.drawer-footer {
  flex-shrink: 0;
  padding-bottom: 8px;
}

.logout-item { color: #f08080; }

.logout-item:hover {
  background-color: rgba(240, 128, 128, 0.12);
  color: #ff9999;
}
</style>
