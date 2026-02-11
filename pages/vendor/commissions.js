import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import { ArrowLeft, DollarSign, TrendingUp, Calendar, Building2 } from 'lucide-react'

export default function VendorCommissions() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [commissionData, setCommissionData] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadCommissions()
  }, [router])

  const loadCommissions = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/vendor/commissions', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setCommissionData(data)
      } else if (response.status === 401) {
        router.push('/login')
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading commissions:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading commissions...</p>
        </div>
      </div>
    )
  }

  if (!commissionData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load commission data</p>
          <Button onClick={loadCommissions}>Retry</Button>
        </div>
      </div>
    )
  }

  const { vendor, summary, monthly_breakdown, organization_commissions } = commissionData

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
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Commissions & Earnings</h1>
            <p className="text-gray-600">Track your commission earnings and history</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Commission Earned</p>
                <p className="text-3xl font-bold text-green-700">
                  ₹{summary.total_commission_earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-green-600" size={32} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Organizations</p>
                <p className="text-3xl font-bold text-blue-700">{summary.total_organizations}</p>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="text-blue-600" size={32} />
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average per Organization</p>
                <p className="text-3xl font-bold text-purple-700">
                  ₹{summary.average_commission_per_org.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-purple-600" size={32} />
              </div>
            </div>
          </Card>
        </div>

        {/* Vendor Info */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Vendor Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Vendor Code</p>
              <p className="text-lg font-semibold text-gray-900">{vendor.vendor_code}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Commission Rate</p>
              <p className="text-lg font-semibold text-gray-900">{(vendor.commission_rate * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vendor Name</p>
              <p className="text-lg font-semibold text-gray-900">{vendor.name}</p>
            </div>
          </div>
        </Card>

        {/* Monthly Breakdown */}
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Monthly Commission Breakdown (Last 12 Months)</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commission</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Organizations</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {monthly_breakdown.map((month, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{month.month}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-green-600">
                        ₹{month.commission.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{month.organizations}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Organization Commissions */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Commission by Organization</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Subscription Value</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commission Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Commission Earned</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Last Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Signup Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organization_commissions.map((org) => (
                  <tr key={org.organization_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{org.organization_name}</div>
                      <div className="text-sm text-gray-500">ID: {org.organization_id}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">
                        ₹{org.subscription_value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{(org.commission_rate * 100).toFixed(1)}%</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-green-600">
                        ₹{org.commission_earned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {org.last_payment_date ? new Date(org.last_payment_date).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {org.signup_date ? new Date(org.signup_date).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {organization_commissions.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              <Building2 size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No commission data available</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}



