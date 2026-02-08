import { X, Building2, MapPin, CreditCard, Users, BarChart3, Store, Settings, Calendar, DollarSign, Phone, Mail, Globe } from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

export default function OrganizationDetailsModal({ organizationData, isOpen, onClose }) {
  if (!isOpen || !organizationData) return null

  const { organization, location, subscription, billing, users, statistics, vendor } = organizationData

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Building2 size={28} />
              {organization.name}
            </h2>
            <p className="text-blue-100 mt-1">{organization.org_type.toUpperCase()}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-white/20"
          >
            <X size={24} />
          </Button>
        </div>

        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Organization Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 size={20} />
                  Organization Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
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
                </div>
                {organization.created_at && (
                  <div className="flex items-start gap-3">
                    <Calendar size={18} className="text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="font-medium">{new Date(organization.created_at).toLocaleString()}</p>
                    </div>
                  </div>
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

            {/* Subscription & Billing */}
            {subscription ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard size={20} />
                      Subscription
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Plan</p>
                      <p className="font-medium text-lg">{subscription.plan.name}</p>
                      <p className="text-xs text-gray-400">{subscription.plan.plan_type}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                        subscription.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {subscription.status.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Billing Period</p>
                      <p className="font-medium capitalize">{subscription.billing_period}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Max Engineers</p>
                      <p className="font-medium">{subscription.plan.max_engineers || 'Unlimited'}</p>
                    </div>
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
                    {subscription.trial_end_date && (
                      <div>
                        <p className="text-sm text-gray-500">Trial End Date</p>
                        <p className="font-medium">{new Date(subscription.trial_end_date).toLocaleDateString()}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <p className="text-sm text-gray-500">Auto Renew:</p>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        subscription.auto_renew ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {subscription.auto_renew ? 'Yes' : 'No'}
                      </span>
                    </div>
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
                    <CardContent className="space-y-3">
                      <div>
                        <p className="text-sm text-gray-500">Current Price</p>
                        <p className="font-medium text-lg text-green-600">
                          {billing.currency} {billing.current_price.toFixed(2)}
                        </p>
                      </div>
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
              </>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-500">No active subscription</p>
                </CardContent>
              </Card>
            )}

            {/* Users */}
            {users && users.total > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Users ({users.total})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(users.by_role).length > 0 && (
                    <div>
                      <p className="text-sm text-gray-500 mb-2">By Role:</p>
                      <div className="space-y-1">
                        {Object.entries(users.by_role).map(([role, count]) => (
                          <div key={role} className="flex justify-between items-center">
                            <span className="text-sm capitalize">{role.replace('_', ' ')}</span>
                            <span className="font-semibold">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {users.list && users.list.filter(u => u.role === 'organization_admin').length > 0 && (
                    <div className="pt-3 border-t">
                      <p className="text-sm text-gray-500 mb-2">Admin Users:</p>
                      <div className="space-y-2">
                        {users.list.filter(u => u.role === 'organization_admin').map(admin => (
                          <div key={admin.id} className="flex justify-between items-start">
                            <div>
                              <p className="font-medium text-sm">{admin.full_name}</p>
                              <p className="text-xs text-gray-500">{admin.email}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-xs ${
                              admin.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                            }`}>
                              {admin.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Statistics */}
            {statistics && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} />
                    Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{statistics.total_tickets}</p>
                      <p className="text-xs text-gray-600">Total Tickets</p>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{statistics.total_devices}</p>
                      <p className="text-xs text-gray-600">Total Devices</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg col-span-2">
                      <p className="text-2xl font-bold text-purple-600">{statistics.total_users}</p>
                      <p className="text-xs text-gray-600">Total Users</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vendor */}
            {vendor && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store size={20} />
                    Vendor Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Vendor Name</p>
                    <p className="font-medium">{vendor.vendor_name}</p>
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
                      <p className="text-sm text-gray-500">Last Commission</p>
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
            )}

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
                  <div className="space-y-2">
                    {Object.entries(organization.feature_flags).map(([key, value]) => (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          value ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {value ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}



