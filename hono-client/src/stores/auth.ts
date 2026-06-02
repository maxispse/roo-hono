import { reactive } from 'vue'

export const auth = reactive({
  token: localStorage.getItem('token') || null,
  username: localStorage.getItem('username') || null,

  get isLoggedIn() {
    return !!this.token
  },

  login(token: string, username: string) {
    this.token = token
    this.username = username
    localStorage.setItem('token', token)
    localStorage.setItem('username', username)
  },

  logout() {
    this.token = null
    this.username = null
    localStorage.removeItem('token')
    localStorage.removeItem('username')
  }
})