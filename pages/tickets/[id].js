import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { getApiBase } from '../../lib/api'

/**
 * Central ticket URL /tickets/[id] - redirects to the correct role-based ticket page.
 * City admin (and other links) use /tickets/10; this page sends them to the right view.
 */
export default function TicketRedirect() {
  const router = useRouter()
  const { id } = router.query

  useEffect(() => {
    if (!id) return

    const token = localStorage.getItem('token')
    if (!token) {
      router.replace(`/login?next=/tickets/${id}`)
      return
    }

    fetch(getApiBase() + '/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        const role = data?.role
        if (role === 'customer') {
          router.replace(`/customer/ticket/${id}`)
        } else if (role === 'support_engineer') {
          router.replace(`/engineer/ticket/${id}`)
        } else if (['city_admin', 'state_admin', 'country_admin', 'organization_admin', 'platform_admin'].includes(role)) {
          router.replace(`/engineer/ticket/${id}`)
        } else {
          router.replace('/login')
        }
      })
      .catch(() => {
        router.replace(`/login?next=/tickets/${id}`)
      })
  }, [id, router])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Opening ticket...</p>
      </div>
    </div>
  )
}
