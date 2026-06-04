<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { auth } from '../../stores/auth'

const route = useRoute()
const router = useRouter()
const videoId = ref(route.params.videoId)

const video = ref(null as any)
const allVideos = ref([] as any[])
const comments = ref([])
const loading = ref(true)
const newComment = ref('')
const userReaction = ref(null as string | null)
const showReportModal = ref(false)
const showComments = ref(false)
const reportReason = ref('')
const reportSuccess = ref(false)
const commentError = ref('')
let isScrolling = false

async function loadVideo(id: any) {
  loading.value = true
  try {
    const videoRes = await fetch(`http://localhost:3000/videos/${id}`)
    video.value = await videoRes.json()

    const commentsRes = await fetch(`http://localhost:3000/videos/${id}/comments`)
    comments.value = await commentsRes.json()

    if (auth.isLoggedIn) {
      const reactionRes = await fetch(`http://localhost:3000/videos/${id}/reaction`, {
        credentials: 'include'
      })
      const reactionData = await reactionRes.json()
      userReaction.value = reactionData.reaction
    }
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  const res = await fetch('http://localhost:3000/videos')
  allVideos.value = await res.json()
  await loadVideo(videoId.value)
})

function onWheel(e: WheelEvent) {
  e.preventDefault()
  if (isScrolling) return

  const currentIndex = allVideos.value.findIndex((v: any) => v.id == videoId.value)

  if (e.deltaY > 0 && currentIndex < allVideos.value.length - 1) {
    router.push(`/videoPage/${allVideos.value[currentIndex + 1].id}`)
  } else if (e.deltaY < 0 && currentIndex > 0) {
    router.push(`/videoPage/${allVideos.value[currentIndex - 1].id}`)
  }

  isScrolling = true
  setTimeout(() => { isScrolling = false }, 800)
}

watch(() => route.params.videoId, (newId) => {
  videoId.value = newId
  showComments.value = false
  loadVideo(newId)
})

async function react(type: string) {
  if (!auth.isLoggedIn) return router.push('/loginPage')
  const res = await fetch(`http://localhost:3000/videos/${videoId.value}/react`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ type })
  })
  const data = await res.json()
  if (data.message === 'Reaction removed') {
    if (type === 'like') video.value.likes--
    else video.value.dislikes--
    userReaction.value = null
  } else if (data.message === 'Reaction updated') {
    if (type === 'like') { video.value.likes++; video.value.dislikes-- }
    else { video.value.dislikes++; video.value.likes-- }
    userReaction.value = type
  } else {
    if (type === 'like') video.value.likes++
    else video.value.dislikes++
    userReaction.value = type
  }
}

