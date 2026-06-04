<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { auth } from '../stores/auth'

const notifications = ref([] as any[])
const unreadCount = ref(0)
const showPanel = ref(false)
let eventSource: EventSource | null = null

async function fetchUnread() {
  if (!auth.isLoggedIn) return
  const res = await fetch('http://localhost:3000/notifications/unread', {
    credentials: 'include'
  })
  const data = await res.json()
  unreadCount.value = data.count
}

async function fetchNotifications() {
  const res = await fetch('http://localhost:3000/notifications', {
    credentials: 'include'
  })
  notifications.value = await res.json()
}

async function openPanel() {
  showPanel.value = true
  await fetchNotifications()
  await markAllRead()
}

async function markAllRead() {
  await fetch('http://localhost:3000/notifications/read', {
    method: 'PATCH',
    credentials: 'include'
  })
  unreadCount.value = 0
  notifications.value = notifications.value.map((n: any) => ({ ...n, is_read: true }))
}

onMounted(() => {
  fetchUnread()

  // listen for realtime notifications
  eventSource = new EventSource('http://localhost:3000/sse')
  eventSource.onmessage = (e) => {
    const data = JSON.parse(e.data)
    if (data.type === 'notification' && data.userId === auth.id) {
      unreadCount.value++
    }
  }
})

onUnmounted(() => {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
})
</script>

<template>
  <div class="relative">
    <!-- bell button -->
    <button @click="openPanel" class="relative w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition text-lg">
      🔔
      <span v-if="unreadCount > 0"
        class="absolute -top-1 -right-1 w-5 h-5 bg-[#CB3939] text-white text-xs rounded-full flex items-center justify-center font-bold">
        {{ unreadCount > 9 ? '9+' : unreadCount }}
      </span>
    </button>

    <!-- notifications panel -->
    <div v-if="showPanel"
      class="absolute right-0 top-12 w-[350px] bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 overflow-hidden">

      <div class="flex items-center justify-between p-4 border-b dark:border-gray-700">
        <h2 class="font-bold text-gray-900 dark:text-white">Notifications</h2>
        <button @click="showPanel = false" class="text-gray-500 hover:text-gray-900 dark:hover:text-white">✕</button>
      </div>

      <div class="max-h-[400px] overflow-y-auto">
        <div v-if="notifications.length === 0" class="p-8 text-center text-gray-400">
          No notifications yet
        </div>

        <div v-for="notif in notifications" :key="notif.id"
          :class="!notif.is_read ? 'bg-red-50 dark:bg-gray-800' : ''"
          class="flex items-start gap-3 p-4 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
          <span class="text-2xl">
            {{ notif.type === 'like' ? '👍' : notif.type === 'subscribe' ? '⭐' : notif.type === 'comment' ? '💬' : notif.type === 'report' ? '🚩' : '🔔' }}
          </span>
          <div class="flex-1">
            <p class="text-sm text-gray-900 dark:text-white">{{ notif.message }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ new Date(notif.created_at).toLocaleDateString() }}</p>
          </div>
          <div v-if="!notif.is_read" class="w-2 h-2 rounded-full bg-[#CB3939] mt-2 shrink-0"></div>
        </div>
      </div>
    </div>

    <!-- backdrop to close -->
    <div v-if="showPanel" class="fixed inset-0 z-40" @click="showPanel = false"></div>
  </div>
</template>