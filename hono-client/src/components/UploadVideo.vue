<script setup>
import { ref } from 'vue'
import { auth } from '../stores/auth'

const title = ref('')
const file = ref(null)
const error = ref('')
const success = ref('')
const loading = ref(false)

function onFileChange(e) {
  file.value = e.target.files[0]
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
  formData.append('username', auth.username)

  try {
    const res = await fetch('http://localhost:3000/videos/upload', {
      method: 'POST',
      credentials: 'include',
      body: formData
    })
    const data = await res.json()
    if (!res.ok) return error.value = data.error

    success.value = 'Video uploaded successfully!'
    title.value = ''
    file.value = null
  } catch (err) {
    error.value = 'Something went wrong'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center items-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow w-[500px] flex flex-col gap-4">
      <h1 class="text-2xl font-bold text-[#CB3939]">Upload Video</h1>

      <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
      <p v-if="success" class="text-green-500 text-sm">{{ success }}</p>

      <input
        v-model="title"
        type="text"
        placeholder="Video title"
        class="border p-2 rounded w-full"
      />

      <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <p class="text-gray-500 mb-2">Select a video file</p>
        <input type="file" accept="video/*" @change="onFileChange" class="w-full" />
      </div>

      <p v-if="file" class="text-sm text-gray-600">Selected: {{ file.name }}</p>

      <button
        @click="upload"
        :disabled="loading"
        class="bg-[#CB3939] text-white p-2 rounded w-full font-semibold hover:bg-[#DF4F4F] transition disabled:opacity-50"
      >
        {{ loading ? 'Uploading...' : 'Upload' }}
      </button>
    </div>
  </div>
</template>