import { ref, watch } from 'vue'

const isDark = ref(localStorage.getItem('darkMode') === 'true')

// apply on load
if (isDark.value) {
  document.documentElement.classList.add('dark')
}

watch(isDark, (val) => {
  if (val) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
  localStorage.setItem('darkMode', String(val))
})

export function useDarkMode() {
  function toggle() {
    isDark.value = !isDark.value
  }
  return { isDark, toggle }
}