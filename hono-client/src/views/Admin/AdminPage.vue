<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { auth } from '../../stores/auth'

const users = ref([])

onMounted(async () => {
  const res = await fetch('http://localhost:3000/admin/users', {
    credentials: 'include'
  })
  users.value = await res.json()
})

async function deleteUser(id: number) {
  await fetch(`http://localhost:3000/admin/users/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  users.value = users.value.filter((u: any) => u.id !== id)
}
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl font-bold text-[#CB3939] mb-6">Admin Dashboard</h1>
    <table class="w-full bg-white rounded-lg shadow">
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
        <tr v-for="user in users" :key="user.id" class="border-b">
          <td class="p-4">{{ user.id }}</td>
          <td class="p-4">{{ user.username }}</td>
          <td class="p-4">{{ user.email }}</td>
          <td class="p-4">
            <span :class="user.role === 'admin' ? 'text-[#CB3939] font-bold' : 'text-gray-600'">
              {{ user.role }}
            </span>
          </td>
          <td class="p-4">
            <button
              v-if="user.id !== auth.id"
              @click="deleteUser(user.id)"
              class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 transition"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>