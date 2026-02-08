import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Badge } from '../../components/ui/badge'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { 
  Ticket, Users, Package, CheckCircle2, XCircle, AlertCircle,
  Eye, Edit, ArrowRight, Clock, TrendingUp, BarChart3, X,
  RefreshCw, Download, Filter, Search, Plus, FileText, MapPin
} from 'lucide-react'

const LocationMap = dynamic(() => import('../../components/LocationMap'), { ssr: false })

export default function CityAdminDashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [stats, setStats] = useState({})
  const [tickets, setTickets] = useState([])
  const [engineers, setEngineers] = useState([])
  const [inventory, setInventory] = useState([])
  const [pendingPartsApproval, setPendingPartsApproval] = useState([])
  const [complaints, setComplaints] = useState([])
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [showPartsApprovalModal, setShowPartsApprovalModal] = useState(false)
  const [selectedTicketForApproval, setSelectedTicketForApproval] = useState(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showReassignModal, setShowReassignModal] = useState(false)
  const [selectedTicketForReassign, setSelectedTicketForReassign] = useState(null)
  const [selectedEngineerId, setSelectedEngineerId] = useState(null)
  const [selectedTicketIds, setSelectedTicketIds] = useState([])
  const [showQualityCheckModal, setShowQualityCheckModal] = useState(false)
  const [selectedTicketForQuality, setSelectedTicketForQuality] = useState(null)
  const [qualityStatus, setQualityStatus] = useState('pass')
  const [qualityNotes, setQualityNotes] = useState('')
  const [showBulkReassignModal, setShowBulkReassignModal] = useState(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [showMapModal, setShowMapModal] = useState(false)
  const [mapTicket, setMapTicket] = useState(null)
  const [etaEstimates, setEtaEstimates] = useState({})
  const [etaLoading, setEtaLoading] = useState({})
  const [autoEtaEnabled, setAutoEtaEnabled] = useState(false)
  const [showHqModal, setShowHqModal] = useState(false)
  const [hqForm, setHqForm] = useState({ hq_latitude: '', hq_longitude: '' })
  const [followUpForm, setFollowUpForm] = useState({
    action_type: 'follow_up_visit',
    preferred_date: '',
    goodwill: '',
    notes: '',
    create_follow_up_ticket: false,
    engineer_id: ''
  })
  const [ticketFilters, setTicketFilters] = useState({
    product_category: 'all',
    oem_brand: 'all',
    partner_id: 'all'
  })
  const [reorderRequests, setReorderRequests] = useState([])
  const [ageingInventory, setAgeingInventory] = useState([])
  const [showThresholdModal, setShowThresholdModal] = useState(false)
  const [selectedInventoryForThreshold, setSelectedInventoryForThreshold] = useState(null)
  const [thresholdForm, setThresholdForm] = useState({ min_threshold: '', max_threshold: '' })
  const [showRestockModal, setShowRestockModal] = useState(false)
  const [selectedInventoryForRestock, setSelectedInventoryForRestock] = useState(null)
  const [restockQuantity, setRestockQuantity] = useState('')
  const [returnForm, setReturnForm] = useState({
    inventory_id: '',
    quantity: '',
    ticket_id: '',
    notes: ''
  })
  const [redispatchSuggestions, setRedispatchSuggestions] = useState([])
  const [fraudAnomalies, setFraudAnomalies] = useState([])
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadDashboardData(token)
  }, [router, activeTab])

  useEffect(() => {
    if (!autoEtaEnabled) return
    if (!tickets.length) return
    const updateEtas = async () => {
      const token = localStorage.getItem('token')
      const cityLat = dashboardData?.city?.hq_latitude || dashboardData?.city?.latitude
      const cityLng = dashboardData?.city?.hq_longitude || dashboardData?.city?.longitude
      const origin = cityLat && cityLng
        ? { lat: cityLat.toString(), lng: cityLng.toString() }
        : null

      const runWithOrigin = async (originPoint) => {
        const candidates = tickets.filter(t => t.service_latitude && t.service_longitude).slice(0, 8)
        await Promise.all(candidates.map(async (ticket) => {
          try {
            const params = new URLSearchParams({
              origin_lat: originPoint.lat,
              origin_lng: originPoint.lng,
              dest_lat: ticket.service_latitude,
              dest_lng: ticket.service_longitude
            })
            const response = await fetch(`http://localhost:8000/api/v1/routes/directions?${params.toString()}`, {
              headers: { Authorization: `Bearer ${token}` }
            })
            const data = await response.json()
            if (response.ok) {
              setEtaEstimates(prev => ({
                ...prev,
                [ticket.id]: {
                  distanceKm: (data.distance_m / 1000).toFixed(1),
                  etaMin: Math.round(data.duration_s / 60)
                }
              }))
            }
          } catch (error) {
            // ignore ETA errors
          }
        }))
      }

      if (origin) {
        await runWithOrigin(origin)
        return
      }

      if (!navigator.geolocation) return
      navigator.geolocation.getCurrentPosition(async (position) => {
        await runWithOrigin({
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        })
      })
    }

    updateEtas()
    const interval = setInterval(updateEtas, 60000)
    return () => clearInterval(interval)
  }, [autoEtaEnabled, tickets, dashboardData])

  useEffect(() => {
    setSelectedTicketIds([])
  }, [ticketFilters])

  const loadDashboardData = async (token) => {
    try {
      // Load dashboard overview from database
      const dashboardRes = await fetch('http://localhost:8000/api/v1/city-admin/dashboard', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setDashboardData(data)
        setStats(data.statistics || {})
      }

      // Load tickets from database
      if (activeTab === 'tickets' || activeTab === 'overview') {
        const ticketsRes = await fetch('http://localhost:8000/api/v1/city-admin/tickets', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (ticketsRes.ok) {
          const ticketsData = await ticketsRes.json()
          setTickets(ticketsData)
        }
      }

      // Load engineers from database
      if (activeTab === 'engineers' || activeTab === 'overview') {
        const engineersRes = await fetch('http://localhost:8000/api/v1/city-admin/engineers', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (engineersRes.ok) {
          const engineersData = await engineersRes.json()
          setEngineers(engineersData)
        }
      }

      // Load inventory from database
      if (activeTab === 'inventory' || activeTab === 'overview') {
        const inventoryRes = await fetch('http://localhost:8000/api/v1/city-admin/inventory?low_stock_only=false', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json()
          setInventory(inventoryData)
        }

        const reorderRes = await fetch('http://localhost:8000/api/v1/city-admin/inventory/reorder-requests', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (reorderRes.ok) {
          setReorderRequests(await reorderRes.json())
        }

        const ageingRes = await fetch('http://localhost:8000/api/v1/city-admin/inventory?ageing_only=true&slow_moving_days=30', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (ageingRes.ok) {
          setAgeingInventory(await ageingRes.json())
        }
      }

      // Load pending parts approval from database
      if (activeTab === 'parts-approval' || activeTab === 'overview') {
        const partsRes = await fetch('http://localhost:8000/api/v1/city-admin/tickets/pending-parts-approval', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (partsRes.ok) {
          const partsData = await partsRes.json()
          setPendingPartsApproval(partsData)
        }
      }

      if (activeTab === 'complaints' || activeTab === 'overview') {
        const complaintsRes = await fetch('http://localhost:8000/api/v1/city-admin/complaints', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (complaintsRes.ok) {
          const complaintsData = await complaintsRes.json()
          setComplaints(complaintsData)
        }
      }

      if (activeTab === 'overview' || activeTab === 'tickets') {
        const suggestionsRes = await fetch('http://localhost:8000/api/v1/city-admin/tickets/redispatch-suggestions', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (suggestionsRes.ok) {
          setRedispatchSuggestions(await suggestionsRes.json())
        }

        const fraudRes = await fetch('http://localhost:8000/api/v1/city-admin/fraud-anomalies', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        if (fraudRes.ok) {
          const fraudData = await fraudRes.json()
          setFraudAnomalies(Array.isArray(fraudData) ? fraudData : [])
        }
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  const handleApproveParts = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/tickets/${selectedTicketForApproval.ticket_id}/approve-parts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      })
      
      if (response.ok) {
        const result = await response.json()
        alert(`Parts approved. Approved: ${result.approved?.length || 0}, Rejected: ${result.rejected?.length || 0}`)
        setShowPartsApprovalModal(false)
        setSelectedTicketForApproval(null)
        loadDashboardData(token)
      } else {
        const error = await response.json()
        alert(error.detail || 'Error approving parts')
      }
    } catch (error) {
      console.error('Error approving parts:', error)
      alert('Error approving parts')
    }
  }

  const handleRejectParts = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/tickets/${selectedTicketForApproval.ticket_id}/reject-parts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectionReason })
      })
      
      if (response.ok) {
        alert('Parts usage rejected')
        setShowPartsApprovalModal(false)
        setSelectedTicketForApproval(null)
        setRejectionReason('')
        loadDashboardData(token)
      } else {
        const error = await response.json()
        alert(error.detail || 'Error rejecting parts')
      }
    } catch (error) {
      console.error('Error rejecting parts:', error)
      alert('Error rejecting parts')
    }
  }

  const handleUpdateThresholds = async () => {
    if (!selectedInventoryForThreshold) return
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/inventory/${selectedInventoryForThreshold.id}/thresholds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          min_threshold: thresholdForm.min_threshold,
          max_threshold: thresholdForm.max_threshold
        })
      })
      if (response.ok) {
        alert('Thresholds updated')
        setShowThresholdModal(false)
        setSelectedInventoryForThreshold(null)
        loadDashboardData(token)
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to update thresholds')
      }
    } catch (error) {
      alert('Failed to update thresholds')
    }
  }

  const handleCreateRestock = async () => {
    if (!selectedInventoryForRestock || !restockQuantity) return
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:8000/api/v1/city-admin/inventory/reorder-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          inventory_id: selectedInventoryForRestock.id,
          requested_quantity: restockQuantity
        })
      })
      if (response.ok) {
        alert('Restock request created')
        setShowRestockModal(false)
        setSelectedInventoryForRestock(null)
        setRestockQuantity('')
        loadDashboardData(token)
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to create restock request')
      }
    } catch (error) {
      alert('Failed to create restock request')
    }
  }

  const handleApproveRestock = async (requestId) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/inventory/reorder-requests/${requestId}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        loadDashboardData(token)
      }
    } catch (error) {
      alert('Failed to approve request')
    }
  }

  const handleRejectRestock = async (requestId) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/inventory/reorder-requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        loadDashboardData(token)
      }
    } catch (error) {
      alert('Failed to reject request')
    }
  }

  const handleAutoRestock = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:8000/api/v1/city-admin/inventory/restock/auto', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        alert(`Auto restock requests created: ${data.created}`)
        loadDashboardData(token)
      } else {
        alert(data.detail || 'Auto restock failed')
      }
    } catch (error) {
      alert('Auto restock failed')
    }
  }

  const handleRecordReturn = async () => {
    if (!returnForm.inventory_id || !returnForm.quantity) {
      alert('Select a part and quantity')
      return
    }
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:8000/api/v1/city-admin/inventory/returns', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(returnForm)
      })
      if (response.ok) {
        alert('Return recorded')
        setReturnForm({ inventory_id: '', quantity: '', ticket_id: '', notes: '' })
        loadDashboardData(token)
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to record return')
      }
    } catch (error) {
      alert('Failed to record return')
    }
  }

  const handlePriorityUpdate = async (ticketId, priority) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/tickets/${ticketId}/priority`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ priority, reason: 'Escalated due to negative feedback' })
      })
      if (response.ok) {
        loadDashboardData(token)
      }
    } catch (error) {
      alert('Failed to update priority')
    }
  }

  const handleFreezeAssignment = async (ticketId, frozen) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/tickets/${ticketId}/freeze-assignment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ frozen })
      })
      if (response.ok) {
        loadDashboardData(token)
      }
    } catch (error) {
      alert('Failed to update freeze state')
    }
  }

  const categoryOptions = Array.from(new Set(tickets.map(t => t.product_category).filter(Boolean)))
  const brandOptions = Array.from(new Set(tickets.map(t => t.oem_brand).filter(Boolean)))
  const partnerOptions = Array.from(new Set(tickets.map(t => t.partner_id).filter(Boolean)))

  const filteredTickets = tickets.filter((ticket) => {
    if (ticketFilters.product_category !== 'all' && ticket.product_category !== ticketFilters.product_category) return false
    if (ticketFilters.oem_brand !== 'all' && ticket.oem_brand !== ticketFilters.oem_brand) return false
    if (ticketFilters.partner_id !== 'all' && String(ticket.partner_id) !== String(ticketFilters.partner_id)) return false
    return true
  })

  const handleReassignTicket = async () => {
    if (!selectedEngineerId) {
      alert('Please select an engineer')
      return
    }
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/tickets/${selectedTicketForReassign}/reassign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ engineer_id: parseInt(selectedEngineerId) })
      })
      
      if (response.ok) {
        alert('Ticket reassigned successfully')
        setShowReassignModal(false)
        setSelectedTicketForReassign(null)
        setSelectedEngineerId(null)
        loadDashboardData(token)
      } else {
        const error = await response.json()
        alert(error.detail || 'Error reassigning ticket')
      }
    } catch (error) {
      console.error('Error reassigning ticket:', error)
      alert('Error reassigning ticket')
    }
  }

  const handleBulkReassign = async () => {
    if (!selectedEngineerId || selectedTicketIds.length === 0) {
      alert('Please select tickets and an engineer')
      return
    }
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:8000/api/v1/city-admin/tickets/bulk-reassign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticket_ids: selectedTicketIds,
          engineer_id: parseInt(selectedEngineerId)
        })
      })
      if (response.ok) {
        alert('Tickets reassigned successfully')
        setShowBulkReassignModal(false)
        setSelectedTicketIds([])
        setSelectedEngineerId(null)
        loadDashboardData(token)
      } else {
        const error = await response.json()
        alert(error.detail || 'Error reassigning tickets')
      }
    } catch (error) {
      alert('Error reassigning tickets')
    }
  }

  const handleFollowUp = async () => {
    if (!selectedComplaint) return
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/complaints/${selectedComplaint.id}/follow-up`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(followUpForm)
      })
      if (response.ok) {
        alert('Follow-up logged')
        setShowFollowUpModal(false)
        setSelectedComplaint(null)
        setFollowUpForm({ action_type: 'follow_up_visit', preferred_date: '', goodwill: '', notes: '', create_follow_up_ticket: false, engineer_id: '' })
      } else {
        const error = await response.json()
        alert(error.detail || 'Error saving follow-up')
      }
    } catch (error) {
      alert('Error saving follow-up')
    }
  }

  const handleQualityCheck = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/city-admin/tickets/${selectedTicketForQuality}/quality-check`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: qualityStatus,
          notes: qualityNotes
        })
      })
      
      if (response.ok) {
        alert(`Quality check submitted: ${qualityStatus}`)
        setShowQualityCheckModal(false)
        setSelectedTicketForQuality(null)
        setQualityStatus('pass')
        setQualityNotes('')
        loadDashboardData(token)
      } else {
        const error = await response.json()
        alert(error.detail || 'Error submitting quality check')
      }
    } catch (error) {
      console.error('Error submitting quality check:', error)
      alert('Error submitting quality check')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            City Admin Dashboard{dashboardData?.city?.name ? ` – ${dashboardData.city.name}` : ''}
          </h1>
          <p className="text-gray-600">
            {dashboardData?.city?.name
              ? `Monitor and manage operations for ${dashboardData.city.name}`
              : 'Monitor and manage city-level operations'}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tickets"
            value={stats.total_tickets || 0}
            icon={{ emoji: '🎫', bg: 'bg-blue-100', color: 'text-blue-600' }}
          />
          <StatCard
            title="Open Tickets"
            value={stats.open_tickets || 0}
            icon={{ emoji: '⏳', bg: 'bg-yellow-100', color: 'text-yellow-600' }}
          />
          <StatCard
            title="Resolved Today"
            value={stats.resolved_today || 0}
            icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }}
          />
          <StatCard
            title="Pending Parts Approval"
            value={stats.pending_parts_approval || 0}
            icon={{ emoji: '⚠️', bg: 'bg-orange-100', color: 'text-orange-600' }}
          />
        </div>

        {dashboardData?.city?.hq_latitude != null && dashboardData?.city?.hq_longitude != null && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={20} />
                City HQ Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocationMap
                center={{
                  lat: parseFloat(dashboardData.city.hq_latitude),
                  lng: parseFloat(dashboardData.city.hq_longitude)
                }}
                zoom={12}
                markers={[{
                  lat: parseFloat(dashboardData.city.hq_latitude),
                  lng: parseFloat(dashboardData.city.hq_longitude),
                  label: 'HQ'
                }]}
                height="280px"
                width="100%"
              />
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="engineers">Engineers</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="parts-approval">Parts Approval</TabsTrigger>
            <TabsTrigger value="complaints">Complaints</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Tickets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Ticket size={20} />
                    Recent Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dashboardData?.recent_tickets?.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <p>No recent tickets</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData?.recent_tickets?.slice(0, 5).map((ticket) => (
                        <div key={ticket.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-50">
                          <div>
                            <p className="font-semibold">{ticket.ticket_number}</p>
                            <p className="text-sm text-gray-600">{ticket.status}</p>
                          </div>
                          <Badge className={ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}>
                            {ticket.priority}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Engineers Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Engineers Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Total Engineers</span>
                      <span className="font-bold">{stats.total_engineers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Available</span>
                      <span className="font-bold text-green-600">{stats.available_engineers || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Low Stock Items</span>
                      <span className="font-bold text-red-600">{stats.low_stock_items || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp size={20} />
                    Redispatch Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {redispatchSuggestions.length === 0 ? (
                    <p className="text-sm text-gray-600">No suggestions right now.</p>
                  ) : (
                    <div className="space-y-2 text-sm">
                      {redispatchSuggestions.map((item) => (
                        <div key={item.ticket_id} className="border rounded-lg p-2">
                          <div className="font-semibold">{item.ticket_number}</div>
                          <div className="text-gray-600">
                            {item.suggested_engineer_name} • {item.reason}
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
                    <AlertCircle size={20} />
                    Fraud Anomalies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!Array.isArray(fraudAnomalies) || fraudAnomalies.length === 0 ? (
                    <p className="text-sm text-gray-600">No anomalies detected.</p>
                  ) : (
                    <ul className="list-disc list-inside text-sm text-gray-700">
                      {fraudAnomalies.map((anomaly, idx) => (
                        <li key={idx}>{anomaly.description || anomaly.type}</li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Ticket size={20} />
                    City Tickets
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setAutoEtaEnabled((prev) => !prev)}
                    >
                      Auto ETA: {autoEtaEnabled ? 'On' : 'Off'}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={async () => {
                        const token = localStorage.getItem('token')
                        try {
                          const response = await fetch('http://localhost:8000/api/v1/city-admin/tickets/auto-redispatch', {
                            method: 'POST',
                            headers: {
                              Authorization: `Bearer ${token}`,
                              'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ risk_threshold: 0.7, max_tickets: 10 })
                          })
                          const data = await response.json()
                          if (response.ok) {
                            alert(`Redispatched ${data.redispatched} tickets`)
                            loadDashboardData(token)
                          } else {
                            alert(data.detail || 'Redispatch failed')
                          }
                        } catch (error) {
                          alert('Redispatch failed')
                        }
                      }}
                    >
                      Auto Redispatch
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setHqForm({
                          hq_latitude: dashboardData?.city?.hq_latitude || '',
                          hq_longitude: dashboardData?.city?.hq_longitude || ''
                        })
                        setShowHqModal(true)
                      }}
                    >
                      Set HQ
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkReassignModal(true)}
                      disabled={selectedTicketIds.length === 0}
                    >
                      <Edit size={16} className="mr-2" />
                      Bulk Reassign
                    </Button>
                    <Button onClick={() => loadDashboardData(localStorage.getItem('token'))}>
                      <RefreshCw size={16} className="mr-2" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div>
                    <Label>Product Category</Label>
                    <Select
                      value={ticketFilters.product_category}
                      onValueChange={(value) => setTicketFilters({ ...ticketFilters, product_category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {categoryOptions.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>OEM Brand</Label>
                    <Select
                      value={ticketFilters.oem_brand}
                      onValueChange={(value) => setTicketFilters({ ...ticketFilters, oem_brand: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All brands" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {brandOptions.map((brand) => (
                          <SelectItem key={brand} value={brand}>
                            {brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Partner</Label>
                    <Select
                      value={ticketFilters.partner_id}
                      onValueChange={(value) => setTicketFilters({ ...ticketFilters, partner_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All partners" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        {partnerOptions.map((partnerId) => (
                          <SelectItem key={partnerId} value={String(partnerId)}>
                            Partner #{partnerId}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                {filteredTickets.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Ticket size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No tickets found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                            <input
                              type="checkbox"
                              checked={filteredTickets.length > 0 && selectedTicketIds.length === filteredTickets.length}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedTicketIds(filteredTickets.map(t => t.id))
                                } else {
                                  setSelectedTicketIds([])
                                }
                              }}
                            />
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ticket #</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Priority</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SLA Risk</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Map</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredTickets.map((ticket) => (
                          <tr key={ticket.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                checked={selectedTicketIds.includes(ticket.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedTicketIds([...selectedTicketIds, ticket.id])
                                  } else {
                                    setSelectedTicketIds(selectedTicketIds.filter(id => id !== ticket.id))
                                  }
                                }}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{ticket.ticket_number}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={
                                ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                                ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                                'bg-yellow-100 text-yellow-700'
                              }>
                                {ticket.status}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={
                                ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-blue-100 text-blue-700'
                              }>
                                {ticket.priority}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{ticket.issue_category || 'General'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={
                                ticket.sla_breach_risk > 0.7 ? 'bg-red-100 text-red-700' :
                                ticket.sla_breach_risk > 0.4 ? 'bg-yellow-100 text-yellow-700' :
                                'bg-green-100 text-green-700'
                              }>
                                {ticket.sla_breach_risk ? `${Math.round(ticket.sla_breach_risk * 100)}%` : '—'}
                              </Badge>
                              {ticket.sla_risk_reasons && ticket.sla_risk_reasons.length > 0 && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {ticket.sla_risk_reasons.slice(0, 2).join('; ')}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {ticket.service_latitude && ticket.service_longitude ? (
                                <div className="flex flex-col gap-2">
                                  <img
                                    src={`http://localhost:8000/api/v1/routes/static-map?latitude=${ticket.service_latitude}&longitude=${ticket.service_longitude}&zoom=13`}
                                    alt="Map thumbnail"
                                    className="h-16 w-28 rounded border object-cover"
                                  />
                                  <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      window.open(
                                        `https://www.google.com/maps?q=${ticket.service_latitude},${ticket.service_longitude}`,
                                        '_blank'
                                      )
                                    }}
                                  >
                                    Open
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setMapTicket(ticket)
                                      setShowMapModal(true)
                                    }}
                                  >
                                    Preview
                                  </Button>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        if (!navigator.geolocation) {
                                          alert('Geolocation not supported')
                                          return
                                        }
                                        setEtaLoading(prev => ({ ...prev, [ticket.id]: true }))
                                        navigator.geolocation.getCurrentPosition(async (position) => {
                                          const token = localStorage.getItem('token')
                                          try {
                                            const params = new URLSearchParams({
                                              origin_lat: position.coords.latitude.toString(),
                                              origin_lng: position.coords.longitude.toString(),
                                              dest_lat: ticket.service_latitude,
                                              dest_lng: ticket.service_longitude
                                            })
                                            const response = await fetch(`http://localhost:8000/api/v1/routes/directions?${params.toString()}`, {
                                              headers: { Authorization: `Bearer ${token}` }
                                            })
                                            const data = await response.json()
                                            if (response.ok) {
                                              setEtaEstimates(prev => ({
                                                ...prev,
                                                [ticket.id]: {
                                                  distanceKm: (data.distance_m / 1000).toFixed(1),
                                                  etaMin: Math.round(data.duration_s / 60)
                                                }
                                              }))
                                            } else {
                                              alert(data.detail || 'ETA lookup failed')
                                            }
                                          } catch (error) {
                                            alert('ETA lookup failed')
                                          } finally {
                                            setEtaLoading(prev => ({ ...prev, [ticket.id]: false }))
                                          }
                                        })
                                      }}
                                    >
                                      {etaLoading[ticket.id] ? 'ETA...' : 'ETA'}
                                    </Button>
                                  </div>
                                  {etaEstimates[ticket.id] && (
                                    <div className="text-xs text-gray-600">
                                      {etaEstimates[ticket.id].distanceKm} km • {etaEstimates[ticket.id].etaMin} min
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-xs text-gray-400">—</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => router.push(`/tickets/${ticket.id}`)}
                                >
                                  <Eye size={14} className="mr-1" />
                                  View
                                </Button>
                                {ticket.status !== 'resolved' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedTicketForReassign(ticket.id)
                                      setShowReassignModal(true)
                                    }}
                                  >
                                    <Edit size={14} className="mr-1" />
                                    Reassign
                                  </Button>
                                )}
                                {ticket.status !== 'resolved' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleFreezeAssignment(ticket.id, !ticket.assignment_frozen)}
                                  >
                                    {ticket.assignment_frozen ? 'Unfreeze' : 'Freeze'}
                                  </Button>
                                )}
                                {ticket.status === 'resolved' && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={async () => {
                                      const token = localStorage.getItem('token')
                                      const response = await fetch(`http://localhost:8000/api/v1/city-admin/tickets/${ticket.id}/quality-check`, {
                                        headers: { 'Authorization': `Bearer ${token}` }
                                      })
                                      if (response.ok) {
                                        const data = await response.json()
                                        setSelectedTicketForQuality(ticket.id)
                                        setShowQualityCheckModal(true)
                                      }
                                    }}
                                  >
                                    <CheckCircle2 size={14} className="mr-1" />
                                    Quality Check
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reorder Requests</CardTitle>
              </CardHeader>
              <CardContent>
                {reorderRequests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No reorder requests</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {reorderRequests.map((req) => (
                      <div key={req.id} className="flex items-center justify-between border rounded p-3">
                        <div>
                          <div className="font-semibold">{req.part_name || `Part #${req.part_id}`}</div>
                          <div className="text-sm text-gray-600">Qty: {req.requested_quantity} | Stock: {req.current_stock}</div>
                          <div className="text-xs text-gray-500">Status: {req.status}</div>
                        </div>
                        {req.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => handleApproveRestock(req.id)}>
                              Approve
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleRejectRestock(req.id)}>
                              Reject
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Slow Moving Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                {ageingInventory.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No slow-moving items</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Part</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Age (Days)</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {ageingInventory.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap">{item.part_name}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.sku}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.age_days ?? '—'}</td>
                            <td className="px-6 py-4 whitespace-nowrap">{item.current_stock}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Parts to Inventory</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label>Part</Label>
                    <Select
                      value={returnForm.inventory_id}
                      onValueChange={(value) => setReturnForm({ ...returnForm, inventory_id: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select part" />
                      </SelectTrigger>
                      <SelectContent>
                        {inventory.map((item) => (
                          <SelectItem key={item.id} value={String(item.id)}>
                            {item.part_name} ({item.sku})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={returnForm.quantity}
                      onChange={(e) => setReturnForm({ ...returnForm, quantity: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Ticket ID (optional)</Label>
                    <Input
                      value={returnForm.ticket_id}
                      onChange={(e) => setReturnForm({ ...returnForm, ticket_id: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Notes</Label>
                    <Input
                      value={returnForm.notes}
                      onChange={(e) => setReturnForm({ ...returnForm, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <Button onClick={handleRecordReturn}>Record Return</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Engineers Tab */}
          <TabsContent value="engineers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users size={20} />
                  City Engineers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {engineers.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Users size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No engineers found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Assigned Tickets</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Skill Level</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {engineers.map((engineer) => (
                          <tr key={engineer.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{engineer.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{engineer.email}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={engineer.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                {engineer.is_available ? 'Available' : 'Busy'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{engineer.assigned_tickets || 0}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className="capitalize">{engineer.skill_level || 'N/A'}</Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} />
                    City Inventory
                  </CardTitle>
                  <Button variant="outline" onClick={handleAutoRestock}>
                    Auto Restock
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {inventory.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Package size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No inventory items found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Part Name</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">SKU</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Current Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Min Threshold</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Max Threshold</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Age (Days)</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {inventory.map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">{item.part_name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.sku}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.current_stock}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.min_threshold}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.max_threshold ?? '—'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{item.age_days ?? '—'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge className={item.is_low_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                                {item.is_low_stock ? 'Low Stock' : 'Normal'}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInventoryForThreshold(item)
                                    setThresholdForm({
                                      min_threshold: item.min_threshold,
                                      max_threshold: item.max_threshold ?? ''
                                    })
                                    setShowThresholdModal(true)
                                  }}
                                >
                                  Thresholds
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedInventoryForRestock(item)
                                    setRestockQuantity(item.max_threshold ? Math.max(item.max_threshold - item.current_stock, 1) : '')
                                    setShowRestockModal(true)
                                  }}
                                >
                                  Restock
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Parts Approval Tab */}
          <TabsContent value="parts-approval" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  Pending Parts Approval
                </CardTitle>
              </CardHeader>
              <CardContent>
                {pendingPartsApproval.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle2 size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No pending parts approvals</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingPartsApproval.map((ticket) => (
                      <Card key={ticket.ticket_id} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-bold">{ticket.ticket_number}</h3>
                            <p className="text-sm text-gray-600">Engineer: {ticket.engineer_name}</p>
                            <p className="text-sm text-gray-600">Resolved: {new Date(ticket.resolved_at).toLocaleString()}</p>
                          </div>
                          <Button
                            onClick={() => {
                              setSelectedTicketForApproval(ticket)
                              setShowPartsApprovalModal(true)
                            }}
                          >
                            Review Parts
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <h4 className="font-semibold">Parts Used:</h4>
                          {ticket.parts.map((part) => (
                            <div key={part.part_id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <div>
                                <p className="font-medium">{part.part_name}</p>
                                <p className="text-sm text-gray-600">SKU: {part.sku}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold">Qty: {part.quantity}</p>
                                <p className="text-sm text-gray-600">Available: {part.available_stock}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle size={20} />
                  Negative Feedback & Disputes
                </CardTitle>
              </CardHeader>
              <CardContent>
                {complaints.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
                    <p>No negative feedback in this city</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {complaints.map((ticket) => (
                      <Card key={ticket.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{ticket.ticket_number}</h3>
                            <p className="text-sm text-gray-600">{ticket.customer_feedback || 'No feedback message'}</p>
                            {ticket.customer_dispute_tags?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {ticket.customer_dispute_tags.map((tag) => (
                                  <Badge key={tag} className="bg-red-100 text-red-700">{tag}</Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-500">Rating</div>
                            <div className="text-lg font-bold text-red-600">
                              {ticket.customer_rating || '—'}
                            </div>
                          </div>
                        </div>
                        <div className="mt-4 flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(ticket)
                              setShowFollowUpModal(true)
                            }}
                          >
                            Schedule Follow-up
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handlePriorityUpdate(ticket.id, 'high')}
                          >
                            Raise Priority
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedComplaint(ticket)
                              setFollowUpForm({
                                action_type: 'goodwill_gesture',
                                preferred_date: '',
                                goodwill: '',
                            notes: '',
                            create_follow_up_ticket: false,
                            engineer_id: ''
                              })
                              setShowFollowUpModal(true)
                            }}
                          >
                            Goodwill Action
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Parts Approval Modal */}
        {showPartsApprovalModal && selectedTicketForApproval && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Approve Parts Usage - {selectedTicketForApproval.ticket_number}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowPartsApprovalModal(false)
                    setSelectedTicketForApproval(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Parts Used:</h4>
                  {selectedTicketForApproval.parts.map((part) => (
                    <div key={part.part_id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{part.part_name}</p>
                          <p className="text-sm text-gray-600">SKU: {part.sku}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">Quantity: {part.quantity}</p>
                          <p className={`text-sm ${part.available_stock >= part.quantity ? 'text-green-600' : 'text-red-600'}`}>
                            Available: {part.available_stock}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleApproveParts} className="flex-1 bg-green-600 hover:bg-green-700">
                    <CheckCircle2 size={16} className="mr-2" />
                    Approve All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const reason = prompt('Enter rejection reason:')
                      if (reason) {
                        setRejectionReason(reason)
                        handleRejectParts()
                      }
                    }}
                    className="flex-1"
                  >
                    <XCircle size={16} className="mr-2" />
                    Reject
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reassign Ticket Modal */}
        {showReassignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Reassign Ticket</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowReassignModal(false)
                    setSelectedTicketForReassign(null)
                    setSelectedEngineerId(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Engineer</Label>
                  <Select value={selectedEngineerId || undefined} onValueChange={setSelectedEngineerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineers.filter(e => e.is_available).map((engineer) => (
                        <SelectItem key={engineer.id} value={engineer.id.toString()}>
                          {engineer.name} ({engineer.assigned_tickets} tickets)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReassignTicket} className="flex-1">
                    Reassign
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowReassignModal(false)
                      setSelectedTicketForReassign(null)
                      setSelectedEngineerId(null)
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

        {/* Bulk Reassign Modal */}
        {showBulkReassignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Bulk Reassign Tickets</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowBulkReassignModal(false)
                    setSelectedEngineerId(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Engineer</Label>
                  <Select value={selectedEngineerId || undefined} onValueChange={setSelectedEngineerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineers.map((engineer) => (
                        <SelectItem key={engineer.id} value={engineer.id.toString()}>
                          {engineer.name} ({engineer.assigned_tickets} tickets)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-gray-600">
                  Selected tickets: {selectedTicketIds.length}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBulkReassign} className="flex-1">
                    Reassign All
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowBulkReassignModal(false)
                      setSelectedEngineerId(null)
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

        {/* Follow-up Modal */}
        {showFollowUpModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Complaint Follow-up</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowFollowUpModal(false)
                    setSelectedComplaint(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Action Type</Label>
                  <Select
                    value={followUpForm.action_type}
                    onValueChange={(value) => setFollowUpForm({ ...followUpForm, action_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up_visit">Follow-up visit</SelectItem>
                      <SelectItem value="call_customer">Call customer</SelectItem>
                      <SelectItem value="goodwill_gesture">Goodwill gesture</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Preferred Date</Label>
                  <Input
                    type="datetime-local"
                    value={followUpForm.preferred_date}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, preferred_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Goodwill (optional)</Label>
                  <Input
                    value={followUpForm.goodwill}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, goodwill: e.target.value })}
                    placeholder="e.g., Free filter replacement"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={followUpForm.notes}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                    rows={3}
                    placeholder="Notes for follow-up..."
                  />
                </div>
                <div>
                  <Label>Assign Engineer (optional)</Label>
                  <Select
                    value={followUpForm.engineer_id ? followUpForm.engineer_id.toString() : ''}
                    onValueChange={(value) => setFollowUpForm({ ...followUpForm, engineer_id: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {engineers.map((engineer) => (
                        <SelectItem key={engineer.id} value={engineer.id.toString()}>
                          {engineer.name} ({engineer.assigned_tickets} tickets)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={followUpForm.create_follow_up_ticket}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, create_follow_up_ticket: e.target.checked })}
                  />
                  Create follow-up ticket
                </label>
                <div className="flex gap-2">
                  <Button onClick={handleFollowUp} className="flex-1">
                    Save Follow-up
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFollowUpModal(false)
                      setSelectedComplaint(null)
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

        {/* Map Preview Modal */}
        {showMapModal && mapTicket && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Map Preview - {mapTicket.ticket_number}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowMapModal(false)
                    setMapTicket(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <img
                  src={`http://localhost:8000/api/v1/routes/static-map?latitude=${mapTicket.service_latitude}&longitude=${mapTicket.service_longitude}`}
                  alt="Service location"
                  className="w-full rounded-lg border"
                />
                <div className="flex justify-between items-center text-sm text-gray-700">
                  <span>{mapTicket.service_address}</span>
                  <Button
                    variant="outline"
                    onClick={() => {
                      window.open(
                        `https://www.google.com/maps?q=${mapTicket.service_latitude},${mapTicket.service_longitude}`,
                        '_blank'
                      )
                    }}
                  >
                    Open in Maps
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Threshold Modal */}
        {showThresholdModal && selectedInventoryForThreshold && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Update Thresholds</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowThresholdModal(false)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Min Threshold</Label>
                  <Input
                    type="number"
                    value={thresholdForm.min_threshold}
                    onChange={(e) => setThresholdForm({ ...thresholdForm, min_threshold: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Max Threshold</Label>
                  <Input
                    type="number"
                    value={thresholdForm.max_threshold}
                    onChange={(e) => setThresholdForm({ ...thresholdForm, max_threshold: e.target.value })}
                  />
                </div>
                <Button onClick={handleUpdateThresholds} className="w-full">
                  Save Thresholds
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Restock Modal */}
        {showRestockModal && selectedInventoryForRestock && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Request Restock</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowRestockModal(false)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-700">
                  {selectedInventoryForRestock.part_name} (Stock: {selectedInventoryForRestock.current_stock})
                </div>
                <div>
                  <Label>Requested Quantity</Label>
                  <Input
                    type="number"
                    value={restockQuantity}
                    onChange={(e) => setRestockQuantity(e.target.value)}
                  />
                </div>
                <Button onClick={handleCreateRestock} className="w-full">
                  Submit Request
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* City HQ Modal */}
        {showHqModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Set City HQ Location</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowHqModal(false)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">Click on the map to set HQ, or enter coordinates below.</p>
                <LocationMap
                  center={
                    (hqForm.hq_latitude && hqForm.hq_longitude)
                      ? { lat: parseFloat(hqForm.hq_latitude), lng: parseFloat(hqForm.hq_longitude) }
                      : { lat: 20.5937, lng: 78.9629 }
                  }
                  zoom={hqForm.hq_latitude && hqForm.hq_longitude ? 12 : 5}
                  markers={
                    hqForm.hq_latitude && hqForm.hq_longitude
                      ? [{ lat: parseFloat(hqForm.hq_latitude), lng: parseFloat(hqForm.hq_longitude), label: 'HQ' }]
                      : []
                  }
                  onMapClick={({ lat, lng }) => setHqForm({ hq_latitude: String(lat), hq_longitude: String(lng) })}
                  height="240px"
                  width="100%"
                />
                <div>
                  <Label>HQ Latitude</Label>
                  <Input
                    value={hqForm.hq_latitude}
                    onChange={(e) => setHqForm({ ...hqForm, hq_latitude: e.target.value })}
                    placeholder="e.g., 18.5204"
                  />
                </div>
                <div>
                  <Label>HQ Longitude</Label>
                  <Input
                    value={hqForm.hq_longitude}
                    onChange={(e) => setHqForm({ ...hqForm, hq_longitude: e.target.value })}
                    placeholder="e.g., 73.8567"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={async () => {
                      const token = localStorage.getItem('token')
                      try {
                        const response = await fetch('http://localhost:8000/api/v1/city-admin/city-hq', {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(hqForm)
                        })
                        if (response.ok) {
                          setShowHqModal(false)
                          loadDashboardData(token)
                        } else {
                          const error = await response.json()
                          alert(error.detail || 'Failed to update HQ')
                        }
                      } catch (error) {
                        alert('Failed to update HQ')
                      }
                    }}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowHqModal(false)} className="flex-1">
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quality Check Modal */}
        {showQualityCheckModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Quality Check</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowQualityCheckModal(false)
                    setSelectedTicketForQuality(null)
                    setQualityStatus('pass')
                    setQualityNotes('')
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Quality Status</Label>
                  <Select value={qualityStatus} onValueChange={setQualityStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pass">Pass</SelectItem>
                      <SelectItem value="fail">Fail</SelectItem>
                      <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={qualityNotes}
                    onChange={(e) => setQualityNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter quality check notes..."
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleQualityCheck} className="flex-1">
                    Submit Quality Check
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowQualityCheckModal(false)
                      setSelectedTicketForQuality(null)
                      setQualityStatus('pass')
                      setQualityNotes('')
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
