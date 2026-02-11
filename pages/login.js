import { useState } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Card from '../components/Card'
import { API_BASE } from '../lib/api'

export default function Login({ setUser }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      console.log('Sending login request...', { email, password: '***' })
      
      const response = await fetch(API_BASE + '/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      console.log('Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: Object.fromEntries(response.headers.entries())
      })

      // Check if response is OK first
      if (response.ok) {
        const data = await response.json()
        console.log('Login successful:', { role: data.role, userId: data.user_id })
        
        localStorage.setItem('token', data.access_token)
        localStorage.setItem('userRole', data.role)
        localStorage.setItem('userId', data.user_id)
        
        if (setUser) {
          setUser(data)
        }

        const roleRoutes = {
          'customer': '/customer/dashboard',
          'support_engineer': '/engineer/dashboard',
          'city_admin': '/city-admin/dashboard',
          'state_admin': '/state-admin/dashboard',
          'country_admin': '/country-admin/dashboard',
          'organization_admin': '/org-admin/dashboard',
          'platform_admin': '/platform-admin/dashboard',
          'vendor': '/vendor/dashboard',
        }

        router.push(roleRoutes[data.role] || '/dashboard')
      } else {
        // Try to parse error response
        let errorMessage = 'Login failed. Please check your credentials.'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorData.message || errorMessage
        } catch (parseError) {
          // If JSON parsing fails, use status text
          errorMessage = `Login failed: ${response.status} ${response.statusText}`
        }
        setError(errorMessage)
      }
    } catch (err) {
      console.error('Login error:', err)
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      })
      setError(err.message || 'Network error. Please check if the backend server is running.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center py-12">
        <div className="w-full max-w-md">
          <Card className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">eR</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Sign in to your eRepairing.com account</p>
            </div>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="admin@erepairing.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter your password"
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                    Signing in...
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Home
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  )
}
