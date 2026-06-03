<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from '../../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import VideoCard from '../../components/VideoCard.vue'

const router = useRouter()
const route = useRoute()
const videos = ref([])
const loading = ref(true)
const subscriberCount = ref(0)
const isSubscribed = ref(false)
const channelUser = ref(Array.isArray(route.params.username) 
  ? route.params.username[0] 
  : route.params.username || auth.username
)
const channelProfile = ref({ username: '', avatar: null as string | null })

onMounted(async () => {
  try {
    const profileRes = await fetch(`http://localhost:3000/users/${channelUser.value}`)
    channelProfile.value = await profileRes.json()

    // fetch videos
    const res = await fetch(`http://localhost:3000/videos/user/${channelUser.value}`, {
      credentials: 'include'
    })
    videos.value = await res.json()

    // fetch subscriber count
    const countRes = await fetch(`http://localhost:3000/subscriptions/count/${channelUser.value}`)
    const countData = await countRes.json()
    subscriberCount.value = countData.count

    // check if subscribed
    if (auth.isLoggedIn) {
      const checkRes = await fetch(`http://localhost:3000/subscriptions/check/${channelUser.value}`, {
        credentials: 'include'
      })
      const checkData = await checkRes.json()
      isSubscribed.value = checkData.subscribed
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
})

async function toggleSubscribe() {
  if (!auth.isLoggedIn) {
    router.push('/loginPage')
    return
  }

  const method = isSubscribed.value ? 'DELETE' : 'POST'
  await fetch(`http://localhost:3000/subscriptions/${channelUser.value}`, {
    method,
    credentials: 'include'
  })

  isSubscribed.value = !isSubscribed.value
  subscriberCount.value += isSubscribed.value ? 1 : -1
}

async function logout() {
  await fetch('http://localhost:3000/auth/logout', {
    method: 'POST',
    credentials: 'include'
  })
  auth.logout()
  router.push('/loginPage')
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100">
    <div class="w-full h-[200px] bg-[#CB3939]"></div>
    <div class="max-w-5xl mx-auto w-full px-8">
      <div class="flex items-center gap-6 -mt-12 mb-8">
        <div class="w-[100px] h-[100px] rounded-full bg-[#DF4F4F] border-4 border-white overflow-hidden flex items-center justify-center">
  <img
    v-if="channelProfile.avatar"
    :src="`http://localhost:3000${channelProfile.avatar}`"
    class="w-full h-full object-cover"
  />
  <span v-else class="text-white text-4xl font-bold">
    {{ channelUser?.toString().charAt(0).toUpperCase() }}
  </span>
</div>
        <div class="mt-12">
          <h1 class="text-2xl font-bold text-gray-900">{{ channelUser }}</h1>
          <p class="text-gray-500 text-sm">{{ subscriberCount }} subscribers • {{ videos.length }} videos</p>
        </div>
        <div class="mt-12 ml-auto flex gap-2">
          <!-- show subscribe button if viewing someone else's channel -->
          <button
            v-if="auth.username !== channelUser"
            @click="toggleSubscribe"
            :class="isSubscribed
              ? 'border border-gray-300 text-gray-700 hover:bg-gray-200'
              : 'bg-[#CB3939] text-white hover:bg-[#DF4F4F]'"
            class="px-4 py-2 rounded-lg font-semibold transition"
          >
            {{ isSubscribed ? 'Unsubscribe' : 'Subscribe' }}
          </button>

          <!-- show edit/logout if viewing own channel -->
          <template v-if="auth.username === channelUser && auth.isLoggedIn">
            <button class="bg-[#CB3939] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition">
              Edit Profile
            </button>
            <button @click="logout" class="border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-200 transition">
              Logout
            </button>
          </template>
        </div>
      </div>

      <hr class="border-gray-300 mb-8" />
      <h2 class="text-xl font-bold text-gray-800 mb-4">Videos</h2>

      <div v-if="loading" class="flex justify-center items-center p-16">
        <div class="w-12 h-12 border-4 border-[#CB3939] border-t-transparent rounded-full animate-spin"></div>
      </div>

      <div v-else-if="videos.length === 0" class="flex flex-col items-center p-16 gap-4">
        <p class="text-gray-500 text-xl font-semibold">No videos yet</p>
        <RouterLink
          v-if="auth.username === channelUser"
          to="/upload"
          class="bg-[#CB3939] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition"
        >
          Upload your first video
        </RouterLink>
      </div>

      <div v-else class="flex flex-wrap gap-4">
        <VideoCard
          v-for="video in videos"
          :key="video.id"
          :id="video.id"
          :title="video.title"
          :thumbnail="video.url"
          :channelName="channelUser"
          :views="video.views"
          :uploadDate="video.created_at"
        />
      </div>
    </div>
  </div>
</template>