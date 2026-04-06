import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Card } from '../components/ui/card'
import Logo from '../components/Logo'
import { getApiBase } from '@lib/api'
import { Lock, CheckCircle2, Loader2, Mail } from 'lucide-react'

function formatErrorDetail(detail) {
  if (!detail) return 'Something went wrong.'
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    return detail.map((e) => e.msg || e.message || JSON.stringify(e)).join(' ')
  }
  return String(detail)
}

export default function SetPassword() {
  const router = useRouter()
  const { token } = router.query
  const [verificationCode, setVerificationCode] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [previewLoading, setPreviewLoading] = useState(true)
  /** If false, email was already verified (e.g. /verify-email) — OTP not required */
  const [requiresOtp, setRequiresOtp] = useState(true)
  const [badLinkMessage, setBadLinkMessage] = useState('')

  useEffect(() => {
    if (!token && router.isReady) {
      setBadLinkMessage('Invalid or missing link. Please use the link from your email.')
      setPreviewLoading(false)
    }
  }, [token, router.isReady])

  useEffect(() => {
    if (!token || !router.isReady) return
    let cancelled = false
    ;(async () => {
      setPreviewLoading(true)
      setBadLinkMessage('')
      try {
        const q = new URLSearchParams({ token: String(token) })
        const res = await fetch(`${getApiBase()}/auth/set-password-preview?${q}`)
        const data = await res.json()
        if (cancelled) return
        if (!data.valid) {
          setBadLinkMessage(
            data.reason === 'expired'
              ? 'This link has expired. Use “Forgot password” or ask your admin to resend the invite.'
              : 'This link is invalid or was already used.'
          )
          setRequiresOtp(true)
        } else {
          setRequiresOtp(data.requires_verification_code !== false)
        }
      } catch {
        if (!cancelled) setRequiresOtp(true)
      } finally {
        if (!cancelled) setPreviewLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [token, router.isReady])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (requiresOtp && (!verificationCode.trim() || verificationCode.replace(/\D/g, '').length < 4)) {
      setError('Enter the verification code from your email (6 digits).')
      return
    }
    if (!password || !confirmPassword) {
      setError('Please enter and confirm your password.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(getApiBase() + '/auth/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          new_password: password,
          verification_code: requiresOtp ? verificationCode.trim() : '',
        }),
      })
      const data = await response.json()
      if (response.ok) {
        setSuccess(true)
      } else {
        setError(formatErrorDetail(data.detail) || 'Invalid code, link, or password. Request a new email from login if needed.')
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <CheckCircle2 className="mx-auto text-green-600 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Account ready</h1>
          <p className="text-gray-600 mb-6">
            Your email is verified and your password is set. You can log in now.
          </p>
          <Link href="/login">
            <Button className="w-full">Go to login</Button>
          </Link>
        </Card>
      </div>
    )
  }

  if (!token && router.isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Logo />
          </div>
          <p className="text-red-600 text-center mb-4">{badLinkMessage}</p>
          <Link href="/login" className="block text-center text-primary hover:underline">
            Back to login
          </Link>
        </Card>
      </div>
    )
  }

  if (previewLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md p-8 text-center">
          <Loader2 className="mx-auto animate-spin text-primary mb-4" size={32} />
          <p className="text-gray-600">Checking your link…</p>
        </Card>
      </div>
    )
  }

  if (badLinkMessage && token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <Card className="w-full max-w-md p-8">
          <div className="text-center mb-6">
            <Logo />
          </div>
          <p className="text-red-600 text-center mb-4">{badLinkMessage}</p>
          <Link href="/login" className="block text-center text-primary hover:underline">
            Back to login
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
        <div className="flex items-center justify-center mb-4">
          <Lock className="mr-2 text-primary" size={24} />
          <h1 className="text-2xl font-bold text-gray-900">Activate your account</h1>
        </div>
        <p className="text-gray-600 text-sm text-center mb-6">
          {requiresOtp ? (
            <>
              Enter the <strong>verification code</strong> from the same email as this link, then choose your
              password twice below.
            </>
          ) : (
            <>Your email is already verified. Choose your new password twice below.</>
          )}
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          {requiresOtp && (
            <div className="space-y-2">
              <Label htmlFor="otp" className="flex items-center gap-2">
                <Mail size={16} />
                Verification code *
              </Label>
              <Input
                id="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 8))}
                placeholder="6-digit code from email"
                required
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="password">New password *</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
              required
              minLength={8}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm new password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              required
              minLength={8}
            />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Activating account...
              </>
            ) : (
              'Verify & set password'
            )}
          </Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-4">
          <Link href="/login" className="text-primary hover:underline">Back to login</Link>
          {' · '}
          <Link href="/verify-email" className="text-primary hover:underline">
            Verified email only?
          </Link>
        </p>
      </Card>
    </div>
  )
}
