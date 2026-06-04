<script setup>
import { auth } from '../stores/auth'
import { useRoute } from 'vue-router'

const route = useRoute()
</script>

<template>
  <div class="w-[72px] sm:w-[220px] flex flex-col sticky top-0 h-screen bg-[#801313] dark:bg-gray-950 shadow-xl">

    <!-- nav items -->
    <div class="flex flex-col gap-1 p-3 mt-4">

      <RouterLink to="/" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/' ? 'bg-[#CB3939] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/1946488.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Home</span>
      </RouterLink>

      <RouterLink to="/stars" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/stars' ? 'bg-[#CB3939] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/images.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Subscriptions</span>
      </RouterLink>

      <RouterLink to="/upload" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/upload' ? 'bg-[#CB3939] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <span class="text-2xl">⬆️</span>
        <span class="hidden sm:block font-semibold text-sm">Upload</span>
      </RouterLink>

      <RouterLink to="/channel" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/channel' ? 'bg-[#CB3939] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <span class="text-2xl">👤</span>
        <span class="hidden sm:block font-semibold text-sm">My Channel</span>
      </RouterLink>

      <RouterLink to="/settings" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/settings' ? 'bg-[#CB3939] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/2821378.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Settings</span>
      </RouterLink>

      <RouterLink to="/admin" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/admin' ? 'bg-[#CB3939] text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/image copy 3.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Admin</span>
      </RouterLink>

    </div>

    <!-- user info at bottom -->
    <div class="mt-auto p-3 mb-4">
      <RouterLink v-if="auth.isLoggedIn" to="/channel"
        class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition">
        <div class="w-8 h-8 rounded-full bg-[#CB3939] overflow-hidden flex items-center justify-center shrink-0">
          <img v-if="auth.avatar" :src="`http://localhost:3000${auth.avatar}`" class="w-full h-full object-cover" />
          <span v-else class="text-white text-sm font-bold">{{ auth.username?.charAt(0).toUpperCase() }}</span>
        </div>
        <span class="hidden sm:block text-gray-300 text-sm font-semibold truncate">{{ auth.username }}</span>
      </RouterLink>
      <RouterLink v-else to="/loginPage"
        class="flex items-center gap-3 px-3 py-3 rounded-xl text-gray-400 hover:bg-white/10 hover:text-white transition">
        <span class="text-2xl">🔑</span>
        <span class="hidden sm:block font-semibold text-sm">Login</span>
      </RouterLink>
    </div>

  </div>
</template>