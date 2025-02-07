<script setup lang="ts">
import Container from '@/components/Container.vue'
import Login from '@/components/pages/Login.vue'
import { useUser } from '@/composables/useUser'
import { ref } from 'vue'

const logined = ref(false)
const { userId, login } = useUser()
const onLogin = async (phone: string) => {
  await login(phone)
  if (userId.value) {
    logined.value = true
  }
}
</script>

<template>
  <Container v-if="logined && userId" :user-id="userId"> </Container>
  <Login v-else @login="onLogin" />
</template>
