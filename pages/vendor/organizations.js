import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { ArrowLeft, Building2, Eye, Search, DollarSign, Calendar, CheckCircle, XCircle } from 'lucide-react'

export default function VendorOrganizations() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [organizations, setOrganizations] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadOrganizations()
  }, [router])

  const loadOrganizations = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:8000/api/v1/vendor/organizations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setOrganizations(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading organizations:', error)
      setLoading(false)
    }
  }

  const filteredOrganizations = organizations.filter(org => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      org.organization_name?.toLowerCase().includes(search) ||
      org.organization_email?.toLowerCase().includes(search) ||
      org.organization_type?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organizations...</p>
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
            onClick={() => router.push('/vendor/dashboard')}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">My Organizations</h1>
              <p className="text-gray-600">View all organizations you&apos;ve signed up</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search organizations by name, email, or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Organizations Grid */}
        {filteredOrganizations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrganizations.map((org) => (
              <Card key={org.organization_id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                    <Building2 className="text-white" size={24} />
                  </div>
                  <div className="flex items-center gap-2">
                    {org.is_active && org.org_is_active ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-gray-400" size={20} />
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{org.organization_name}</h3>
                <p className="text-sm text-gray-600 mb-4">{org.organization_email}</p>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Type:</span>
                    <span className="font-semibold capitalize">{org.organization_type || 'N/A'}</span>
                  </div>

                  {org.subscription && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Plan:</span>
                        <span className="font-semibold">{org.subscription.plan_name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          org.subscription.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {org.subscription.status || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Subscription Value:</span>
                        <span className="font-semibold">
                          ₹{org.subscription.current_price?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </span>
                      </div>
                    </>
                  )}

                  <div className="border-t pt-3">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600 flex items-center gap-1">
                        <DollarSign size={14} />
                        Commission Earned:
                      </span>
                      <span className="font-bold text-green-600">
                        ₹{org.commission.earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Rate: {(org.commission.rate * 100).toFixed(1)}%</span>
                      {org.commission.last_payment && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(org.commission.last_payment).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Signed up:
                    </span>
                    <span>{new Date(org.signup_date).toLocaleDateString()}</span>
                  </div>

                  {org.statistics && (
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{org.statistics.total_tickets}</div>
                        <div className="text-xs text-gray-500">Tickets</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">{org.statistics.total_devices}</div>
                        <div className="text-xs text-gray-500">Devices</div>
                      </div>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  onClick={() => router.push(`/vendor/organizations/${org.organization_id}`)}
                >
                  <Eye size={16} className="mr-2" />
                  View Details
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-12 text-center">
            <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-2">
              {searchTerm ? 'No organizations found matching your search' : 'No organizations signed up yet'}
            </p>
            {!searchTerm && (
              <p className="text-sm text-gray-500">Start signing up organizations to earn commissions!</p>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}



