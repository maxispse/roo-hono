<script setup>
import { auth } from '../stores/auth'
</script>

<template>
  <!-- show different UI based on login state -->
  <div v-if="auth.isLoggedIn">
    <p>Welcome, {{ auth.username }}!</p>
    <button @click="auth.logout()">Logout</button>
  </div>
  <div v-else>
    <RouterLink to="/loginPage">Login</RouterLink>
  </div>
</template>