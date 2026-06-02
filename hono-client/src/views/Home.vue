<script setup lang="ts">
import { ref, onMounted } from 'vue'
import VideoCard from '../components/VideoCard.vue'

const videos = ref([])

onMounted(async () => {
  const res = await fetch('http://localhost:3000/videos')
  videos.value = await res.json()
})
</script>

<template>
  <div class="flex flex-wrap gap-4 p-8">
    <VideoCard
      v-for="video in videos"
      :key="video.id"
      :title="video.title"
      :thumbnail="video.url"
      :channelName="video.username"
      :views="video.views"
      :uploadDate="video.created_at"
    />
  </div>
</template>