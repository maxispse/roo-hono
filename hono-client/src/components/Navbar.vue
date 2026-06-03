<script setup>
import { useDarkMode } from '../composables/useDarkMode'
const { isDark, toggle } = useDarkMode()
</script>

<template>
  <div class="flex items-center w-full bg-[#D9D9D9] dark:bg-gray-800 sticky top-0 z-10">
    <RouterLink to="/">
    <img 
      src="../assets/ScrollTubeLogo.png"
      class="w-[128px] h-[128px] bg-[#DF4F4F] block"
    />
    </RouterLink>
    <div class="flex flex-row gap-2 justify-center ml-8">
      <h1 class="text-3xl font-bold text-[#CB3939]">ScrollTube</h1>
    </div>

    <div class="ml-auto mr-8 flex items-center gap-4">
      <!-- dark mode toggle -->
      <button
        @click="toggle"
        class="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-xl"
      >
        {{ isDark ? '☀️' : '🌙' }}
      </button>
      <RouterLink to="/loginPage">
        <img src="../assets/image copy.png" class="w-[48px] h-[48px] rounded-2xl" />
      </RouterLink>
    </div>
  </div>
</template>