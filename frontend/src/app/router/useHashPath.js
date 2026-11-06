import { useSyncExternalStore } from 'react'

function subscribe(callback) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
}

function getSnapshot() {
  return window.location.hash.slice(1) || '/'
}

export function useHashPath() {
  return useSyncExternalStore(subscribe, getSnapshot)
}

export function navigate(path) {
  window.location.hash = path
}
