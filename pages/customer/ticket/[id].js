import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Input } from '../../../components/ui/input'
import { Label } from '../../../components/ui/label'
import { Textarea } from '../../../components/ui/textarea'
import { Badge } from '../../../components/ui/badge'
import { 
  Ticket, Calendar, MapPin, Clock, User, MessageSquare, 
  CheckCircle2, X, ArrowLeft, AlertCircle, Phone, Mail
} from 'lucide-react'

export default function CustomerTicketDetail() {
  const router = useRouter()
  const { id, action } = router.query
  const [ticket, setTicket] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [feedbackForm, setFeedbackForm] = useState({
    rating: 5,
    feedback: '',
    dispute_tags: []
  })
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [mapUrl, setMapUrl] = useState(null)
  const [tracking, setTracking] = useState(null)
  const [trackingError, setTrackingError] = useState(null)
  const [estimate, setEstimate] = useState(null)
  const [aiSummary, setAiSummary] = useState(null)
  const [rescheduleForm, setRescheduleForm] = useState({
    service_address: '',
    service_latitude: '',
    service_longitude: '',
    preferred_date: '',
    reason: ''
  })
  const [rescheduleGeoLoading, setRescheduleGeoLoading] = useState(false)
  const [lastRescheduleGeocode, setLastRescheduleGeocode] = useState('')

  useEffect(() => {
    if (id) {
      loadTicket()
      if (action === 'reschedule') {
        setShowRescheduleModal(true)
      }
    }
  }, [id, action])

  useEffect(() => {
    if (id) {
      fetchEstimate()
      fetchAiSummary()
    }
  }, [id])

  useEffect(() => {
    if (!ticket?.service_latitude || !ticket?.service_longitude) return
    const token = localStorage.getItem('token')
    const fetchMap = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/routes/static-map?latitude=${ticket.service_latitude}&longitude=${ticket.service_longitude}`,
          { headers: { Authorization: `Bearer ${token}` } }
        )
        const data = await response.json()
        if (response.ok) {
          setMapUrl(data.map_url)
        }
      } catch (error) {
        // ignore map errors
      }
    }
    fetchMap()
  }, [ticket])

  const fetchTracking = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/tickets/${id}/tracking`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (!response.ok) {
        setTrackingError(data.detail || 'Tracking unavailable')
      } else {
        setTracking(data)
        setTrackingError(null)
      }
    } catch (error) {
      setTrackingError('Tracking unavailable')
    }
  }

  const fetchEstimate = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/tickets/${id}/estimate`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        setEstimate(data)
      }
    } catch (error) {
      // ignore
    }
  }

  const fetchAiSummary = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/ai/tickets/summary', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: parseInt(id) })
      })
      if (response.ok) {
        setAiSummary(await response.json())
      }
    } catch (error) {
      // ignore
    }
  }

  useEffect(() => {
    const address = rescheduleForm.service_address.trim()
    if (!address || address.length < 5) return
    if (address === lastRescheduleGeocode) return
    const timeout = setTimeout(async () => {
      setRescheduleGeoLoading(true)
      const token = localStorage.getItem('token')
      try {
        const params = new URLSearchParams({ address })
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/routes/geocode?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setRescheduleForm(prev => ({
            ...prev,
            service_latitude: data.latitude.toString(),
            service_longitude: data.longitude.toString()
          }))
          setLastRescheduleGeocode(address)
        }
      } catch (error) {
        // silent on auto-geocode
      } finally {
        setRescheduleGeoLoading(false)
      }
    }, 800)
    return () => clearTimeout(timeout)
  }, [rescheduleForm.service_address, lastRescheduleGeocode])

  const loadTicket = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/tickets/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        setTicket(data)
        setRescheduleForm({
          service_address: data.service_address || '',
          service_latitude: data.service_latitude || '',
          service_longitude: data.service_longitude || '',
          preferred_date: '',
          reason: ''
        })
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading ticket:', error)
      setLoading(false)
    }
  }

  const handleReschedule = async () => {
    if (!rescheduleForm.preferred_date || !rescheduleForm.reason) {
      alert('Please provide preferred date and reason')
      return
    }

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/tickets/${id}/reschedule`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          service_address: rescheduleForm.service_address,
          service_latitude: rescheduleForm.service_latitude,
          service_longitude: rescheduleForm.service_longitude,
          preferred_date: rescheduleForm.preferred_date,
          reason: rescheduleForm.reason
        })
      })

      if (response.ok) {
        alert('Ticket rescheduled successfully')
        setShowRescheduleModal(false)
        loadTicket()
        router.push('/customer/dashboard')
      } else {
        const error = await response.json()
        alert(error.detail || 'Error rescheduling ticket')
      }
    } catch (error) {
      console.error('Error rescheduling ticket:', error)
      alert('Error rescheduling ticket')
    }
  }

  const handleSubmitFeedback = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/tickets/${id}/feedback`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(feedbackForm)
      })
      if (response.ok) {
        setFeedbackSubmitted(true)
        loadTicket()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error submitting feedback')
      }
    } catch (error) {
      alert('Error submitting feedback')
    }
  }

  if (loading || !ticket) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ticket...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl mb-2">{ticket.ticket_number}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={
                    ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                    ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'assigned' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-yellow-100 text-yellow-700'
                  }>
                    {ticket.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={
                    ticket.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                    'bg-blue-100 text-blue-700'
                  }>
                    {ticket.priority}
                  </Badge>
                </div>
              </div>
              {ticket.status === 'assigned' && (
                <Button
                  onClick={() => setShowRescheduleModal(true)}
                  variant="outline"
                >
                  <Calendar size={16} className="mr-2" />
                  Reschedule
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Issue Description</h3>
              <p className="text-gray-700">{ticket.issue_description}</p>
            </div>

            {(ticket.parent_ticket || (ticket.follow_up_tickets && ticket.follow_up_tickets.length > 0)) && (
              <div>
                <h3 className="font-semibold mb-2">Related Tickets</h3>
                {ticket.parent_ticket && (
                  <div className="text-sm text-gray-700">
                    Follow-up of:
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/customer/ticket/${ticket.parent_ticket.id}`)}
                    >
                      {ticket.parent_ticket.ticket_number}
                    </Button>
                  </div>
                )}
                {ticket.follow_up_tickets && ticket.follow_up_tickets.length > 0 && (
                  <div className="mt-2 space-y-1 text-sm text-gray-700">
                    <div className="text-gray-600">Follow-up tickets:</div>
                    {ticket.follow_up_tickets.map((t) => (
                      <Button
                        key={t.id}
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/customer/ticket/${t.id}`)}
                      >
                        {t.ticket_number}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {ticket.issue_photos && ticket.issue_photos.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Photos / Videos</h3>
                <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                  {ticket.issue_photos.map((url, idx) => (
                    <li key={`${url}-${idx}`}>
                      <a href={url} target="_blank" rel="noreferrer" className="hover:underline">{url}</a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MapPin size={16} />
                  Service Address
                </h3>
                <p className="text-gray-700">{ticket.service_address}</p>
                {mapUrl && (
                  <img src={mapUrl} alt="Service location map" className="mt-3 rounded-lg border" />
                )}
              </div>
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Created
                </h3>
                <p className="text-gray-700">{new Date(ticket.created_at).toLocaleString()}</p>
              </div>
            </div>

            {ticket.preferred_time_slots?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Preferred Visit Slots</h3>
                <div className="flex flex-wrap gap-2">
                  {ticket.preferred_time_slots.map((slot, idx) => (
                    <Badge key={`${slot.day}-${slot.slot}-${idx}`} className="bg-gray-100 text-gray-700">
                      {slot.day} {slot.slot}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {ticket.contact_preferences?.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Contact Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {ticket.contact_preferences.map((pref) => (
                    <Badge key={pref} className="bg-blue-100 text-blue-700">{pref}</Badge>
                  ))}
                </div>
              </div>
            )}

            {ticket.assigned_engineer && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <User size={16} />
                  Assigned Engineer
                </h3>
                <p className="text-gray-700">{ticket.assigned_engineer.full_name || 'Engineer Assigned'}</p>
                <div className="mt-2 flex gap-2">
                  <Button variant="outline" size="sm" onClick={fetchTracking}>
                    Track Live Location
                  </Button>
                  {tracking && tracking.latitude && tracking.longitude && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        window.open(`https://www.google.com/maps?q=${tracking.latitude},${tracking.longitude}`, '_blank')
                      }}
                    >
                      Open Map
                    </Button>
                  )}
                </div>
                {trackingError && (
                  <p className="text-xs text-red-600 mt-1">{trackingError}</p>
                )}
              </div>
            )}

            {(ticket.engineer_eta_start || ticket.engineer_eta_end) && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  Engineer ETA
                </h3>
                <p className="text-gray-700">
                  {ticket.engineer_eta_start ? new Date(ticket.engineer_eta_start).toLocaleTimeString() : '—'} - {ticket.engineer_eta_end ? new Date(ticket.engineer_eta_end).toLocaleTimeString() : '—'}
                </p>
              </div>
            )}

            {ticket.sla_deadline && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Clock size={16} />
                  SLA Deadline
                </h3>
                <p className="text-gray-700">{new Date(ticket.sla_deadline).toLocaleString()}</p>
              </div>
            )}

            {ticket.resolution_notes && (
              <div>
                <h3 className="font-semibold mb-2">Resolution Notes</h3>
                <p className="text-gray-700">{ticket.resolution_notes}</p>
              </div>
            )}

            {ticket.status_timeline && (
              <div>
                <h3 className="font-semibold mb-2">Status Timeline</h3>
                <div className="flex flex-wrap items-center gap-2 text-xs text-gray-600">
                  {ticket.status_timeline.map((status, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${status.completed ? 'bg-green-500' : 'bg-gray-300'}`} />
                      <span>{status.label}</span>
                      {idx < ticket.status_timeline.length - 1 && <span>→</span>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {(ticket.status === 'resolved' || ticket.status === 'closed') && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Rate Your Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {feedbackSubmitted || ticket.customer_rating ? (
                <div className="text-sm text-green-700">
                  Thank you for your feedback! Rating: {ticket.customer_rating || feedbackForm.rating}
                </div>
              ) : (
                <>
                  <div>
                    <Label>Rating</Label>
                    <div className="flex gap-2 mt-2">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => setFeedbackForm({ ...feedbackForm, rating })}
                          className={`px-3 py-2 rounded ${feedbackForm.rating >= rating ? 'bg-yellow-400' : 'bg-gray-200'}`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label>Feedback</Label>
                    <Textarea
                      value={feedbackForm.feedback}
                      onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
                      rows={3}
                      placeholder="Share your experience..."
                    />
                  </div>
                  <div>
                    <Label>Dispute (if any)</Label>
                    <div className="flex flex-wrap gap-3 mt-2 text-sm">
                      {['Issue not resolved', 'Came without parts', 'Overcharged', 'Late arrival'].map((tag) => (
                        <label key={tag} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={feedbackForm.dispute_tags.includes(tag)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...feedbackForm.dispute_tags, tag]
                                : feedbackForm.dispute_tags.filter((t) => t !== tag)
                              setFeedbackForm({ ...feedbackForm, dispute_tags: next })
                            }}
                          />
                          <span>{tag}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <Button onClick={handleSubmitFeedback}>
                    Submit Feedback
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
        {aiSummary && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>AI Ticket Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>{aiSummary.summary}</p>
              {aiSummary.highlights && aiSummary.highlights.length > 0 && (
                <ul className="list-disc list-inside text-gray-600">
                  {aiSummary.highlights.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        )}
        {estimate && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Cost Estimate</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>{estimate.note}</p>
              <div className="flex justify-between">
                <span>Labour</span>
                <span>₹{estimate.labour}</span>
              </div>
              {estimate.parts && estimate.parts.length > 0 && (
                <div className="space-y-1">
                  {estimate.parts.map((part) => (
                    <div key={part.part_id} className="flex justify-between">
                      <span>{part.part_name}</span>
                      <span>₹{part.price}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between font-semibold">
                <span>Total</span>
                <span>₹{estimate.total_estimate}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {ticket.follow_up_actions && ticket.follow_up_actions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Follow-up Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              {ticket.follow_up_actions.map((action, idx) => (
                <div key={idx} className="border rounded-lg p-3">
                  <div className="font-semibold">{action.action_type || 'Follow-up'}</div>
                  <div className="text-gray-600">
                    {action.preferred_date ? `Preferred: ${new Date(action.preferred_date).toLocaleString()}` : 'Preferred date pending'}
                  </div>
                  {action.goodwill && <div className="text-gray-600">Goodwill: {action.goodwill}</div>}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reschedule Modal */}
        {showRescheduleModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Reschedule Service</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowRescheduleModal(false)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Preferred Date & Time *</Label>
                  <Input
                    type="datetime-local"
                    value={rescheduleForm.preferred_date}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, preferred_date: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label>Service Address *</Label>
                  <Textarea
                    value={rescheduleForm.service_address}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, service_address: e.target.value})}
                    rows={3}
                    placeholder="Enter service address"
                    required
                  />
                  <div className="mt-2 flex gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={async () => {
                        if (!rescheduleForm.service_address.trim()) return
                        setRescheduleGeoLoading(true)
                        const token = localStorage.getItem('token')
                        try {
                          const params = new URLSearchParams({ address: rescheduleForm.service_address })
                          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/routes/geocode?${params.toString()}`, {
                            headers: { Authorization: `Bearer ${token}` }
                          })
                          const data = await response.json()
                          if (!response.ok) {
                            alert(data.detail || 'Address lookup failed')
                          } else {
                            setRescheduleForm({
                              ...rescheduleForm,
                              service_latitude: data.latitude.toString(),
                              service_longitude: data.longitude.toString()
                            })
                          }
                        } catch (error) {
                          alert('Address lookup failed')
                        } finally {
                          setRescheduleGeoLoading(false)
                        }
                      }}
                      disabled={rescheduleGeoLoading}
                    >
                      {rescheduleGeoLoading ? 'Locating...' : 'Lookup Location'}
                    </Button>
                    {rescheduleForm.service_latitude && rescheduleForm.service_longitude && (
                      <span className="text-xs text-gray-500 self-center">
                        {rescheduleForm.service_latitude}, {rescheduleForm.service_longitude}
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <Label>Reason for Reschedule *</Label>
                  <Textarea
                    value={rescheduleForm.reason}
                    onChange={(e) => setRescheduleForm({...rescheduleForm, reason: e.target.value})}
                    rows={4}
                    placeholder="Please provide a reason for rescheduling..."
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleReschedule} className="flex-1">
                    Submit Reschedule Request
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowRescheduleModal(false)}
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
