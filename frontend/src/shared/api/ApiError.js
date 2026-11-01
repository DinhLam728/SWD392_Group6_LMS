export class ApiError extends Error {
  constructor({ status = 0, code, message, errors = [] }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }
}
