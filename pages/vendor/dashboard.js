import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import StatCard from '../../components/StatCard'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { 
  Building2, TrendingUp, DollarSign, Users, Ticket, Package,
  ArrowRight, Eye, Calendar, CreditCard, BarChart3, Settings, Link, Copy
} from 'lucide-react'

export default function VendorDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadDashboardData()
  }, [router])

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/vendor/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        setLoading(false)
      } else if (response.status === 401) {
        router.push('/login')
        setLoading(false)
      } else {
        // Handle other error statuses
        let errorMessage = 'Failed to load dashboard data'
        try {
          const errorData = await response.json()
          errorMessage = errorData.detail || errorMessage
        } catch (e) {
          errorMessage = `Server error (${response.status})`
        }
        console.error('Dashboard API error:', errorMessage)
        setLoading(false)
        // Keep dashboardData as null to show error state
      }
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
      // Keep dashboardData as null to show error state
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load dashboard data</p>
          <Button onClick={loadDashboardData}>Retry</Button>
        </div>
      </div>
    )
  }

  const { vendor, statistics, organizations } = dashboardData

  const signupLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?vendor_code=${vendor.vendor_code}`

  const copySignupLink = () => {
    navigator.clipboard.writeText(signupLink)
    alert('Signup link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vendor Dashboard</h1>
          <p className="text-gray-600 mb-4">
            Welcome back, <span className="font-semibold">{vendor.name}</span> ({vendor.vendor_code})
          </p>
          
          {/* Signup Link Card */}
          <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                  <Link size={20} />
                  Your Signup Link
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  Share this link with organizations to sign them up. They'll be automatically linked to your vendor account and you'll earn commission.
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    value={signupLink}
                    readOnly
                    className="bg-white font-mono text-sm flex-1"
                  />
                  <Button onClick={copySignupLink} variant="outline">
                    <Copy size={16} className="mr-2" />
                    Copy Link
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Organizations"
            value={statistics.total_organizations}
            icon={{ emoji: '🏢', bg: 'bg-blue-100', color: 'text-blue-600' }}
          />
          <StatCard
            title="Active Organizations"
            value={statistics.active_organizations}
            icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }}
          />
          <StatCard
            title="Total Commission"
            value={`₹${statistics.total_commission_earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={{ emoji: '💰', bg: 'bg-yellow-100', color: 'text-yellow-600' }}
          />
          <StatCard
            title="Monthly Commission"
            value={`₹${statistics.monthly_commission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={{ emoji: '📈', bg: 'bg-purple-100', color: 'text-purple-600' }}
          />
        </div>


        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_tickets}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Ticket className="text-blue-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.total_devices}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent Signups (30 days)</p>
                <p className="text-2xl font-bold text-gray-900">{statistics.recent_signups}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={24} />
              </div>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300"
            onClick={() => router.push('/vendor/organizations')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Building2 size={32} className="text-white" />
              </div>
              <ArrowRight className="text-blue-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">My Organizations</h3>
            <p className="text-sm text-gray-600 mb-4">View all organizations you've signed up</p>
            <div className="text-2xl font-bold text-blue-600">{statistics.total_organizations}</div>
          </Card>

          <Card 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-green-300"
            onClick={() => router.push('/vendor/commissions')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign size={32} className="text-white" />
              </div>
              <ArrowRight className="text-green-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Commissions</h3>
            <p className="text-sm text-gray-600 mb-4">Track your earnings and commission history</p>
            <div className="text-2xl font-bold text-green-600">
              ₹{statistics.total_commission_earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </Card>

          <Card 
            className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-purple-300"
            onClick={() => router.push('/vendor/analytics')}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 size={32} className="text-white" />
              </div>
              <ArrowRight className="text-purple-600" size={20} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600 mb-4">View performance metrics and insights</p>
          </Card>
        </div>

        {/* Recent Organizations */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Organizations</h2>
            <Button 
              variant="outline"
              onClick={() => router.push('/vendor/organizations')}
            >
              View All
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </div>

          {organizations && organizations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Organization</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subscription</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Signup Date</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {organizations.map((org) => (
                    <tr key={org.organization_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{org.organization_name}</div>
                        <div className="text-sm text-gray-500">{org.organization_email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                          {org.organization_type || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{org.subscription_plan || 'N/A'}</div>
                        <div className="text-xs text-gray-500">
                          <span className={`px-2 py-1 rounded ${
                            org.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {org.subscription_status || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-green-600">
                          ₹{org.commission_earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">Rate: {(org.commission_rate * 100).toFixed(1)}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {org.signup_date ? new Date(org.signup_date).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => router.push(`/vendor/organizations/${org.organization_id}`)}
                        >
                          <Eye size={14} className="mr-2" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No organizations signed up yet</p>
              <p className="text-sm mt-2">Start signing up organizations to earn commissions!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
