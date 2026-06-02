<script setup lang="ts">

import { auth } from '../stores/auth'
</script>

<template>
  <div class="w-[80px] sm:w-[128px] flex flex-col gap-16 items-center sticky bg-[#CB3939] dark:bg-red-900 top-0 h-screen p-4 sm:p-8">
    <RouterLink to="/channel">
      <img src="../assets/1946488.png" class="w-16 h-12 sm:w-[64px] sm:h-[64px]" />
    </RouterLink>
    <RouterLink to="/stars">
      <img src="../assets/images.png" class="w-16 h-12 sm:w-[64px] sm:h-[64px]" />
    </RouterLink>
    <RouterLink to="/settings">
      <img src="../assets/2821378.png" class="w-16 h-12 sm:w-[64px] sm:h-[64px]" />
    </RouterLink>
    <RouterLink to="/upload">
      <img src="../assets/ios-share-zmjqh7inc2jqwfwm5f8.png" class="w-8 h-8 sm:w-[64px] sm:h-[64px]" />
    </RouterLink>
    <RouterLink v-if="auth.isAdmin" to="/admin">
      <img src="../assets/your-admin-icon.png" class="w-8 h-8 sm:w-[64px] sm:h-[64px]" />
    </RouterLink>
  </div>
</template>