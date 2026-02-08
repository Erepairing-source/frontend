import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import StatCard from '../../../components/StatCard'
import {
  Store, MapPin, DollarSign, Users, BarChart3,
  Building2, Calendar, Phone, Mail, ArrowLeft,
  TrendingUp, Ticket, Package, CheckCircle2, XCircle
} from 'lucide-react'

export default function VendorDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [vendorData, setVendorData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!id) return

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadVendorDetails()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router])

  const loadVendorDetails = async () => {
    if (!id) return
    
    setLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    
    try {
      const response = await fetch(`http://localhost:8000/api/v1/platform-admin/vendors/${id}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch vendor details`)
      }

      const data = await response.json()
      setVendorData(data)
    } catch (error) {
      console.error('Error loading vendor details:', error)
      setVendorData(null)
      alert(`Error: ${error.message}. Please check the console for details.`)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor details...</p>
        </div>
      </div>
    )
  }

  if (!vendorData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Vendor not found or failed to load</p>
          <Button onClick={() => router.push('/platform-admin/vendors')}>
            <ArrowLeft size={18} className="mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    )
  }

  const { vendor, location, statistics, organizations } = vendorData || {}
  
  if (!vendor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Invalid vendor data</p>
          <Button onClick={() => router.push('/platform-admin/vendors')}>
            <ArrowLeft size={18} className="mr-2" />
            Back to Vendors
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/platform-admin/vendors')}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Vendors
          </Button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
              <Store size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{vendor.name}</h1>
              <p className="text-gray-600 mt-1">Vendor Code: {vendor.vendor_code}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Organizations"
            value={statistics?.organizations_count || 0}
            icon={{ emoji: '🏢', bg: 'bg-blue-100', color: 'text-blue-600' }}
          />
          <StatCard
            title="Active Organizations"
            value={statistics?.active_organizations_count || 0}
            icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }}
          />
          <StatCard
            title="Total Commission"
            value={`₹${(statistics?.total_commission_earned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={{ emoji: '💰', bg: 'bg-yellow-100', color: 'text-yellow-600' }}
          />
          <StatCard
            title="Monthly Commission"
            value={`₹${(statistics?.monthly_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={{ emoji: '📈', bg: 'bg-purple-100', color: 'text-purple-600' }}
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b border-gray-200">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'organizations', label: 'Organizations' },
              { id: 'statistics', label: 'Statistics' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Vendor Code</label>
                  <p className="text-lg font-semibold">{vendor.vendor_code}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Email</label>
                  <p className="text-lg flex items-center gap-2">
                    <Mail size={16} className="text-gray-400" />
                    {vendor.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Phone</label>
                  <p className="text-lg flex items-center gap-2">
                    <Phone size={16} className="text-gray-400" />
                    {vendor.phone || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Commission Rate</label>
                  <p className="text-lg font-semibold text-green-600">
                    {(vendor.commission_rate * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                    vendor.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {vendor.is_active ? (
                      <>
                        <CheckCircle2 size={14} className="mr-1" />
                        Active
                      </>
                    ) : (
                      <>
                        <XCircle size={14} className="mr-1" />
                        Inactive
                      </>
                    )}
                  </span>
                </div>
                {vendor.created_at && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Created At</label>
                    <p className="text-lg flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {new Date(vendor.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {location.country || location.state || location.city ? (
                  <>
                    {location.country && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Country</label>
                        <p className="text-lg flex items-center gap-2">
                          <MapPin size={16} className="text-gray-400" />
                          {location.country}
                        </p>
                      </div>
                    )}
                    {location.state && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">State</label>
                        <p className="text-lg">{location.state}</p>
                      </div>
                    )}
                    {location.city && (
                      <div>
                        <label className="text-sm font-medium text-gray-500">City</label>
                        <p className="text-lg">{location.city}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500">No location information available</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'organizations' && (
            <Card>
              <CardHeader>
                <CardTitle>Organizations ({(organizations || []).length})</CardTitle>
              </CardHeader>
              <CardContent>
                {!organizations || organizations.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No organizations signed up yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(organizations || []).map((org) => (
                    <Card key={org.organization_id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-lg">{org.organization_name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          org.is_active
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {org.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Email:</span>
                          <span className="ml-2">{org.organization_email}</span>
                        </div>
                        {org.organization_phone && (
                          <div>
                            <span className="text-gray-500">Phone:</span>
                            <span className="ml-2">{org.organization_phone}</span>
                          </div>
                        )}
                        {org.subscription && (
                          <div>
                            <span className="text-gray-500">Plan:</span>
                            <span className="ml-2 font-semibold">{org.subscription.plan_name}</span>
                          </div>
                        )}
                        <div className="pt-2 border-t">
                          <span className="text-gray-500">Commission Earned:</span>
                          <span className="ml-2 font-bold text-green-600">
                            ₹{org.commission_earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        {org.signup_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            <span>Signed up: {new Date(org.signup_date).toLocaleDateString()}</span>
                          </div>
                        )}
                        {org.statistics && (
                          <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                            <div className="text-center">
                              <div className="font-bold">{org.statistics?.total_tickets || 0}</div>
                              <div className="text-xs text-gray-500">Tickets</div>
                            </div>
                            <div className="text-center">
                              <div className="font-bold">{org.statistics?.total_devices || 0}</div>
                              <div className="text-xs text-gray-500">Devices</div>
                            </div>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => router.push(`/platform-admin/organization/${org.organization_id}`)}
                      >
                        View Organization Details
                      </Button>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Organizations</span>
                  <span className="font-bold text-lg">{statistics?.organizations_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Active Organizations</span>
                  <span className="font-bold text-lg text-green-600">{statistics?.active_organizations_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Recent Signups (30d)</span>
                  <span className="font-bold text-lg text-purple-600">{statistics?.recent_signups || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commission Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Commission</span>
                  <span className="font-bold text-lg text-green-600">
                    ₹{(statistics?.total_commission_earned || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Monthly Commission</span>
                  <span className="font-bold text-lg text-blue-600">
                    ₹{(statistics?.monthly_commission || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Commission Rate</span>
                  <span className="font-bold text-lg">
                    {(vendor.commission_rate * 100).toFixed(1)}%
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platform Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Ticket size={16} />
                    Total Tickets
                  </span>
                  <span className="font-bold text-lg">{statistics?.total_tickets || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 flex items-center gap-2">
                    <Package size={16} />
                    Total Devices
                  </span>
                  <span className="font-bold text-lg">{statistics?.total_devices || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

