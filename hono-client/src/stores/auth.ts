import { reactive } from 'vue'
import { useAccounts } from '../composables/useAccounts'
import { useTheme } from '../composables/useTheme'
import { initTheme, applyTheme, currentFrame } from '../composables/useTheme'
import { watch } from 'vue'

// add this after the reactive declaration
// sync auth.frame with currentFrame whenever it changes
watch(currentFrame, (val) => {
  auth.frame = val
})

export const auth = reactive({
  username: null as string | null,
  id: null as number | null,
  role: null as string | null,
  avatar: null as string | null,
  banner: null as string | null,
  frame: (localStorage.getItem('profileFrame') || 'none') as string,

  get isLoggedIn() { return !!this.username },
  get isAdmin() { return this.role === 'admin' },

login(username: string, id: number, role: string) {
  this.username = username
  this.id = id
  this.role = role
  localStorage.setItem('currentUser', username) // ✅ save current user
  initTheme(username)
},

async fetchMe() {
  try {
    const res = await fetch('http://localhost:3000/auth/me', { credentials: 'include' })
    if (!res.ok) return
    const data = await res.json()
    this.username = data.username
    this.id = data.id
    this.role = data.role
    this.avatar = data.avatar
    this.banner = data.banner
    
    initTheme(data.username)
    this.frame = currentFrame.value  // ✅ sync frame after initTheme

    const { saveAccount } = useAccounts()
    saveAccount(data.username, data.email, data.avatar)
  } catch {
    this.username = null
    this.id = null
    this.role = null
    this.avatar = null
    this.banner = null
  }
},

logout() {
  this.username = null
  this.id = null
  this.role = null
  this.avatar = null
  this.banner = null
  localStorage.removeItem('currentUser') // ✅ clear on logout
  applyTheme('red')
}
})