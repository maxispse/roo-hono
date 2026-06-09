<script setup lang="ts">
import { useTheme } from '../../composables/useTheme'
import { useRouter } from 'vue-router'
import { auth } from '../../stores/auth'

const { isPro, unlockPro } = useTheme()
const router = useRouter()

function activatePro() {
  if (!auth.username) return
  console.log('activating pro for:', auth.username)
  unlockPro(auth.username)
  router.push('/settings')
}
</script>

<template>
  <div class="min-h-full bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-8">

    <!-- hero -->
    <div class="text-center mb-12">
      <div class="text-8xl mb-4 flex items-center justify-center">
        <img src="/Users/melonytbh/Documents/ROOhono/roo-hono/hono-client/src/assets/image copy 8.png" class="w-36 h-36" />
      </div>
      <h1 class="text-5xl font-bold text-gray-900 dark:text-white mb-4">
        Scroll<span class="text-primary">Tube</span> Pro
      </h1>
      <p class="text-xl text-gray-500 dark:text-gray-400 max-w-lg mx-auto">
        Unlock exclusive themes, profile frames, and more. Support ScrollTube and stand out from the crowd.
      </p>
    </div>

    <!-- already pro -->
    <div v-if="isPro" class="bg-green-50 dark:bg-green-900/20 rounded-2xl p-8 text-center max-w-md w-full mb-8">
      <div class="text-5xl mb-3">🎉</div>
      <h2 class="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">You're already Pro!</h2>
      <p class="text-green-500 dark:text-green-500 mb-4">All features are unlocked. Thank you for supporting ScrollTube!</p>
      <RouterLink to="/settings"
        class="bg-primary text-white px-6 py-2 rounded-full font-semibold hover-primary transition inline-block">
        Manage Settings
      </RouterLink>
    </div>

    <!-- features grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl w-full mb-12">

      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col items-center text-center gap-3">
        <span class="text-4xl">🎨</span>
        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Premium Themes</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">5 exclusive color themes — Gold, Royal, Rose, Teal, Midnight</p>
        <span class="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-semibold">Pro only</span>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col items-center text-center gap-3">
        <span class="text-4xl">🖼️</span>
        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Profile Frames</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Glowing animated borders — Gold, Neon, Rainbow, Fire, Royal</p>
        <span class="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-semibold">Pro only</span>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col items-center text-center gap-3">
        <span class="text-4xl">🏅</span>
        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Pro Badge</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Show off your Pro status with a badge on your channel page</p>
        <span class="bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full font-semibold">Pro only</span>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col items-center text-center gap-3">
        <span class="text-4xl">🔔</span>
        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Notifications</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Real-time alerts for likes, comments and new subscribers</p>
        <span class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">Free</span>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col items-center text-center gap-3">
        <span class="text-4xl">📊</span>
        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Channel Analytics</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">View stats, watch time and audience insights for your channel</p>
        <span class="bg-gray-100 text-gray-500 text-xs px-3 py-1 rounded-full font-semibold">Coming soon</span>
      </div>

      <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow flex flex-col items-center text-center gap-3">
        <span class="text-4xl">🌙</span>
        <h3 class="font-bold text-gray-900 dark:text-white text-lg">Dark Mode</h3>
        <p class="text-gray-500 dark:text-gray-400 text-sm">Switch between light and dark mode anytime you want</p>
        <span class="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full font-semibold">Free</span>
      </div>

    </div>

    <!-- CTA -->
    <div v-if="!isPro" class="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-8 text-center max-w-md w-full shadow-xl">
      <h2 class="text-2xl font-bold text-yellow-900 mb-2">Ready to go Pro?</h2>
      <p class="text-yellow-800 mb-6">It's completely free — no credit card required!</p>
      <button @click="activatePro"
        class="bg-yellow-900 text-yellow-400 px-8 py-3 rounded-full font-bold text-lg hover:bg-yellow-800 transition w-full">
        ✨ Activate Pro — Free!
      </button>
    </div>

  </div>
</template>