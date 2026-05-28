import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import DashboardHeader from '../../components/DashboardHeader'
import { 
  Ticket, Package, Shield, Clock, MapPin, MessageSquare, 
  Camera, QrCode, FileText, CheckCircle2, AlertCircle, 
  TrendingUp, Bell, Settings, Search, Filter, Plus,
  Eye, Edit, Calendar, Phone, Mail, Send, Star, Users, Timer
} from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'
import { getApiBase } from '@lib/api'

export default function CustomerDashboardEnhanced() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    inProgress: 0,
    resolved: 0,
    totalDevices: 0,
    devicesInWarranty: 0
  })
  const [tickets, setTickets] = useState([])
  const [devices, setDevices] = useState([])
  const [notifications, setNotifications] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [slaPolicies, setSlaPolicies] = useState([])
  const [servicePolicies, setServicePolicies] = useState([])

  useEffect(() => {
    loadDashboardData()
    // Set up real-time updates (would use WebSocket/SSE in production)
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const tab = router.query.tab
    if (tab === 'notifications' || tab === 'tickets' || tab === 'devices' || tab === 'overview' || tab === 'sla') {
      setActiveTab(tab)
    }
  }, [router.query.tab])

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Load tickets
      const ticketsRes = await fetch(getApiBase() + '/tickets/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json()
        setTickets(ticketsData)
        setStats(prev => ({
          ...prev,
          totalTickets: ticketsData.length,
          openTickets: ticketsData.filter(t => ['created', 'assigned', 'in_progress'].includes(t.status)).length,
          inProgress: ticketsData.filter(t => t.status === 'in_progress').length,
          resolved: ticketsData.filter(t => t.status === 'resolved').length
        }))
      }

      // Load devices
      const devicesRes = await fetch(getApiBase() + '/devices/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (devicesRes.ok) {
        const devicesData = await devicesRes.json()
        setDevices(devicesData)
        setStats(prev => ({
          ...prev,
          totalDevices: devicesData.length,
          devicesInWarranty: devicesData.filter(d => d.warranty_status === 'in_warranty').length
        }))
      }

      // Load notifications
      const notifRes = await fetch(getApiBase() + '/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (notifRes.ok) {
        const notifData = await notifRes.json()
        setNotifications(notifData.filter(n => !n.read_at).slice(0, 5))
      }

      const slaRes = await fetch(getApiBase() + '/organizations/me/sla-policies', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (slaRes.ok) {
        const slaData = await slaRes.json()
        setSlaPolicies(Array.isArray(slaData) ? slaData : [])
      } else {
        setSlaPolicies([])
      }

      const svcRes = await fetch(getApiBase() + '/organizations/me/service-policies', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (svcRes.ok) {
        const svcData = await svcRes.json()
        setServicePolicies(Array.isArray(svcData) ? svcData : [])
      } else {
        setServicePolicies([])
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  const slaTypeLabel = (slug) => {
    if (!slug) return 'SLA'
    const map = {
      first_response: 'First response',
      assignment: 'Engineer assignment',
      resolution: 'Resolution',
      on_site: 'On-site visit'
    }
    return map[slug] || String(slug).replace(/_/g, ' ')
  }

  const servicePolicyTypeLabel = (t) => {
    if (!t) return 'Policy'
    const map = {
      warranty: 'Warranty',
      chargeable: 'Chargeable service',
      parts: 'Parts',
      pricing: 'Pricing',
      replacement: 'Replacement',
      other: 'Other'
    }
    return map[String(t).toLowerCase()] || String(t).replace(/_/g, ' ')
  }

  const formatServiceRulesForCustomer = (rules) => {
    if (!rules || typeof rules !== 'object') return null
    try {
      return JSON.stringify(rules, null, 2)
    } catch {
      return String(rules)
    }
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = !searchTerm || 
      ticket.ticket_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.issue_description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus
    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DashboardHeader
          title="My Service Dashboard"
          subtitle="Manage your devices, tickets, and service requests"
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => router.push('/customer/create-ticket')}
          >
            <Plus size={20} className="mr-2" />
            Create Ticket
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => router.push('/customer/register-device')}
          >
            <QrCode size={20} className="mr-2" />
            Register Device
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => setActiveTab('devices')}
          >
            <Package size={20} className="mr-2" />
            My Devices
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={20} className="mr-2" />
            Notifications
            {notifications.length > 0 && (
              <Badge className="ml-2 bg-red-500">{notifications.length}</Badge>
            )}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            title="Total Tickets"
            value={stats.totalTickets}
            icon={<Ticket size={24} className="text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Open Tickets"
            value={stats.openTickets}
            icon={<Clock size={24} className="text-yellow-600" />}
            bgColor="bg-yellow-50"
          />
          <StatCard
            title="In Progress"
            value={stats.inProgress}
            icon={<TrendingUp size={24} className="text-indigo-600" />}
            bgColor="bg-indigo-50"
          />
          <StatCard
            title="Resolved"
            value={stats.resolved}
            icon={<CheckCircle2 size={24} className="text-green-600" />}
            bgColor="bg-green-50"
          />
          <StatCard
            title="My Devices"
            value={stats.totalDevices}
            icon={<Package size={24} className="text-purple-600" />}
            bgColor="bg-purple-50"
          />
          <StatCard
            title="In Warranty"
            value={stats.devicesInWarranty}
            icon={<Shield size={24} className="text-teal-600" />}
            bgColor="bg-teal-50"
          />
        </div>


        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'overview', label: 'Overview', icon: Eye },
              { id: 'tickets', label: 'My Tickets', icon: Ticket },
              { id: 'devices', label: 'My Devices', icon: Package },
              { id: 'sla', label: 'SLA & policies', icon: Timer },
              { id: 'notifications', label: 'Notifications', icon: Bell }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Tickets */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Recent Tickets</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setActiveTab('tickets')}>
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {tickets.slice(0, 5).length === 0 ? (
                  <div className="text-center py-8">
                    <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No tickets yet</p>
                    <Button onClick={() => router.push('/customer/create-ticket')}>
                      Create Your First Ticket
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tickets.slice(0, 5).map(ticket => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-semibold">{ticket.ticket_number}</span>
                            <Badge variant={
                              ticket.status === 'resolved' ? 'success' :
                              ticket.status === 'in_progress' ? 'default' :
                              'secondary'
                            }>
                              {ticket.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{ticket.issue_category || 'General Issue'}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(ticket.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => router.push(`/customer/ticket/${ticket.id}`)}
                        >
                          View <Eye size={14} className="ml-1" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* SLA commitments (org-level) */}
            {slaPolicies.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Timer size={22} className="text-blue-600" />
                      Service time commitments
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('sla')}>
                      View all
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Target response times set by your service provider for support requests.
                  </p>
                  <ul className="space-y-2">
                    {slaPolicies.slice(0, 4).map((row, idx) => (
                      <li key={idx} className="flex flex-wrap items-baseline justify-between gap-2 text-sm border-b border-gray-100 pb-2 last:border-0">
                        <span className="font-medium text-gray-900">{slaTypeLabel(row.sla_type)}</span>
                        <span className="text-gray-700">
                          {row.target_hours}h target
                          {row.business_hours_only ? ' · Business hours' : ''}
                          {row.product_category ? ` · ${row.product_category}` : ''}
                        </span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Service policies (org-level) */}
            {servicePolicies.length > 0 && (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Shield size={22} className="text-teal-600" />
                      Service policies
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setActiveTab('sla')}>
                      View all
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    Warranty, pricing, and other service rules published by your organization.
                  </p>
                  <ul className="space-y-2">
                    {servicePolicies.slice(0, 4).map((row, idx) => (
                      <li key={idx} className="text-sm border-b border-gray-100 pb-2 last:border-0">
                        <span className="font-medium text-gray-900">{servicePolicyTypeLabel(row.policy_type)}</span>
                        {row.product_category && (
                          <Badge variant="outline" className="ml-2 text-xs">{row.product_category}</Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* My Devices */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Devices</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => router.push('/customer/register-device')}>
                    <Plus size={14} className="mr-1" />
                    Register Device
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {devices.length === 0 ? (
                  <div className="text-center py-8">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No devices registered</p>
                    <Button onClick={() => router.push('/customer/register-device')}>
                      Register Your First Device
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {devices.slice(0, 4).map(device => (
                      <div key={device.id} className="p-4 border rounded-lg hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-semibold">{device.brand} {device.model_number}</h3>
                            <p className="text-sm text-gray-600">{device.product_category}</p>
                          </div>
                          {device.warranty_status === 'in_warranty' && (
                            <Badge className="bg-green-100 text-green-700">
                              <Shield size={12} className="mr-1" />
                              In Warranty
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">SN: {device.serial_number}</p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="mt-2 w-full"
                          onClick={() => router.push(`/customer/device/${device.id}`)}
                        >
                          View Details
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'tickets' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <Card className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    placeholder="Search tickets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-full md:w-[200px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </Card>

            {/* Tickets List */}
            <Card>
              <CardHeader>
                <CardTitle>My Service Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12">
                    <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600">No tickets found</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets.map(ticket => (
                      <div key={ticket.id} className="p-6 border rounded-lg hover:shadow-md transition">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-bold">{ticket.ticket_number}</h3>
                              <Badge variant={
                                ticket.status === 'resolved' ? 'success' :
                                ticket.status === 'in_progress' ? 'default' :
                                'secondary'
                              }>
                                {ticket.status.replace('_', ' ')}
                              </Badge>
                              {ticket.priority === 'urgent' && (
                                <Badge className="bg-red-100 text-red-700">Urgent</Badge>
                              )}
                            </div>
                            <p className="text-gray-700 mb-2">{ticket.issue_description}</p>
                            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                {new Date(ticket.created_at).toLocaleDateString()}
                              </span>
                              {ticket.assigned_engineer && (
                                <span className="flex items-center gap-1">
                                  <Users size={14} />
                                  Engineer: {ticket.assigned_engineer.full_name}
                                </span>
                              )}
                              {ticket.sla_deadline && (
                                <span className="flex items-center gap-1">
                                  <Clock size={14} />
                                  SLA: {new Date(ticket.sla_deadline).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/customer/ticket/${ticket.id}`)}
                            >
                              <Eye size={14} className="mr-1" />
                              View
                            </Button>
                            {ticket.status === 'assigned' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => router.push(`/customer/ticket/${ticket.id}?action=reschedule`)}
                              >
                                <Calendar size={14} className="mr-1" />
                                Reschedule
                              </Button>
                            )}
                          </div>
                        </div>
                        {/* Status Timeline */}
                        {ticket.status_timeline && (
                          <div className="mt-4 pt-4 border-t">
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {ticket.status_timeline.map((status, idx) => (
                                <div key={idx} className="flex items-center gap-2">
                                  <div className={`w-2 h-2 rounded-full ${
                                    status.completed ? 'bg-green-500' : 'bg-gray-300'
                                  }`} />
                                  <span>{status.label}</span>
                                  {idx < ticket.status_timeline.length - 1 && <span>→</span>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>My Registered Devices</CardTitle>
                  <Button onClick={() => router.push('/customer/register-device')}>
                    <Plus size={16} className="mr-2" />
                    Register New Device
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {devices.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No devices registered yet</p>
                    <Button onClick={() => router.push('/customer/register-device')}>
                      Register Your First Device
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {devices.map(device => (
                      <Card key={device.id} className="hover:shadow-lg transition">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{device.brand}</h3>
                              <p className="text-sm text-gray-600">{device.model_number}</p>
                              <p className="text-xs text-gray-500 mt-1">{device.product_category}</p>
                            </div>
                            {device.warranty_status === 'in_warranty' && (
                              <Badge className="bg-green-100 text-green-700">
                                <Shield size={12} className="mr-1" />
                                Warranty
                              </Badge>
                            )}
                          </div>
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Serial Number:</span>
                              <span className="font-mono text-xs">{device.serial_number}</span>
                            </div>
                            {device.warranty_end_date && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Warranty Until:</span>
                                <span>{new Date(device.warranty_end_date).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-1"
                              onClick={() => router.push(`/customer/device/${device.id}`)}
                            >
                              View Details
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => router.push(`/customer/create-ticket?device_id=${device.id}`)}
                            >
                              <Ticket size={14} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'sla' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Timer size={24} className="text-blue-600" />
                  Service times (SLA)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6">
                  These are your organization&apos;s published target times for support. Actual times may vary by ticket priority and location.
                </p>
                {slaPolicies.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <Timer size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>No SLA policies are published for your organization yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {slaPolicies.map((row, idx) => (
                      <div
                        key={`${row.sla_type}-${row.product_category || 'all'}-${idx}`}
                        className="p-4 border rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
                      >
                        <div>
                          <h4 className="font-semibold text-gray-900">{slaTypeLabel(row.sla_type)}</h4>
                          <p className="text-sm text-gray-600 mt-1">
                            Target: <span className="font-medium text-gray-800">{row.target_hours} hours</span>
                            {row.business_hours_only ? ' · Counted in business hours only' : ''}
                          </p>
                          {row.product_category && (
                            <Badge variant="outline" className="mt-2">{row.product_category}</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield size={24} className="text-teal-600" />
                  Service policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-6">
                  Rules your service provider uses for warranty, charges, parts, and pricing. Details are shown as published.
                </p>
                {servicePolicies.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <Shield size={48} className="mx-auto text-gray-300 mb-4" />
                    <p>No service policies are published for your organization yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {servicePolicies.map((row, idx) => (
                      <div
                        key={`${row.policy_type}-${row.product_category || 'all'}-${idx}`}
                        className="p-4 border rounded-lg"
                      >
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{servicePolicyTypeLabel(row.policy_type)}</h4>
                          {row.product_category && (
                            <Badge variant="outline">{row.product_category}</Badge>
                          )}
                        </div>
                        {formatServiceRulesForCustomer(row.rules) && (
                          <pre className="text-xs bg-slate-50 border border-slate-100 rounded-md p-3 overflow-x-auto max-h-48 text-slate-800">
                            {formatServiceRulesForCustomer(row.rules)}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'notifications' && (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-12">
                  <Bell size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map(notif => (
                    <div key={notif.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Bell size={20} className="text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold">{notif.title}</h4>
                          <p className="text-sm text-gray-600">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notif.created_at).toLocaleString()}
                          </p>
                          {(notif.ticket_id || notif.action_url) && (
                            <Button
                              variant="link"
                              size="sm"
                              className="mt-2 p-0 h-auto text-blue-600"
                              onClick={() => router.push(notif.action_url || `/customer/ticket/${notif.ticket_id}`)}
                            >
                              View ticket
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

