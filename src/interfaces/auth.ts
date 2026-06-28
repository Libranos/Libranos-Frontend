export type Role = 'TEACHER' | 'STUDENT'

export interface LoginCredentials {
  email: string
  password: string
}

export interface LoginResponse {
  token: string
  expiresIn: number
  role: Role
}

export interface AuthUser {
  email: string
  role: Role
}

// ── Cadastro ─────────────────────────────────────────────────────────────────

export interface RegisterRequest {
  email: string
  password: string
  fullName: string
  role: Role
}
