<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

// Quando a página carrega (F5), se há sessão ativa nos cookies,
// restaura o progressoStore com os dados do localStorage
onMounted(() => {
  authStore.inicializarSessaoExistente()
})
</script>

<template>
  <router-view />
</template>

<style>
body {
  margin: 0;
  padding: 0;
}
</style>
