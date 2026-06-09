<script setup lang="ts">
import { ref } from 'vue'
import { auth } from '../stores/auth'
import { useRouter } from 'vue-router'
import { useTheme, type ThemeName, type FrameName } from '../composables/useTheme'
const { currentTheme, themes, setTheme, isPro, unlockPro, currentFrame, profileFrames, setFrame } = useTheme()

const showProModal = ref(false)

const router = useRouter()
const newUsername = ref('')
const avatarFile = ref(null as File | null)
const avatarPreview = ref(auth.avatar ? `http://localhost:3000${auth.avatar}` : null)
const success = ref('')
const error = ref('')
const loading = ref(false)
const showDeleteModal = ref(false)
const bannerFile = ref(null as File | null)
const bannerPreview = ref(auth.banner ? `http://localhost:3000${auth.banner}` : null)

function onBannerChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  bannerFile.value = file
  bannerPreview.value = URL.createObjectURL(file)
}

async function updateBanner() {
  if (!bannerFile.value) {
    error.value = 'Please select an image'
    return
  }
  loading.value = true
  error.value = ''
  success.value = ''
  const formData = new FormData()
  formData.append('banner', bannerFile.value)
  try {
    const res = await fetch('http://localhost:3000/users/banner', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    const data = await res.json()
    if (!res.ok) return error.value = data.error
    auth.banner = data.banner
    success.value = 'Banner updated!'
  } catch {
    error.value = 'Something went wrong'
  } finally {
    loading.value = false
  }
}
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



function activatePro() {
  showProModal.value = true
}

function handleSetTheme(name: ThemeName) {
  setTheme(name, auth.username!)
}

function handleSetFrame(name: FrameName) {
  setFrame(name, auth.username!)
}

function handleUnlockPro() {
  if (!auth.username) return
  unlockPro(auth.username)
  showProModal.value = false
}
</script>

<template>
  <div class="p-8 bg-gray-200 dark:bg-gray-900 min-h-full">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

    <!-- two column grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">

      <!-- avatar section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Picture</h2>
        <div class="flex items-center gap-6 mb-4">
          <div
            class="w-[80px] h-[80px] rounded-full bg-primary flex items-center justify-center overflow-hidden shrink-0">
            <img v-if="avatarPreview" :src="avatarPreview" class="w-full h-full object-cover" />
            <span v-else class="text-white text-3xl font-bold">{{ auth.username?.charAt(0).toUpperCase() }}</span>
          </div>
          <input type="file" accept="image/*" @change="onAvatarChange" class="text-sm dark:text-white" />
        </div>
        <p v-if="error" class="text-red-500 text-sm mb-4">{{ error }}</p>
        <p v-if="success" class="text-green-500 text-sm mb-4">{{ success }}</p>
        <button @click="updateAvatar" :disabled="loading"
          class="bg-primary text-white p-2 rounded w-full font-semibold hover-primary transition disabled:opacity-50">
          {{ loading ? 'Saving...' : 'Save Avatar' }}
        </button>
      </div>

      <!-- username section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Change Username</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Current username: <span class="font-bold text-primary">{{ auth.username }}</span>
        </p>
        <input v-model="newUsername" type="text" placeholder="New username"
          class="border p-2 rounded w-full mb-4 dark:bg-gray-700 dark:text-white dark:border-gray-600" />
        <button @click="updateUsername" :disabled="loading"
          class="bg-primary text-white p-2 rounded w-full font-semibold hover-primary transition disabled:opacity-50">
          {{ loading ? 'Saving...' : 'Save Changes' }}
        </button>
      </div>

      <!-- banner section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:col-span-2">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Channel Banner</h2>

        <!-- banner preview -->
        <div class="w-full h-[150px] rounded-lg overflow-hidden mb-4 bg-gray-200 dark:bg-gray-700 relative">
          <img v-if="bannerPreview" :src="bannerPreview" class="w-full h-full object-cover" />
          <div v-else class="w-full h-full flex items-center justify-center text-gray-400">
            No banner yet
          </div>
        </div>

        <input type="file" accept="image/*" @change="onBannerChange" class="text-sm dark:text-white mb-4" />
        <button @click="updateBanner" :disabled="loading"
          class="bg-primary text-white p-2 rounded w-full font-semibold hover-primary transition disabled:opacity-50">
          {{ loading ? 'Saving...' : 'Save Banner' }}
        </button>
      </div>
      
      <!-- theme section -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 md:col-span-2">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Theme Color</h2>
          <span v-if="isPro" class="bg-yellow-400 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold">
            ✨ PRO
          </span>
          <button v-else @click="activatePro"
            class="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 text-xs px-3 py-1 rounded-full font-bold transition">
            Upgrade to PRO
          </button>
        </div>

        <div class="flex gap-3 flex-wrap mb-3">
          <button v-for="(colors, name) in themes" :key="name" @click="handleSetTheme(name)"
            class="relative w-12 h-12 rounded-full border-4 transition-transform"
            :style="`background-color: ${colors.primary}`" :class="[
              currentTheme === name ? 'border-white scale-110 shadow-lg' : 'border-transparent',
              colors.pro && !isPro ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110 cursor-pointer'
            ]">
            <!-- lock icon for pro themes -->
            <span v-if="colors.pro && !isPro"
              class="absolute inset-0 flex items-center justify-center text-white text-lg">
              🔒
            </span>
          </button>
        </div>

        <p class="text-sm text-gray-500 dark:text-gray-400">
          Current: <span class="font-semibold capitalize" :style="`color: var(--color-primary)`">{{
            themes[currentTheme].name }}</span>
          <span v-if="!isPro" class="ml-2 text-xs text-yellow-500">— Upgrade for 5 more themes</span>
        </p>
      </div>

      

      <!-- danger zone -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border-2 border-red-500">
        <h2 class="text-lg font-semibold text-red-500 mb-2">Danger Zone</h2>
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-4">
          Deleting your account is permanent and cannot be undone. All your videos, comments and subscriptions will be
          deleted.
        </p>
        <button @click="showDeleteModal = true"
          class="bg-red-500 text-white p-2 rounded w-full font-semibold hover:bg-red-600 transition">
          Delete Account
        </button>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Frame</h2>
        <div class="flex flex-wrap gap-4 mb-3">
          <button v-for="(frame, name) in profileFrames" :key="name" @click="handleSetFrame(name)"
            class="relative flex flex-col items-center gap-1"
            :class="frame.pro && !isPro ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'">
            <!-- preview avatar with frame -->
            <div
              class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-primary transition-transform hover:scale-110"
              :class="[
                frame.style,
                currentFrame === name ? 'scale-110' : ''
              ]">
              <img v-if="auth.avatar" :src="`http://localhost:3000${auth.avatar}`" class="w-full h-full object-cover" />
              <span v-else class="text-white font-bold text-sm">{{ auth.username?.charAt(0).toUpperCase() }}</span>
            </div>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ frame.name }}</span>
            <span v-if="frame.pro && !isPro" class="absolute -top-1 -right-1 text-xs">🔒</span>
            <span v-if="currentFrame === name" class="absolute -top-1 -right-1 text-xs">✅</span>
          </button>
        </div>
      </div>

      
    </div>
  </div>

  <!-- pro section -->

  <!-- confirm delete modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px]">
      <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Are you sure?</h2>
      <p class="text-gray-500 dark:text-gray-400 mb-6">This action cannot be undone. All your data will be permanently
        deleted.</p>
      <div class="flex gap-2">
        <button @click="showDeleteModal = false"
          class="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition">
          Cancel
        </button>
        <button @click="deleteAccount"
          class="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition">
          Delete
        </button>
      </div>
    </div>
  </div>

  <div v-if="showProModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div class="bg-white dark:bg-gray-800 rounded-2xl p-8 w-[400px] text-center">
    <div class="text-6xl mb-4">✨</div>
    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">ScrollTube Pro</h2>
    <p class="text-gray-500 dark:text-gray-400 mb-6">Unlock 5 exclusive premium themes and profile frames!</p>

    <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-4 mb-6">
      <p class="text-yellow-700 dark:text-yellow-400 font-semibold text-lg">Free for now! 🎉</p>
      <p class="text-yellow-600 dark:text-yellow-500 text-sm">Activate Pro at no cost</p>
    </div>

    <div class="flex gap-2">
      <button @click="showProModal = false"
        class="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition">
        Maybe later
      </button>
      <button @click="handleUnlockPro"
        class="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 px-4 py-2 rounded-lg font-semibold transition">
        ✨ Activate Pro
      </button>
    </div>
  </div>
</div>
</template>