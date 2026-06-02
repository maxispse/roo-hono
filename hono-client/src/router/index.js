import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import Stars from '../views/Stars.vue'
import VideoPage from '../views/Video/VideoPage.vue'
import LoginPage from '../views/Login/LoginPage.vue'
import RegisterPage from '../views/Login/RegisterPage.vue'
import ChannelPage from '../views/Channel/ChannelPage.vue'
import UploadPage from '../views/Upload/UploadPage.vue'
import { auth } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/profile/:username', component: Profile },
    { path: '/settings', component: Settings, meta: { requiresAuth: true } },
    { path: '/stars', component: Stars, meta: { requiresAuth: true } },
    { path: '/videoPage/:videoId', component: VideoPage },
    { path: '/loginPage', component: LoginPage },
    { path: '/register', component: RegisterPage },
    { path: '/channel', component: ChannelPage, meta: { requiresAuth: true } },
    { path: '/upload', component: UploadPage, meta: { requiresAuth: true } },
  ]
})

router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/loginPage'
  }
})

export default router