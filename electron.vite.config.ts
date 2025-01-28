import { fileURLToPath, URL } from 'node:url'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import autoprefixer from 'autoprefixer'
import tailwind from 'tailwindcss'

import vue from '@vitejs/plugin-vue'

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': fileURLToPath(new URL('./src', import.meta.url)),
        '@': fileURLToPath(new URL('./src/renderer/src', import.meta.url))
        // '@renderer': resolve('src/renderer/src'),
        // '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    css: {
      postcss: {
        plugins: [tailwind(), autoprefixer()]
      }
    },
    plugins: [vue()]
  }
})
