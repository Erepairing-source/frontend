/**
 * API base URL for fetch() calls. Uses runtime override from public/config.js when set.
 */

function normalizeBase(url) {
  if (url == null || url === '') return ''
  return String(url).replace(/\/+$/, '')
}

export function getApiBase() {
  if (typeof window !== 'undefined') {
    const runtime = window.__API_BASE__
    if (runtime != null && String(runtime).trim() !== '') {
      return normalizeBase(runtime)
    }
  }
  const env = process.env.NEXT_PUBLIC_API_URL
  if (env != null && String(env).trim() !== '') {
    return normalizeBase(env)
  }
  return 'http://localhost:8000/api/v1'
}

/** API host without /api/v1 — for /uploads static files served by FastAPI. */
export function getApiOrigin() {
  const base = getApiBase()
  if (base.endsWith('/api/v1')) {
    return base.slice(0, -'/api/v1'.length)
  }
  return base.replace(/\/api\/v1\/?$/, '') || base
}

/**
 * Turn stored upload paths (/uploads/...) into absolute URLs on the API host.
 * Relative paths on the marketing site (erepairing.com) 404; files live on api.*.
 */
export function resolveMediaUrl(url) {
  if (url == null || url === '') return ''
  const s = String(url).trim()
  if (s.startsWith('http://') || s.startsWith('https://') || s.startsWith('blob:')) {
    return s
  }
  if (s.startsWith('/uploads/')) {
    return `${getApiOrigin()}${s}`
  }
  return s
}

/**
 * Turn FastAPI `detail` (string | object | validation array) into a single message.
 */
export function formatApiError(detail) {
  if (detail == null) return ''
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail
      .map((e) => {
        if (e == null) return ''
        if (typeof e === 'string') return e
        if (typeof e.msg === 'string') return e.msg
        if (typeof e.message === 'string') return e.message
        try {
          return JSON.stringify(e)
        } catch {
          return String(e)
        }
      })
      .filter(Boolean)
      .join('; ')
  }
  if (typeof detail === 'object') {
    if (typeof detail.msg === 'string') return detail.msg
    if (typeof detail.message === 'string') return detail.message
    try {
      return JSON.stringify(detail)
    } catch {
      return String(detail)
    }
  }
  return String(detail)
}
