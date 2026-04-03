import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card } from '../components/ui/card'
import Logo from '../components/Logo'
import { getApiBase } from '../lib/api'
import { getDashboardPathForRole } from '../lib/roleDashboard'
import { Mail, CheckCircle2, Loader2 } from 'lucide-react'

export default function VerifyEmail({ setUser }) {
  const router = useRouter()
  const qEmail = router.query.email
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [resendMsg, setResendMsg] = useState('')

  useEffect(() => {
    if (router.isReady && qEmail && typeof qEmail === 'string') {
      setEmail(decodeURIComponent(qEmail))
    }
  }, [router.isReady, qEmail])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setResendMsg('')
    if (!email?.trim() || !code?.trim()) {
      setError('Enter your email and the 6-digit code from your inbox.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(getApiBase() + '/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), code: code.trim() }),
      })
      const data = await response.json()
      if (response.ok) {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
        const role = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null
        if (token && role) {
          if (setUser) {
            try {
              const r = await fetch(getApiBase() + '/auth/me', {
                headers: { Authorization: `Bearer ${token}` },
              })
              const u = await r.json()
              if (u.id) setUser(u)
            } catch (_) {
              /* ignore */
            }
          }
          router.replace(getDashboardPathForRole(role))
          return
        }
        setSuccess(true)
      } else {
        setError(typeof data.detail === 'string' ? data.detail : 'Invalid or expired code.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setResendMsg('')
    if (!email?.trim()) {
      setError('Enter your email first.')
      return
    }
    setResendLoading(true)
    try {
      const response = await fetch(getApiBase() + '/auth/resend-verification-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await response.json()
      if (response.ok) {
        setResendMsg(data.message || 'If your account needs verification, a new code was sent.')
      } else {
        setError(data.detail || 'Could not resend code.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Email verified</h1>
          <p className="text-gray-600 mb-6">Thank you. You can continue using eRepairing.</p>
          <Link href="/login">
            <Button className="w-full">Go to login</Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <Logo />
        </div>
        <div className="flex items-center justify-center mb-6">
          <Mail className="mr-2 text-primary" size={24} />
          <h1 className="text-xl font-semibold text-gray-900">Verify your email</h1>
        </div>
        <p className="text-sm text-gray-600 mb-6 text-center">
          Enter the 6-digit code we sent to your email (same message as your password link if you signed up without a password).
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <Label htmlFor="code">Verification code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
              placeholder="6-digit code"
              required
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {resendMsg && <p className="text-sm text-green-700">{resendMsg}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verify'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={handleResend}
            disabled={resendLoading}
            className="text-sm text-primary hover:underline disabled:opacity-50"
          >
            {resendLoading ? 'Sending…' : 'Resend code'}
          </button>
        </div>
        <p className="mt-6 text-center text-sm text-gray-500">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  )
}
