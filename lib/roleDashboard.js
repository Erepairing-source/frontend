/**
 * Default post-login dashboard path per role (see pages/login.js, Layout.js).
 */
const ROLE_DASHBOARD = {
  customer: '/customer/dashboard',
  support_engineer: '/engineer/dashboard',
  city_admin: '/city-admin/dashboard',
  state_admin: '/state-admin/dashboard',
  country_admin: '/country-admin/dashboard',
  organization_admin: '/organization-admin/dashboard',
  platform_admin: '/platform-admin/dashboard',
  vendor: '/vendor/dashboard',
}

export function getDashboardPathForRole(role) {
  if (!role) return '/'
  const path = ROLE_DASHBOARD[role]
  return path || '/'
}
