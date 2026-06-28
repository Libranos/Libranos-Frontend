<script setup lang="ts">
import LoginPromoCard from '@/components/login/LoginPromoCard.vue'
import LoginForm from '@/components/login/LoginForm.vue'
import LoginSocialButtons from '@/components/login/LoginSocialButtons.vue'
</script>

<template>
  <div class="login-page">
    <div class="login-promo">
      <LoginPromoCard />
    </div>
    <div class="login-form-area">
      <div class="login-form-wrap">
        <LoginForm />
        <LoginSocialButtons />
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 2rem 2rem 6rem;
  box-sizing: border-box;
}

.login-promo { flex: 0 0 40%; max-width: 40%; }

.login-form-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-form-wrap {
  width: 100%;
  max-width: 420px;
  padding: 0 1rem;
  box-sizing: border-box;
}

@media (max-width: 1100px) {
  .login-page { padding: 1.5rem; gap: 1rem; }
}

@media (max-width: 768px) {
  .login-page { flex-direction: column; align-items: stretch; padding: 1rem; background-color: white; }
  .login-promo { flex: none; max-width: 100%; width: 100%; }
  .login-form-area { width: 100%; }
}
</style>
