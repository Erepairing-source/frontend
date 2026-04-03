import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import { Store, ArrowLeft, DollarSign, Eye, TrendingUp, Building2, Ticket, Package, MapPin } from 'lucide-react'
import { API_BASE } from '../../lib/api'

export default function VendorsPage() {
  const router = useRouter()
  const [vendors, setVendors] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const headers = { 'Authorization': `Bearer ${token}` }
    fetch(API_BASE + '/platform-admin/vendors', { headers })
      .then(res => res.json())
      .then(data => {
        setVendors(data)
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
          <p className="text-gray-600">Loading vendors...</p>
        </div>
      </div>
    )
  }

  const totalCommission = vendors.reduce((sum, v) => sum + (v.total_commission_earned || 0), 0)
  const activeVendors = vendors.filter(v => v.is_active).length

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
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Vendors</h1>
          <p className="text-gray-600">Manage vendors and track commissions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Vendors"
            value={vendors.length}
            icon={{ emoji: '🤝', bg: 'bg-purple-100', color: 'text-purple-600' }}
          />
          <StatCard
            title="Active Vendors"
            value={activeVendors}
            icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }}
          />
          <StatCard
            title="Total Commission"
            value={`₹${totalCommission.toLocaleString('en-IN')}`}
            icon={{ emoji: '💰', bg: 'bg-yellow-100', color: 'text-yellow-600' }}
          />
        </div>

        {/* Vendors Grid */}
        <Card className="p-6">
          {vendors.length === 0 ? (
            <div className="text-center py-12">
              <Store size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No vendors found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <Card key={vendor.id} hover className="p-6">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                      <Store size={32} className="text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{vendor.name}</h3>
                      <p className="text-sm text-gray-500">Code: {vendor.vendor_code}</p>
                      {vendor.location && (vendor.location.city || vendor.location.state || vendor.location.country) && (
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPin size={12} />
                          {[vendor.location.city, vendor.location.state, vendor.location.country].filter(Boolean).join(', ') || 'Location not set'}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Total Orgs:</span>
                        <span className="font-semibold ml-2">{vendor.organizations_count || 0}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Active:</span>
                        <span className="font-semibold ml-2 text-green-600">{vendor.active_organizations_count || 0}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-gray-500">Commission Rate:</span>
                      <span className="font-semibold">{(vendor.commission_rate * 100).toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <DollarSign size={14} />
                        Total Commission:
                      </span>
                      <span className="font-bold text-lg text-green-600">
                        ₹{vendor.total_commission_earned?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Monthly:</span>
                      <span className="font-semibold text-blue-600">
                        ₹{vendor.monthly_commission?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>

                    {(vendor.total_tickets > 0 || vendor.total_devices > 0) && (
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{vendor.total_tickets || 0}</div>
                          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                            <Ticket size={12} />
                            Tickets
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-gray-900">{vendor.total_devices || 0}</div>
                          <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                            <Package size={12} />
                            Devices
                          </div>
                        </div>
                      </div>
                    )}

                    {vendor.recent_signups > 0 && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <TrendingUp size={14} />
                          Recent Signups (30d):
                        </span>
                        <span className="font-semibold text-purple-600">{vendor.recent_signups}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      vendor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {vendor.is_active ? 'Active' : 'Inactive'}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/platform-admin/vendors/${vendor.id}`)}
                    >
                      <Eye size={14} className="mr-2" />
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

