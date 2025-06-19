<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white rounded-xl shadow-md p-8">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
        <div>
          <label class="block text-sm text-gray-600 mb-1">
            Email <span class="text-red-500">*</span>
          </label>
          <input v-model="email" type="text" placeholder="Enter your email"
            class="w-full px-4 py-2 border rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            :class="{ 'border-red-500': emailError }" />
          <p v-if="emailError" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-sm text-gray-600 mb-1">
            Password <span class="text-red-500">*</span>
          </label>
          <input v-model="password" type="password" placeholder="Enter your password"
            class="w-full px-4 py-2 border rounded-md text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            :class="{ 'border-red-500': passwordError }" />
          <p v-if="passwordError" class="text-red-500 text-sm mt-1">{{ passwordError }}</p>
        </div>

        <button type="submit"
          class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
          :disabled="isLoading">
          <span v-if="!isLoading">Sign In</span>
          <span v-else>Loading...</span>
        </button>

        <p v-if="error" class="text-red-500 text-sm mt-2 text-center">{{ error }}</p>
      </form>

      <div v-if="isLoading" class="flex justify-center items-center mt-6">
        <div class="w-8 h-8 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin"></div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRuntimeConfig } from '#imports'

const email = ref('')
const password = ref('')
const error = ref('')
const isLoading = ref(false)

const emailError = ref('')
const passwordError = ref('')

const config = useRuntimeConfig()
const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')
  if (token) {
    router.push('/book/')
  }
})

function validateInputs() {
  let isValid = true
  emailError.value = ''
  passwordError.value = ''
  error.value = ''

  if (!email.value.trim()) {
    emailError.value = 'กรุณากรอกอีเมล'
    isValid = false
  } else if (!validateEmail(email.value)) {
    emailError.value = 'รูปแบบอีเมลไม่ถูกต้อง'
    isValid = false
  }

  if (!password.value.trim()) {
    passwordError.value = 'กรุณากรอกรหัสผ่าน'
    isValid = false
  }

  return isValid
}

function validateEmail(email: string) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return re.test(email)
}

async function handleLogin() {
  if (!validateInputs()) return

  isLoading.value = true
  try {
    const res = await $fetch(`${config.public.API_URL}/auth/login`, {
      method: 'POST',
      body: { email: email.value, password: password.value },
    })

    if (!res || !res.access_token) throw new Error('No token')

    useCookie('token').value = res.access_token
    await navigateTo('/book/')
  } catch (err: any) {
    error.value = err?.data?.message || 'Login failed'
  } finally {
    isLoading.value = false
  }
}
</script>
