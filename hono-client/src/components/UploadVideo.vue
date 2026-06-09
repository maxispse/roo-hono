<script setup>
import { ref } from 'vue'
import { auth } from '../stores/auth'
import confetti from 'canvas-confetti'

const title = ref('')
const description = ref('')
const file = ref(null)
const error = ref('')
const success = ref('')
const loading = ref(false)

function onFileChange(e) {
  file.value = e.target.files[0]
}

function fireConfetti() {
  confetti({
    particleCount: 150,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#CB3939', '#DF4F4F', '#ffffff', '#ff6b6b']
  })

  // second burst
  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: ['#CB3939', '#DF4F4F', '#ffffff']
    })
  }, 200)

  setTimeout(() => {
    confetti({
      particleCount: 80,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: ['#CB3939', '#DF4F4F', '#ffffff']
    })
  }, 400)
}

async function upload() {
  if (!file.value || !title.value) {
    error.value = 'Please provide a title and video file'
    return
  }

  loading.value = true
  error.value = ''
  success.value = ''

  const formData = new FormData()
  formData.append('video', file.value)
  formData.append('title', title.value)
  formData.append('description', description.value)
  formData.append('username', auth.username)

  try {
    const res = await fetch('http://localhost:3000/videos/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    const data = await res.json()
    if (!res.ok) return error.value = data.error

    success.value = '🎉 Video uploaded successfully!'

    // only confetti on first upload
    const firstUploadKey = `firstUpload_${auth.username}`
    if (!localStorage.getItem(firstUploadKey)) {
      fireConfetti()
      localStorage.setItem(firstUploadKey, 'true')
    }

    title.value = ''
    description.value = ''
    file.value = null
  } catch {
    error.value = 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow w-[500px] flex flex-col gap-4">
      <h1 class="text-2xl font-bold text-primary">Upload Video</h1>
      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <p v-if="success" class="text-green-500 text-sm font-semibold">{{ success }}</p>
      <input v-model="title" type="text" placeholder="Video title"
        class="border p-2 rounded w-full dark:bg-gray-700 dark:text-white dark:border-gray-600" />
      <textarea v-model="description" placeholder="Video description (optional)"
        class="border p-2 rounded w-full h-24 resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600" />
      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p class="text-gray-500 dark:text-gray-400 mb-2">Select a video file (mp4, webm, ogg — max 50MB)</p>
        <input type="file" accept="video/mp4,video/webm,video/ogg" @change="onFileChange" class="w-full" />
      </div>
      <p v-if="file" class="text-sm text-gray-600 dark:text-gray-400">Selected: {{ file.name }}</p>
      <button @click="upload" :disabled="loading"
        class="bg-primary text-white p-2 rounded w-full font-semibold hover-primary transition disabled:opacity-50">
        {{ loading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>
  </div>
</template>