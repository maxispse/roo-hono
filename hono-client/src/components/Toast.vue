<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
const message = ref('')

function show(msg: string = 'Link copied!') {
  message.value = msg
  visible.value = true
  setTimeout(() => { visible.value = false }, 2000)
}

defineExpose({ show })
</script>

<template>
  <Transition name="toast">
    <div v-if="visible"
      class="fixed bottom-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-lg text-sm font-semibold z-50 flex items-center gap-2">
      ✅ {{ message }}
    </div>
  </Transition>
</template>

<style>
.toast-enter-active, .toast-leave-active { transition: all 0.3s ease; }
.toast-enter-from, .toast-leave-to { opacity: 0; transform: translate(-50%, 20px); }
</style>