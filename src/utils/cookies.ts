const AUTH_COOKIE = 'auth_token'
const ROLE_COOKIE = 'user_role'

interface CookieOptions {
  expiresInMs?: number  // TTL em milissegundos (vindo do campo expiresIn do backend)
  path?: string
  sameSite?: 'Strict' | 'Lax' | 'None'
}

function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const { expiresInMs, path = '/', sameSite = 'Strict' } = options

  // SameSite=None exige Secure; nos demais casos seta Secure apenas em HTTPS
  const secure =
    sameSite === 'None' || window.location.protocol === 'https:'

  let cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`

  if (expiresInMs !== undefined) {
    cookie += `; Expires=${new Date(Date.now() + expiresInMs).toUTCString()}`
  }

  cookie += `; Path=${path}; SameSite=${sameSite}`
  if (secure) cookie += '; Secure'

  document.cookie = cookie
}

function getCookie(name: string): string | null {
  const prefix = `${encodeURIComponent(name)}=`

  for (const part of document.cookie.split('; ')) {
    if (part.startsWith(prefix)) {
      return decodeURIComponent(part.slice(prefix.length))
    }
  }

  return null
}

function removeCookie(name: string, path = '/'): void {
  // Expira imediatamente sobrescrevendo com data no passado
  document.cookie = `${encodeURIComponent(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=${path}`
}

// ── Wrappers específicos para o token de autenticação ─────────────────────────

export const getAuthToken = (): string | null =>
  getCookie(AUTH_COOKIE)

export const setAuthToken = (token: string, expiresInMs?: number): void =>
  setCookie(AUTH_COOKIE, token, { expiresInMs })

export const removeAuthToken = (): void =>
  removeCookie(AUTH_COOKIE)

// ── Wrappers para o papel do usuário ─────────────────────────────────────────

export const getUserRole = (): string | null =>
  getCookie(ROLE_COOKIE)

export const setUserRole = (role: string, expiresInMs?: number): void =>
  setCookie(ROLE_COOKIE, role, { expiresInMs })

export const removeUserRole = (): void =>
  removeCookie(ROLE_COOKIE)
