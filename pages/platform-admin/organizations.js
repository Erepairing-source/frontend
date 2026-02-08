import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Mail, Calendar, Search, Building2, Eye, ArrowLeft } from 'lucide-react'

export default function OrganizationsPage() {
  const router = useRouter()
  const [organizations, setOrganizations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const headers = { 'Authorization': `Bearer ${token}` }
    fetch('http://localhost:8000/api/v1/platform-admin/organizations', { headers })
      .then(res => res.json())
      .then(data => {
        setOrganizations(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [router])

  const filteredOrganizations = organizations.filter(org => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      org.name?.toLowerCase().includes(search) ||
      org.email?.toLowerCase().includes(search) ||
      org.org_type?.toLowerCase().includes(search) ||
      org.subscription?.plan_name?.toLowerCase().includes(search) ||
      org.subscription?.status?.toLowerCase().includes(search)
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
            onClick={() => router.push('/platform-admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All Organizations</h1>
          <p className="text-gray-600">Manage and view all organizations</p>
        </div>

        {/* Search Bar */}
        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search organizations by name, email, type, or plan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Organizations Grid */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Organizations ({filteredOrganizations.length})
            </h2>
          </div>

          {filteredOrganizations.length === 0 ? (
            <div className="text-center py-12">
              <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">
                {searchTerm ? 'No organizations found matching your search' : 'No organizations found'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredOrganizations.map((org) => (
                <Card
                  key={org.id}
                  hover
                  className="p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        {org.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">{org.name}</h3>
                        <p className="text-sm text-gray-500 capitalize">{org.org_type.replace('_', ' ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {org.is_active ? (
                        <>
                          {org.subscription?.status === 'active' && (
                            <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">Active</span>
                          )}
                          {org.subscription?.status === 'trial' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded">Trial</span>
                          )}
                          {org.subscription?.status === 'expired' && (
                            <span className="px-2 py-1 bg-orange-100 text-orange-600 text-xs rounded">Expired</span>
                          )}
                          {(!org.subscription || org.subscription?.status === 'inactive') && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-600 text-xs rounded">No Subscription</span>
                          )}
                        </>
                      ) : (
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Inactive</span>
                      )}
                    </div>
                  </div>

                  {org.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <Mail size={14} className="text-gray-400" />
                      <span className="truncate">{org.email}</span>
                    </div>
                  )}

                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Plan:</span>
                      <span className={`text-sm font-semibold ${
                        org.subscription?.plan_name ? 'text-gray-900' : 'text-gray-400'
                      }`}>
                        {org.subscription?.plan_name || 'No Plan'}
                      </span>
                    </div>
                    {org.subscription?.end_date && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar size={12} />
                        <span>Expires: {new Date(org.subscription.end_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  <Button
                    variant="default"
                    size="default"
                    className="w-full"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      console.log('Navigating to organization:', org.id)
                      router.push(`/platform-admin/organization/${org.id}`)
                    }}
                  >
                    <Eye size={16} className="mr-2" />
                    View Details
                  </Button>
                </Card>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

