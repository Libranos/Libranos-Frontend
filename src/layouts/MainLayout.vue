<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AppDrawer from '@/components/layout/AppDrawer.vue'

const authStore    = useAuthStore()
const drawerAberto = ref(false)
</script>

<template>
  <q-layout view="lHh LpR lFf">

    <q-header class="app-header">
      <q-toolbar>
        <q-btn flat round icon="menu" color="white" @click="drawerAberto = !drawerAberto" />

        <q-toolbar-title class="toolbar-brand">
          <q-icon name="sign_language" size="22px" class="q-mr-xs" />
          Libranos
        </q-toolbar-title>

        <q-chip
          v-if="authStore.isTeacher"
          dense
          color="teal-8"
          text-color="white"
          icon="school"
          label="Professor"
          class="q-mr-sm"
        />

        <q-btn flat round icon="logout" color="white" @click="authStore.logout">
          <q-tooltip>Sair</q-tooltip>
        </q-btn>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="drawerAberto"
      side="left"
      :width="240"
      :breakpoint="700"
      overlay
      behavior="mobile"
    >
      <AppDrawer />
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>

  </q-layout>
</template>

<style scoped>
.app-header {
  background-color: #1f3852;
}

.toolbar-brand {
  font-size: 1.3rem;
  font-weight: 700;
  display: flex;
  align-items: center;
}
</style>
