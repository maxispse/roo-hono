<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth'


const router = useRouter()
const email = ref('')
const password = ref('')
const error = ref('')

async function login() {
  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`},
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    
    const data = await res.json()
    if (!res.ok) return error.value = data.error

    auth.login(data.token, data.username)
    router.push('/')
  } catch (err) {
    error.value = 'Something went wrong'
  }
}
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow w-[400px] flex flex-col gap-4">
      <h1 class="text-2xl font-bold text-[#CB3939]">Login</h1>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <input v-model="email" type="email" placeholder="Email" class="border p-2 rounded w-full" />
      <input v-model="password" type="password" placeholder="Password" class="border p-2 rounded w-full" />
      <button @click="login" class="bg-[#CB3939] text-white p-2 rounded w-full font-semibold">Login</button>
      <p class="text-sm text-center">No account? <RouterLink to="/register" class="text-[#CB3939]">Register</RouterLink></p>
    </div>
  </div>
</template>