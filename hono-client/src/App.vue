<script setup>
import Navbar from './components/Navbar.vue'
import Sidebar from './components/Sidebar.vue'
</script>

<template>
    <div class="w-full h-screen flex flex-col h-screen sticky top-0">
        <Navbar />
        <div class="flex flex-row flex-1 h-screen sticky top-0">
        <Sidebar />
        <div class="flex-1 bg-gray-200 dark:bg-gray-900">
            <RouterView />
        </div>
        </div>
    </div>
</template>