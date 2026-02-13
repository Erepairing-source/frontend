/**
 * API base URL for backend. Use getApiBase() in fetch() so AWS/production works.
 * - Build time: set NEXT_PUBLIC_API_URL before npm run build (e.g. in .env.local).
 * - Runtime override: set window.__API_BASE__ in public/config.js (e.g. for one build, multiple backends).
 */
export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

/** Use this in components so runtime override (config.js) is applied. On server returns API_BASE. */
export function getApiBase() {
  if (typeof window === 'undefined') return API_BASE
  return window.__API_BASE__ || API_BASE
}
