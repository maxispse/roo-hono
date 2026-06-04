<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import VideoCard from '../components/VideoCard.vue'

const videos = ref([])
const loading = ref(true)
let eventSource: EventSource | null = null

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/videos')
    videos.value = await res.json()
  } catch (err) {
    console.error('Failed to fetch videos:', err)
  } finally {
    loading.value = false
  }

  // connect to SSE
  eventSource = new EventSource('http://localhost:3000/sse')

  eventSource.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'new_video') {
      // add new video to the top of the list
      videos.value.unshift(data.video)
    }
  }

  eventSource.onerror = () => {
    console.error('SSE connection lost')
  }
})

// ✅ close connection when leaving the page
onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
})
</script>

<template>
  <div v-if="loading" class="flex justify-center items-center h-full p-16 bg-gray-200 dark:bg-gray-900">
    <div class="w-12 h-12 border-4 border-[#CB3939] border-t-transparent rounded-full animate-spin"></div>
  </div>

  <div v-else-if="videos.length === 0" class="flex flex-col justify-center items-center h-full p-16 gap-4 bg-gray-200 dark:bg-gray-900">
    <img src="../assets/ScrollTubeLogo.png" class="w-24 h-24 opacity-30" />
    <p class="text-gray-500 dark:text-gray-400 text-xl font-semibold">No videos yet</p>
    <p class="text-gray-400 dark:text-gray-500">Be the first to upload one!</p>
    <RouterLink to="/upload" class="bg-[#CB3939] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition">
      Upload Video
    </RouterLink>
  </div>

  <div v-else class="flex flex-wrap gap-4 p-8 bg-gray-200 dark:bg-gray-900 min-h-full">
    <VideoCard
      v-for="video in videos"
      :key="video.id"
      :id="video.id"
      :title="video.title"
      :thumbnail="video.url"
      :channelName="video.username"
      :views="video.views"
      :uploadDate="video.created_at"
    />
  </div>
</template>