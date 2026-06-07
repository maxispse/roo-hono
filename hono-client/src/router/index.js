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
import AdminPage from '../views/Admin/AdminPage.vue'
import { auth } from '../stores/auth'
import NotFound from '../views/NotFound.vue'
import SearchPage from '../views/Search/SearchPage.vue'

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
    { path: '/admin', component: AdminPage, meta: { requiresAuth: true, requiresAdmin: true } },
    { path: '/404', component: NotFound },
    { path: '/:pathMatch(.*)*', component: NotFound },
    { path: '/channel/:username', component: ChannelPage },
    { path: '/channel', component: ChannelPage, meta: { requiresAuth: true } },
    { path: '/search', component: SearchPage }
  ]
})

router.beforeEach(async (to) => {
  if (auth.username === null) {
    await auth.fetchMe()
  }

  // redirect logged in users away from login and register
  if ((to.path === '/loginPage' || to.path === '/register') && auth.isLoggedIn) {
    return '/'
  }

  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return '/loginPage'
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return '/'
  }
})

export default router