<script setup lang="ts">
import AuthPageLayout from '@/components/login/AuthPageLayout.vue'
import LoginPromoCard from '@/components/login/LoginPromoCard.vue'
import LoginForm from '@/components/login/LoginForm.vue'
import LoginSocialButtons from '@/components/login/LoginSocialButtons.vue'
</script>

<template>
  <AuthPageLayout>
    <template #promo>
      <LoginPromoCard />
    </template>
    <LoginForm />
    <LoginSocialButtons />
  </AuthPageLayout>
</template>
