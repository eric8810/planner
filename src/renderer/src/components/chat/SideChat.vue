<template>
  <aside class="w-80 h-full flex flex-col">
    <!-- Header -->
    <div class="p-4 border-b">
      <h2 class="font-semibold">AI Chat</h2>
    </div>

    <!-- Chat Messages -->
    <div class="flex-1 overflow-y-auto p-4 space-y-4">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="[
          'rounded-lg p-3',
          message.role === 'user' ? 'bg-primary text-primary-foreground ml-4' : 'bg-muted mr-4'
        ]"
      >
        <p class="text-sm">{{ message.content }}</p>
      </div>
    </div>

    <!-- Input Area -->
    <div class="p-4 border-t">
      <form @submit.prevent="sendMessage" class="flex gap-2">
        <Input v-model="userInput" placeholder="Type a message..." class="flex-1" />
        <Button type="submit" size="sm">
          <Send class="h-4 w-4" />
        </Button>
      </form>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-vue-next'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
}

const messages = ref<Message[]>([])
const userInput = ref('')

const sendMessage = () => {
  if (!userInput.value.trim()) return

  // Add user message
  messages.value.push({
    id: Date.now(),
    role: 'user',
    content: userInput.value
  })

  // TODO: Implement AI response logic here
  // Simulate AI response for now
  setTimeout(() => {
    messages.value.push({
      id: Date.now(),
      role: 'assistant',
      content: 'This is a sample AI response.'
    })
  }, 1000)

  userInput.value = ''
}
</script>
