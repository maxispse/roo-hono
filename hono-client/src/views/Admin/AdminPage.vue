<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from '../../stores/auth'

const users = ref([])
const reports = ref([])
const activeTab = ref('users')

onMounted(async () => {
  await fetchUsers()
  await fetchReports()
})

async function fetchUsers() {
  const res = await fetch('http://localhost:3000/admin/users', {
    credentials: 'include'
  })
  users.value = await res.json()
}

async function fetchReports() {
  const res = await fetch('http://localhost:3000/admin/reports', {
    credentials: 'include'
  })
  reports.value = await res.json()
}

async function deleteUser(id: number) {
  await fetch(`http://localhost:3000/admin/users/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  users.value = users.value.filter((u: any) => u.id !== id)
}

async function deleteVideo(videoId: number, reportId: number) {
  await fetch(`http://localhost:3000/videos/${videoId}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  reports.value = reports.value.filter((r: any) => r.video_id !== videoId)
}

async function dismissReport(id: number) {
  await fetch(`http://localhost:3000/admin/reports/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  reports.value = reports.value.filter((r: any) => r.id !== id)
}
</script>

<template>
  <div class="p-8 bg-gray-200 dark:bg-gray-900 min-h-full">
    <h1 class="text-2xl font-bold text-[#CB3939] mb-6">Admin Dashboard</h1>

    <!-- tabs -->
    <div class="flex gap-2 mb-6">
      <button
        @click="activeTab = 'users'"
        :class="activeTab === 'users' ? 'bg-[#CB3939] text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white'"
        class="px-6 py-2 rounded-lg font-semibold transition"
      >
        👥 Users ({{ users.length }})
      </button>
      <button
        @click="activeTab = 'reports'"
        :class="activeTab === 'reports' ? 'bg-[#CB3939] text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-white'"
        class="px-6 py-2 rounded-lg font-semibold transition relative"
      >
        🚩 Reports
        <span v-if="reports.length > 0" class="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
          {{ reports.length }}
        </span>
      </button>
    </div>

    <!-- users tab -->
    <div v-if="activeTab === 'users'">
      <table class="w-full bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <thead class="bg-[#CB3939] text-white">
          <tr>
            <th class="p-4 text-left">ID</th>
            <th class="p-4 text-left">Username</th>
            <th class="p-4 text-left">Email</th>
            <th class="p-4 text-left">Role</th>
            <th class="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in users" :key="user.id" class="border-b dark:border-gray-700">
            <td class="p-4 dark:text-white">{{ user.id }}</td>
            <td class="p-4">
              <RouterLink :to="`/channel/${user.username}`" class="text-[#CB3939] font-semibold hover:underline">
                {{ user.username }}
              </RouterLink>
            </td>
            <td class="p-4 text-gray-600 dark:text-gray-400">{{ user.email }}</td>
            <td class="p-4">
              <span :class="user.role === 'admin' ? 'bg-[#CB3939] text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white'"
                class="px-2 py-1 rounded-full text-xs font-semibold">
                {{ user.role }}
              </span>
            </td>
            <td class="p-4">
              <button
                v-if="user.id !== auth.id"
                @click="deleteUser(user.id)"
                class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- reports tab -->
    <div v-if="activeTab === 'reports'">
      <div v-if="reports.length === 0" class="flex flex-col items-center p-16 gap-4">
        <p class="text-gray-500 dark:text-gray-400 text-xl font-semibold">No reports yet</p>
      </div>

      <div v-else class="flex flex-col gap-4">
        <div v-for="report in reports" :key="report.id"
          class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 flex items-start justify-between gap-4">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-2">
              <span class="text-2xl">🚩</span>
              <span class="font-bold text-gray-900 dark:text-white">{{ report.video_title }}</span>
            </div>
            <p class="text-gray-600 dark:text-gray-400 text-sm">
              Reported by <span class="font-semibold text-[#CB3939]">{{ report.reporter }}</span> for:
              <span class="font-semibold text-gray-900 dark:text-white"> {{ report.reason }}</span>
            </p>
            <p class="text-gray-400 text-xs mt-1">{{ new Date(report.created_at).toLocaleDateString() }}</p>
          </div>
          <div class="flex gap-2 shrink-0">
            <RouterLink :to="`/videoPage/${report.video_id}`"
              class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              View
            </RouterLink>
            <button @click="deleteVideo(report.video_id, report.id)"
              class="bg-red-500 text-white px-3 py-1 rounded text-sm font-semibold hover:bg-red-600 transition">
              Delete Video
            </button>
            <button @click="dismissReport(report.id)"
              class="bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-1 rounded text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition">
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>