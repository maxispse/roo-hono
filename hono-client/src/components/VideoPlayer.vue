<script setup lang="ts">
defineProps({
  src: String,
  title: String
})
</script>

<template>
  <video
    :src="src"
    class="w-full rounded-lg bg-black"
    controls
    autoplay
  />
</template>