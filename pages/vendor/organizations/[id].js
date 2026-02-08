import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../../components/Card'
import { Button } from '../../../components/ui/button'
import { ArrowLeft, Building2, Mail, Phone, MapPin, Calendar, DollarSign, CreditCard, CheckCircle, XCircle } from 'lucide-react'

export default function VendorOrganizationDetails() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [orgData, setOrgData] = useState(null)

  useEffect(() => {
    if (!id) return

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadOrganizationDetails()
  }, [id, router])

  const loadOrganizationDetails = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/vendor/organizations/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setOrgData(data)
      } else if (response.status === 404) {
        alert('Organization not found or not associated with your vendor account')
        router.push('/vendor/organizations')
      } else if (response.status === 401) {
        router.push('/login')
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading organization details:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization details...</p>
        </div>
      </div>
    )
  }

  if (!orgData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load organization details</p>
          <Button onClick={() => router.push('/vendor/organizations')}>Back to Organizations</Button>
        </div>
      </div>
    )
  }

  const { vendor_org, organization, location, subscription, commission } = orgData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/vendor/organizations')}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Organizations
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{organization.name}</h1>
              <p className="text-gray-600">Organization Details</p>
            </div>
            <div className="flex items-center gap-2">
              {organization.is_active ? (
                <CheckCircle className="text-green-500" size={24} />
              ) : (
                <XCircle className="text-gray-400" size={24} />
              )}
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                organization.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {organization.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Organization Information */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building2 size={24} />
                Organization Information
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Organization Name</p>
                    <p className="text-lg font-semibold text-gray-900">{organization.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Organization Type</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{organization.org_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Mail size={14} />
                      Email
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{organization.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Phone size={14} />
                      Phone
                    </p>
                    <p className="text-lg font-semibold text-gray-900">{organization.phone || 'N/A'}</p>
                  </div>
                  {organization.address && (
                    <div className="md:col-span-2">
                      <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                        <MapPin size={14} />
                        Address
                      </p>
                      <p className="text-lg font-semibold text-gray-900">{organization.address}</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Location */}
            {location && (location.country || location.state || location.city) && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Location</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {location.country && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Country</p>
                      <p className="text-lg font-semibold text-gray-900">{location.country}</p>
                    </div>
                  )}
                  {location.state && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">State</p>
                      <p className="text-lg font-semibold text-gray-900">{location.state}</p>
                    </div>
                  )}
                  {location.city && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">City</p>
                      <p className="text-lg font-semibold text-gray-900">{location.city}</p>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {/* Subscription */}
            {subscription && (
              <Card className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard size={24} />
                  Subscription Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plan Name</p>
                    <p className="text-lg font-semibold text-gray-900">{subscription.plan_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Plan Type</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{subscription.plan_type || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {subscription.status || 'N/A'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Billing Period</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{subscription.billing_period || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Current Price</p>
                    <p className="text-lg font-semibold text-gray-900">
                      ₹{subscription.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                    </p>
                  </div>
                  {subscription.start_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Start Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(subscription.start_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                  {subscription.end_date && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">End Date</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {new Date(subscription.end_date).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Commission Information */}
            <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={24} />
                Commission
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Commission Rate</p>
                  <p className="text-2xl font-bold text-green-700">{(commission.rate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-2xl font-bold text-green-700">
                    ₹{commission.earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                {commission.last_payment && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar size={14} />
                      Last Payment
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {new Date(commission.last_payment).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Vendor Organization Info */}
            <Card className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Vendor Relationship</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-1">
                    <Calendar size={14} />
                    Signup Date
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {vendor_org.signup_date ? new Date(vendor_org.signup_date).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    vendor_org.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {vendor_org.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}



