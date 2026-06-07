<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import VideoCard from '../../components/VideoCard.vue'

const route = useRoute()
const videos = ref([])
const loading = ref(false)

async function fetchResults(query: string) {
  if (!query) return
  loading.value = true
  try {
    const res = await fetch(`http://localhost:3000/videos/search?q=${encodeURIComponent(query)}`)
    videos.value = await res.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

watch(() => route.query.q, (q) => {
  fetchResults(q as string)
}, { immediate: true })
</script>

<template>
  <div class="p-8 bg-gray-200 dark:bg-gray-900 min-h-full">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
      Search results for "<span class="text-[#CB3939]">{{ route.query.q }}</span>"
    </h1>

    <!-- loading -->
    <div v-if="loading" class="flex justify-center items-center p-16">
      <div class="w-12 h-12 border-4 border-[#CB3939] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- empty -->
    <div v-else-if="videos.length === 0" class="flex flex-col items-center p-16 gap-4">
      <p class="text-gray-500 dark:text-gray-400 text-xl font-semibold">No results found</p>
      <p class="text-gray-400 dark:text-gray-500">Try a different search term</p>
    </div>

    <!-- results -->
    <div v-else class="flex flex-wrap gap-4">
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
  </div>
</template>