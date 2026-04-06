/**
 * Routes a user may open while logged in but email not yet verified.
 * All other routes will redirect to /verify-email after /auth/me loads.
 */
const UNVERIFIED_ALLOWED_PATHS = new Set([
  '/',
  '/login',
  '/signup',
  '/customer-signup',
  '/get-started',
  '/verify-email',
  '/set-password',
  '/forgot-password',
])

export function isPathAllowedWithoutEmailVerification(pathname) {
  if (!pathname) return false
  return UNVERIFIED_ALLOWED_PATHS.has(pathname)
}

/** Full-screen auth/marketing flows: no global Layout + FloatingRoleAssistant wrapper */
export const STANDALONE_PAGE_PATHS = new Set([
  '/login',
  '/signup',
  '/customer-signup',
  '/get-started',
  '/verify-email',
  '/set-password',
  '/forgot-password',
])

export function isStandalonePagePath(pathname) {
  return pathname && STANDALONE_PAGE_PATHS.has(pathname)
}
