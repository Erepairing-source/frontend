import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card } from '../components/ui/card'
import Logo from '../components/Logo'
import { getApiBase } from '../lib/api'
import { KeyRound, Loader2, Mail } from 'lucide-react'

export default function ForgotPasswordPage() {
  const router = useRouter()
  const qEmail = router.query.email

  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    if (router.isReady && qEmail && typeof qEmail === 'string') {
      setEmail(decodeURIComponent(qEmail))
    }
  }, [router.isReady, qEmail])

  const normalizedEmail = () => email.trim().toLowerCase()

  const handleSendCode = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!normalizedEmail()) {
      setError('Enter your registered email address.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(getApiBase() + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail() }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setInfo(data.message || 'If an account exists for that email, a reset code has been sent.')
        setStep('reset')
      } else {
        setError(typeof data.detail === 'string' ? data.detail : 'Could not send code. Try again later.')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    setError('')
    setInfo('')
    if (!normalizedEmail()) {
      setError('Enter your email first.')
      return
    }
    setResendLoading(true)
    try {
      const response = await fetch(getApiBase() + '/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail() }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setInfo(data.message || 'If an account exists for that email, a reset code has been sent.')
      } else {
        setError(typeof data.detail === 'string' ? data.detail : 'Could not resend code.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setResendLoading(false)
    }
  }

  const handleReset = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (!code.trim()) {
      setError('Enter the code from your email.')
      return
    }
    if (!newPassword || newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(getApiBase() + '/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: normalizedEmail(),
          code: code.trim(),
          new_password: newPassword,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        router.push('/login?reset=success')
      } else {
        setError(typeof data.detail === 'string' ? data.detail : 'Could not reset password.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-6">
          <Logo />
        </div>

        {step === 'email' ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <Mail className="text-primary" size={22} />
              <h1 className="text-xl font-semibold text-gray-900">Forgot password</h1>
            </div>
            <p className="text-sm text-gray-600 mb-6 text-center">
              Enter the email you use to sign in. We will send a one-time code to reset your password.
            </p>
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <Label htmlFor="fp-email">Email</Label>
                <Input
                  id="fp-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Sending…
                  </span>
                ) : (
                  'Send reset code'
                )}
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <KeyRound className="text-primary" size={22} />
              <h1 className="text-xl font-semibold text-gray-900">Set new password</h1>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              We sent a 6-digit code to <strong>{normalizedEmail()}</strong>. Enter it below with your new password.
            </p>
            {info && <p className="text-sm text-green-700 mb-4">{info}</p>}
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <Label htmlFor="fp-email2">Email</Label>
                <Input
                  id="fp-email2"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="fp-code">Code from email</Label>
                <Input
                  id="fp-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="6-digit code"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fp-new">New password</Label>
                <Input
                  id="fp-new"
                  type="password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  minLength={8}
                />
              </div>
              <div>
                <Label htmlFor="fp-confirm">Confirm password</Label>
                <Input
                  id="fp-confirm"
                  type="password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  minLength={8}
                />
              </div>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={18} />
                    Updating…
                  </span>
                ) : (
                  'Update password'
                )}
              </Button>
            </form>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-sm">
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading}
                className="text-primary hover:underline disabled:opacity-50"
              >
                {resendLoading ? 'Sending…' : 'Resend code'}
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setNewPassword('')
                  setConfirmPassword('')
                  setError('')
                  setInfo('')
                }}
                className="text-gray-600 hover:underline"
              >
                Different email
              </button>
            </div>
          </>
        )}

        <p className="mt-8 text-center text-sm text-gray-500">
          <Link href="/login" className="text-primary hover:underline">
            Back to login
          </Link>
        </p>
      </Card>
    </div>
  )
}
