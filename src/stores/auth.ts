import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { loginUser, registerUser } from '@/services/authService'
import {
  getAuthToken, setAuthToken, removeAuthToken,
  getUserRole, setUserRole, removeUserRole,
  getUserEmail, setUserEmail, removeUserEmail,
} from '@/utils/cookies'
import type { LoginCredentials, AuthUser, Role, RegisterRequest } from '@/interfaces/auth'
import { useProgressoStore } from '@/stores/progresso'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getAuthToken())
  const role  = ref<Role | null>(getUserRole() as Role | null)
  const email = ref<string | null>(getUserEmail())
  const user  = ref<AuthUser | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => token.value !== null)
  const isTeacher       = computed(() => role.value === 'TEACHER')

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

  function aplicarLogin(responseToken: string, responseRole: string, userEmail: string, expiresIn: number) {
    token.value = responseToken
    role.value  = responseRole as Role
    email.value = userEmail

    setAuthToken(responseToken, expiresIn)
    setUserRole(responseRole, expiresIn)
    setUserEmail(userEmail, expiresIn)

    useProgressoStore().inicializar(userEmail)
  }

  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await loginUser(credentials)
      aplicarLogin(response.token, response.role, credentials.email, response.expiresIn)
      router.push('/modulos')
    } catch (err) {
      error.value = isAxiosError(err) && err.response?.status === 401
        ? 'E-mail ou senha incorretos.'
        : 'Não foi possível conectar ao servidor. Tente novamente.'
    } finally {
      isLoading.value = false
    }
  }

  async function register(dto: RegisterRequest): Promise<boolean> {
    isLoading.value = true
    error.value = null
    try {
      await registerUser(dto)
      const response = await loginUser({ email: dto.email, password: dto.password })
      aplicarLogin(response.token, response.role, dto.email, response.expiresIn)
      router.push('/modulos')
      return true
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 409)      error.value = 'Este e-mail já está cadastrado.'
        else if (status === 400) error.value = 'Dados inválidos. Verifique as informações e tente novamente.'
        else                     error.value = 'Não foi possível conectar ao servidor. Tente novamente.'
      } else {
        error.value = 'Ocorreu um erro inesperado.'
      }
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout(): void {
    useProgressoStore().limpar()
    token.value = null
    role.value  = null
    email.value = null
    user.value  = null
    removeAuthToken()
    removeUserRole()
    removeUserEmail()
    router.push('/')
  }

  function inicializarSessaoExistente() {
    if (token.value && email.value) {
      useProgressoStore().inicializar(email.value)
    }
  }

  function loginWithGoogle()   { console.log('Login com Google') }
  function loginWithFacebook() { console.log('Login com Facebook') }

  return {
    token, role, email, user, isLoading, error,
    isAuthenticated, isTeacher,
    emailRules, passwordRules, fullNameRules, confirmPasswordRules,
    login, register, logout,
    inicializarSessaoExistente,
    loginWithGoogle, loginWithFacebook,
  }
})
