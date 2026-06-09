<script setup>
import { auth } from '../stores/auth'
import { useRoute } from 'vue-router'
import UserAvatar from './UserAvatar.vue'

const route = useRoute()
</script>

<template>
  <div class="w-[72px] sm:w-[220px] flex flex-col sticky top-0 h-full bg-[#1a1a1a] dark:bg-gray-950 shadow-xl">

    <!-- nav items -->
    <div class="flex flex-col gap-1 p-3 mt-4">

      <RouterLink v-if="auth.isLoggedIn" to="/" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/1946488.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Home</span>
      </RouterLink>

      <RouterLink v-if="auth.isLoggedIn" to="/stars" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/stars' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/images.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Subscriptions</span>
      </RouterLink>

      <RouterLink v-if="auth.isLoggedIn" to="/upload" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/upload' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/image copy 6.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Upload</span>
      </RouterLink>

      <RouterLink v-if="auth.isLoggedIn" to="/settings" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/settings' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/2821378.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Settings</span>
      </RouterLink>

      <RouterLink v-if="auth.isLoggedIn" to="/pro" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/pro' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/image copy 8.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Pro</span>
      </RouterLink>

      <RouterLink v-if="auth.isLoggedIn && auth.isAdmin" to="/admin" class="group flex items-center gap-4 px-3 py-3 rounded-xl transition"
        :class="route.path === '/admin' ? 'bg-primary text-white' : 'text-gray-400 hover:bg-white/10 hover:text-white'">
        <img src="../assets/image copy 3.png" class="w-6 h-6" />
        <span class="hidden sm:block font-semibold text-sm">Admin</span>
      </RouterLink>

    </div>

    <!-- user info at bottom -->
    <div class="mt-auto p-3 mb-4">
      <RouterLink v-if="auth.isLoggedIn" to="/channel"
        class="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition">
        <UserAvatar
  :avatar="auth.avatar"
  :username="auth.username"
  :frame="auth.frame"
  size="sm"
/>
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