import type { StorageAdapter } from './storageAdapter'

export const browserStorageAdapter: StorageAdapter = {
  getItem(key) {
    return window.localStorage.getItem(key)
  },
  setItem(key, value) {
    window.localStorage.setItem(key, value)
  },
  removeItem(key) {
    window.localStorage.removeItem(key)
  },
}
