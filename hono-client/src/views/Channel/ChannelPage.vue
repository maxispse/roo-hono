<script setup>
import { auth } from '../../stores/auth'
import VideoCard from '../../components/VideoCard.vue'

// placeholder videos — replace with actual fetch later
const videos = [
  { id: 1, title: 'First video', thumbnail: '/thumbnails/1.png', views: '1.2M', uploadDate: '2 days ago' },
  { id: 2, title: 'Second video', thumbnail: '/thumbnails/2.png', views: '800K', uploadDate: '1 week ago' },
]
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100">

    <!-- Banner -->
    <div class="w-full h-[200px] bg-[#CB3939]"></div>

    <!-- Profile section -->
    <div class="max-w-5xl mx-auto w-full px-8">
      <div class="flex items-center gap-6 -mt-12 mb-8">
        <!-- Avatar -->
        <div class="w-[100px] h-[100px] rounded-full bg-[#DF4F4F] border-4 border-white flex items-center justify-center">
          <span class="text-white text-4xl font-bold">
            {{ auth.username?.charAt(0).toUpperCase() }}
          </span>
        </div>

        <!-- Name & stats -->
        <div class="mt-12">
          <h1 class="text-2xl font-bold text-gray-900">{{ auth.username }}</h1>
          <p class="text-gray-500 text-sm">0 subscribers • {{ videos.length }} videos</p>
        </div>

        <!-- Edit profile button (only show if logged in as this user) -->
        <div class="mt-12 ml-auto" v-if="auth.isLoggedIn">
          <button class="bg-[#CB3939] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition">
            Edit Profile
          </button>
          <button @click="auth.logout()" class="ml-2 border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
            Logout
          </button>
        </div>
      </div>

      <!-- Divider -->
      <hr class="border-gray-300 mb-8" />

      <!-- Videos grid -->
      <h2 class="text-xl font-bold text-gray-800 mb-4">Videos</h2>
      <div class="flex flex-wrap gap-4">
        <VideoCard
          v-for="video in videos"
          :key="video.id"
          :title="video.title"
          :thumbnail="video.thumbnail"
          :channelName="auth.username"
          :views="video.views"
          :uploadDate="video.uploadDate"
        />
      </div>

    </div>
  </div>
</template>