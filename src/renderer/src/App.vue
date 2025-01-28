<script setup lang="ts">
import Container from '@/components/Container.vue'

const ipcHandle = () => window.electron.ipcRenderer.send('ping')
</script>

<template>
  <Container></Container>
</template>
