import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import StatCard from '../../components/StatCard'
import {
  Building2, CreditCard, Store, BarChart3, Settings,
  Users, TrendingUp, Shield, ArrowRight
} from 'lucide-react'

export default function PlatformAdminDashboard({ user }) {
  const router = useRouter()
  const [stats, setStats] = useState({
    organizations: 0,
    plans: 0,
    vendors: 0,
    activeSubscriptions: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const headers = { 'Authorization': `Bearer ${token}` }

    Promise.all([
      fetch('http://localhost:8000/api/v1/platform-admin/organizations', { headers }),
      fetch('http://localhost:8000/api/v1/platform-admin/plans', { headers }),
      fetch('http://localhost:8000/api/v1/platform-admin/vendors', { headers }),
    ])
      .then(responses => Promise.all(responses.map(r => r.json())))
      .then(([orgs, plansData, vendorsData]) => {
        setStats({
          organizations: orgs.length,
          plans: plansData.length,
          vendors: vendorsData.length,
          activeSubscriptions: orgs.filter(o => o.subscription?.status === 'active').length
        })
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [router])

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

  const dashboardCards = [
    {
      id: 'organizations',
      title: 'Organizations',
      description: 'Manage all organizations, view details, and track subscriptions',
      icon: Building2,
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      count: stats.organizations,
      route: '/platform-admin/organizations'
    },
    {
      id: 'plans',
      title: 'Subscription Plans',
      description: 'Create, edit, and manage subscription plans',
      icon: CreditCard,
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      count: stats.plans,
      route: '/platform-admin/plans'
    },
    {
      id: 'vendors',
      title: 'Vendors',
      description: 'Manage vendors and track commissions',
      icon: Store,
      color: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      count: stats.vendors,
      route: '/platform-admin/vendors'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'View platform-wide analytics and insights',
      icon: BarChart3,
      color: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      count: null,
      route: '/platform-admin/analytics'
    },
    {
      id: 'users',
      title: 'Users Management',
      description: 'Manage platform users and permissions',
      icon: Users,
      color: 'from-cyan-500 to-blue-600',
      bgColor: 'bg-cyan-50',
      iconColor: 'text-cyan-600',
      count: null,
      route: '/platform-admin/users'
    },
    {
      id: 'knowledge_base',
      title: 'Knowledge Base',
      description: 'Manage AI documents and policies',
      icon: BarChart3,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
      count: null,
      route: '/platform-admin/knowledge-base'
    },
    {
      id: 'settings',
      title: 'Platform Settings',
      description: 'Configure platform settings and preferences',
      icon: Settings,
      color: 'from-gray-500 to-slate-600',
      bgColor: 'bg-gray-50',
      iconColor: 'text-gray-600',
      count: null,
      route: '/platform-admin/settings'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Platform Admin Dashboard</h1>
          <p className="text-gray-600">Manage your platform, organizations, and subscriptions</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Organizations"
            value={stats.organizations}
            icon={{ emoji: '🏢', bg: 'bg-blue-100', color: 'text-blue-600' }}
          />
          <StatCard
            title="Active Plans"
            value={stats.plans}
            icon={{ emoji: '📋', bg: 'bg-indigo-100', color: 'text-indigo-600' }}
          />
          <StatCard
            title="Vendors"
            value={stats.vendors}
            icon={{ emoji: '🤝', bg: 'bg-purple-100', color: 'text-purple-600' }}
          />
          <StatCard
            title="Active Subscriptions"
            value={stats.activeSubscriptions}
            icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }}
          />
        </div>


        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardCards.map((card) => {
            const Icon = card.icon
            return (
              <Card
                key={card.id}
                className="p-6 hover:shadow-lg transition-all duration-200 cursor-pointer border-2 hover:border-blue-300 group"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push(card.route)
                }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-16 h-16 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={32} className="text-white" />
                  </div>
                  {card.count !== null && (
                    <div className="text-right">
                      <div className="text-3xl font-bold text-gray-900">{card.count}</div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">{card.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{card.description}</p>

                <div className="flex items-center text-blue-600 font-semibold group-hover:translate-x-2 transition-transform">
                  <span className="text-sm">View Details</span>
                  <ArrowRight size={16} className="ml-2" />
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
