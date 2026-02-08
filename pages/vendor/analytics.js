import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  ArrowLeft, BarChart3, TrendingUp, Building2,
  DollarSign, Package, Ticket, Activity, Download, Target
} from 'lucide-react'

export default function VendorAnalytics() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadAnalytics()
  }, [router])

  const loadAnalytics = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:8000/api/v1/vendor/analytics', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch analytics')
      }

      const data = await response.json()
      setAnalytics(data)
      setLoading(false)
    } catch (error) {
      console.error('Error loading analytics:', error)
      setLoading(false)
    }
  }

  const exportData = () => {
    if (!analytics) return
    const dataStr = JSON.stringify(analytics, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `vendor-analytics-${new Date().toISOString().split('T')[0]}.json`
    link.click()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">Failed to load analytics</p>
      </div>
    )
  }

  const { vendor, overview, trends, top_organizations } = analytics

  // Prepare chart data
  const monthlySignupData = trends.monthly_signups.map(m => ({
    month: m.month,
    signups: m.count
  }))

  const monthlyCommissionData = trends.monthly_commissions.map(m => ({
    month: m.month,
    commission: m.commission
  }))

  // Calculate metrics
  const avgCommissionPerOrg = overview.total_organizations > 0
    ? overview.total_commission_earned / overview.total_organizations
    : 0

  const conversionRate = overview.recent_signups_30d > 0
    ? (overview.active_organizations / overview.total_organizations * 100)
    : 0

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Analytics & Performance</h1>
              <p className="text-gray-600">View your performance metrics and insights</p>
            </div>
            <Button onClick={exportData} variant="outline">
              <Download size={16} className="mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Organizations"
            value={overview.total_organizations}
            icon={{ emoji: '🏢', bg: 'bg-blue-100', color: 'text-blue-600' }}
          />
          <StatCard
            title="Active Organizations"
            value={overview.active_organizations}
            icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }}
          />
          <StatCard
            title="Total Commission"
            value={`₹${overview.total_commission_earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={{ emoji: '💰', bg: 'bg-yellow-100', color: 'text-yellow-600' }}
          />
          <StatCard
            title="Monthly Commission"
            value={`₹${overview.monthly_commission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={{ emoji: '📈', bg: 'bg-purple-100', color: 'text-purple-600' }}
          />
        </div>

        {/* Advanced Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Recent Signups (30d)</p>
                <p className="text-2xl font-bold text-gray-900">{overview.recent_signups_30d}</p>
              </div>
              <TrendingUp className="text-green-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Commission/Org</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{avgCommissionPerOrg.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <Target className="text-blue-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total_tickets}</p>
              </div>
              <Ticket className="text-purple-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Devices</p>
                <p className="text-2xl font-bold text-gray-900">{overview.total_devices}</p>
              </div>
              <Package className="text-orange-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Signups Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlySignupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="signups" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Commissions Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyCommissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
                <Line type="monotone" dataKey="commission" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Combined Chart */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Signups vs Commissions (12 Months)</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={monthlySignupData.map((signup, idx) => ({
              month: signup.month,
              signups: signup.signups,
              commission: monthlyCommissionData[idx]?.commission || 0
            }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="signups" fill="#10b981" name="Signups" />
              <Bar yAxisId="right" dataKey="commission" fill="#f59e0b" name="Commission (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top Organizations */}
        {top_organizations && top_organizations.length > 0 && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Organizations by Commission</h2>
            <div className="space-y-3">
              {top_organizations.map((org, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{org.organization_name}</p>
                      {org.signup_date && (
                        <p className="text-sm text-gray-600">
                          Signed up: {new Date(org.signup_date).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">
                      ₹{org.commission_earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Commission Rate Info */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Your Commission Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {(vendor.commission_rate * 100).toFixed(1)}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600 mb-1">Vendor Code</p>
              <p className="text-xl font-semibold text-gray-900">{vendor.vendor_code}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
