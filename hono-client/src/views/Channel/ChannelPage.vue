<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { auth } from '../../stores/auth'
import { useRouter, useRoute } from 'vue-router'
import VideoCard from '../../components/VideoCard.vue'
import UserAvatar from '../../components/UserAvatar.vue'
import { useTheme } from '../../composables/useTheme'

const { isPro } = useTheme()
const router = useRouter()
const route = useRoute()
const videos = ref([])
const loading = ref(true)
const subscriberCount = ref(0)
const isSubscribed = ref(false)
const channelProfile = ref({ username: '', avatar: null as string | null, banner: null as string | null })
const editingVideo = ref(null as any)
const editTitle = ref('')
const editDescription = ref('')

function openEdit(video: any) {
  editingVideo.value = video
  editTitle.value = video.title
  editDescription.value = video.description || ''
}

async function saveEdit() {
  const res = await fetch(`http://localhost:3000/videos/${editingVideo.value.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ title: editTitle.value, description: editDescription.value })
  })
  if (res.ok) {
    editingVideo.value.title = editTitle.value
    editingVideo.value.description = editDescription.value
    editingVideo.value = null
  }
}
const channelUser = computed(() => {
  if (Array.isArray(route.params.username)) return route.params.username[0]
  return route.params.username || auth.username
})

const isOwnChannel = computed(() => auth.username === channelUser.value)

async function fetchChannelData() {
  loading.value = true
  try {
    const profileRes = await fetch(`http://localhost:3000/users/${channelUser.value}`)

    // handle deleted user
    if (!profileRes.ok) {
      router.push('/404')
      return
    }

    channelProfile.value = await profileRes.json()

    const res = await fetch(`http://localhost:3000/videos/user/${channelUser.value}`, {
      credentials: 'include'
    })
    videos.value = await res.json()

    const countRes = await fetch(`http://localhost:3000/subscriptions/count/${channelUser.value}`)
    const countData = await countRes.json()
    subscriberCount.value = countData.count

    if (auth.isLoggedIn && !isOwnChannel.value) {
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
}

// ✅ refetch when route changes
watch(() => route.params.username, () => {
  fetchChannelData()
}, { immediate: true })

async function toggleSubscribe() {
  if (!auth.isLoggedIn) return router.push('/loginPage')
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

async function deleteVideo(id: number) {
  if (!confirm('Are you sure you want to delete this video?')) return

  const res = await fetch(`http://localhost:3000/videos/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (res.ok) {
    videos.value = videos.value.filter((v: any) => v.id !== id)
  }
}
</script>

<template>
  <div class="flex flex-col min-h-screen bg-gray-100 dark:bg-gray-900">

    <!-- banner -->
    <div class="w-full h-[200px] relative overflow-hidden"
      :class="!channelProfile.banner ? (isOwnChannel ? 'bg-[#CB3939]' : 'bg-gray-800') : ''">
      <img v-if="channelProfile.banner" :src="`http://localhost:3000${channelProfile.banner}`"
        class="w-full h-full object-cover" />
      <div v-else class="absolute inset-0 opacity-20"
        :style="isOwnChannel ? 'background: repeating-linear-gradient(45deg, #fff 0px, #fff 1px, transparent 0px, transparent 50%)' : ''">
      </div>
      <div v-if="isOwnChannel"
        class="absolute top-4 right-4 bg-white/20 text-white text-sm px-3 py-1 rounded-full font-semibold">
        Your Channel
      </div>
    </div>

    <div class="max-w-5xl mx-auto w-full px-8">
      <div class="flex flex-col md:flex-row md:items-end gap-6 -mt-12 mb-8">

        <!-- avatar -->
        <UserAvatar :avatar="channelProfile.avatar" :username="channelUser?.toString()"
          :frame="isOwnChannel ? auth.frame : 'none'" size="xl" class="relative z-10" />

        <div class="mt-12">
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-2">
              <h1 class="text-2xl font-bold text-gray-900 dark:text-white">{{ channelUser }}</h1>
              <span v-if="isOwnChannel"
                class="bg-primary text-white text-xs px-2 py-0.5 rounded-full font-semibold">You</span>
              <span v-if="isOwnChannel && isPro"
                class="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 text-xs px-2 py-0.5 rounded-full font-bold">✨
                Pro</span>
            </div>
          </div>
          <p class="text-gray-500 dark:text-gray-400 text-sm">{{ subscriberCount }} subscribers • {{ videos.length }}
            videos</p>
        </div>

        <div class="mt-12 ml-auto flex gap-2">
          <!-- own channel actions -->
          <template v-if="isOwnChannel">
            <RouterLink to="/settings"
              class="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-600 transition">
              ⚙️ Edit Profile
            </RouterLink>
            <RouterLink to="/upload"
              class="bg-[#CB3939] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition">
              ⬆️ Upload
            </RouterLink>
            <button @click="logout"
              class="border border-gray-300 dark:border-gray-600 dark:text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 transition">
              Logout
            </button>
          </template>

          <!-- other channel actions -->
          <template v-else>
            <button v-if="auth.isLoggedIn" @click="toggleSubscribe"
              :class="isSubscribed ? 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-[#CB3939] text-white hover:bg-[#DF4F4F]'"
              class="px-6 py-2 rounded-lg font-semibold transition">
              {{ isSubscribed ? '✓ Subscribed' : 'Subscribe' }}
            </button>
            <RouterLink v-else to="/loginPage"
              class="bg-[#CB3939] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition">
              Subscribe
            </RouterLink>
          </template>
        </div>
      </div>

      <hr class="border-gray-300 dark:border-gray-700 mb-8" />

      <!-- tabs -->
      <div class="flex gap-4 mb-6">
        <span class="text-gray-900 dark:text-white font-bold border-b-2 border-[#CB3939] pb-1">Videos</span>
      </div>

      <!-- loading -->
      <div v-if="loading" class="flex justify-center items-center p-16">
        <div class="w-12 h-12 border-4 border-[#CB3939] border-t-transparent rounded-full animate-spin"></div>
      </div>

      <!-- empty state -->
      <div v-else-if="videos.length === 0" class="flex flex-col items-center p-16 gap-4">
        <p class="text-gray-500 dark:text-gray-400 text-xl font-semibold">No videos yet</p>
        <RouterLink v-if="isOwnChannel" to="/upload"
          class="bg-[#CB3939] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition">
          Upload your first video
        </RouterLink>
      </div>

      <!-- videos grid -->
      <div v-else class="flex flex-wrap gap-4 pb-8">
        <div v-for="video in videos" :key="video.id" class="relative group">
          <VideoCard :id="video.id" :title="video.title" :thumbnail="video.url" :channelName="channelUser"
            :avatar="channelProfile.avatar" :views="video.views" :uploadDate="video.created_at" />
          <!-- action buttons on own channel -->
          <div v-if="isOwnChannel"
            class="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button @click="openEdit(video)"
              class="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              ✏️ Edit
            </button>
            <button @click="deleteVideo(video.id)"
              class="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              🗑 Delete
            </button>
          </div>
        </div>
      </div>

      <!-- edit modal -->
      <div v-if="editingVideo" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-[500px] flex flex-col gap-4">
          <h2 class="text-xl font-bold text-gray-900 dark:text-white">Edit Video</h2>
          <input v-model="editTitle" type="text" placeholder="Title"
            class="border p-2 rounded w-full dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          <textarea v-model="editDescription" placeholder="Description"
            class="border p-2 rounded w-full h-24 resize-none dark:bg-gray-700 dark:text-white dark:border-gray-600" />
          <div class="flex gap-2">
            <button @click="editingVideo = null"
              class="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition">
              Cancel
            </button>
            <button @click="saveEdit"
              class="flex-1 bg-primary text-white px-4 py-2 rounded-lg font-semibold hover-primary transition">
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>