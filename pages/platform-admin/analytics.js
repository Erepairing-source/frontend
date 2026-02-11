import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import {
  ArrowLeft, BarChart3, TrendingUp, Building2, Users,
  Ticket, Package, Store, DollarSign, CreditCard, Activity,
  Download, Calendar, TrendingDown, Target
} from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState(null)
  const [period, setPeriod] = useState('30d')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadAnalytics()
  }, [router, period])

  const loadAnalytics = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/platform-admin/analytics?period=${period}`, {
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
    link.download = `analytics-${new Date().toISOString().split('T')[0]}.json`
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

  const { overview, revenue, growth, tickets, distributions, top_vendors, advanced_metrics, daily_trends, revenue_by_plan } = analytics

  // Prepare chart data
  const monthlySignupData = growth.monthly_signups.map(m => ({
    month: m.month,
    signups: m.count
  }))

  const dailySignupData = daily_trends?.signups?.slice(-30) || []
  const dailyRevenueData = daily_trends?.revenue?.slice(-30) || []
  const dailyTicketData = daily_trends?.tickets?.slice(-30) || []

  const orgTypeData = Object.entries(distributions.organization_types).map(([name, value]) => ({
    name: name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value
  }))

  const subscriptionStatusData = Object.entries(distributions.subscription_statuses).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value
  }))

  const revenueByPlanData = revenue_by_plan?.map(plan => ({
    name: plan.plan_name,
    revenue: plan.revenue,
    subscriptions: plan.subscriptions
  })) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/platform-admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Platform Analytics</h1>
              <p className="text-gray-600">Comprehensive platform-wide insights and metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportData} variant="outline">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
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
            title="Total Users"
            value={overview.total_users}
            icon={{ emoji: '👥', bg: 'bg-purple-100', color: 'text-purple-600' }}
          />
          <StatCard
            title="Total Tickets"
            value={overview.total_tickets}
            icon={{ emoji: '🎫', bg: 'bg-orange-100', color: 'text-orange-600' }}
          />
        </div>

        {/* Advanced Metrics */}
        {advanced_metrics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">MRR</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{advanced_metrics.mrr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Monthly Recurring Revenue</p>
                </div>
                <TrendingUp className="text-blue-600" size={32} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">ARR</p>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹{advanced_metrics.arr.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Annual Recurring Revenue</p>
                </div>
                <Target className="text-green-600" size={32} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Churn Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {advanced_metrics.churn_rate.toFixed(2)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Last 30 days</p>
                </div>
                <TrendingDown className={advanced_metrics.churn_rate > 5 ? "text-red-600" : "text-yellow-600"} size={32} />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Resolution Rate</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {advanced_metrics.resolution_rate.toFixed(1)}%
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Ticket resolution</p>
                </div>
                <Activity className="text-purple-600" size={32} />
              </div>
            </Card>
          </div>
        )}

        {/* Revenue Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{revenue.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <DollarSign className="text-green-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Monthly Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{revenue.monthly_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Commissions</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{revenue.total_commissions_paid.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <Store className="text-purple-600" size={32} />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Avg Revenue/Org</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{advanced_metrics?.avg_revenue_per_org?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <CreditCard className="text-orange-600" size={32} />
            </div>
          </Card>
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Signups Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailySignupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Revenue Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Organization Signups</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlySignupData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="signups" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Daily Ticket Activity</h2>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dailyTicketData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Area type="monotone" dataKey="created" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                <Area type="monotone" dataKey="resolved" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Charts Row 3 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Organization Types</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={orgTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orgTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Subscription Status</h2>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={subscriptionStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {subscriptionStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Plan</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={revenueByPlanData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                <Bar dataKey="revenue" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Ticket Statistics */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ticket Statistics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total</p>
              <p className="text-2xl font-bold text-gray-900">{tickets.total}</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Open</p>
              <p className="text-2xl font-bold text-gray-900">{tickets.open}</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{tickets.resolved}</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Closed</p>
              <p className="text-2xl font-bold text-gray-900">{tickets.closed}</p>
            </div>
          </div>
        </Card>

        {/* Top Vendors */}
        {top_vendors && top_vendors.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Top Vendors by Commission</h2>
            <div className="space-y-3">
              {top_vendors.map((vendor, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold">
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{vendor.name}</p>
                      <p className="text-sm text-gray-600">Code: {vendor.vendor_code} • {vendor.organizations_count} orgs</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">
                      ₹{vendor.total_commission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
