<script setup>
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
  <div class="w-full h-screen flex flex-col bg-white dark:bg-gray-900">
    <Navbar />
    <div class="flex flex-row flex-1">
      <Sidebar />
      <div class="flex-1 bg-gray-200 dark:bg-gray-900">
        <RouterView />
      </div>
    </div>
  </div>
</template>