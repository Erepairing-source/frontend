import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Textarea } from '../components/ui/textarea'
import { Card } from '../components/ui/card'
import { CheckCircle2, Loader2, Building2, User, MapPin, CreditCard } from 'lucide-react'
import Link from 'next/link'
import Logo from '../components/Logo'
import { getApiBase } from '../lib/api'

export default function Signup() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingCountries, setLoadingCountries] = useState(true)
  const [loadingStates, setLoadingStates] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [plans, setPlans] = useState([])
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [selectedCountry, setSelectedCountry] = useState(null)
  const [selectedState, setSelectedState] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  
  const [formData, setFormData] = useState({
    // Organization
    org_name: '',
    org_type: '',
    org_email: '',
    org_phone: '',
    org_address: '',
    country_id: '',
    state_id: '',
    city_id: '',
    // Admin User
    admin_name: '',
    admin_email: '',
    admin_phone: '',
    admin_password: '',
    admin_confirm_password: '',
    // Subscription
    plan_id: '',
    billing_period: 'monthly',
    // Vendor (optional - auto-filled from URL)
    vendor_code: ''
  })

  useEffect(() => {
    // Check for vendor_code in query params
    const { vendor_code } = router.query
    if (vendor_code) {
      setFormData(prev => ({ ...prev, vendor_code: vendor_code }))
    }
    
    // Check for plan ID in query params
    if (router.query.plan) {
      setFormData(prev => ({ ...prev, plan_id: String(router.query.plan) }))
      setSelectedPlan(String(router.query.plan))
    }
    
    // Load plans
    fetch(getApiBase() + '/platform-admin/plans/public')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          // Public endpoint already filters for is_visible, so just use all returned plans
          setPlans(data)
          console.log('Loaded plans:', data.length)
        } else {
          console.error('Plans data is not an array:', data)
          setPlans([])
        }
      })
      .catch(err => {
        console.error('Error loading plans:', err)
        setPlans([])
      })
    
    // Load countries (India only)
    setLoadingCountries(true)
    fetch(getApiBase() + '/locations/countries?india_only=true')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCountries(data)
        }
      })
      .catch(err => console.error('Error loading countries:', err))
      .finally(() => setLoadingCountries(false))
  }, [router.query])

  useEffect(() => {
    if (!selectedCountry) {
      setStates([])
      setLoadingStates(false)
      return
    }
    setLoadingStates(true)
    setCities([])
    setSelectedState(null)
    setFormData(prev => ({ ...prev, state_id: '', city_id: '' }))
    const stateParam = selectedCountry && !isNaN(Number(selectedCountry)) ? `country_id=${selectedCountry}` : `country_code=${selectedCountry || 'IN'}`
    fetch(`${getApiBase()}/locations/states?${stateParam}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setStates(data)
      })
      .catch(err => console.error('Error loading states:', err))
      .finally(() => setLoadingStates(false))
  }, [selectedCountry])

  useEffect(() => {
    if (!selectedState) {
      setCities([])
      setLoadingCities(false)
      return
    }
    setLoadingCities(true)
    setFormData(prev => ({ ...prev, city_id: '' }))
    const params = new URLSearchParams({ state_id: String(selectedState), country_code: 'IN' })
    fetch(`${getApiBase()}/locations/cities?${params}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setCities(data)
      })
      .catch(err => console.error('Error loading cities:', err))
      .finally(() => setLoadingCities(false))
  }, [selectedState])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleSelectChange = (id, value) => {
    setFormData(prev => ({ ...prev, [id]: value }))
    if (id === 'country_id') {
      setSelectedCountry(value)
    } else if (id === 'state_id') {
      setSelectedState(value)
    } else if (id === 'plan_id') {
      setSelectedPlan(value)
    }
  }

  const validateStep = (stepNum) => {
    if (stepNum === 1) {
      if (!formData.org_name || !formData.org_type || !formData.org_email || 
          !formData.org_phone || !formData.country_id || !formData.state_id || !formData.city_id) {
        alert('Please fill in all required organization fields')
        return false
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.org_email)) {
        alert('Please enter a valid email address')
        return false
      }
    } else if (stepNum === 2) {
      if (!formData.admin_name || !formData.admin_email || !formData.admin_phone || 
          !formData.admin_password || !formData.admin_confirm_password) {
        alert('Please fill in all required admin user fields')
        return false
      }
      if (formData.admin_password !== formData.admin_confirm_password) {
        alert('Passwords do not match')
        return false
      }
      if (formData.admin_password.length < 8) {
        alert('Password must be at least 8 characters long')
        return false
      }
    } else if (stepNum === 3) {
      if (!formData.plan_id) {
        alert('Please select a subscription plan')
        return false
      }
    }
    return true
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateStep(3)) return
    
    setLoading(true)
    
    const cid = parseInt(formData.country_id, 10)
    const sid = parseInt(formData.state_id, 10)
    const cityId = parseInt(formData.city_id, 10)
    const validCountryId = !isNaN(cid) && cid > 0
    const validStateId = !isNaN(sid) && sid > 0
    const validCityId = !isNaN(cityId) && cityId > 0

    const submitData = {
      ...formData,
      plan_id: parseInt(formData.plan_id, 10),
      billing_period: billingPeriod,
      country_id: validCountryId ? cid : null,
      state_id: validStateId ? sid : null,
      city_id: validCityId ? cityId : null
    }
    if (!validCountryId && formData.country_id) submitData.country_code = String(formData.country_id).trim()
    if (!validStateId && formData.state_id) {
      const sv = String(formData.state_id).trim()
      if (sv.length <= 4 && sv === sv.toUpperCase()) submitData.state_code = sv
      else submitData.state_name = sv
    }
    if (!validCityId && formData.city_id) submitData.city_name = String(formData.city_id).trim()
    
    delete submitData.admin_confirm_password
    
    try {
      const response = await fetch(getApiBase() + '/signup/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData)
      })
      
      const data = await response.json()
      
      if (response.ok) {
        // Check if user is already logged in (e.g., vendor viewing signup page)
        const existingToken = localStorage.getItem('token')
        const existingRole = localStorage.getItem('userRole')
        
        if (existingToken && existingRole === 'vendor') {
          // Vendor is logged in - don't override their session
          // Show success message and refresh vendor dashboard
          alert(`Organization "${data.organization.name}" has been successfully registered! The organization has been linked to your vendor account.`)
          
          // Refresh vendor dashboard to show new organization
          if (window.location.pathname.includes('/signup')) {
            router.push('/vendor/dashboard')
          } else {
            // If vendor opened signup in new tab, just close or refresh
            window.location.reload()
          }
        } else {
          // No one is logged in - proceed with normal signup flow
          localStorage.setItem('token', data.access_token)
          localStorage.setItem('userRole', data.user.role)
          localStorage.setItem('userId', data.user.id)
          localStorage.setItem('organizationId', data.organization.id)
          
          alert('Registration successful! Redirecting to dashboard...')
          router.push('/organization-admin/dashboard')
        }
      } else {
        alert(`Error: ${data.detail || 'Registration failed. Please try again.'}`)
        setLoading(false)
      }
    } catch (err) {
      console.error('Registration error:', err)
      alert('Registration failed. Please try again.')
      setLoading(false)
    }
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 pt-20 pb-12">
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/90 backdrop-blur border-b border-gray-200">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo className="h-12" />
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
        </div>
      </header>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                  step >= s 
                    ? 'bg-primary border-primary text-primary-foreground' 
                    : 'bg-white border-gray-300 text-gray-400'
                }`}>
                  {step > s ? (
                    <CheckCircle2 size={20} />
                  ) : (
                    <span className="font-semibold">{s}</span>
                  )}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 ${
                    step > s ? 'bg-primary' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-sm">
            <span className={step >= 1 ? 'text-primary font-semibold' : 'text-gray-400'}>
              Organization
            </span>
            <span className={step >= 2 ? 'text-primary font-semibold' : 'text-gray-400'}>
              Admin Account
            </span>
            <span className={step >= 3 ? 'text-primary font-semibold' : 'text-gray-400'}>
              Subscription
            </span>
          </div>
        </div>

        <Card className="p-8">
          {/* Step 1: Organization Details */}
          {step === 1 && (
            <div>
              <div className="flex items-center mb-6">
                <Building2 className="mr-3 text-primary" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Organization Details</h2>
              </div>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="org_name">Organization Name *</Label>
                    <Input
                      id="org_name"
                      value={formData.org_name}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC Service Center"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org_type">Organization Type *</Label>
                    <Select value={formData.org_type} onValueChange={(value) => handleSelectChange('org_type', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oem">OEM (Original Equipment Manufacturer)</SelectItem>
                        <SelectItem value="service_company">Service Company</SelectItem>
                        <SelectItem value="dealer">Dealer</SelectItem>
                        <SelectItem value="repair_shop">Repair Shop</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="org_email">Organization Email *</Label>
                    <Input
                      id="org_email"
                      type="email"
                      value={formData.org_email}
                      onChange={handleInputChange}
                      placeholder="contact@organization.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="org_phone">Organization Phone *</Label>
                    <Input
                      id="org_phone"
                      type="tel"
                      value={formData.org_phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="org_address">Address</Label>
                  <Textarea
                    id="org_address"
                    value={formData.org_address}
                    onChange={handleInputChange}
                    placeholder="Street address, building, etc."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country_id">Country *</Label>
                    <Select value={formData.country_id} onValueChange={(value) => handleSelectChange('country_id', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCountries ? 'Loading...' : 'Select country'} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCountries ? (
                          <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                        ) : (
                          countries.map(country => (
                            <SelectItem key={country.id ?? country.code} value={String(country.id ?? country.code)}>
                              {country.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="state_id">State *</Label>
                    <Select 
                      value={formData.state_id} 
                      onValueChange={(value) => handleSelectChange('state_id', value)}
                      disabled={!selectedCountry || loadingStates}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingStates ? 'Loading...' : 'Select state'} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingStates ? (
                          <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                        ) : (
                          states.map(state => (
                            <SelectItem key={state.id ?? state.code ?? state.name} value={String(state.id ?? state.code ?? state.name)}>
                              {state.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="city_id">City *</Label>
                    <Select 
                      value={formData.city_id} 
                      onValueChange={(value) => handleSelectChange('city_id', value)}
                      disabled={!selectedState || loadingCities}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingCities ? 'Loading...' : 'Select city'} />
                      </SelectTrigger>
                      <SelectContent>
                        {loadingCities ? (
                          <div className="flex items-center justify-center py-4"><Loader2 className="h-5 w-5 animate-spin" /></div>
                        ) : (
                          cities.map(city => (
                            <SelectItem key={city.id ?? city.name} value={String(city.id ?? city.name)}>
                              {city.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end mt-8">
                <Button onClick={handleNext} variant="default" size="lg">
                  Next: Admin Account
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Admin Account */}
          {step === 2 && (
            <div>
              <div className="flex items-center mb-6">
                <User className="mr-3 text-primary" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Admin Account</h2>
              </div>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="admin_name">Full Name *</Label>
                  <Input
                    id="admin_name"
                    value={formData.admin_name}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin_email">Email *</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={formData.admin_email}
                      onChange={handleInputChange}
                      placeholder="admin@organization.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin_phone">Phone *</Label>
                    <Input
                      id="admin_phone"
                      type="tel"
                      value={formData.admin_phone}
                      onChange={handleInputChange}
                      placeholder="+91 9876543210"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="admin_password">Password *</Label>
                    <Input
                      id="admin_password"
                      type="password"
                      value={formData.admin_password}
                      onChange={handleInputChange}
                      placeholder="Minimum 8 characters"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="admin_confirm_password">Confirm Password *</Label>
                    <Input
                      id="admin_confirm_password"
                      type="password"
                      value={formData.admin_confirm_password}
                      onChange={handleInputChange}
                      placeholder="Re-enter password"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-8">
                <Button onClick={handleBack} variant="outline" size="lg">
                  Back
                </Button>
                <Button onClick={handleNext} variant="default" size="lg">
                  Next: Subscription
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Subscription Plan */}
          {step === 3 && (
            <div>
              <div className="flex items-center mb-6">
                <CreditCard className="mr-3 text-primary" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Choose Your Plan</h2>
              </div>

              {/* Billing Period Toggle */}
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center space-x-4 bg-gray-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('monthly')}
                    className={`px-6 py-2 rounded-md font-semibold transition-all ${
                      billingPeriod === 'monthly'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setBillingPeriod('annual')}
                    className={`px-6 py-2 rounded-md font-semibold transition-all ${
                      billingPeriod === 'annual'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Annual
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {plans.length === 0 ? (
                  <div className="col-span-3 text-center py-8">
                    <Loader2 className="mx-auto mb-4 animate-spin text-primary" size={32} />
                    <p className="text-gray-600">Loading plans...</p>
                  </div>
                ) : (
                  plans.map((plan) => {
                    const price = billingPeriod === 'monthly' ? plan.monthly_price : plan.annual_price
                    const isSelected = formData.plan_id === String(plan.id)
                    
                    return (
                      <Card
                        key={plan.id}
                        className={`p-6 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-2 border-primary shadow-lg'
                            : 'border hover:shadow-md'
                        }`}
                        onClick={() => handleSelectChange('plan_id', String(plan.id))}
                      >
                        <div className="text-center">
                          <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                          <div className="mb-4">
                            <span className="text-3xl font-bold">
                              {formatPrice(price)}
                            </span>
                            <span className="text-gray-600 text-sm">
                              /{billingPeriod === 'monthly' ? 'month' : 'year'}
                            </span>
                          </div>
                          {plan.description && (
                            <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                          )}
                          {plan.max_engineers && (
                            <p className="text-xs text-gray-500 mb-4">
                              Max Engineers: {plan.max_engineers === -1 ? 'Unlimited' : plan.max_engineers}
                            </p>
                          )}
                          {isSelected && (
                            <div className="mt-4">
                              <CheckCircle2 className="mx-auto text-primary" size={24} />
                            </div>
                          )}
                        </div>
                      </Card>
                    )
                  })
                )}
              </div>

              <div className="flex justify-between mt-8">
                <Button onClick={handleBack} variant="outline" size="lg">
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit} 
                  variant="default" 
                  size="lg"
                  disabled={loading || !formData.plan_id}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={20} />
                      Creating Account...
                    </>
                  ) : (
                    'Complete Registration'
                  )}
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
