<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import menu from './img/mais.png'
import L from './img/L.png'

onMounted(() => {
  document.body.classList.add('home-page')
})

onUnmounted(() => {
  document.body.classList.remove('home-page')
})

interface Modulo {
  id: number
  titulo: string
  descricao: string
  ordem: number
  ativo: boolean
  createdAt: string
}

const modulos = ref<Modulo[]>([])
const carregando = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/modulos')
    modulos.value = await res.json()
  } catch (erro) {
    console.error('Erro ao buscar módulos:', erro)
  } finally {
    carregando.value = false
  }
})

const moduloDestaque = computed(() =>
  modulos.value
    .filter(m => m.ativo)
    .sort((a, b) => a.ordem - b.ordem)[0] ?? null
)

const proximosModulos = computed(() =>
  modulos.value
    .filter(m => m.ativo)
    .sort((a, b) => a.ordem - b.ordem)
    .slice(1)
)
</script>

<template>
  <div class="page">
    <header class="header">
      <button class="menu-btn">
        <img class="menu-icon" :src="menu" alt="Menu">
      </button>
      <h1 class="logo">
        <img class="logo-icon" :src="L" alt="Libranos Logo">
        <span class="logo-text">ibranos</span>
      </h1>
    </header>
    <main class="content">
      <p class="boas-vindas">Bem vinda, Ana Maria!</p>
      <template v-if="carregando">
        <div class="skeleton-destaque"></div>
        <div class="skeleton-grid">
          <div class="skeleton-card" v-for="i in 3" :key="i"></div>
        </div>
      </template>
      <template v-else>
        <div v-if="moduloDestaque" class="card-destaque">
          <h2 class="destaque-titulo">{{ moduloDestaque.titulo }}</h2>
          <div class="destaque-corpo">
            <div class="destaque-thumb">
              <div class="thumb-placeholder">
                <span class="thumb-icone">▶</span>
                <span class="thumb-tempo">00:00 / 00:00</span>
              </div>
            </div>
            <div class="destaque-info">
              <p class="destaque-descricao">{{ moduloDestaque.descricao }}</p>
              <div class="progresso-barra">
                <div class="progresso-fill" style="width: 65%"></div>
              </div>
              <q-btn
                class="btn-continuar"
                color="primary"
                label="Continuar assistindo"
                icon="play_arrow"
                unelevated
              />
            </div>
          </div>
        </div>
        <div v-if="proximosModulos.length > 0" class="proximas-section">
          <h3 class="proximas-titulo">Próximas aulas:</h3>
          <div class="proximas-grid">
            <div
              v-for="modulo in proximosModulos"
              :key="modulo.id"
              class="card-aula"
            >
              <div class="aula-thumb">
                <span class="aula-numero">{{ modulo.ordem }}</span>
              </div>
              <p class="aula-titulo">{{ modulo.titulo }}</p>
            </div>
          </div>
        </div>
        <div v-if="!moduloDestaque && proximosModulos.length === 0" class="vazio">
          <p>Nenhum módulo disponível no momento.</p>
        </div>
      </template>
    </main>
  </div>
</template>

<style scoped>

.page {
  min-height: 100vh;
  background-color: #f4f6f9;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  background-color: #1F3852;
  padding: 10px 20px;
  color: white;
  gap: 30px;
}

.menu-btn {
  margin: 0;
  padding: 0;
  background: none;
  border: none;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 0;
}

.menu-btn:hover .menu-icon {
  transform: scale(1.2);
}

.menu-btn:active {
  transform: translateY(1px);
}

.header h1 {
  margin: 0;
  line-height: 1;
}

.menu-icon {
  width: 26px;
  height: 26px;
  filter: brightness(0) invert(1);
  transition: transform 0.15s ease;
}

.logo {
  display: inline-flex;
  align-items: center;
  margin: 0;
  font-size: 2rem;
  line-height: 1;
  font-weight: 700;
}

.logo-icon {
  width: 30px;
  height: auto;
  display: block;
  filter: brightness(0) invert(1);
  margin-right: -6px;
  transform: translateY(1px);
}

.logo-text {
  padding-left: 6px;
}

.content {
  padding: 28px 32px;
  max-width: 900px;
}

.boas-vindas {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1F3852;
  margin: 0 0 20px 0;
}

.card-destaque {
  background: white;
  border-radius: 12px;
  padding: 20px 24px;
  margin-bottom: 32px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
}

.destaque-titulo {
  font-size: 1.05rem;
  font-weight: 700;
  color: #1F3852;
  margin: 0 0 16px 0;
}

.destaque-corpo {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.destaque-thumb {
  flex: 0 0 220px;
}

.thumb-placeholder {
  background-color: #2a2a2a;
  border-radius: 8px;
  height: 130px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: white;
}

.thumb-icone {
  font-size: 1.4rem;
  opacity: 0.7;
}

.thumb-tempo {
  font-size: 0.75rem;
  opacity: 0.6;
}

.destaque-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.destaque-descricao {
  font-size: 0.9rem;
  color: #444;
  line-height: 1.5;
  margin: 0;
}

.progresso-barra {
  height: 5px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
}

.progresso-fill {
  height: 100%;
  background-color: #1F3852;
  border-radius: 3px;
}

.btn-continuar {
  align-self: flex-start;
  background-color: #1F3852 !important;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 8px;
  padding: 8px 18px;
}

.proximas-section {
  margin-top: 8px;
}

.proximas-titulo {
  font-size: 1rem;
  font-weight: 700;
  color: #1F3852;
  margin: 0 0 16px 0;
}

.proximas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  gap: 16px;
}

.card-aula {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.card-aula:hover .aula-thumb {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.aula-thumb {
  width: 100%;
  aspect-ratio: 1 / 0.75;
  background-color: #1a1a1a;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.aula-numero {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  opacity: 0.85;
}

.aula-titulo {
  font-size: 0.82rem;
  font-weight: 600;
  color: #333;
  text-align: center;
  margin: 0;
}

.skeleton-destaque {
  background: #e0e0e0;
  border-radius: 12px;
  height: 180px;
  margin-bottom: 32px;
  animation: pulse 1.4s ease-in-out infinite;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.skeleton-card {
  background: #e0e0e0;
  border-radius: 8px;
  height: 110px;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.vazio {
  color: #888;
  font-size: 0.95rem;
  margin-top: 40px;
}

@media (max-width: 600px) {
  .content {
    padding: 20px 16px;
  }

  .destaque-corpo {
    flex-direction: column;
  }

  .destaque-thumb {
    flex: none;
    width: 100%;
  }
}

</style>
