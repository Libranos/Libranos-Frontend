<script setup lang="ts">
import AuthPageLayout from '@/components/login/AuthPageLayout.vue'
import LoginPromoCard from '@/components/login/LoginPromoCard.vue'
import CadastroForm from '@/components/login/CadastroForm.vue'
import CadastroFooter from '@/components/login/CadastroFooter.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
authStore.error = null
</script>

<template>
  <AuthPageLayout>
    <template #promo>
      <LoginPromoCard />
    </template>
    <CadastroForm />
    <CadastroFooter />
  </AuthPageLayout>
</template>
