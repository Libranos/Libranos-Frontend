<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const form = reactive({ email: '', password: '' })
const showPassword = ref(false)
</script>

<template>
  <div>
    <div class="login-header">
      <h1 class="login-titulo">Bem-vindo de volta!</h1>
      <p class="login-subtitulo">Faça login para continuar aprendendo</p>
    </div>

    <q-banner
      v-if="authStore.error"
      class="text-negative q-mb-md"
      rounded
      dense
    >
      <template #avatar>
        <q-icon name="error_outline" />
      </template>
      {{ authStore.error }}
    </q-banner>

    <q-form @submit="authStore.login(form)" greedy>
      <div class="field">
        <q-input
          v-model="form.email"
          type="email"
          label="E-mail"
          outlined
          :rules="authStore.emailRules"
          :disable="authStore.isLoading"
          autocomplete="email"
        >
          <template #prepend>
            <q-icon name="email" />
          </template>
        </q-input>
      </div>

      <div class="field">
        <q-input
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          label="Senha"
          outlined
          :rules="authStore.passwordRules"
          :disable="authStore.isLoading"
          autocomplete="current-password"
        >
          <template #prepend>
            <q-icon name="lock" />
          </template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
        <a href="#" class="forgot-password">Esqueceu sua senha?</a>
      </div>

      <q-btn
        type="submit"
        label="Entrar"
        icon="login"
        class="btn-entrar"
        unelevated
        :loading="authStore.isLoading"
        :disable="authStore.isLoading"
      />
    </q-form>
  </div>
</template>

<style scoped>
.login-header {
  margin-bottom: 2rem;
}

.login-titulo {
  font-size: 1.9em;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 0.3em 0;
}

.login-subtitulo {
  color: #6b7280;
  font-size: 0.95em;
  margin: 0;
}

.field {
  margin-bottom: 1rem;
}

.forgot-password {
  display: inline-block;
  margin-top: 6px;
  font-size: 0.85em;
  color: #1e3a5f;
  font-weight: 600;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.btn-entrar {
  width: 100%;
  margin-top: 0.5rem;
}
</style>
