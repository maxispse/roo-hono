<script setup>
import { useDarkMode } from '../composables/useDarkMode'
import { auth } from '../stores/auth'
import Notifications from './Notifications.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const { isDark, toggle } = useDarkMode()
const router = useRouter()
const searchQuery = ref('')

const emit = defineEmits(['toggle-sidebar'])

function search() {
  if (!searchQuery.value.trim()) return
  router.push(`/search?q=${encodeURIComponent(searchQuery.value)}`)
  searchQuery.value = ''
}
</script>

<template>
  <div class="flex items-center w-full h-[64px] bg-[#1a1a1a] dark:bg-gray-950 shadow-lg sticky top-0 z-10 px-6 gap-4">
    
    <!-- sidebar toggle button -->
    <button
      v-if="auth.isLoggedIn"
      @click="emit('toggle-sidebar')"
      class="w-9 h-10 rounded-2xl hover:bg-white/10 flex items-center justify-center transition text-lg shrink-0"
    >
    <img src="../assets/ScrollTubeLogo.png" class="w-[40px] h-[40px] rounded-lg" />
    </button>

    <RouterLink to="/" class="flex items-center gap-3 shrink-0">
      <span class="text-white font-bold text-xl hidden sm:block">
        Scroll<span class="text-[#CB3939]">Tube</span>
      </span>
    </RouterLink>

    <div class="flex-1 max-w-[500px] mx-auto flex gap-2">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Search videos..."
        class="flex-1 h-[36px] px-4 rounded-full bg-white/10 text-white placeholder-gray-400 text-sm outline-none focus:bg-white/20 transition border border-white/10 focus:border-[#CB3939]"
        @keyup.enter="search"
      />
      <button @click="search"
        class="h-[36px] px-4 bg-[#CB3939] hover:bg-[#DF4F4F] text-white rounded-full text-sm font-semibold transition">
        🔍
      </button>
    </div>

    <div class="flex items-center gap-3 ml-auto shrink-0">
      <button @click="toggle"
        class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-lg">
        {{ isDark ? '☀️' : '🌙' }}
      </button>

      <Notifications v-if="auth.isLoggedIn" />

      <RouterLink v-if="auth.isLoggedIn" to="/upload"
        class="hidden sm:flex items-center gap-2 bg-[#CB3939] hover:bg-[#DF4F4F] text-white px-4 h-[36px] rounded-full text-sm font-semibold transition">
        ⬆️ Upload
      </RouterLink>

      <RouterLink v-if="auth.isLoggedIn" to="/channel" class="flex items-center gap-2">
        <div class="w-9 h-9 rounded-full bg-[#CB3939] overflow-hidden flex items-center justify-center">
          <img v-if="auth.avatar" :src="`http://localhost:3000${auth.avatar}`" class="w-full h-full object-cover" />
          <span v-else class="text-white text-sm font-bold">{{ auth.username?.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="hidden sm:block text-white text-sm font-semibold">{{ auth.username }}</span>
      </RouterLink>

      <RouterLink v-else to="/loginPage"
        class="bg-[#CB3939] hover:bg-[#DF4F4F] text-white px-4 h-[36px] rounded-full text-sm font-semibold transition flex items-center">
        Login
      </RouterLink>
    </div>
  </div>
</template>