import { useEffect } from 'react'
import { useRouter } from 'next/router'

export default function OrgAdminDashboardRedirect() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to the correct organization admin dashboard
    router.replace('/organization-admin/dashboard')
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}



