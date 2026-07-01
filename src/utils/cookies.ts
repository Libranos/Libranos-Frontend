const AUTH_COOKIE  = 'auth_token'
const ROLE_COOKIE  = 'user_role'
const EMAIL_COOKIE = 'user_email'

interface CookieOptions {
  expiresInMs?: number
  path?: string
  sameSite?: 'Strict' | 'Lax' | 'None'
}

function setCookie(name: string, value: string, options: CookieOptions = {}): void {
  const { expiresInMs, path = '/', sameSite = 'Strict' } = options
  const secure = sameSite === 'None' || window.location.protocol === 'https:'

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
  document.cookie = `${encodeURIComponent(name)}=; Expires=Thu, 01 Jan 1970 00:00:00 UTC; Path=${path}`
}

export const getAuthToken    = (): string | null => getCookie(AUTH_COOKIE)
export const setAuthToken    = (token: string, expiresInMs?: number) => setCookie(AUTH_COOKIE, token, { expiresInMs })
export const removeAuthToken = () => removeCookie(AUTH_COOKIE)

export const getUserRole    = (): string | null => getCookie(ROLE_COOKIE)
export const setUserRole    = (role: string, expiresInMs?: number) => setCookie(ROLE_COOKIE, role, { expiresInMs })
export const removeUserRole = () => removeCookie(ROLE_COOKIE)

export const getUserEmail    = (): string | null => getCookie(EMAIL_COOKIE)
export const setUserEmail    = (email: string, expiresInMs?: number) => setCookie(EMAIL_COOKIE, email, { expiresInMs })
export const removeUserEmail = () => removeCookie(EMAIL_COOKIE)
