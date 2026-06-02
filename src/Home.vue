<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import menu from './img/mais.png'
import L from './img/L.png'

onMounted(() => {
  document.body.classList.add('home-page')
})

onUnmounted(() => {
  document.body.classList.remove('home-page')
})

</script>

<template>
    <header class="header">
        <button>
            <img class="menu-icon" :src="menu" alt="Menu">
        </button>
        <h1 class="logo">
            <img class="logo-icon" :src="L" alt="Libranos Logo">
            <span class="logo-text">ibranos</span>
        </h1>
    </header>

</template>

<style scoped>


.header {
    display: flex;
    flex-direction: row;
    align-items: center;
    background-color: #1F3852;
    padding: 10px 20px;
    color: white;
    gap: 30px;
}

header button {
    margin-bottom: 0;
    padding: 0;
    background: none;
    border: none;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    line-height: 0;
}

header button:hover .menu-icon {
    transform: scale(1.2);
}

header button:active {
    transform: translateY(1px);
    background: #162b48;
}

header h1 {
  margin: 0;
  line-height: 1;
}

.menu-icon {
    width: 26px;
    height: 26px;
    filter: brightness(0) invert(1) saturate(5) contrast(200%);
    transition: transform 0.15s ease, filter 0.15s ease;
}

.logo {
    display: inline-flex;
    align-items: center;
    gap: 0;
    margin: 0;
    font-size: 2rem;
    line-height: 1;
    font-weight: 700;
}

.logo-icon {
    width: 30px;
    height: auto;
    display: block;
    filter: brightness(0) invert(1) saturate(5) contrast(200%);
    margin-right: -6px;
    transform: translateY(1px);
    transition: transform 0.15s ease, filter 0.15s ease;
}

.logo-text {
    padding-left: 6px;
}

</style>