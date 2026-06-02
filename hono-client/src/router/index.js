import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Profile from '../views/Profile.vue'
import Settings from '../views/Settings.vue'
import Stars from '../views/Stars.vue'
import LoginPage from '../views/Login/LoginPage.vue'
import RegisterPage from '../views/Login/RegisterPage.vue'
import VideoPage from '../views/Video/VideoPage.vue'

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
      component: Settings
    },
    {
      path: '/stars',
      component: Stars
    },
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
    }
  ]
})


export default router