<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../stores/auth'
import { useAccounts } from '../composables/useAccounts'

const router = useRouter()
const { accounts, saveAccount } = useAccounts()
const email = ref('')
const password = ref('')
const error = ref('')

async function login() {
  try {
    const res = await fetch('http://localhost:3000/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email: email.value, password: password.value })
    })
    const data = await res.json()
    if (!res.ok) return error.value = data.error

    auth.login(data.username, data.id, data.role)
    // save account for switching
    saveAccount(data.username, email.value, data.avatar)
    router.push('/')
  } catch (err) {
    error.value = 'Something went wrong'
  }
}

async function switchTo(savedEmail: string) {
  // logout current user first
  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })
  auth.logout()
  // prefill email
  email.value = savedEmail
  password.value = ''
}
</script>

<template>
  <div class="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow w-[400px] flex flex-col gap-4">
      <h1 class="text-2xl font-bold text-primary">Login</h1>

      <!-- saved accounts -->
      <div v-if="accounts.length > 0" class="flex flex-col gap-2">
        <p class="text-sm text-gray-500 dark:text-gray-400 font-semibold">Saved accounts</p>
        <div v-for="account in accounts" :key="account.email"
          @click="switchTo(account.email)"
          class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition">
          <div class="w-9 h-9 rounded-full bg-primary overflow-hidden flex items-center justify-center shrink-0">
            <img v-if="account.avatar" :src="`http://localhost:3000${account.avatar}`" class="w-full h-full object-cover" />
            <span v-else class="text-white text-sm font-bold">{{ account.username.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="flex-1">
            <p class="text-sm font-semibold text-gray-900 dark:text-white">{{ account.username }}</p>
            <p class="text-xs text-gray-500 dark:text-gray-400">{{ account.email }}</p>
          </div>
          <span class="text-xs text-primary">Switch →</span>
        </div>
        <hr class="border-gray-200 dark:border-gray-700" />
      </div>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <input v-model="email" type="email" placeholder="Email"
        class="border p-2 rounded w-full dark:bg-gray-700 dark:text-white dark:border-gray-600" />
      <input v-model="password" type="password" placeholder="Password"
        class="border p-2 rounded w-full dark:bg-gray-700 dark:text-white dark:border-gray-600" />
      <button @click="login"
        class="bg-primary text-white p-2 rounded w-full font-semibold hover-primary transition">
        Login
      </button>
      <p class="text-sm text-center dark:text-white">No account?
        <RouterLink to="/register" class="text-primary">Register</RouterLink>
      </p>
    </div>
  </div>
</template>