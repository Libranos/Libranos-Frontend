<script setup lang="ts">
import LoginPromoCard from '@/components/login/LoginPromoCard.vue'
import LoginForm from '@/components/login/LoginForm.vue'
import LoginSocialButtons from '@/components/login/LoginSocialButtons.vue'
</script>

<template>
  <div class="main">
    <div class="card">
      <LoginPromoCard />
    </div>

    <div class="interactive">
      <div class="login">
        <LoginForm />
        <LoginSocialButtons />
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.interactive {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login {
  width: 100%;
  max-width: 420px;
  padding: 0 1rem;
  box-sizing: border-box;
}

@media (max-width: 1100px) {
  .main { padding: 1.5rem; gap: 1rem; }
}

@media (max-width: 768px) {
  .main {
    flex-direction: column;
    align-items: stretch;
    padding: 1rem;
    background-color: white;
  }

  .card {
    flex: none;
    max-width: 100%;
    width: 100%;
  }

  .interactive { width: 100%; }
}
</style>
