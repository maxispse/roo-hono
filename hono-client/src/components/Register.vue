<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const email = ref('')
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const error = ref('')

async function register() {
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }

  try {
    const res = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.value, username: username.value, password: password.value })
    })
    const data = await res.json()
    if (!res.ok) return error.value = data.error

    router.push('/loginPage')
  } catch (err) {
    error.value = 'Something went wrong'
  }
}
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow w-[400px] flex flex-col gap-4">
      <h1 class="text-2xl font-bold text-[#CB3939]">Register</h1>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <input v-model="email" type="email" placeholder="Email" class="border p-2 rounded w-full" />
      <input v-model="username" type="text" placeholder="Username" class="border p-2 rounded w-full" />
      <input v-model="password" type="password" placeholder="Password" class="border p-2 rounded w-full" />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" class="border p-2 rounded w-full" />
      <button @click="register" class="bg-[#CB3939] text-white p-2 rounded w-full font-semibold">Register</button>
      <p class="text-sm text-center">Already have an account? <RouterLink to="/loginPage" class="text-[#CB3939]">Login</RouterLink></p>
    </div>
  </div>
</template>