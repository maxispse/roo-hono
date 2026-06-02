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
  <RouterLink :to="`/videoPage/${id}`">
    <div class="w-[320px] m-4 cursor-pointer hover:opacity-90 transition">
      <video
        :src="`http://localhost:3000${thumbnail}`"
        class="w-full h-[180px] object-cover rounded-lg"
        muted
        @mouseover="$event.target.play()"
        @mouseleave="$event.target.pause()"
      />
      <h3 class="text-lg font-semibold mt-2 dark:text-white">{{ title }}</h3>
      <p class="text-sm text-gray-600">{{ channelName }}</p>
      <p class="text-sm text-gray-600">{{ views }} views • {{ uploadDate }}</p>
    </div>
  </RouterLink>
</template>