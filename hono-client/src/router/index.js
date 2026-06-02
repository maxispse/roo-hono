import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import Stars from '../views/Stars.vue'
import LoginPage from '../views/Login/LoginPage.vue'
import RegisterPage from '../views/Login/RegisterPage.vue'
import VideoPage from '../views/Video/VideoPage.vue'
import { auth } from '../stores/auth'
import ChannelPage from '../views/Channel/ChannelPage.vue'
import UploadPage from '../views/Upload/UploadPage.vue'

// add meta to protected routes



const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/profile/:username',
      component: Profile
    },
    { 
      path: '/settings', 
      component: Settings, 
      meta: { requiresAuth: true } },
    { 
      path: '/stars', 
      component: Stars, 
      meta: { requiresAuth: true } },
    {
      path: '/login',
      component: LoginPage
    },
    {
      path: '/register',
      component: RegisterPage
    },
    {
      path: '/video/:videoId',
      component: VideoPage
    },
    {
      path: '/videos',
      component: Home
    },
    { 
      path: '/channel',
      component: ChannelPage, 
      meta: { requiresAuth: true } 
    },
    { 
      path: '/upload', 
      component: UploadPage, 
      meta: { requiresAuth: true }
    }
  ]
})

// add this after createRouter()
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/loginPage'  // redirect to login if not logged in
  }
})


export default router