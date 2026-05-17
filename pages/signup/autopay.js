import { useEffect } from 'react'
import { useRouter } from 'next/router'

/** Autopay is disabled while all orgs are on complimentary access. */
export default function SignupAutopayRedirect() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.replace('/organization-admin/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center text-slate-600">
      Redirecting…
    </div>
  )
}
