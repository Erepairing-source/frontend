import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import { 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Package, 
  AlertTriangle,
  BarChart3, 
  Filter, 
  Download, 
  RefreshCw, 
  ArrowRight, 
  Clock,
  CheckCircle2, 
  XCircle, 
  Activity, 
  Zap, 
  Building2, 
  X
} from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'

const LocationMap = dynamic(() => import('../../components/LocationMap'), { ssr: false })

export default function StateAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCities: 0,
    totalTickets: 0,
    slaCompliance: 0,
    mttr: 0,
    repeatVisits: 0,
    stockoutIncidents: 0
  })
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('all')
  const [timeRange, setTimeRange] = useState('30d')
  const [showInventoryTransfer, setShowInventoryTransfer] = useState(false)
  const [showEngineerReallocation, setShowEngineerReallocation] = useState(false)
  const [engineers, setEngineers] = useState([])
  const [inventoryParts, setInventoryParts] = useState([])
  const [slaRiskTickets, setSlaRiskTickets] = useState([])
  const [slaRiskFilters, setSlaRiskFilters] = useState({
    city_id: 'all',
    status: 'all',
    priority: 'all',
    min_risk: 0.4
  })
  const [complianceAlerts, setComplianceAlerts] = useState([])
  const [demandForecast, setDemandForecast] = useState([])
  const [trainingGaps, setTrainingGaps] = useState([])
  const [policyTargetHours, setPolicyTargetHours] = useState(24)
  const [policyImpact, setPolicyImpact] = useState(null)
  const [transferForm, setTransferForm] = useState({
    from_city_id: '',
    to_city_id: '',
    part_id: '',
    quantity: '',
    notes: ''
  })
  const [reallocationForm, setReallocationForm] = useState({
    engineer_id: '',
    to_city_id: '',
    reason: ''
  })

  useEffect(() => {
    loadDashboardData()
  }, [selectedCity, timeRange])

  useEffect(() => {
    loadSlaRisk()
  }, [slaRiskFilters, cities])

  useEffect(() => {
    loadComplianceAlerts()
  }, [])

  useEffect(() => {
    loadDemandForecast()
    loadTrainingGaps()
  }, [])

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Load state-wide statistics
      const statsResponse = await fetch(`http://localhost:8000/api/v1/state-admin/dashboard?time_range=${timeRange}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load city performance data
      const citiesResponse = await fetch('http://localhost:8000/api/v1/state-admin/cities', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      if (citiesResponse.ok) {
        const citiesData = await citiesResponse.json()
        setCities(citiesData)
      }

      // Load engineers for reallocation
      const engineersRes = await fetch('http://localhost:8000/api/v1/state-admin/engineers/reallocations', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (engineersRes.ok) {
        const engineersData = await engineersRes.json()
        setEngineers(engineersData)
      }

      // Load inventory parts - get from all cities in state
      const inventoryRes = await fetch('http://localhost:8000/api/v1/state-admin/inventory/parts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (inventoryRes.ok) {
        const inventoryData = await inventoryRes.json()
        // Flatten parts with cities
        const flatParts = []
        inventoryData.forEach(part => {
          part.cities.forEach(city => {
            flatParts.push({
              part_id: part.part_id,
              part_name: part.part_name,
              sku: part.sku,
              city_id: city.city_id,
              city_name: city.city_name,
              current_stock: city.current_stock
            })
          })
        })
        setInventoryParts(flatParts)
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  const loadSlaRisk = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }

    const params = new URLSearchParams()
    if (slaRiskFilters.city_id !== 'all') params.append('city_id', slaRiskFilters.city_id)
    if (slaRiskFilters.status !== 'all') params.append('status', slaRiskFilters.status)
    if (slaRiskFilters.priority !== 'all') params.append('priority', slaRiskFilters.priority)
    params.append('min_risk', slaRiskFilters.min_risk.toString())

    try {
      const response = await fetch(`http://localhost:8000/api/v1/state-admin/sla-risk?${params.toString()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setSlaRiskTickets(data)
      }
    } catch (error) {
      console.error('Error loading SLA risk:', error)
    }
  }

  const loadComplianceAlerts = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      return
    }
    try {
      const response = await fetch('http://localhost:8000/api/v1/state-admin/compliance-alerts', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setComplianceAlerts(await response.json())
      }
    } catch (error) {
      console.error('Error loading compliance alerts:', error)
    }
  }

  const loadDemandForecast = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch('http://localhost:8000/api/v1/state-admin/demand-forecast', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setDemandForecast(await response.json())
      }
    } catch (error) {
      console.error('Error loading demand forecast:', error)
    }
  }

  const loadTrainingGaps = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch('http://localhost:8000/api/v1/state-admin/training-gaps', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        setTrainingGaps(await response.json())
      }
    } catch (error) {
      console.error('Error loading training gaps:', error)
    }
  }

  const runPolicyImpact = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const response = await fetch('http://localhost:8000/api/v1/state-admin/policy-impact', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_hours: policyTargetHours })
      })
      if (response.ok) {
        setPolicyImpact(await response.json())
      }
    } catch (error) {
      console.error('Error simulating policy impact:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading state dashboard...</p>
        </div>
      </div>
    )
  }

  const cityKey = (c) => (c.id != null ? String(c.id) : `noid-${c.name}`)
  const filteredCities = selectedCity === 'all' 
    ? cities 
    : cities.filter(c => cityKey(c) === selectedCity)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">State Admin Dashboard</h1>
          <p className="text-gray-600">Multi-city health monitoring and resource management</p>
        </div>

        {/* Filters */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-gray-500" />
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city.id ?? `noid-${city.name}`} value={city.id != null ? String(city.id) : `noid-${city.name}`}>
                      {city.name}
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

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <StatCard
            title="Cities"
            value={stats.totalCities}
            icon={<Building2 size={24} className="text-blue-600" />}
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
            value={`${stats.slaCompliance}%`}
            icon={<CheckCircle2 size={24} className="text-green-600" />}
            bgColor="bg-green-50"
          />
          <StatCard
            title="Avg MTTR"
            value={`${stats.mttr}h`}
            icon={<Clock size={24} className="text-purple-600" />}
            bgColor="bg-purple-50"
          />
          <StatCard
            title="Repeat Visits"
            value={stats.repeatVisits}
            icon={<RefreshCw size={24} className="text-orange-600" />}
            bgColor="bg-orange-50"
          />
          <StatCard
            title="Stockouts"
            value={stats.stockoutIncidents}
            icon={<AlertTriangle size={24} className="text-red-600" />}
            bgColor="bg-red-50"
          />
        </div>


        {/* City Performance Table */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                City Performance Comparison
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
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">City</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">SLA %</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">MTTR</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Repeat Visits</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Stockouts</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCities.map((city) => (
                    <tr key={city.id ?? `noid-${city.name}`} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{city.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className={city.slaCompliance >= 90 ? 'text-green-600' : city.slaCompliance >= 70 ? 'text-yellow-600' : 'text-red-600'}>
                            {city.slaCompliance}%
                          </span>
                          {city.slaCompliance >= 90 ? (
                            <TrendingUp size={16} className="text-green-600" />
                          ) : city.slaCompliance < 70 ? (
                            <TrendingDown size={16} className="text-red-600" />
                          ) : null}
                        </div>
                      </td>
                      <td className="py-3 px-4">{city.mttr}h</td>
                      <td className="py-3 px-4">
                        <span className={city.repeatVisits > 10 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {city.repeatVisits}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={city.stockoutIncidents > 5 ? 'text-red-600 font-semibold' : 'text-gray-700'}>
                          {city.stockoutIncidents}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          city.status === 'healthy' ? 'bg-green-100 text-green-700' :
                          city.status === 'warning' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {city.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {city.id != null ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/state-admin/city/${city.id}`)}
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

        {cities.some(c => (c.hq_latitude != null && c.hq_longitude != null)) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                City HQ Locations
              </CardTitle>
              <p className="text-sm text-gray-500 mt-1">Cities with HQ coordinates set</p>
            </CardHeader>
            <CardContent>
              <LocationMap
                markers={cities
                  .filter(c => c.hq_latitude != null && c.hq_longitude != null)
                  .map((c, i) => ({
                    id: c.id ?? `noid-${i}`,
                    lat: parseFloat(c.hq_latitude),
                    lng: parseFloat(c.hq_longitude),
                    label: c.name
                  }))}
                zoom={6}
                height="320px"
                width="100%"
              />
            </CardContent>
          </Card>
        )}

        {/* SLA Risk Dashboard */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={20} />
                SLA Risk Dashboard
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadSlaRisk}>
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <Label>City</Label>
                <Select
                  value={slaRiskFilters.city_id}
                  onValueChange={(value) => setSlaRiskFilters({ ...slaRiskFilters, city_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Cities</SelectItem>
                    {cities.map(city => (
                      <SelectItem key={city.id ?? `noid-${city.name}`} value={city.id != null ? String(city.id) : `noid-${city.name}`}>{city.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Status</Label>
                <Select
                  value={slaRiskFilters.status}
                  onValueChange={(value) => setSlaRiskFilters({ ...slaRiskFilters, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="created">Created</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="waiting_parts">Waiting Parts</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Priority</Label>
                <Select
                  value={slaRiskFilters.priority}
                  onValueChange={(value) => setSlaRiskFilters({ ...slaRiskFilters, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Min Risk (0-1)</Label>
                <Input
                  type="number"
                  step="0.05"
                  min="0"
                  max="1"
                  value={slaRiskFilters.min_risk}
                  onChange={(e) => setSlaRiskFilters({ ...slaRiskFilters, min_risk: parseFloat(e.target.value || 0) })}
                />
              </div>
            </div>

            {slaRiskTickets.length === 0 ? (
              <p className="text-sm text-gray-600">No high-risk tickets found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Ticket</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Priority</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Risk</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">SLA Deadline</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slaRiskTickets.map(ticket => (
                      <tr key={ticket.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{ticket.ticket_number}</td>
                        <td className="py-3 px-4">{ticket.status}</td>
                        <td className="py-3 px-4">{ticket.priority}</td>
                        <td className="py-3 px-4">
                          <span className={ticket.sla_breach_risk > 0.7 ? 'text-red-600' : 'text-yellow-600'}>
                            {Math.round(ticket.sla_breach_risk * 100)}%
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {ticket.sla_deadline ? new Date(ticket.sla_deadline).toLocaleString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Alerts */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle size={20} />
                Compliance Alerts
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadComplianceAlerts}>
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {complianceAlerts.length === 0 ? (
              <p className="text-sm text-gray-600">No compliance alerts.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">City</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">At Risk</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Total</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Risk %</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complianceAlerts.map((alert) => (
                      <tr key={alert.city_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{alert.city_name}</td>
                        <td className="py-3 px-4">{alert.at_risk}</td>
                        <td className="py-3 px-4">{alert.total}</td>
                        <td className="py-3 px-4 text-red-600">{alert.ratio}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Demand Forecast */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Demand Forecast
              </CardTitle>
              <Button variant="outline" size="sm" onClick={loadDemandForecast}>
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {demandForecast.length === 0 ? (
              <p className="text-sm text-gray-600">No forecast data yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Part</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Forecast (30d)</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Weekly Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demandForecast.map((item) => (
                      <tr key={item.part_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.part_name}</td>
                        <td className="py-3 px-4">{item.predicted_demand}</td>
                        <td className="py-3 px-4">{item.weekly_forecast?.[0] ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Policy Impact Simulator */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap size={20} />
              Policy Impact Simulator
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2 items-center">
              <Input
                type="number"
                value={policyTargetHours}
                onChange={(e) => setPolicyTargetHours(parseInt(e.target.value || '24'))}
                className="w-32"
              />
              <span className="text-sm text-gray-600">Target Hours</span>
              <Button size="sm" variant="outline" onClick={runPolicyImpact}>
                Simulate
              </Button>
            </div>
            {policyImpact && (
              <div className="text-sm text-gray-700">
                Compliance: {policyImpact.compliance_rate}% • Breaches: {policyImpact.projected_breaches} • Penalty: ₹{policyImpact.estimated_penalty}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Training Gaps */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users size={20} />
              Training Gaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            {trainingGaps.length === 0 ? (
              <p className="text-sm text-gray-600">No training gaps detected.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Engineer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Follow-up %</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Avg Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainingGaps.map((gap) => (
                      <tr key={gap.engineer_id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{gap.engineer_name}</td>
                        <td className="py-3 px-4">{gap.follow_up_rate}%</td>
                        <td className="py-3 px-4">{gap.avg_rating ?? '—'}</td>
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
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowEngineerReallocation(true)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users size={24} className="text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Engineer Reallocation</h3>
                <p className="text-sm text-gray-600">Move engineers between cities</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowInventoryTransfer(true)}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package size={24} className="text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Inventory Transfer</h3>
                <p className="text-sm text-gray-600">Transfer parts between cities</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/state-admin/policies')}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Zap size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Regional Policies</h3>
                <p className="text-sm text-gray-600">Configure SLA and service rules</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Inventory Transfer Modal */}
        {showInventoryTransfer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Transfer Inventory Between Cities</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowInventoryTransfer(false)
                    setTransferForm({ from_city_id: '', to_city_id: '', part_id: '', quantity: '', notes: '' })
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>From City</Label>
                  <Select value={transferForm.from_city_id} onValueChange={(val) => setTransferForm({...transferForm, from_city_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.id ?? `noid-${city.name}`} value={city.id != null ? String(city.id) : `noid-${city.name}`}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To City</Label>
                  <Select value={transferForm.to_city_id} onValueChange={(val) => setTransferForm({...transferForm, to_city_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.filter(c => c.id.toString() !== transferForm.from_city_id).map(city => (
                        <SelectItem key={city.id ?? `noid-${city.name}`} value={city.id != null ? String(city.id) : `noid-${city.name}`}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Part</Label>
                  <Select value={transferForm.part_id} onValueChange={(val) => setTransferForm({...transferForm, part_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select part" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventoryParts.filter(p => p.city_id.toString() === transferForm.from_city_id).map(part => (
                        <SelectItem key={part.part_id} value={part.part_id.toString()}>
                          {part.part_name} (SKU: {part.sku}) - Stock: {part.current_stock}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    value={transferForm.quantity}
                    onChange={(e) => setTransferForm({...transferForm, quantity: e.target.value})}
                    placeholder="Enter quantity"
                  />
                </div>
                <div>
                  <Label>Notes (Optional)</Label>
                  <Textarea
                    value={transferForm.notes}
                    onChange={(e) => setTransferForm({...transferForm, notes: e.target.value})}
                    rows={3}
                    placeholder="Transfer reason or notes..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const token = localStorage.getItem('token')
                      try {
                        const response = await fetch('http://localhost:8000/api/v1/state-admin/inventory/transfer', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            from_city_id: parseInt(transferForm.from_city_id),
                            to_city_id: parseInt(transferForm.to_city_id),
                            part_id: parseInt(transferForm.part_id),
                            quantity: parseInt(transferForm.quantity),
                            notes: transferForm.notes
                          })
                        })
                        if (response.ok) {
                          alert('Inventory transferred successfully')
                          setShowInventoryTransfer(false)
                          setTransferForm({ from_city_id: '', to_city_id: '', part_id: '', quantity: '', notes: '' })
                          loadDashboardData()
                        } else {
                          const error = await response.json()
                          alert(error.detail || 'Error transferring inventory')
                        }
                      } catch (error) {
                        alert('Error transferring inventory')
                      }
                    }}
                    className="flex-1"
                    disabled={!transferForm.from_city_id || !transferForm.to_city_id || !transferForm.part_id || !transferForm.quantity}
                  >
                    Transfer Inventory
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowInventoryTransfer(false)
                      setTransferForm({ from_city_id: '', to_city_id: '', part_id: '', quantity: '', notes: '' })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Engineer Reallocation Modal */}
        {showEngineerReallocation && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Reallocate Engineer</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowEngineerReallocation(false)
                    setReallocationForm({ engineer_id: '', to_city_id: '', reason: '' })
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Engineer</Label>
                  <Select value={reallocationForm.engineer_id} onValueChange={(val) => setReallocationForm({...reallocationForm, engineer_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineers.map(engineer => (
                        <SelectItem key={engineer.id} value={engineer.id.toString()}>
                          {engineer.name} - Current City: {engineer.current_city_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>To City</Label>
                  <Select value={reallocationForm.to_city_id} onValueChange={(val) => setReallocationForm({...reallocationForm, to_city_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination city" />
                    </SelectTrigger>
                    <SelectContent>
                      {cities.map(city => (
                        <SelectItem key={city.id ?? `noid-${city.name}`} value={city.id != null ? String(city.id) : `noid-${city.name}`}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Reason</Label>
                  <Textarea
                    value={reallocationForm.reason}
                    onChange={(e) => setReallocationForm({...reallocationForm, reason: e.target.value})}
                    rows={3}
                    placeholder="Reason for reallocation..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const token = localStorage.getItem('token')
                      try {
                        const response = await fetch('http://localhost:8000/api/v1/state-admin/engineers/reallocate', {
                          method: 'POST',
                          headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({
                            engineer_id: parseInt(reallocationForm.engineer_id),
                            to_city_id: parseInt(reallocationForm.to_city_id),
                            reason: reallocationForm.reason
                          })
                        })
                        if (response.ok) {
                          alert('Engineer reallocated successfully')
                          setShowEngineerReallocation(false)
                          setReallocationForm({ engineer_id: '', to_city_id: '', reason: '' })
                          loadDashboardData()
                        } else {
                          const error = await response.json()
                          alert(error.detail || 'Error reallocating engineer')
                        }
                      } catch (error) {
                        alert('Error reallocating engineer')
                      }
                    }}
                    className="flex-1"
                    disabled={!reallocationForm.engineer_id || !reallocationForm.to_city_id}
                  >
                    Reallocate Engineer
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowEngineerReallocation(false)
                      setReallocationForm({ engineer_id: '', to_city_id: '', reason: '' })
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}



