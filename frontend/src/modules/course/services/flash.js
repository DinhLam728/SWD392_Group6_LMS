const FLASH_KEY = 'lms.course.flash'

export function setFlash(message) {
  sessionStorage.setItem(FLASH_KEY, message)
}

export function peekFlash() {
  return sessionStorage.getItem(FLASH_KEY)
}

export function clearFlash() {
  sessionStorage.removeItem(FLASH_KEY)
}
