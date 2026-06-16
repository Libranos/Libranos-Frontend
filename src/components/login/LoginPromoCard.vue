<script setup lang="ts">
import mulher from '@/img/mulher.png'
</script>

<template>
  <div class="conteudo">
    <div class="texto">
      <h1 class="titulo">Libranos</h1>
      <h2 class="subtitulo">Aprenda Libras de forma simples e acessível</h2>
      <p style="opacity: 0.85">Conteudo pratico, aulas guiadas e mais</p>
    </div>
    <div class="imagem-container">
      <img class="imagem" :src="mulher" alt="Mulher fazendo sinais com as mãos" />
    </div>
  </div>
</template>

<style scoped>
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
  background-image: url('@/img/maos.png');
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

@media (max-width: 1100px) {
  .titulo { font-size: 2.2em; }
  .subtitulo { font-size: 1.8em; }
}
</style>
