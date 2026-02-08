import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import StatCard from '../../../components/StatCard'
import {
  Building2, MapPin, CreditCard, Users, BarChart3, Settings,
  Store, Calendar, DollarSign, Phone, Mail, Globe, ArrowLeft,
  TrendingUp, Ticket, Package, Shield, Edit, Save, X,
  CheckCircle2, XCircle, AlertCircle, Clock, Activity
} from 'lucide-react'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Switch } from '../../../components/ui/switch'
import { Textarea } from '../../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'

export default function OrganizationDetailPage() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [orgData, setOrgData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editing, setEditing] = useState(false)
  const [editData, setEditData] = useState({})

  useEffect(() => {
    if (!id) return

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadOrganizationDetails()
  }, [id])

  const loadOrganizationDetails = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/platform-admin/organizations/${id}/details`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        console.error('API Error:', errorData)
        throw new Error(errorData.detail || `HTTP ${response.status}: Failed to fetch organization details`)
      }

      const data = await response.json()
      console.log('Organization details loaded:', data)
      setOrgData(data)
      setEditData({
        name: data.organization.name,
        email: data.organization.email,
        phone: data.organization.phone,
        address: data.organization.address,
        is_active: data.organization.is_active
      })
      setLoading(false)
    } catch (error) {
      console.error('Error loading organization details:', error)
      alert(`Error: ${error.message}. Please check the console for details.`)
      setLoading(false)
    }
  }

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    try {
      // Here you would call an update endpoint
      // For now, just show success message
      alert('Organization updated successfully')
      setEditing(false)
      loadOrganizationDetails()
    } catch (error) {
      console.error('Error updating:', error)
      alert('Failed to update organization')
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
        <p className="text-gray-600">Organization not found</p>
      </div>
    )
  }

  const { organization, location, subscription, billing, users, statistics, vendor } = orgData

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Building2 },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'vendor', label: 'Vendor', icon: Store },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Building2 size={40} className="text-blue-600" />
                {organization.name}
              </h1>
              <p className="text-gray-600 text-lg">{organization.org_type.toUpperCase()}</p>
            </div>
            <div className="flex gap-3">
              {editing ? (
                <>
                  <Button variant="outline" onClick={() => { setEditing(false); setEditData({}) }}>
                    <X size={18} className="mr-2" />
                    Cancel
                  </Button>
                  <Button onClick={handleSave}>
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </Button>
                </>
              ) : (
                <Button variant="outline" onClick={() => setEditing(true)}>
                  <Edit size={18} className="mr-2" />
                  Edit Organization
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tickets"
            value={statistics?.total_tickets || 0}
            icon={Ticket}
            color="blue"
          />
          <StatCard
            title="Total Devices"
            value={statistics?.total_devices || 0}
            icon={Package}
            color="green"
          />
          <StatCard
            title="Total Users"
            value={statistics?.total_users || 0}
            icon={Users}
            color="purple"
          />
          <StatCard
            title="Active Engineers"
            value={users?.by_role?.support_engineer || 0}
            icon={Activity}
            color="orange"
          />
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white p-1 rounded-lg shadow-sm border border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground shadow-md'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Organization Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 size={20} />
                    Organization Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editing ? (
                    <>
                      <div>
                        <Label>Organization Name</Label>
                        <Input
                          value={editData.name}
                          onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Email</Label>
                        <Input
                          type="email"
                          value={editData.email}
                          onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Phone</Label>
                        <Input
                          value={editData.phone}
                          onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label>Address</Label>
                        <Textarea
                          value={editData.address}
                          onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={editData.is_active}
                          onCheckedChange={(checked) => setEditData({ ...editData, is_active: checked })}
                        />
                        <Label>Organization Active</Label>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start gap-3">
                        <Mail size={18} className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <p className="font-medium">{organization.email}</p>
                        </div>
                      </div>
                      {organization.phone && (
                        <div className="flex items-start gap-3">
                          <Phone size={18} className="text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Phone</p>
                            <p className="font-medium">{organization.phone}</p>
                          </div>
                        </div>
                      )}
                      {organization.address && (
                        <div className="flex items-start gap-3">
                          <MapPin size={18} className="text-gray-400 mt-1" />
                          <div>
                            <p className="text-sm text-gray-500">Address</p>
                            <p className="font-medium">{organization.address}</p>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center gap-2 pt-2 border-t">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          organization.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {organization.is_active ? 'Active' : 'Inactive'}
                        </span>
                        {organization.created_at && (
                          <span className="text-xs text-gray-500">
                            Created: {new Date(organization.created_at).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Location */}
              {location && (location.country || location.state || location.city) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin size={20} />
                      Location
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {location.country && (
                      <div className="flex items-start gap-3">
                        <Globe size={18} className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">Country</p>
                          <p className="font-medium">{location.country.name} ({location.country.code})</p>
                        </div>
                      </div>
                    )}
                    {location.state && (
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">State</p>
                          <p className="font-medium">{location.state.name}{location.state.code ? ` (${location.state.code})` : ''}</p>
                        </div>
                      </div>
                    )}
                    {location.city && (
                      <div className="flex items-start gap-3">
                        <MapPin size={18} className="text-gray-400 mt-1" />
                        <div>
                          <p className="text-sm text-gray-500">City</p>
                          <p className="font-medium">{location.city.name}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Subscription Summary */}
              {subscription ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard size={20} />
                      Subscription Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Plan</p>
                        <p className="font-medium text-lg">{subscription.plan_name || 'No Plan'}</p>
                        {subscription.plan_type && (
                          <p className="text-xs text-gray-400 capitalize">{subscription.plan_type}</p>
                        )}
                      </div>
                      {subscription.status && (
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                            subscription.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {subscription.status.toUpperCase()}
                          </span>
                        </div>
                      )}
                      {subscription.current_price !== null && subscription.current_price !== undefined && (
                        <div>
                          <p className="text-sm text-gray-500">Current Price</p>
                          <p className="font-medium text-lg text-green-600">
                            ₹ {subscription.current_price.toFixed(2)}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard size={20} />
                      Subscription Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">No subscription found</p>
                  </CardContent>
                </Card>
              )}

              {/* Users Summary */}
              {users && users.total > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users size={20} />
                      Users Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <p className="text-2xl font-bold text-primary">{users.total}</p>
                        <p className="text-sm text-gray-500">Total Users</p>
                      </div>
                      {Object.keys(users.by_role).length > 0 && (
                        <div className="space-y-2 pt-3 border-t">
                          {Object.entries(users.by_role).map(([role, userList]) => (
                            <div key={role} className="flex justify-between items-center">
                              <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                              <span className="font-semibold">{Array.isArray(userList) ? userList.length : 0}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Subscription Tab */}
          {activeTab === 'subscription' && subscription && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Subscription Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Plan Name</p>
                    <p className="font-medium text-lg">{subscription.plan_name || 'No Plan'}</p>
                    {subscription.plan_type && (
                      <p className="text-xs text-gray-400 capitalize">{subscription.plan_type}</p>
                    )}
                  </div>
                  {subscription.status && (
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                        subscription.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {subscription.status.toUpperCase()}
                      </span>
                    </div>
                  )}
                  {subscription.billing_period && (
                    <div>
                      <p className="text-sm text-gray-500">Billing Period</p>
                      <p className="font-medium capitalize">{subscription.billing_period}</p>
                    </div>
                  )}
                  {subscription.current_price !== null && subscription.current_price !== undefined && (
                    <div>
                      <p className="text-sm text-gray-500">Current Price</p>
                      <p className="font-medium text-lg text-green-600">
                        ₹ {subscription.current_price.toFixed(2)}
                      </p>
                    </div>
                  )}
                  {subscription.start_date && (
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{new Date(subscription.start_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {subscription.end_date && (
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{new Date(subscription.end_date).toLocaleDateString()}</p>
                    </div>
                  )}
                  {/* trial_end_date and auto_renew are not in the backend response */}
                </CardContent>
              </Card>

              {billing && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign size={20} />
                      Billing Details
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {subscription && subscription.current_price !== null && subscription.current_price !== undefined && (
                      <div>
                        <p className="text-sm text-gray-500">Current Price</p>
                        <p className="font-medium text-2xl text-green-600">
                          ₹ {subscription.current_price.toFixed(2)}
                        </p>
                      </div>
                    )}
                    {billing.payment_method && (
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">{billing.payment_method}</p>
                      </div>
                    )}
                    {billing.last_payment_date && (
                      <div>
                        <p className="text-sm text-gray-500">Last Payment</p>
                        <p className="font-medium">{new Date(billing.last_payment_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    {billing.next_billing_date && (
                      <div>
                        <p className="text-sm text-gray-500">Next Billing</p>
                        <p className="font-medium">{new Date(billing.next_billing_date).toLocaleDateString()}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Plan Features */}
              {/* Plan features are not included in subscription data - would need to fetch plan separately */}
            </div>
          )}

          {/* Users Tab */}
          {activeTab === 'users' && users && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users size={20} />
                      Users ({users.total})
                    </div>
                    <Button size="sm">
                      <Users size={16} className="mr-2" />
                      Add User
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {users.by_role && Object.keys(users.by_role).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Name</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Email</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Phone</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Role</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(users.by_role).flatMap(([role, userList]) =>
                            Array.isArray(userList) ? userList.map(user => (
                              <tr key={user.id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{user.full_name || 'N/A'}</td>
                                <td className="py-3 px-4">{user.email || 'N/A'}</td>
                                <td className="py-3 px-4">{user.phone || 'N/A'}</td>
                                <td className="py-3 px-4">
                                  <span className="px-2 py-1 rounded text-xs bg-blue-100 text-blue-700 capitalize">
                                    {role.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                  }`}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </td>
                                <td className="py-3 px-4">
                                  <Button variant="ghost" size="sm">
                                    <Edit size={14} />
                                  </Button>
                                </td>
                              </tr>
                            )) : []
                          )}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-8">No users found</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} />
                    Statistics Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <p className="text-3xl font-bold text-blue-600">{statistics?.total_tickets || 0}</p>
                      <p className="text-sm text-gray-600">Total Tickets</p>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-3xl font-bold text-green-600">{statistics?.total_devices || 0}</p>
                      <p className="text-sm text-gray-600">Total Devices</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-3xl font-bold text-purple-600">{statistics?.total_users || 0}</p>
                      <p className="text-sm text-gray-600">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    User Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {users?.by_role && Object.keys(users.by_role).length > 0 ? (
                    <div className="space-y-3">
                      {Object.entries(users.by_role).map(([role, userList]) => {
                        const count = Array.isArray(userList) ? userList.length : 0
                        const percentage = users.total > 0 ? ((count / users.total) * 100).toFixed(1) : 0
                        return (
                          <div key={role}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                              <span className="text-sm font-semibold">{count} ({percentage}%)</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No user data available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Vendor Tab */}
          {activeTab === 'vendor' && (
            <div>
              {vendor ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Store size={20} />
                      Vendor Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-500">Vendor Name</p>
                      <p className="font-medium text-lg">{vendor.vendor_name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Vendor Code</p>
                      <p className="font-medium">{vendor.vendor_code}</p>
                    </div>
                    {vendor.signup_date && (
                      <div>
                        <p className="text-sm text-gray-500">Signup Date</p>
                        <p className="font-medium">{new Date(vendor.signup_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-500">Commission Earned</p>
                      <p className="font-medium text-lg text-green-600">
                        {billing?.currency || 'INR'} {vendor.commission_earned.toFixed(2)}
                      </p>
                    </div>
                    {vendor.last_commission_date && (
                      <div>
                        <p className="text-sm text-gray-500">Last Commission Date</p>
                        <p className="font-medium">{new Date(vendor.last_commission_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        vendor.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {vendor.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Store size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-500">No vendor information available</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Feature Flags */}
              {organization.feature_flags && Object.keys(organization.feature_flags).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings size={20} />
                      Feature Flags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(organization.feature_flags).map(([key, value]) => (
                        <div key={key} className="flex justify-between items-center">
                          <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                          <Switch checked={value} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* SLA Configuration */}
              {organization.sla_config && Object.keys(organization.sla_config).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock size={20} />
                      SLA Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(organization.sla_config).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="font-medium">{JSON.stringify(value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Warranty Policy */}
              {organization.warranty_policy && Object.keys(organization.warranty_policy).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield size={20} />
                      Warranty Policy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {Object.entries(organization.warranty_policy).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                          <p className="font-medium">{JSON.stringify(value)}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

