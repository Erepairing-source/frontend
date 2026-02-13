import '../styles/globals.css'
import Script from 'next/script'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Layout from '../components/Layout'
import FloatingRoleAssistant from '../components/FloatingRoleAssistant'
import { getApiBase } from '../lib/api'

export default function App({ Component, pageProps }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token and get user info
      fetch(getApiBase() + '/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => res.json())
        .then(data => {
          if (data.id) {
            setUser(data)
          }
        })
        .catch(() => {
          localStorage.removeItem('token')
        })
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

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

  // Don't wrap login/signup with Layout
  if (router.pathname === '/login' || router.pathname === '/signup') {
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
