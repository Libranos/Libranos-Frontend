<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref } from 'vue'
import mulher from './img/mulher.png'


const email = ref('')
const password = ref('')
const showPassword = ref(false)
const router = useRouter()


async function handleLogin() {
  try {
    const res = await fetch('http://localhost:8005/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, password: password.value })
    })

    if (!res.ok) {
      alert('Email ou senha incorretos')
      return
    }

    const data = await res.json()
    localStorage.setItem('token', data.token)
    router.push('/modulos')

  } catch (erro) {
    console.error('Erro ao fazer login:', erro)
    alert('Erro ao conectar com o servidor.')
  }
}

function loginWithGoogle() {
  console.log('Login com Google')
}

function loginWithFacebook() {
  console.log('Login com Facebook')
}

</script>

<template>
    <div class="main">
        <div class="card">
            <div class="conteudo">
                <div class="texto">
                    <h1 class="titulo">Libranos</h1>
                    <h2 class="subtitulo">Aprenda Libras de forma simples e acessível</h2>
                    <p style="opacity: 0.85;">Conteudo pratico, aulas guiadas e mais</p>
                </div>
                <div class="imagem-container">
                    <img class="imagem" :src="mulher" alt="Mulher fazendo sinais com as mãos"/>
                </div>
            </div>
        </div>
        <div class="interactive">
        <div class="login">
          <div class="login-header">
            <h1 class="login-titulo">Bem-vindo de volta!</h1>
            <p class="login-subtitulo">Faça login para continuar aprendendo</p>
          </div>

          <form @submit.prevent="handleLogin">
            <div class="field">
              <label for="email">E-mail</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                  </svg>
                </span>
                <input
                  id="email"
                  v-model="email"
                  type="email"
                  placeholder="Seu@gmail.com"
                  required
                />
              </div>
            </div>

            <div class="field">
              <label for="password">Senha</label>
              <div class="input-wrapper">
                <span class="input-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Sua senha"
                  required
                />
                <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                  <svg v-if="!showPassword" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                  <svg v-else xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                </button>
              </div>
              <a href="#" class="forgot-password">Esqueceu sua senha?</a>
            </div>

            <button @click="handleLogin" type="submit" class="btn-entrar">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
              Entrar
            </button>
          </form>

          <div class="divider">
            <span>ou continue com</span>
          </div>

          <div class="social-buttons">
            <button class="btn-social" @click="loginWithGoogle">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button class="btn-social" @click="loginWithFacebook">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
          </div>

          <p class="cadastro-link">
            Ainda não tem uma conta?
            <a href="#">Cadastrar</a>
          </p>
        </div>
      </div>
    </div>
</template>

<style scoped>

.titulo {
  font-size: 3em;
  padding-left: 1rem;
}

.subtitulo {
  font-size: 2.5em;
  max-width: 8em;
  line-height: 1.2;
}

.main {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 2rem 2rem 6rem;
  box-sizing: border-box;
}

.card {
  flex: 0 0 40%;
  max-width: 40%;
}

.conteudo {
  background-color: #1e3a5f;
  color: white;
  position: relative;     
  border-radius: 50px;
}

.conteudo::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('./img/maos.png');
  background-size: cover;
  background-position: center;
  opacity: 0.09; 
  border-radius: 50px;
  pointer-events: none;
  z-index: 0;
}

.texto {
  padding: 10% 10% 5% 10%;
}

.titulo {
  font-size: 3em;
  margin: 0 0 0.4em 0;
}

.subtitulo {
  font-size: 2.5em;
  margin: 0 0 0.6em 0;
  max-width: 8em;
  line-height: 1.2;
}

.imagem-container {
  flex: 1;
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  align-items: flex-end;
  padding-top: 1rem;
}

.imagem {
  width: 60%;
  height: auto;
  display: block;
}

.interactive {
  flex: 1;
  display: flex;
  justify-content: center;
  padding-left: 0;
  align-items: center;
}

.login {
  width: 100%;
  max-width: 420px;
  padding: 0 1rem;
  box-sizing: border-box;
}

.login-header { margin-bottom: 2rem; }

.login-titulo {
  font-size: 1.9em;
  font-weight: 800;
  color: #1e3a5f;
  margin: 0 0 0.3em 0;
}

.login-subtitulo { color: #6b7280; font-size: 0.95em; margin: 0; }

.input-wrapper {
  display: flex;
  align-items: center;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
  padding: 0 12px;
  transition: border-color 0.2s;
}

.input-wrapper:focus-within { border-color: #1e3a5f; }

.input-icon {
  color: #9ca3af;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  margin-right: 10px;
}

.input-wrapper input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 0;
  font-size: 0.95em;
  color: #1a1a2e;
  background: transparent;
  width: 100%;
}

.input-wrapper input::placeholder { color: #9ca3af; }

.toggle-password {
  background: none;
  border: none;
  cursor: pointer;
  color: #9ca3af;
  display: flex;
  align-items: center;
  padding: 0;
  flex-shrink: 0;
}

.toggle-password:hover { color: #1e3a5f; }

.forgot-password {
  display: inline-block;
  margin-top: 6px;
  font-size: 0.85em;
  color: #1e3a5f;
  font-weight: 600;
  text-decoration: none;
}

.forgot-password:hover { text-decoration: underline; }

.btn-entrar {
  width: 100%;
  padding: 14px;
  background-color: #1e3a5f;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1em;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 0.5rem;
  transition: background-color 0.2s;
}

.btn-entrar:hover { background-color: #162d4a; }

.divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 1.5rem 0;
  color: #9ca3af;
  font-size: 0.85em;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #e5e7eb;
}

.social-buttons { display: flex; gap: 12px; }

.btn-social {
  flex: 1;
  padding: 11px;
  border: 1.5px solid #d1d5db;
  border-radius: 8px;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.95em;
  font-weight: 600;
  color: #1a1a2e;
  transition: border-color 0.2s, background-color 0.2s;
}

.btn-social:hover { border-color: #1e3a5f; background-color: #f8fafc; }

.cadastro-link {
  text-align: center;
  margin-top: 1.5rem;
  font-size: 0.9em;
  color: #6b7280;
}

.cadastro-link a { color: #1e3a5f; font-weight: 700; text-decoration: none; }
.cadastro-link a:hover { text-decoration: underline; }

@media (max-width: 1100px) {
  .titulo {
    font-size: 2.2em;
  }

  .subtitulo {
    font-size: 1.8em;
  }

  .main {
    padding: 1.5rem;
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .main {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
  }

  .card {
    flex: none;
    max-width: 100%;
    width: 100%;
  }

  .interactive {
    width: 100%;
  }
}

@media (max-width: 768px) {
  .main { background-color: white; }
}
</style>