<template>
  <div class="auth-page">
    <div class="auth-promo">
      <slot name="promo" />
    </div>
    <div class="auth-form-area">
      <div class="auth-form-wrap">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  display: flex;
  flex-direction: row;
  align-items: center;
  min-height: 100vh;
  padding: 2rem 2rem 2rem 6rem;
  box-sizing: border-box;
}

.auth-promo { flex: 0 0 40%; max-width: 40%; }

.auth-form-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.auth-form-wrap {
  width: 100%;
  max-width: 420px;
  padding: 0 1rem;
  box-sizing: border-box;
}

@media (max-width: 1100px) {
  .auth-page { padding: 1.5rem; gap: 1rem; }
}

@media (max-width: 768px) {
  .auth-page { flex-direction: column; align-items: stretch; padding: 1rem; background-color: white; }
  .auth-promo { flex: none; max-width: 100%; width: 100%; }
  .auth-form-area { width: 100%; }
}
</style>
