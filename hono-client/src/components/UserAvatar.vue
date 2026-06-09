<script setup lang="ts">
import { useTheme } from '../composables/useTheme'
import { computed } from 'vue'

const props = defineProps({
  avatar: String,
  username: String,
  size: { type: String, default: 'md' },
  frame: { type: String, default: 'none' }
})

const { profileFrames } = useTheme()

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm': return 'w-8 h-8 text-sm'
    case 'md': return 'w-10 h-10 text-base'
    case 'lg': return 'w-16 h-16 text-2xl'
    case 'xl': return 'w-24 h-24 text-4xl'
    default: return 'w-10 h-10 text-base'
  }
})

const frameStyle = computed(() => {
  const f = profileFrames[props.frame as keyof typeof profileFrames]
  return f ? f.style : ''
})
</script>

<template>
  <div
    class="rounded-full overflow-hidden flex items-center justify-center bg-primary shrink-0"
    :class="[sizeClasses, frameStyle]"
  >
    <img v-if="avatar" :src="`http://localhost:3000${avatar}`" class="w-full h-full object-cover" />
    <span v-else class="text-white font-bold">{{ username?.charAt(0).toUpperCase() }}</span>
  </div>
</template>