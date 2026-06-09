import { ref, watch } from 'vue'

export const themes = {
  red: { name: 'Classic', primary: '#CB3939', hover: '#DF4F4F', light: '#DF4F4F', pro: false },
  blue: { name: 'Ocean', primary: '#3B82F6', hover: '#60A5FA', light: '#93C5FD', pro: false },
  green: { name: 'Forest', primary: '#22C55E', hover: '#4ADE80', light: '#86EFAC', pro: false },
  gold: { name: '✨ Gold', primary: '#F59E0B', hover: '#FBBF24', light: '#FDE68A', pro: true },
  purple: { name: '✨ Royal', primary: '#7C3AED', hover: '#8B5CF6', light: '#C4B5FD', pro: true },
  pink: { name: '✨ Rose', primary: '#DB2777', hover: '#EC4899', light: '#FBCFE8', pro: true },
  teal: { name: '✨ Teal', primary: '#0D9488', hover: '#14B8A6', light: '#99F6E4', pro: true },
  midnight: { name: '✨ Midnight', primary: '#6366F1', hover: '#818CF8', light: '#C7D2FE', pro: true },
}

export const profileFrames = {
  none: { name: 'None', style: '', pro: false },
  red: { name: 'Classic', style: 'border-4 border-[#CB3939]', pro: false },
  gold: { name: '✨ Gold', style: 'border-4 border-yellow-400 shadow-[0_0_10px_#FBBF24]', pro: true },
  rainbow: { name: '✨ Rainbow', style: 'border-4 border-transparent bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500', pro: true },
  neon: { name: '✨ Neon', style: 'border-4 border-green-400 shadow-[0_0_15px_#4ADE80]', pro: true },
  purple: { name: '✨ Royal', style: 'border-4 border-purple-500 shadow-[0_0_10px_#A855F7]', pro: true },
  fire: { name: '✨ Fire', style: 'border-4 border-orange-500 shadow-[0_0_15px_#F97316]', pro: true },
}

export type ThemeName = keyof typeof themes
export type FrameName = keyof typeof profileFrames
// make sure this is exported at the module level
export const currentFrame = ref<FrameName>('none')

function proKey(username: string) { return `pro_${username}` }
function themeKey(username: string) { return `theme_${username}` }
function frameKey(username: string) { return `frame_${username}` }

const currentTheme = ref<ThemeName>('red')
const isPro = ref(false)

export function applyTheme(name: ThemeName) {
  const theme = themes[name]
  document.documentElement.style.setProperty('--color-primary', theme.primary)
  document.documentElement.style.setProperty('--color-hover', theme.hover)
  document.documentElement.style.setProperty('--color-light', theme.light)
}

export function initTheme(username: string) {
  const pro = localStorage.getItem(proKey(username)) === 'true'
  isPro.value = pro

  if (pro) {
    const savedTheme = localStorage.getItem(themeKey(username)) as ThemeName
    const savedFrame = localStorage.getItem(frameKey(username)) as FrameName
    currentTheme.value = savedTheme || 'red'
    currentFrame.value = savedFrame || 'none'
  } else {
    currentTheme.value = 'red'
    currentFrame.value = 'none'
  }

  applyTheme(currentTheme.value)
}

// replace the savedAccounts block at the bottom with this
const currentUser = localStorage.getItem('currentUser')
if (currentUser) {
  isPro.value = localStorage.getItem(proKey(currentUser)) === 'true'
  const savedTheme = localStorage.getItem(themeKey(currentUser)) as ThemeName
  const savedFrame = localStorage.getItem(frameKey(currentUser)) as FrameName
  if (savedTheme) currentTheme.value = savedTheme
  if (savedFrame) currentFrame.value = savedFrame
  applyTheme(currentTheme.value)
}

watch(currentTheme, (name) => applyTheme(name))

export function useTheme() {
  function setTheme(name: ThemeName, username: string) {
    const theme = themes[name]
    if (theme.pro && !isPro.value) return
    currentTheme.value = name
    localStorage.setItem(themeKey(username), name)
  }

  function setFrame(name: FrameName, username: string) {
    const frame = profileFrames[name]
    if (frame.pro && !isPro.value) return
    currentFrame.value = name
    localStorage.setItem(frameKey(username), name)
  }

  function unlockPro(username: string) {
    isPro.value = true
    localStorage.setItem(proKey(username), 'true')
  }

  return { currentTheme, themes, setTheme, isPro, unlockPro, currentFrame, profileFrames, setFrame }
}