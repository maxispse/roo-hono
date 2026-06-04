<script>
export default {
  name: 'VideoCard',
  props: {
    title: String,
    thumbnail: String,
    channelName: String,
    views: String,
    uploadDate: String,
    id: Number
  }
}
</script>

<template>
  <div class="w-[320px] m-4 cursor-pointer hover:opacity-90 transition">
    <RouterLink :to="`/videoPage/${id}`">
      <video
        :src="`http://localhost:3000${thumbnail}`"
        class="w-full h-[180px] object-cover rounded-lg"
        muted
        @mouseover.stop="$event.target.play()"
        @mouseleave.stop="$event.target.pause()"
      />
    </RouterLink>
    <div class="bg-white dark:bg-gray-800 rounded-lg p-3 mt-1">
      <RouterLink :to="`/videoPage/${id}`">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white hover:text-[#CB3939]">{{ title }}</h3>
      </RouterLink>
      <RouterLink :to="`/channel/${channelName}`" class="text-sm text-gray-600 dark:text-gray-400 hover:text-[#CB3939]">
        {{ channelName }}
      </RouterLink>
      <p class="text-sm text-gray-500 dark:text-gray-400">{{ views }} views • {{ uploadDate }}</p>
    </div>
  </div>
</template>