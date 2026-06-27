<script setup lang="ts">
import { reactive, ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const showPassword = ref(false)
const showConfirm = ref(false)
const sucesso = ref(false)

const confirmRules = computed(() => authStore.confirmPasswordRules(form.password))

async function cadastrar() {
  const ok = await authStore.register({
    fullName: form.fullName,
    email: form.email,
    password: form.password,
    role: 'STUDENT',
  })

  if (ok) {
    sucesso.value = true
    // Redireciona pro login após 2s
    setTimeout(() => router.push({ name: 'login' }), 2000)
  }
}
</script>

<template>
  <div>
    <div class="cadastro-header">
      <h1 class="cadastro-titulo">Crie sua conta</h1>
      <p class="cadastro-subtitulo">Comece sua jornada no Libranos hoje</p>
    </div>

    <!-- Sucesso -->
    <q-banner v-if="sucesso" class="text-positive q-mb-md" rounded dense>
      <template #avatar><q-icon name="check_circle" /></template>
      Conta criada com sucesso! Redirecionando para o login...
    </q-banner>

    <!-- Erro -->
    <q-banner v-if="authStore.error && !sucesso" class="text-negative q-mb-md" rounded dense>
      <template #avatar><q-icon name="error_outline" /></template>
      {{ authStore.error }}
    </q-banner>

    <q-form v-if="!sucesso" @submit="cadastrar" greedy>

      <div class="field">
        <q-input
          v-model="form.fullName"
          label="Nome completo"
          outlined
          :rules="authStore.fullNameRules"
          :disable="authStore.isLoading"
          autocomplete="name"
        >
          <template #prepend><q-icon name="person" /></template>
        </q-input>
      </div>

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
          <template #prepend><q-icon name="email" /></template>
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
          autocomplete="new-password"
        >
          <template #prepend><q-icon name="lock" /></template>
          <template #append>
            <q-icon
              :name="showPassword ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showPassword = !showPassword"
            />
          </template>
        </q-input>
      </div>

      <div class="field">
        <q-input
          v-model="form.confirmPassword"
          :type="showConfirm ? 'text' : 'password'"
          label="Confirmar senha"
          outlined
          :rules="confirmRules"
          :disable="authStore.isLoading"
          autocomplete="new-password"
        >
          <template #prepend><q-icon name="lock_outline" /></template>
          <template #append>
            <q-icon
              :name="showConfirm ? 'visibility_off' : 'visibility'"
              class="cursor-pointer"
              @click="showConfirm = !showConfirm"
            />
          </template>
        </q-input>
      </div>

      <q-btn
        type="submit"
        label="Criar conta"
        icon="person_add"
        class="btn-cadastrar"
        unelevated
        :loading="authStore.isLoading"
        :disable="authStore.isLoading"
      />

    </q-form>
  </div>
</template>

<style scoped>
.cadastro-header {
  margin-bottom: 2rem;
}

.cadastro-titulo {
  font-size: 1.9em;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 0.3em 0;
}

.cadastro-subtitulo {
  color: #6b7280;
  font-size: 0.95em;
  margin: 0;
}

.field {
  margin-bottom: 1rem;
}

.btn-cadastrar {
  width: 100%;
  margin-top: 0.5rem;
}
</style>
