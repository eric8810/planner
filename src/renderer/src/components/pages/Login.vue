<template>
  <div class="min-h-screen flex items-center justify-center bg-background">
    <Card class="w-[400px] p-6">
      <CardHeader>
        <CardTitle class="text-2xl font-bold text-center">Welcome to Planner</CardTitle>
        <CardDescription class="text-center text-muted-foreground">
          Login to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form class="space-y-4" @submit.prevent="handleLogin">
          <div class="space-y-2">
            <Label for="phone">Phone Number</Label>
            <Input
              id="phone"
              v-model="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              :class="{ 'border-destructive': errors.phone }"
            />
            <p v-if="errors.phone" class="text-sm text-destructive">{{ errors.phone }}</p>
          </div>
          <Button type="submit" class="w-full" :disabled="isLoading">
            <Icon v-if="isLoading" icon="lucide:loader-2" class="mr-2 h-4 w-4 animate-spin" />
            {{ isLoading ? 'Signing in...' : 'Sign in' }}
          </Button>
        </form>
      </CardContent>
      <CardFooter class="flex flex-col space-y-4">
        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <span class="w-full border-t" />
          </div>
          <div class="relative flex justify-center text-xs uppercase">
            <span class="bg-background px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>
        <div class="flex space-x-2 w-full">
          <Button variant="outline" class="w-full" @click="handleGithubLogin">
            <Icon icon="logos:github-icon" class="mr-2 h-4 w-4" />
            Github
          </Button>
          <Button variant="outline" class="w-full" @click="handleGoogleLogin">
            <Icon icon="logos:google-icon" class="mr-2 h-4 w-4" />
            Google
          </Button>
        </div>
        <p class="text-center text-sm text-muted-foreground">
          Don't have an account?
          <Button variant="link" class="p-0 h-auto">Sign up</Button>
        </p>
      </CardFooter>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Icon } from '@iconify/vue'

const emit = defineEmits(['login'])
const phone = ref('')

const isLoading = ref(false)
const errors = ref({
  phone: '',
  password: ''
})

const handleLogin = async () => {
  // Reset errors
  errors.value = {
    phone: '',
    password: ''
  }

  // Basic validation
  if (!phone.value) {
    errors.value.phone = 'Phone number is required'
  }

  if (errors.value.phone || errors.value.password) {
    return
  }

  try {
    isLoading.value = true
    // Add your login logic here
    await new Promise((resolve) => setTimeout(resolve, 2000)) // Simulated API call
    console.log('Logging in...', {
      phone: phone.value
    })
    emit('login', phone.value)
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    isLoading.value = false
  }
}

const handleGithubLogin = () => {
  console.log('GitHub login clicked')
  // Add GitHub OAuth logic here
}

const handleGoogleLogin = () => {
  console.log('Google login clicked')
  // Add Google OAuth logic here
}
</script>
