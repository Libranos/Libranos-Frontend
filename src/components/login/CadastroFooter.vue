<script setup lang="ts">
import { useRouter } from 'vue-router'
const router = useRouter()
</script>

<template>
  <div>
    <p class="login-link">
      Já tem uma conta?
      <a href="#" @click.prevent="router.push({ name: 'login' })">Entrar</a>
    </p>
  </div>
</template>

<style scoped>
.login-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9em;
  color: #6b7280;
}

.login-link a {
  color: #1e3a5f;
  font-weight: 700;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
