import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { PasswordInput } from '../components/ui/password-input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Card } from '../components/ui/card'
import { User, Building2, Loader2 } from 'lucide-react'
import Logo from '../components/Logo'
import { getApiBase } from '@lib/api'

export default function CustomerSignup() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState([])
  const [loadingOrgs, setLoadingOrgs] = useState(true)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    organization_id: '',
    full_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: ''
  })

  useEffect(() => {
    fetch(getApiBase() + '/signup/organizations')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setOrganizations(data)
        } else {
          setOrganizations([])
        }
      })
      .catch(err => {
        console.error('Error loading organizations:', err)
        setOrganizations([])
      })
      .finally(() => setLoadingOrgs(false))
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.organization_id) {
      alert('Please select your organization.')
      return
    }
    if (!formData.full_name?.trim()) {
      alert('Please enter your full name.')
      return
    }
    if (!formData.email?.trim()) {
      alert('Please enter your email.')
      return
    }
    if (!formData.phone?.trim()) {
      alert('Please enter your phone number.')
      return
    }
    if (formData.password && formData.password !== formData.confirm_password) {
      alert('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      const payload = {
        organization_id: parseInt(formData.organization_id, 10),
        full_name: formData.full_name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim()
      }
      if (formData.password?.trim()) {
        payload.password = formData.password
      }
      const response = await fetch(getApiBase() + '/signup/customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await response.json()
      if (response.ok) {
        if (data.password_set_via_email) {
          alert(data.message || 'Check your email to set your password. The link is valid only once and expires after use.')
          router.push('/login')
        } else {
          localStorage.setItem('token', data.access_token)
          localStorage.setItem('userRole', data.user.role)
          localStorage.setItem('userId', data.user.id)
          localStorage.setItem('organizationId', data.user.organization_id)
          alert(
            'We sent a verification code to your email. Enter it on the next screen to confirm your address, then you can use your dashboard.'
          )
          router.push(
            '/verify-email?email=' + encodeURIComponent(data.user.email)
          )
        }
      } else {
        alert(data.detail || 'Registration failed. Please try again.')
      }
    } catch (err) {
      console.error('Customer signup error:', err)
      alert('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-12">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-12" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/signup" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Sign up your org
            </Link>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
              Login
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-lg">
        <Card className="p-8">
          <div className="flex items-center mb-6">
            <User className="mr-3 text-primary" size={24} />
            <h1 className="text-2xl font-bold text-gray-900">Customer sign up</h1>
          </div>
          <p className="text-gray-600 mb-6">
            Sign up as a customer for your organization. Select your organization below and create your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="organization_id">Your organization *</Label>
              <Select
                value={formData.organization_id}
                onValueChange={(value) => setFormData(prev => ({ ...prev, organization_id: value }))}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={loadingOrgs ? 'Loading organizations...' : 'Select organization'} />
                </SelectTrigger>
                <SelectContent>
                  {loadingOrgs ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                  ) : organizations.length === 0 ? (
                    <div className="py-4 text-center text-sm text-gray-500">No organizations found</div>
                  ) : (
                    organizations.map(org => (
                      <SelectItem key={org.id} value={String(org.id)}>
                        {org.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full name *</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="e.g., John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+91 9876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password (optional)</Label>
              <PasswordInput
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                placeholder="Leave blank to receive set-password link by email"
              />
            </div>

            {formData.password ? (
              <div className="space-y-2">
                <Label htmlFor="confirm_password">Confirm password</Label>
                <PasswordInput
                  id="confirm_password"
                  name="confirm_password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  autoComplete="new-password"
                  placeholder="Re-enter password"
                />
              </div>
            ) : null}

            <Button
              type="submit"
              className="w-full"
              disabled={loading || loadingOrgs || organizations.length === 0}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing up...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link href="/login" className="text-primary font-medium hover:underline">
              Log in
            </Link>
          </p>
          <p className="mt-2 text-center text-sm text-gray-600">
            Need to create an organization?{' '}
            <Link href="/signup" className="text-primary font-medium hover:underline">
              Sign up your org
            </Link>
          </p>
        </Card>
      </div>
    </div>
  )
}