async function postComment() {
  if (!auth.isLoggedIn) return router.push('/loginPage')
  if (!newComment.value) return commentError.value = 'Comment cannot be empty'
  const res = await fetch(`http://localhost:3000/videos/${videoId.value}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ content: newComment.value })
  })
  if (res.ok) {
    comments.value.unshift({
      username: auth.username,
      avatar: auth.avatar,
      content: newComment.value,
      created_at: new Date().toISOString()
    })
    newComment.value = ''
    commentError.value = ''
  }
}

async function deleteComment(id: number) {
  await fetch(`http://localhost:3000/comments/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  comments.value = comments.value.filter((c: any) => c.id !== id)
}

async function submitReport() {
  if (!reportReason.value) return
  await fetch(`http://localhost:3000/videos/${videoId.value}/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ reason: reportReason.value })
  })
  reportSuccess.value = true
  reportReason.value = ''
  setTimeout(() => {
    showReportModal.value = false
    reportSuccess.value = false
  }, 2000)
}

function copyLink() {
  navigator.clipboard.writeText(window.location.href)
}
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-black" @wheel.prevent="onWheel">

    <!-- loading -->
    <div v-if="loading" class="flex justify-center items-center h-full">
      <div class="w-12 h-12 border-4 border-[#CB3939] border-t-transparent rounded-full animate-spin"></div>
    </div>

    <div v-else-if="video" class="relative w-full h-full">

      <!-- video — full screen -->
      <video
        :src="`http://localhost:3000${video.url}`"
        class="w-full h-full object-contain"
        controls
        autoplay
        :key="video.id"
      />

      <!-- bottom info overlay -->
      <div class="absolute bottom-0 left-0 right-16 p-6 bg-gradient-to-t from-black/80 to-transparent pointer-events-none">
        <RouterLink :to="`/channel/${video.username}`" class="flex items-center gap-2 mb-2 pointer-events-auto">
          <div class="w-8 h-8 rounded-full bg-[#CB3939] overflow-hidden flex items-center justify-center">
            <img v-if="video.avatar" :src="`http://localhost:3000${video.avatar}`" class="w-full h-full object-cover" />
            <span v-else class="text-white text-sm font-bold">{{ video.username?.charAt(0).toUpperCase() }}</span>
          </div>
          <span class="text-white font-semibold">{{ video.username }}</span>
        </RouterLink>
        <h1 class="text-white font-bold text-lg">{{ video.title }}</h1>
        <p class="text-gray-300 text-sm mt-1">↑ scroll up • scroll down ↓</p>
      </div>

      <!-- right side actions — TikTok style -->
      <div class="absolute right-4 bottom-24 flex flex-col items-center gap-6">

        <!-- like -->
        <button @click="react('like')" class="flex flex-col items-center gap-1">
          <div :class="userReaction === 'like' ? 'bg-[#CB3939]' : 'bg-white/20'"
            class="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition hover:bg-[#CB3939]">
            👍
          </div>
          <span class="text-white text-xs font-semibold">{{ video.likes }}</span>
        </button>

        <!-- dislike -->
        <button @click="react('dislike')" class="flex flex-col items-center gap-1">
          <div :class="userReaction === 'dislike' ? 'bg-[#CB3939]' : 'bg-white/20'"
            class="w-12 h-12 rounded-full flex items-center justify-center text-2xl transition hover:bg-[#CB3939]">
            👎
          </div>
          <span class="text-white text-xs font-semibold">{{ video.dislikes }}</span>
        </button>

        <!-- comments -->
        <button @click="showComments = true" class="flex flex-col items-center gap-1">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl hover:bg-white/30 transition">
            💬
          </div>
          <span class="text-white text-xs font-semibold">{{ video.comment_count }}</span>
        </button>

        <!-- share -->
        <button @click="copyLink" class="flex flex-col items-center gap-1">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl hover:bg-white/30 transition">
            🔗
          </div>
          <span class="text-white text-xs font-semibold">Share</span>
        </button>

        <!-- report -->
        <button @click="showReportModal = true" class="flex flex-col items-center gap-1">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center text-2xl hover:bg-white/30 transition">
            🚩
          </div>
          <span class="text-white text-xs font-semibold">Report</span>
        </button>

      </div>
    </div>

    <!-- comments panel — slides in from right -->
    <div v-if="showComments"
      class="absolute top-0 right-0 h-full w-[380px] bg-white dark:bg-gray-900 shadow-2xl flex flex-col z-20">

      <!-- header -->
      <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 class="text-lg font-bold dark:text-white">Comments ({{ video?.comment_count }})</h2>
        <button @click="showComments = false" class="text-gray-500 hover:text-gray-900 dark:hover:text-white text-2xl">✕</button>
      </div>

      <!-- comments list -->
      <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        <div v-for="comment in comments" :key="comment.id" class="flex gap-3">
          <div class="w-9 h-9 rounded-full bg-[#CB3939] overflow-hidden flex items-center justify-center shrink-0">
            <img v-if="comment.avatar" :src="`http://localhost:3000${comment.avatar}`" class="w-full h-full object-cover" />
            <span v-else class="text-white text-sm font-bold">{{ comment.username?.charAt(0).toUpperCase() }}</span>
          </div>
          <div class="flex-1">
            <div class="flex items-center justify-between">
              <RouterLink :to="`/channel/${comment.username}`" class="font-semibold text-gray-900 dark:text-white text-sm hover:text-[#CB3939]">
                {{ comment.username }}
              </RouterLink>
              <button v-if="auth.username === comment.username || auth.isAdmin"
                @click="deleteComment(comment.id)" class="text-red-500 text-xs hover:text-red-700">
                Delete
              </button>
            </div>
            <p class="text-gray-700 dark:text-gray-300 text-sm mt-1">{{ comment.content }}</p>
            <p class="text-gray-400 text-xs mt-1">{{ new Date(comment.created_at).toLocaleDateString() }}</p>
          </div>
        </div>
      </div>

      <!-- post comment -->
      <div class="p-4 border-t dark:border-gray-700">
        <div v-if="auth.isLoggedIn" class="flex gap-2">
          <input v-model="newComment" type="text" placeholder="Add a comment..."
            class="flex-1 border rounded-full px-4 py-2 text-sm outline-none focus:border-[#CB3939] dark:bg-gray-800 dark:text-white dark:border-gray-600"
            @keyup.enter="postComment" />
          <button @click="postComment"
            class="bg-[#CB3939] text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-[#DF4F4F] transition">
            Post
          </button>
        </div>
        <RouterLink v-else to="/loginPage" class="text-[#CB3939] text-sm">
          Log in to comment
        </RouterLink>
      </div>
    </div>

    <!-- report modal -->
    <div v-if="showReportModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg p-6 w-[400px]">
        <h2 class="text-xl font-bold text-gray-900 dark:text-white mb-4">Report Video</h2>
        <div v-if="reportSuccess" class="text-green-500 text-center py-4">Report submitted! Thank you.</div>
        <div v-else>
          <p class="text-gray-500 dark:text-gray-400 mb-4">Why are you reporting this video?</p>
          <div class="flex flex-col gap-2 mb-4">
            <label v-for="reason in ['Inappropriate content', 'Spam', 'Harassment', 'Misinformation', 'Other']"
              :key="reason" class="flex items-center gap-2 cursor-pointer">
              <input type="radio" :value="reason" v-model="reportReason" class="accent-[#CB3939]" />
              <span class="text-gray-700 dark:text-gray-300">{{ reason }}</span>
            </label>
          </div>
          <div class="flex gap-2">
            <button @click="showReportModal = false"
              class="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white transition">
              Cancel
            </button>
            <button @click="submitReport"
              class="flex-1 bg-[#CB3939] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#DF4F4F] transition">
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>