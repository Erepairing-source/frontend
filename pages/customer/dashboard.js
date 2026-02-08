import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import { 
  Ticket, Package, Shield, Clock, MapPin, MessageSquare, 
  Camera, QrCode, FileText, CheckCircle2, AlertCircle, 
  TrendingUp, Bell, Settings, Search, Filter, Plus,
  Eye, Edit, Calendar, Phone, Mail, Send, Star
} from 'lucide-react'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Badge } from '../../components/ui/badge'

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

  useEffect(() => {
    loadDashboardData()
    // Set up real-time updates (would use WebSocket/SSE in production)
    const interval = setInterval(loadDashboardData, 30000) // Refresh every 30s
    return () => clearInterval(interval)
  }, [])

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Load tickets
      const ticketsRes = await fetch('http://localhost:8000/api/v1/tickets/', {
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
      const devicesRes = await fetch('http://localhost:8000/api/v1/devices/', {
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
      const notifRes = await fetch('http://localhost:8000/api/v1/notifications/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (notifRes.ok) {
        const notifData = await notifRes.json()
        setNotifications(notifData.filter(n => !n.read_at).slice(0, 5))
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
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
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Service Dashboard</h1>
          <p className="text-gray-600">Manage your devices, tickets, and service requests</p>
        </div>

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

