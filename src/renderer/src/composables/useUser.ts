import { ref } from 'vue'

export const useUser = () => {
  const userId = ref<string | null>(null)

  const login = async (phone: string) => {
    const id = await window.mainService.user.login(phone)
    if (id) {
      userId.value = id
    }
  }

  return { userId, login }
}
