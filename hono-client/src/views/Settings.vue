<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../stores/auth'

const newUsername = ref('')
const avatarFile = ref(null as File | null)
const avatarPreview = ref(auth.avatar ? `http://localhost:3000${auth.avatar}` : null)
const success = ref('')
const error = ref('')
const loading = ref(false)

function onAvatarChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  avatarFile.value = file
  avatarPreview.value = URL.createObjectURL(file)
}

async function updateUsername() {
  if (!newUsername.value) {
    error.value = 'Please enter a new username'
    return
  }
  loading.value = true
  error.value = ''
  success.value = ''
  try {
    const res = await fetch('http://localhost:3000/users/username', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: newUsername.value })
    })
    const data = await res.json()
    if (!res.ok) return error.value = data.error
    auth.username = data.username
    success.value = 'Username updated!'
    newUsername.value = ''
  } catch {
    error.value = 'Something went wrong'
  } finally {
    loading.value = false
  }
}

async function updateAvatar() {
  if (!avatarFile.value) {
    error.value = 'Please select an image'
    return
  }
  loading.value = true
  error.value = ''
  success.value = ''
  const formData = new FormData()
  formData.append('avatar', avatarFile.value)
  try {
    const res = await fetch('http://localhost:3000/users/avatar', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    const data = await res.json()
    if (!res.ok) return error.value = data.error
    auth.avatar = data.avatar
    success.value = 'Avatar updated!'
  } catch {
    error.value = 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-8 bg-gray-200 dark:bg-gray-900 min-h-full">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

    <!-- avatar section -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>

      <div class="flex items-center gap-6 mb-4">
        <!-- avatar preview -->
        <div class="w-[80px] h-[80px] rounded-full bg-[#CB3939] flex items-center justify-center overflow-hidden">
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            class="w-full h-full object-cover"
          />
          <span v-else class="text-white text-3xl font-bold">
            {{ auth.username?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <input type="file" accept="image/*" @change="onAvatarChange" class="text-sm dark:text-white" />
      </div>

      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
      <p v-if="success" class="text-green-500 text-sm mb-4">{{ success }}</p>

      <button
        @click="updateAvatar"
        :disabled="loading"
        class="bg-[#CB3939] text-white p-2 rounded w-full font-semibold hover:bg-[#DF4F4F] transition disabled:opacity-50"
      >
        {{ loading ? 'Saving...' : 'Save Avatar' }}
      </button>
    </div>

    <!-- username section -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Username</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Current username: <span class="font-bold text-[#CB3939]">{{ auth.username }}</span>
      </p>
      <input
        v-model="newUsername"
        type="text"
        placeholder="New username"
        class="border p-2 rounded w-full mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600"
      />
      <button
        @click="updateUsername"
        :disabled="loading"
        class="bg-[#CB3939] text-white p-2 rounded w-full font-semibold hover:bg-[#DF4F4F] transition disabled:opacity-50"
      >
        {{ loading ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>
  </div>
</template>