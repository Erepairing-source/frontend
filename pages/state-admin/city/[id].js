import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select'
import { ArrowLeft, Ticket, Users, Package, AlertCircle, MapPin } from 'lucide-react'

const LocationMap = dynamic(() => import('../../../components/LocationMap'), { ssr: false })
import { API_BASE } from '../../../lib/api'

export default function StateCityDetail() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [city, setCity] = useState(null)
  const [tickets, setTickets] = useState([])
  const [engineers, setEngineers] = useState([])
  const [allEngineers, setAllEngineers] = useState([])
  const [inventory, setInventory] = useState([])
  const [complaints, setComplaints] = useState([])
  const [selectedTicketIds, setSelectedTicketIds] = useState([])
  const [selectedEngineerId, setSelectedEngineerId] = useState('')
  const [showBulkReassignModal, setShowBulkReassignModal] = useState(false)
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [selectedComplaint, setSelectedComplaint] = useState(null)
  const [followUpForm, setFollowUpForm] = useState({
    action_type: 'follow_up_visit',
    preferred_date: '',
    goodwill: '',
    notes: '',
    create_follow_up_ticket: false,
    engineer_id: ''
  })
  const [showHqModal, setShowHqModal] = useState(false)
  const [hqForm, setHqForm] = useState({ hq_latitude: '', hq_longitude: '' })

  const loadCityData = async () => {
    const cityId = id != null ? (typeof id === 'string' ? id : String(id)) : null
    if (!cityId) return
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const citiesRes = await fetch(API_BASE + '/state-admin/cities', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (citiesRes.ok) {
        const citiesData = await citiesRes.json()
        const numId = parseInt(cityId, 10)
        setCity(citiesData.find(c => c.id != null && c.id === numId) || null)
      }

      const ticketsRes = await fetch(`${API_BASE}/tickets?city_id=${cityId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (ticketsRes.ok) {
        setTickets(await ticketsRes.json())
      }

      const engineersRes = await fetch(`${API_BASE}/state-admin/cities/${cityId}/engineers`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (engineersRes.ok) {
        setEngineers(await engineersRes.json())
      }

      const allEngineersRes = await fetch(API_BASE + '/state-admin/engineers/reallocations', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (allEngineersRes.ok) {
        setAllEngineers(await allEngineersRes.json())
      }

      const inventoryRes = await fetch(`${API_BASE}/state-admin/cities/${cityId}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (inventoryRes.ok) {
        setInventory(await inventoryRes.json())
      }

      const complaintsRes = await fetch(`${API_BASE}/state-admin/cities/${cityId}/complaints`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (complaintsRes.ok) {
        setComplaints(await complaintsRes.json())
      }
    } catch (error) {
      console.error('Error loading city details:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (router.isReady && id) loadCityData()
  }, [router.isReady, id])

  const handleBulkReassign = async () => {
    if (!selectedEngineerId || selectedTicketIds.length === 0) {
      alert('Please select tickets and an engineer')
      return
    }
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(API_BASE + '/state-admin/tickets/bulk-reassign', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ticket_ids: selectedTicketIds,
          engineer_id: parseInt(selectedEngineerId, 10)
        })
      })
      if (response.ok) {
        alert('Tickets reassigned')
        setShowBulkReassignModal(false)
        setSelectedTicketIds([])
        setSelectedEngineerId('')
      } else {
        const error = await response.json()
        alert(error.detail || 'Error reassigning')
      }
    } catch (error) {
      alert('Error reassigning')
    }
  }

  const handleFollowUp = async () => {
    if (!selectedComplaint) return
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${API_BASE}/state-admin/complaints/${selectedComplaint.id}/follow-up`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(followUpForm)
      })
      if (response.ok) {
        alert('Follow-up logged')
        setShowFollowUpModal(false)
        setSelectedComplaint(null)
        setFollowUpForm({
          action_type: 'follow_up_visit',
          preferred_date: '',
          goodwill: '',
          notes: '',
          create_follow_up_ticket: false,
          engineer_id: ''
        })
      } else {
        const error = await response.json()
        alert(error.detail || 'Error saving follow-up')
      }
    } catch (error) {
      alert('Error saving follow-up')
    }
  }

  if (!router.isReady || (id && loading)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading city details...</p>
        </div>
      </div>
    )
  }

  if ((router.isReady && !id) || (id && !loading && !city)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">City not found.</p>
          <Button variant="outline" onClick={() => router.push('/state-admin/dashboard')}>
            <ArrowLeft size={16} className="mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{city?.name || 'City Detail'}</h1>
          {city && (
            <p className="text-gray-600">SLA {city.slaCompliance}% • MTTR {city.mttr}h • Repeat {city.repeatVisits}</p>
          )}
          <div className="mt-3">
            <Button
              variant="outline"
              onClick={() => {
                setHqForm({
                  hq_latitude: city?.hq_latitude || '',
                  hq_longitude: city?.hq_longitude || ''
                })
                setShowHqModal(true)
              }}
            >
              Set City HQ
            </Button>
          </div>
        </div>

        {(city?.hq_latitude != null && city?.hq_longitude != null) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin size={18} />
                City HQ Location
              </CardTitle>
            </CardHeader>
            <CardContent>
              <LocationMap
                center={{
                  lat: parseFloat(city.hq_latitude),
                  lng: parseFloat(city.hq_longitude)
                }}
                zoom={12}
                markers={[{
                  lat: parseFloat(city.hq_latitude),
                  lng: parseFloat(city.hq_longitude),
                  label: 'HQ'
                }]}
                height="280px"
                width="100%"
              />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Ticket size={18} />
                City Tickets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {tickets.length === 0 ? (
                <p className="text-sm text-gray-600">No tickets for this city.</p>
              ) : (
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkReassignModal(true)}
                    disabled={selectedTicketIds.length === 0}
                  >
                    Bulk Reassign
                  </Button>
                  {tickets.slice(0, 8).map(ticket => (
                    <div key={ticket.id} className="flex justify-between items-center border rounded-lg p-3">
                      <div>
                        <div className="font-semibold">{ticket.ticket_number}</div>
                        <div className="text-xs text-gray-500">{ticket.issue_category || 'General'}</div>
                      </div>
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
                      <Badge className={
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }>
                        {ticket.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={18} />
                Engineers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {engineers.length === 0 ? (
                <p className="text-sm text-gray-600">No engineers in this city.</p>
              ) : (
                <div className="space-y-2">
                  {engineers.map(engineer => (
                    <div key={engineer.id} className="flex justify-between items-center border rounded-lg p-3 text-sm">
                      <span>{engineer.name}</span>
                      <Badge className={engineer.is_available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                        {engineer.is_available ? 'Available' : 'Busy'}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={18} />
                City Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              {inventory.length === 0 ? (
                <p className="text-sm text-gray-600">No inventory data.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {inventory.map(item => (
                    <div key={item.id} className="flex justify-between items-center border rounded-lg p-3">
                      <span>{item.part_name}</span>
                      <Badge className={item.is_low_stock ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}>
                        {item.current_stock}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle size={18} />
                Complaints
              </CardTitle>
            </CardHeader>
            <CardContent>
              {complaints.length === 0 ? (
                <p className="text-sm text-gray-600">No complaints for this city.</p>
              ) : (
                <div className="space-y-2 text-sm">
                  {complaints.map(ticket => (
                    <div key={ticket.id} className="border rounded-lg p-3">
                      <div className="font-semibold">{ticket.ticket_number}</div>
                      <div className="text-xs text-gray-500">{ticket.customer_feedback || 'No feedback'}</div>
                      <div className="mt-2 flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedComplaint(ticket)
                            setShowFollowUpModal(true)
                          }}
                        >
                          Follow-up
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
                          Goodwill
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {showBulkReassignModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Bulk Reassign Tickets</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600">Selected tickets: {selectedTicketIds.length}</div>
                <div>
                  <Label>Select Engineer</Label>
                  <Select value={selectedEngineerId} onValueChange={setSelectedEngineerId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {allEngineers.map(engineer => (
                        <SelectItem key={engineer.id} value={engineer.id.toString()}>
                          {engineer.name} - {engineer.current_city_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleBulkReassign} className="flex-1">
                    Reassign
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowBulkReassignModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showFollowUpModal && selectedComplaint && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <CardTitle>Complaint Follow-up</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Action Type</Label>
                  <Select value={followUpForm.action_type} onValueChange={(value) => setFollowUpForm({ ...followUpForm, action_type: value })}>
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
                  <Label>Goodwill</Label>
                  <Input
                    value={followUpForm.goodwill}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, goodwill: e.target.value })}
                    placeholder="Optional goodwill"
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Input
                    value={followUpForm.notes}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                    placeholder="Notes"
                  />
                </div>
                <div>
                  <Label>Assign Engineer (optional)</Label>
                  <Select value={followUpForm.engineer_id || ''} onValueChange={(value) => setFollowUpForm({ ...followUpForm, engineer_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {allEngineers.map(engineer => (
                        <SelectItem key={engineer.id} value={engineer.id.toString()}>
                          {engineer.name} - {engineer.current_city_name}
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
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowFollowUpModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {showHqModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Set City HQ Location</CardTitle>
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
                        const response = await fetch(`${API_BASE}/state-admin/cities/${city?.id ?? id}/hq`, {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify(hqForm)
                        })
                        if (response.ok) {
                          setShowHqModal(false)
                          loadCityData()
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
      </div>
    </div>
  )
}
