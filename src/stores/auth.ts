import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { isAxiosError } from 'axios'
import { loginUser, registerUser } from '@/services/authService'
import { getAuthToken, setAuthToken, removeAuthToken, getUserRole, setUserRole, removeUserRole, getUserEmail, setUserEmail, removeUserEmail } from '@/utils/cookies'
import type { LoginCredentials, AuthUser, Role, RegisterRequest } from '@/interfaces/auth'
import { useProgressoStore } from '@/stores/progresso'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  // ── Estado ─────────────────────────────────────────────────────────────────

  const token = ref<string | null>(getAuthToken())
  const role  = ref<Role | null>(getUserRole() as Role | null)
  const email = ref<string | null>(getUserEmail())
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
  const passwordRules    = [(v: string) => !!v || 'Senha é obrigatória']
  const fullNameRules    = [
    (v: string) => !!v || 'Nome completo é obrigatório',
    (v: string) => v.trim().split(' ').length >= 2 || 'Informe nome e sobrenome',
  ]
  const confirmPasswordRules = (senha: string) => [
    (v: string) => !!v || 'Confirmação de senha é obrigatória',
    (v: string) => v === senha || 'As senhas não coincidem',
  ]

  // ── Helpers ────────────────────────────────────────────────────────────────

  // Aplica o resultado de um login bem-sucedido (reutilizado por login e register)
  function _aplicarLogin(responseToken: string, responseRole: string, userEmailStr: string, expiresIn: number) {
    token.value = responseToken
    role.value  = responseRole as Role
    email.value = userEmailStr

    setAuthToken(responseToken, expiresIn)
    setUserRole(responseRole, expiresIn)
    setUserEmail(userEmailStr, expiresIn)

    // Inicializa o progresso store com o email (carrega localStorage)
    const progressoStore = useProgressoStore()
    progressoStore.inicializar(userEmailStr)
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  async function login(credentials: LoginCredentials): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const response = await loginUser(credentials)
      _aplicarLogin(response.token, response.role, credentials.email, response.expiresIn)
      router.push('/modulos')
    } catch (err) {
      if (isAxiosError(err)) {
        error.value = err.response?.status === 401
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
      // 1. Cadastra o usuário
      await registerUser(dto)

      // 2. Faz login automaticamente com as mesmas credenciais
      const response = await loginUser({ email: dto.email, password: dto.password })
      _aplicarLogin(response.token, response.role, dto.email, response.expiresIn)

      // 3. Redireciona direto pra home
      router.push('/modulos')
      return true
    } catch (err) {
      if (isAxiosError(err)) {
        const status = err.response?.status
        if (status === 409) {
          error.value = 'Este e-mail já está cadastrado.'
        } else if (status === 400) {
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
    const progressoStore = useProgressoStore()
    progressoStore.limpar()

    token.value = null
    role.value  = null
    email.value = null
    user.value  = null

    removeAuthToken()
    removeUserRole()
    removeUserEmail()

    router.push('/')
  }

  // Inicializa o progressoStore se já há um email salvo no cookie (F5 com sessão ativa)
  function inicializarSessaoExistente() {
    if (token.value && email.value) {
      const progressoStore = useProgressoStore()
      progressoStore.inicializar(email.value)
    }
  }

  function loginWithGoogle()    { console.log('Login com Google') }
  function loginWithFacebook()  { console.log('Login com Facebook') }

  return {
    token, role, email, user, isLoading, error,
    isAuthenticated, isTeacher,
    emailRules, passwordRules, fullNameRules, confirmPasswordRules,
    login, register, logout,
    inicializarSessaoExistente,
    loginWithGoogle, loginWithFacebook,
  }
})
