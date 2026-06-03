<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from '../stores/auth'

const channels = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('http://localhost:3000/subscriptions/following', {
      credentials: 'include'
    })
    channels.value = await res.json()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="p-8 bg-gray-200 dark:bg-gray-900 min-h-full">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Subscriptions</h1>

    <!-- loading -->
    <div v-if="loading" class="flex justify-center items-center p-16">
      <div class="w-12 h-12 border-4 border-[#CB3939] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <!-- empty -->
    <div v-else-if="channels.length === 0" class="flex flex-col items-center p-16 gap-4">
      <p class="text-gray-500 dark:text-gray-400 text-xl font-semibold">No subscriptions yet</p>
      <p class="text-gray-400 dark:text-gray-500">Subscribe to channels to see them here</p>
      <RouterLink to="/" class="bg-[#CB3939] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition">
        Browse Videos
      </RouterLink>
    </div>

    <!-- channels grid -->
    <div v-else class="flex flex-wrap gap-4">
      <RouterLink
        v-for="channel in channels"
        :key="channel.id"
        :to="`/channel/${channel.username}`"
        class="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition w-[150px]"
      >
        <div class="w-[80px] h-[80px] rounded-full bg-[#CB3939] flex items-center justify-center">
          <span class="text-white text-3xl font-bold">
            {{ channel.username.charAt(0).toUpperCase() }}
          </span>
        </div>
        <p class="text-gray-900 dark:text-white font-semibold text-center">{{ channel.username }}</p>
      </RouterLink>
    </div>
  </div>
</template>