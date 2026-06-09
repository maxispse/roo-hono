<script setup>
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
import { auth } from './stores/auth'
import { ref } from 'vue'

const sidebarOpen = ref(true)
</script>

<template>
  <div class="w-full h-screen flex flex-col overflow-hidden">
    <Navbar @toggle-sidebar="sidebarOpen = !sidebarOpen" />
    <div class="flex flex-row flex-1 min-h-0">
      <Transition name="slide">
        <Sidebar v-if="auth.isLoggedIn && sidebarOpen" />
      </Transition>
      <div class="flex-1 overflow-y-auto bg-surface dark:bg-surface-dark">
        <RouterView />
      </div>
    </div>
  </div>
</template>

<style>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  width: 0;
  opacity: 0;
}
</style>