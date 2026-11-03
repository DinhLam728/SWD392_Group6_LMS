export function formatRegistrationId(id) {
  return `REG-${String(id).padStart(5, '0')}`
}
