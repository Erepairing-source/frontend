import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import { 
  Globe, TrendingUp, TrendingDown, Building2, Users, Package, 
  AlertTriangle, BarChart3, Filter, Download, RefreshCw, ArrowRight,
  Clock, CheckCircle2, XCircle, Activity, Zap, DollarSign, MessageSquare
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { API_BASE } from '../../lib/api'

export default function CountryAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalStates: 0,
    totalTickets: 0,
    nationalSlaCompliance: 0,
    nationalMttr: 0,
    nationalFtfr: 0,
    repeatVisitsByProduct: [],
    customerSatisfaction: 0,
    warrantyCost: 0
  })
  const [states, setStates] = useState([])
  const [partners, setPartners] = useState([])
  const [warrantyAlerts, setWarrantyAlerts] = useState([])
  const [warrantyByProduct, setWarrantyByProduct] = useState([])
  const [oemDefects, setOemDefects] = useState([])
  const [selectedState, setSelectedState] = useState('all')
  const [timeRange, setTimeRange] = useState('30d')

  useEffect(() => {
    loadDashboardData()
  }, [selectedState, timeRange])

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Load national statistics
      const statsResponse = await fetch(`${API_BASE}/country-admin/dashboard?time_range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load state performance data
      const statesResponse = await fetch(API_BASE + '/country-admin/states', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statesResponse.ok) {
        const statesData = await statesResponse.json()
        setStates(statesData)
      }

      // Load partner performance data
      const partnersResponse = await fetch(API_BASE + '/country-admin/partners', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (partnersResponse.ok) {
        const partnersData = await partnersResponse.json()
        setPartners(partnersData)
      }

      // Load warranty abuse signals
      const warrantyResponse = await fetch(API_BASE + '/country-admin/warranty-abuse', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (warrantyResponse.ok) {
        setWarrantyAlerts(await warrantyResponse.json())
      }

      const warrantyProductRes = await fetch(API_BASE + '/country-admin/warranty-abuse/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (warrantyProductRes.ok) {
        setWarrantyByProduct(await warrantyProductRes.json())
      }

      const defectRes = await fetch(API_BASE + '/country-admin/oem-defects', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (defectRes.ok) {
        setOemDefects(await defectRes.json())
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading national dashboard...</p>
        </div>
      </div>
    )
  }

  const filteredStates = selectedState === 'all' 
    ? states 
    : states.filter(s => (s.id != null ? String(s.id) : `noid-${s.name}`) === selectedState)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Country Admin Dashboard</h1>
          <p className="text-gray-600">National performance monitoring and strategic management</p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  {states.map(state => (
                    <SelectItem key={state.id ?? `state-${state.name}`} value={state.id != null ? state.id.toString() : `noid-${state.name}`}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-gray-500" />
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                  <SelectItem value="90d">Last 90 Days</SelectItem>
                  <SelectItem value="1y">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline" onClick={loadDashboardData} className="ml-auto">
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </Card>

        {/* Key National Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <StatCard
            title="States"
            value={stats.totalStates}
            icon={<Globe size={24} className="text-blue-600" />}
            bgColor="bg-blue-50"
          />
          <StatCard
            title="Total Tickets"
            value={stats.totalTickets}
            icon={<Activity size={24} className="text-indigo-600" />}
            bgColor="bg-indigo-50"
          />
          <StatCard
            title="SLA Compliance"
            value={`${stats.nationalSlaCompliance}%`}
            icon={<CheckCircle2 size={24} className="text-green-600" />}
            bgColor="bg-green-50"
          />
          <StatCard
            title="MTTR"
            value={`${stats.nationalMttr}h`}
            icon={<Clock size={24} className="text-purple-600" />}
            bgColor="bg-purple-50"
          />
          <StatCard
            title="FTFR"
            value={`${stats.nationalFtfr}%`}
            icon={<Zap size={24} className="text-orange-600" />}
            bgColor="bg-orange-50"
          />
          <StatCard
            title="Customer NPS"
            value={stats.customerSatisfaction}
            icon={<MessageSquare size={24} className="text-pink-600" />}
            bgColor="bg-pink-50"
          />
          <StatCard
            title="Warranty Cost"
            value={`₹${(stats.warrantyCost / 100000).toFixed(1)}L`}
            icon={<DollarSign size={24} className="text-red-600" />}
            bgColor="bg-red-50"
          />
          <StatCard
            title="Partners"
            value={partners.length}
            icon={<Building2 size={24} className="text-teal-600" />}
            bgColor="bg-teal-50"
          />
        </div>


        {/* State Performance */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Globe size={20} />
                State Performance Overview
              </CardTitle>
              <Button variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">State</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">SLA %</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">MTTR</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">FTFR</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">NPS</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStates.map((state) => (
                    <tr key={state.id ?? `state-${state.name}`} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{state.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={state.slaCompliance >= 90 ? 'text-green-600' : state.slaCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                            {state.slaCompliance}%
                          </span>
                          {state.slaCompliance >= 90 ? (
                            <TrendingUp size={16} className="text-green-600" />
                          ) : state.slaCompliance < 70 ? (
                            <TrendingDown size={16} className="text-red-600" />
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4">{state.mttr}h</td>
                      <td className="py-3 px-4">{state.ftfr}%</td>
                      <td className="py-3 px-4">{state.nps}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          state.status === 'healthy' ? 'bg-green-100 text-green-700' :
                          state.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {state.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {state.id != null ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/country-admin/state/${state.id}`)}
                          >
                            View Details <ArrowRight size={14} className="ml-1" />
                          </Button>
                        ) : (
                          <span className="text-gray-400 text-sm">No data in DB</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Partner Performance (if OEM) */}
        {partners.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Building2 size={20} />
                  Partner Performance Management
                </CardTitle>
                <Button variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Partner</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Tickets</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">SLA %</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Cost/Ticket</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">NPS</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {partners.map((partner) => (
                      <tr key={partner.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{partner.name}</td>
                        <td className="py-3 px-4">{partner.ticketsHandled}</td>
                        <td className="py-3 px-4">
                          <span className={partner.slaAdherence >= 90 ? 'text-green-600' : partner.slaAdherence >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                            {partner.slaAdherence}%
                          </span>
                        </td>
                        <td className="py-3 px-4">₹{partner.costPerTicket.toFixed(2)}</td>
                        <td className="py-3 px-4">{partner.nps}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            partner.status === 'excellent' ? 'bg-green-100 text-green-700' :
                            partner.status === 'good' ? 'bg-blue-100 text-blue-700' :
                            partner.status === 'needs_improvement' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {partner.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/country-admin/partner/${partner.id}`)}
                          >
                            View Details <ArrowRight size={14} className="ml-1" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Warranty Abuse Signals */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={20} />
                Warranty Abuse Signals
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadDashboardData}>
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {warrantyAlerts.length === 0 ? (
              <p className="text-sm text-gray-600">No suspicious warranty patterns detected.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">State</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Warranty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warrantyAlerts.map((alert) => (
                      <tr key={alert.state_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{alert.state_name}</td>
                        <td className="py-3 px-4">{alert.warranty_tickets}</td>
                        <td className="py-3 px-4">{alert.total_tickets}</td>
                        <td className="py-3 px-4 text-red-600">{alert.ratio}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Warranty Abuse by Product */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} />
              Warranty Abuse by Product
            </CardTitle>
          </CardHeader>
          <CardContent>
            {warrantyByProduct.length === 0 ? (
              <p className="text-sm text-gray-600">No product-level warranty anomalies.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Model</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Warranty</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ratio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warrantyByProduct.map((item) => (
                      <tr key={item.model_number} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.model_number}</td>
                        <td className="py-3 px-4">{item.warranty_tickets}</td>
                        <td className="py-3 px-4">{item.total_tickets}</td>
                        <td className="py-3 px-4 text-red-600">{item.ratio}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* OEM Defect Trends */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle size={20} />
              OEM Defect Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            {oemDefects.length === 0 ? (
              <p className="text-sm text-gray-600">No defect spikes detected.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Model</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Recent</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Previous</th>
                    </tr>
                  </thead>
                  <tbody>
                    {oemDefects.map((item) => (
                      <tr key={item.model_number} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.model_number}</td>
                        <td className="py-3 px-4">{item.recent_tickets}</td>
                        <td className="py-3 px-4">{item.previous_tickets}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/country-admin/strategic-inventory')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Strategic Inventory</h3>
                <p className="text-sm text-gray-600">Nation-wide parts and warranty analysis</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/country-admin/partner-management')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Partner Management</h3>
                <p className="text-sm text-gray-600">Compare and manage service partners</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/country-admin/escalations')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <AlertTriangle size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Top Escalations</h3>
                <p className="text-sm text-gray-600">Handle key account and social media issues</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}



