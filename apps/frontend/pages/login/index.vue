<template>
  <div class="min-h-screen">
    <div class="w-full max-w-md bg-white rounded-xl shadow-md p-8">
      <h2 class="text-3xl font-bold text-center text-gray-800 mb-6">Login</h2>
      <form @submit.prevent="handleLogin" class="space-y-4" novalidate>
        <div>
          <label>Email <span class="text-red-500">*</span></label>
          <input
            v-model="email"
            type="text"
            placeholder="Enter your email"
            class="input-field"
            :class="{ 'border-red-500': emailError }"
          />
          <p v-if="emailError" class="text-red-500 text-sm mt-1">{{ emailError }}</p>
        </div>
        <div>
          <label>Password <span class="text-red-500">*</span></label>
          <input
            v-model="password"
            type="password"
            placeholder="Enter your password"
            class="input-field"
            :class="{ 'border-red-500': passwordError }"
          />
          <p v-if="passwordError" class="text-red-500 text-sm mt-1">{{ passwordError }}</p>
        </div>
        <button type="submit" class="btn-primary" :disabled="isLoading">
          <span v-if="!isLoading">Sign In</span>
          <span v-else>Loading...</span>
        </button>
        <p v-if="error" class="text-red-500 text-sm mt-2 text-center">{{ error }}</p>
      </form>
      <div v-if="isLoading" class="flex justify-center items-center min-h-[200px]">
        <div class="spinner"></div>
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

<style scoped>
.min-h-screen {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  padding-left: 1rem;
  padding-right: 1rem;
}

.w-full {
  width: 100%;
}

.max-w-md {
  max-width: 28rem; /* 448px */
}

.bg-white {
  background-color: white;
}

.rounded-xl {
  border-radius: 1rem;
}

.shadow-md {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.p-8 {
  padding: 2rem;
}

.text-3xl {
  font-size: 1.875rem;
  line-height: 2.25rem;
}

.font-bold {
  font-weight: 700;
}

.text-center {
  text-align: center;
}

.text-gray-800 {
  color: #1f2937;
}

.mb-6 {
  margin-bottom: 1.5rem;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

label {
  display: block;
  margin-bottom: 0.25rem;
  font-size: 0.875rem;
  color: #4b5563;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  color: #1f2937;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s ease;
  max-width: 100%;
}

.input-field::placeholder {
  color: #9ca3af;
}

.input-field:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  width: 100%;
  transition: background-color 0.2s ease;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.text-red-500 {
  color: #ef4444;
}

.text-sm {
  font-size: 0.875rem;
}

.mt-2 {
  margin-top: 0.5rem;
}


@media (max-width: 640px) {
  .max-w-md {
    max-width: 100%;
    padding: 1rem;
    border-radius: 0.5rem;
  }
  .p-8 {
    padding: 1.5rem;
  }
  .text-3xl {
    font-size: 1.5rem;
    line-height: 2rem;
  }
}

@media (min-width: 641px) and (max-width: 1024px) {
  .max-w-md {
    max-width: 24rem;
  }
  .p-8 {
    padding: 2rem;
  }
}

@media (min-width: 1025px) {
  .max-w-md {
    max-width: 28rem; 
  }
}
.spinner {
  border: 4px solid #e5e7eb;
  border-top: 4px solid #3b82f6; 
  border-radius: 50%;
  width: 36px;
  height: 36px;
  animation: spin 0.8s linear infinite;
  margin: auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
