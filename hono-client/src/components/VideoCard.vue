<script>
export default {
  name: 'VideoCard',
  props: {
    title: String,
    thumbnail: String,
    channelName: String,
    views: Number,
    uploadDate: String,
    id: Number,
    avatar: String
  }
}
</script>

<template>
  <div class="w-[300px] flex flex-col cursor-pointer group">

    <!-- thumbnail / video preview -->
    <RouterLink :to="`/videoPage/${id}`" class="relative overflow-hidden rounded-xl">
      <video :src="`http://localhost:3000${thumbnail}`"
        class="w-full h-[170px] object-cover transition-transform duration-300 group-hover:scale-105" muted
        preload="metadata" @mouseover.stop="$event.target.play()" @mouseleave.stop="$event.target.pause()" />
      <!-- play overlay on hover -->
      <div
        class="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
        <div class="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
          <span class="text-xl ml-1">▶</span>
        </div>
      </div>
    </RouterLink>

    <!-- info -->
    <div class="flex gap-3 mt-3 px-1">

      <!-- channel avatar -->
      <RouterLink :to="`/channel/${channelName}`" @click.stop class="shrink-0">
        <div class="w-9 h-9 rounded-full bg-[#CB3939] flex items-center justify-center overflow-hidden">
          <img v-if="avatar" :src="`http://localhost:3000${avatar}`" class="w-full h-full object-cover" />
          <span v-else class="text-white text-sm font-bold">{{ channelName?.charAt(0).toUpperCase() }}</span>
        </div>
      </RouterLink>

      <!-- text info -->
      <div class="flex-1 min-w-0">
        <RouterLink :to="`/videoPage/${id}`">
          <h3
            class="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover:text-[#CB3939] transition-colors">
            {{ title }}
          </h3>
        </RouterLink>
        <RouterLink :to="`/channel/${channelName}`" @click.stop
          class="text-xs text-gray-500 dark:text-gray-400 hover:text-[#CB3939] transition-colors mt-1 block">
          {{ channelName }}
        </RouterLink>
        <p class="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
          {{ views?.toLocaleString() }} views • {{ uploadDate }}
        </p>
      </div>

    </div>
  </div>
</template>