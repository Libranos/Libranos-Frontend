import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { loginUser, registerUser } from '@/services/authService'
import { getAuthToken, setAuthToken, removeAuthToken, getUserRole, setUserRole, removeUserRole } from '@/utils/cookies'
import type { LoginCredentials, AuthUser, Role, RegisterRequest } from '@/interfaces/auth'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ─────────────────────────────────────────────────────────────────

  const token = ref<string | null>(getAuthToken())
  const role  = ref<Role | null>(getUserRole() as Role | null)
  const user  = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // ── Getters ────────────────────────────────────────────────────────────────

  const isAuthenticated = computed(() => token.value !== null)
  const isTeacher       = computed(() => role.value === 'TEACHER')

  // ── Regras de validação ────────────────────────────────────────────────────

  const emailRules = [
    (v: string) => !!v || 'E-mail é obrigatório',
    (v: string) => /.+@.+\..+/.test(v) || 'Informe um e-mail válido',
  ]

  const passwordRules = [(v: string) => !!v || 'Senha é obrigatória']

  const fullNameRules = [
    (v: string) => !!v || 'Nome completo é obrigatório',
    (v: string) => v.trim().split(' ').length >= 2 || 'Informe nome e sobrenome',
  ]

  const confirmPasswordRules = (senha: string) => [
    (v: string) => !!v || 'Confirmação de senha é obrigatória',
    (v: string) => v === senha || 'As senhas não coincidem',
  ]

  // ── Actions ────────────────────────────────────────────────────────────────

  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null

    try {
      const response = await loginUser(credentials)

      token.value = response.token
      role.value  = response.role

      setAuthToken(response.token, response.expiresIn)
      setUserRole(response.role, response.expiresIn)

      router.push('/modulos')
    } catch (err) {
      if (isAxiosError(err)) {
        error.value =
          err.response?.status === 401
            ? 'E-mail ou senha incorretos.'
            : 'Não foi possível conectar ao servidor. Tente novamente.'
      } else {
        error.value = 'Ocorreu um erro inesperado.'
      }
    } finally {
      isLoading.value = false
    }
  }

  async function register(dto: RegisterRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null

    try {
      await registerUser(dto)
      return true
    } catch (err) {
      if (isAxiosError(err)) {
        if (err.response?.status === 409) {
          error.value = 'Este e-mail já está cadastrado.'
        } else if (err.response?.status === 400) {
          error.value = 'Dados inválidos. Verifique as informações e tente novamente.'
        } else {
          error.value = 'Não foi possível conectar ao servidor. Tente novamente.'
        }
      } else {
        error.value = 'Ocorreu um erro inesperado.'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    token.value = null
    role.value  = null
    user.value  = null
    removeAuthToken()
    removeUserRole()
    router.push('/')
  }

  function loginWithGoogle(): void {
    console.log('Login com Google')
  }

  function loginWithFacebook(): void {
    console.log('Login com Facebook')
  }

  return {
    token, role, user, isLoading, error,
    isAuthenticated, isTeacher,
    emailRules, passwordRules, fullNameRules, confirmPasswordRules,
    login, register, logout,
    loginWithGoogle, loginWithFacebook,
  }
})
