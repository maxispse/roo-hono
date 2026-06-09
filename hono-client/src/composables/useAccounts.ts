import { reactive } from 'vue'

interface SavedAccount {
  username: string
  email: string
  avatar: string | null
}

const accounts = reactive<SavedAccount[]>(
  JSON.parse(localStorage.getItem('savedAccounts') || '[]')
)

function saveAccount(username: string, email: string, avatar: string | null) {
  const existing = accounts.findIndex(a => a.email === email)
  if (existing >= 0) {
    accounts[existing] = { username, email, avatar }
  } else {
    accounts.push({ username, email, avatar })
  }
  localStorage.setItem('savedAccounts', JSON.stringify(accounts))
}

function removeAccount(email: string) {
  const index = accounts.findIndex(a => a.email === email)
  if (index >= 0) accounts.splice(index, 1)
  localStorage.setItem('savedAccounts', JSON.stringify(accounts))
}

export function useAccounts() {
  return { accounts, saveAccount, removeAccount }
}