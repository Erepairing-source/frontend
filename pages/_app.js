import '../styles/globals.css'
import Script from 'next/script'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import FloatingRoleAssistant from '../components/FloatingRoleAssistant'
import { getApiBase } from '@lib/api'
import { isPathAllowedWithoutEmailVerification, isStandalonePagePath } from '@lib/authPaths'

function clearStoredAuth() {
  localStorage.removeItem('token')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userId')
  localStorage.removeItem('organizationId')
}

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      setUser(null)
      setLoading(false)
      return
    }

    let cancelled = false
    fetch(getApiBase() + '/auth/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        const data = await res.json().catch(() => ({}))
        if (cancelled) return
        if (!res.ok) {
          if (res.status === 401) {
            clearStoredAuth()
            setUser(null)
          }
          return
        }
        if (data.id) {
          setUser(data)
          if (
            data.is_verified !== true &&
            !isPathAllowedWithoutEmailVerification(router.pathname)
          ) {
            const q = data.email
              ? `?email=${encodeURIComponent(data.email)}`
              : ''
            router.replace(`/verify-email${q}`)
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          clearStoredAuth()
          setUser(null)
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [router.pathname])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Don't wrap landing page with Layout (it has its own Header/Footer)
  if (router.pathname === '/') {
    return <Component {...pageProps} user={user} setUser={setUser} />
  }

  if (isStandalonePagePath(router.pathname)) {
    return <Component {...pageProps} user={user} setUser={setUser} />
  }

  // All other pages use Layout
  return (
    <>
      <Script src="/config.js" strategy="beforeInteractive" />
      <Layout user={user} setUser={setUser}>
        <Component {...pageProps} user={user} setUser={setUser} />
        <FloatingRoleAssistant user={user} />
      </Layout>
    </>
  )
}
