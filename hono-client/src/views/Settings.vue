<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const newUsername = ref('')
const avatarFile = ref(null as File | null)
const avatarPreview = ref(auth.avatar ? `http://localhost:3000${auth.avatar}` : null)
const success = ref('')
const error = ref('')
const loading = ref(false)
const showDeleteModal = ref(false)

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

async function deleteAccount() {
  try {
    const res = await fetch('http://localhost:3000/users/me', {
      method: 'DELETE',
      credentials: 'include'
    })
    if (!res.ok) return error.value = 'Something went wrong'
    auth.logout()
    router.push('/loginPage')
  } catch {
    error.value = 'Something went wrong'
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
        <div class="w-[80px] h-[80px] rounded-full bg-[#CB3939] flex items-center justify-center overflow-hidden">
          <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" />
          <span v-else class="text-white text-3xl font-bold">{{ auth.username?.charAt(0).toUpperCase() }}</span>
        </div>
        <input type="file" accept="image/*" @change="onAvatarChange" class="text-sm dark:text-white" />
      </div>
      <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
      <p v-if="success" class="text-green-500 text-sm mb-4">{{ success }}</p>
      <button @click="updateAvatar" :disabled="loading" class="bg-[#CB3939] text-white p-2 rounded w-full font-semibold hover:bg-[#DF4F4F] transition disabled:opacity-50">
        {{ loading ? 'Saving...' : 'Save Avatar' }}
      </button>
    </div>

    <!-- username section -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md mb-6">
      <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Username</h2>
      <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Current username: <span class="font-bold text-[#CB3939]">{{ auth.username }}</span>
      </p>
      <input v-model="newUsername" type="text" placeholder="New username" class="border p-2 rounded w-full mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
      <button @click="updateUsername" :disabled="loading" class="bg-[#CB3939] text-white p-2 rounded w-full font-semibold hover:bg-[#DF4F4F] transition disabled:opacity-50">
        {{ loading ? 'Saving...' : 'Save Changes' }}
      </button>
    </div>

    <!-- danger zone -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md border-2 border-red-500">
      <h2 class="text-lg font-semibold text-red-500 mb-2">Danger Zone</h2>
      <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">Deleting your account is permanent and cannot be undone. All your videos, comments and subscriptions will be deleted.</p>
      <button @click="showDeleteModal = true" class="bg-red-500 text-white p-2 rounded w-full font-semibold hover:bg-red-600 transition">
        Delete Account
      </button>
    </div>

  </div>

  <!-- confirm delete modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px]">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone. All your data will be permanently deleted.</p>
      <div class="flex gap-2">
        <button @click="showDeleteModal = false" class="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition">
          Cancel
        </button>
        <button @click="deleteAccount" class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition">
          Delete
        </button>
      </div>
    </div>
  </div>
</template>