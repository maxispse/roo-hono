import { reactive } from 'vue'

export const auth = reactive({
  username: null as string | null,
  id: null as number | null,
  role: null as string | null,
  avatar: null as string | null,

  get isLoggedIn() {
    return !!this.username
  },

  get isAdmin() {
    return this.role === 'admin'
  },

  async fetchMe() {
    try {
      const res = await fetch('http://localhost:3000/auth/me', {
        credentials: 'include'
      })
      if (!res.ok) return
      const data = await res.json()
      this.username = data.username
      this.id = data.id
      this.role = data.role
      this.avatar = data.avatar
    } catch {
      this.username = null
      this.id = null
      this.role = null
      this.avatar = null
    }
  },

  login(username: string, id: number, role: string) {
    this.username = username
    this.id = id
    this.role = role
  },

  logout() {
    this.username = null
    this.id = null
    this.role = null
    this.avatar = null
  }
})