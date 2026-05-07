import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { getApiBase } from '@lib/api'
import ComingSoon from '../../../components/ComingSoon'
import PreferredVisitSlots from '../../../components/engineer/PreferredVisitSlots'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'

export default function EngineerTicketDetail({ user }) {
  const router = useRouter()
  const { id } = router.query
  const [ticket, setTicket] = useState(null)
  const [copilotQuery, setCopilotQuery] = useState('')
  const [copilotResponse, setCopilotResponse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [inventoryParts, setInventoryParts] = useState([])
  const [partsUsed, setPartsUsed] = useState([])
  const [partSelection, setPartSelection] = useState({ part_id: '', quantity: 1 })
  const [resolutionNotes, setResolutionNotes] = useState('')
  const [resolutionPhotos, setResolutionPhotos] = useState([])
  const [resolutionPhotoInput, setResolutionPhotoInput] = useState('')
  const [resolutionPhotoFile, setResolutionPhotoFile] = useState(null)
  const [partPhotoFile, setPartPhotoFile] = useState(null)
  const [partPhotoUrl, setPartPhotoUrl] = useState('')
  const [etaStart, setEtaStart] = useState('')
  const [etaEnd, setEtaEnd] = useState('')
  const [arrivalStatus, setArrivalStatus] = useState(null)
  const [customerSignature, setCustomerSignature] = useState('')
  const [customerOtpVerified, setCustomerOtpVerified] = useState(false)
  const [escalationForm, setEscalationForm] = useState({
    escalation_type: 'technical_issue',
    escalation_level: 'city',
    reason: ''
  })
  const [routeInfo, setRouteInfo] = useState(null)
  const [routeLoading, setRouteLoading] = useState(false)
  const [routeError, setRouteError] = useState(null)
  const [mapUrl, setMapUrl] = useState(null)
  const [shareLocationLoading, setShareLocationLoading] = useState(false)
  const [aiSummary, setAiSummary] = useState(null)
  const [aiChecklist, setAiChecklist] = useState(null)
  const [aiParts, setAiParts] = useState(null)
  const [aiSlaRisk, setAiSlaRisk] = useState(null)
  const [aiSatisfactionRisk, setAiSatisfactionRisk] = useState(null)
  const [photoQuality, setPhotoQuality] = useState(null)
  const [partsRequestLoading, setPartsRequestLoading] = useState(false)
  const [acceptLoading, setAcceptLoading] = useState(false)
  const [startOtpInput, setStartOtpInput] = useState('')
  const [startOtpLoading, setStartOtpLoading] = useState(false)
  const [completionOtpInput, setCompletionOtpInput] = useState('')
  const [completionOtpLoading, setCompletionOtpLoading] = useState(false)
  const [otpEscalateOpen, setOtpEscalateOpen] = useState(false)
  const [otpEscalateReason, setOtpEscalateReason] = useState(
    'Customer did not provide the completion OTP after it was requested. Please review and close the ticket if appropriate.'
  )
  const [otpEscalateLoading, setOtpEscalateLoading] = useState(false)

  useEffect(() => {
    if (!id) return

    const token = localStorage.getItem('token')
    fetch(`${getApiBase()}/tickets/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setTicket(data)
        setResolutionNotes(data.resolution_notes || '')
        setResolutionPhotos(data.resolution_photos || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [id])

  useEffect(() => {
    if (!ticket) return
    if (ticket.service_latitude && ticket.service_longitude && !routeInfo && !routeLoading) {
      getRoute()
    }
  }, [ticket])

  useEffect(() => {
    if (!ticket) return
    const token = localStorage.getItem('token')
    const cityId = ticket.city_id
    const url = cityId
      ? `${getApiBase()}/inventory/stock?city_id=${cityId}`
      : (getApiBase()) + '/inventory/stock'
    fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setInventoryParts(Array.isArray(data) ? data : [])
      })
      .catch(err => console.error('Inventory error:', err))
  }, [ticket])

  useEffect(() => {
    if (!ticket) return
    const token = localStorage.getItem('token')
    const fetchAi = async () => {
      try {
        const [summaryRes, checklistRes, partsRes, riskRes, satisfactionRes] = await Promise.all([
          fetch((getApiBase()) + '/ai/tickets/summary', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          }),
          fetch((getApiBase()) + '/ai/tickets/checklist', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          }),
          fetch((getApiBase()) + '/ai/tickets/parts-suggestions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          }),
          fetch((getApiBase()) + '/ai/tickets/sla-risk', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          }),
          fetch((getApiBase()) + '/ai/tickets/satisfaction-risk', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          })
        ])
        if (summaryRes.ok) setAiSummary(await summaryRes.json())
        if (checklistRes.ok) setAiChecklist(await checklistRes.json())
        if (partsRes.ok) setAiParts(await partsRes.json())
        if (riskRes.ok) setAiSlaRisk(await riskRes.json())
        if (satisfactionRes.ok) setAiSatisfactionRisk(await satisfactionRes.json())
      } catch (error) {
        // ignore AI errors
      }
    }
    fetchAi()
  }, [ticket])

  const generateAutoNotes = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch((getApiBase()) + '/ai/tickets/auto-notes', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticket.id })
      })
      if (response.ok) {
        const data = await response.json()
        setResolutionNotes(data.notes || resolutionNotes)
      }
    } catch (error) {
      // ignore
    }
  }

  const checkPhotoQuality = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch((getApiBase()) + '/ai/photos/quality', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: [...(ticket.issue_photos || []), ...(resolutionPhotos || [])] })
      })
      if (response.ok) {
        setPhotoQuality(await response.json())
      }
    } catch (error) {
      // ignore
    }
  }

  const askCopilot = async () => {
    if (!copilotQuery) return

    const token = localStorage.getItem('token')
    try {
      const response = await fetch((getApiBase()) + '/ai/copilot/query', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: copilotQuery,
          language: 'en'
        }),
      })

      const data = await response.json()
      setCopilotResponse(data)
    } catch (err) {
      console.error('Copilot error:', err)
    }
  }

  const resolveTicket = async () => {
    if (!resolutionNotes.trim()) {
      alert('Please enter resolution notes')
      return
    }
    const payload = {
      resolution_notes: resolutionNotes,
      resolution_photos: resolutionPhotos,
      parts_used: partsUsed,
      customer_signature: customerSignature || undefined,
      customer_otp_verified: customerOtpVerified
    }
    if (completionOtpInput.trim()) payload.otp = completionOtpInput.trim()

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (response.ok) {
        router.push('/engineer/dashboard')
      } else {
        alert(data.detail || 'Error resolving ticket')
      }
    } catch (err) {
      alert('Error resolving ticket')
    }
  }

  const confirmArrival = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }
    navigator.geolocation.getCurrentPosition(async (position) => {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch(`${getApiBase()}/tickets/${id}/arrival`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            arrival_latitude: position.coords.latitude.toString(),
            arrival_longitude: position.coords.longitude.toString()
          })
        })
        if (response.ok) {
          setArrivalStatus('confirmed')
        } else {
          setArrivalStatus('failed')
        }
      } catch (err) {
        setArrivalStatus('failed')
      }
    })
  }

  const shareLiveLocation = async () => {
    if (!navigator.geolocation) {
      alert('Geolocation not supported')
      return
    }
    setShareLocationLoading(true)
    navigator.geolocation.getCurrentPosition(async (position) => {
      const token = localStorage.getItem('token')
      try {
        const response = await fetch((getApiBase()) + '/users/me/location', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          })
        })
        if (!response.ok) {
          const data = await response.json()
          alert(data.detail || 'Location update failed')
        }
      } catch (error) {
        alert('Location update failed')
      } finally {
        setShareLocationLoading(false)
      }
    })
  }

  const acceptTicket = async () => {
    const token = localStorage.getItem('token')
    setAcceptLoading(true)
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/accept`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        const refreshed = await fetch(`${getApiBase()}/tickets/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        if (refreshed.ok) setTicket(await refreshed.json())
        alert(data.message || 'Ticket accepted. Wait for city admin to approve start.')
      } else {
        alert(data.detail || 'Failed to accept')
      }
    } catch (err) {
      alert('Error accepting ticket')
    } finally {
      setAcceptLoading(false)
    }
  }

  const requestStartOtp = async () => {
    const token = localStorage.getItem('token')
    setStartOtpLoading(true)
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/request-start-otp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        alert(data.message || 'OTP sent to customer email. Ask customer for OTP and enter below.')
      } else {
        alert(data.detail || 'Failed to send OTP')
      }
    } catch (err) {
      alert('Error requesting start OTP')
    } finally {
      setStartOtpLoading(false)
    }
  }

  const verifyStartOtp = async () => {
    if (!startOtpInput.trim()) {
      alert('Enter OTP from customer')
      return
    }
    const token = localStorage.getItem('token')
    setStartOtpLoading(true)
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/verify-start-otp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: startOtpInput.trim() })
      })
      const data = await response.json()
      if (response.ok) {
        const refreshed = await fetch(`${getApiBase()}/tickets/${id}`, { headers: { 'Authorization': `Bearer ${token}` } })
        if (refreshed.ok) setTicket(await refreshed.json())
        setStartOtpInput('')
        alert(data.message || 'Service started.')
      } else {
        alert(data.detail || 'Invalid OTP')
      }
    } catch (err) {
      alert('Error verifying OTP')
    } finally {
      setStartOtpLoading(false)
    }
  }

  const requestCompletionOtp = async () => {
    const token = localStorage.getItem('token')
    setCompletionOtpLoading(true)
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/request-completion-otp`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })
      const data = await response.json()
      if (response.ok) {
        alert(data.message || 'Completion OTP sent to customer. Enter it below when resolving.')
      } else {
        alert(data.detail || 'Failed to send OTP')
      }
    } catch (err) {
      alert('Error requesting completion OTP')
    } finally {
      setCompletionOtpLoading(false)
    }
  }

  const startJobWithEta = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eta_start: etaStart || null,
          eta_end: etaEnd || null
        })
      })
      if (response.ok) {
        const refreshed = await fetch(`${getApiBase()}/tickets/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
        const data = await refreshed.json()
        setTicket(data)
      }
    } catch (err) {
      alert('Error starting job')
    }
  }

  const addPartUsage = () => {
    if (!partSelection.part_id) return
    const selected = inventoryParts.find(p => p.part_id.toString() === partSelection.part_id)
    if (!selected) return
    setPartsUsed([
      ...partsUsed,
      {
        part_id: selected.part_id,
        part_name: selected.part_name,
        sku: selected.sku,
        quantity: parseInt(partSelection.quantity, 10),
        part_photo_url: partPhotoUrl || null
      }
    ])
    setPartSelection({ part_id: '', quantity: 1 })
    setPartPhotoUrl('')
    setPartPhotoFile(null)
  }

  const uploadResolutionPhoto = async () => {
    if (!resolutionPhotoFile) {
      alert('Please select a photo')
      return
    }
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('photo', resolutionPhotoFile)
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/resolution-photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      if (response.ok && data.url) {
        setResolutionPhotos([...resolutionPhotos, data.url])
        setResolutionPhotoFile(null)
      } else {
        alert(data.detail || 'Failed to upload photo')
      }
    } catch (error) {
      alert('Failed to upload photo')
    }
  }

  const uploadPartPhoto = async () => {
    if (!partPhotoFile) {
      alert('Please select a photo')
      return
    }
    const token = localStorage.getItem('token')
    const formData = new FormData()
    formData.append('photo', partPhotoFile)
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/parts/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      })
      const data = await response.json()
      if (response.ok && data.url) {
        setPartPhotoUrl(data.url)
      } else {
        alert(data.detail || 'Failed to upload part photo')
      }
    } catch (error) {
      alert('Failed to upload part photo')
    }
  }

  const requestPartsApproval = async () => {
    if (partsUsed.length === 0) {
      alert('Please add parts before requesting approval')
      return
    }
    const token = localStorage.getItem('token')
    setPartsRequestLoading(true)
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/parts/request`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ parts: partsUsed })
      })
      const data = await response.json()
      if (response.ok) {
        alert('Parts approval requested')
      } else {
        alert(data.detail || 'Failed to request parts approval')
      }
    } catch (error) {
      alert('Failed to request parts approval')
    } finally {
      setPartsRequestLoading(false)
    }
  }

  const submitEscalation = async () => {
    if (!escalationForm.reason.trim()) {
      alert('Please provide a reason for escalation')
      return
    }
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/escalate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(escalationForm)
      })
      if (response.ok) {
        alert('Escalation submitted')
        const refreshed = await fetch(`${getApiBase()}/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (refreshed.ok) setTicket(await refreshed.json())
      } else {
        const error = await response.json()
        alert(error.detail || 'Error escalating')
      }
    } catch (err) {
      alert('Error escalating')
    }
  }

  const submitOtpEscalationToCityAdmin = async () => {
    if (!otpEscalateReason.trim()) {
      alert('Please describe why the OTP cannot be obtained.')
      return
    }
    const token = localStorage.getItem('token')
    setOtpEscalateLoading(true)
    try {
      const response = await fetch(`${getApiBase()}/tickets/${id}/escalate`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          escalation_type: 'other',
          escalation_level: 'city',
          reason: otpEscalateReason.trim(),
          extra_data: { subtype: 'completion_otp_not_provided' }
        })
      })
      const data = await response.json().catch(() => ({}))
      if (response.ok) {
        setOtpEscalateOpen(false)
        alert(data.message || 'Escalated to City Admin. They can close the ticket without OTP.')
        const refreshed = await fetch(`${getApiBase()}/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } })
        if (refreshed.ok) setTicket(await refreshed.json())
      } else {
        alert(data.detail || 'Could not escalate')
      }
    } catch (e) {
      alert('Could not escalate')
    } finally {
      setOtpEscalateLoading(false)
    }
  }

  const getRoute = async () => {
    if (!ticket?.service_latitude || !ticket?.service_longitude) {
      setRouteError('Service coordinates are missing. Please update address with location.')
      return
    }
    if (!navigator.geolocation) {
      setRouteError('Geolocation not supported')
      return
    }
    setRouteLoading(true)
    setRouteError(null)
    navigator.geolocation.getCurrentPosition(async (position) => {
      const token = localStorage.getItem('token')
      try {
        const params = new URLSearchParams({
          origin_lat: position.coords.latitude.toString(),
          origin_lng: position.coords.longitude.toString(),
          dest_lat: ticket.service_latitude,
          dest_lng: ticket.service_longitude
        })
        const response = await fetch(`${getApiBase()}/routes/directions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (!response.ok) {
          setRouteError(data.detail || 'Unable to fetch route')
        } else {
          setRouteInfo(data)
          const mapRes = await fetch(`${getApiBase()}/routes/static-map?latitude=${ticket.service_latitude}&longitude=${ticket.service_longitude}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
          const mapData = await mapRes.json()
          if (mapRes.ok) {
            setMapUrl(mapData.map_url)
          }
        }
      } catch (error) {
        setRouteError('Unable to fetch route')
      } finally {
        setRouteLoading(false)
      }
    })
  }

  if (loading || !ticket) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  const isAdminViewOnly = user && ['city_admin', 'state_admin', 'country_admin', 'organization_admin', 'platform_admin'].includes(user.role) && (ticket.assigned_engineer_id == null || Number(user.id) !== Number(ticket.assigned_engineer_id))

  const statusVariant = (s) => {
    const v = (s || '').toLowerCase()
    if (v === 'resolved' || v === 'closed') return 'bg-emerald-100 text-emerald-800 border-emerald-200'
    if (v === 'escalated') return 'bg-amber-100 text-amber-900 border-amber-200'
    if (v === 'in_progress') return 'bg-blue-100 text-blue-800 border-blue-200'
    return 'bg-slate-100 text-slate-800 border-slate-200'
  }
  const priorityVariant = (p) => {
    const v = (p || '').toLowerCase()
    if (v === 'urgent') return 'bg-red-100 text-red-800 border-red-200'
    if (v === 'high') return 'bg-orange-100 text-orange-900 border-orange-200'
    return 'bg-slate-100 text-slate-700 border-slate-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button variant="ghost" className="mb-4 -ml-2 text-blue-700 font-medium" onClick={() => router.push('/engineer/dashboard')}>
            ← Back to Dashboard
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Service ticket</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">{ticket.ticket_number}</h1>
              {ticket.issue_category && (
                <p className="mt-1 text-slate-600">Category: <span className="font-medium text-slate-800">{ticket.issue_category}</span></p>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={`border px-3 py-1 text-sm font-semibold ${statusVariant(ticket.status)}`}>
                {(ticket.status || '').replace(/_/g, ' ')}
              </Badge>
              <Badge variant="outline" className={`border px-3 py-1 text-sm font-semibold ${priorityVariant(ticket.priority)}`}>
                {(ticket.priority || 'medium').toString()} priority
              </Badge>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm">
            {ticket.sla_deadline && (
              <span>
                <span className="font-semibold text-slate-800">SLA target </span>
                {new Date(ticket.sla_deadline).toLocaleString(undefined, {
                  dateStyle: 'medium',
                  timeStyle: 'short'
                })}
              </span>
            )}
            {ticket.device && (
              <span>
                <span className="font-semibold text-slate-800">Device </span>
                {[ticket.device.brand, ticket.device.model_number].filter(Boolean).join(' ')}
                {ticket.device.serial_number ? ` · SN ${ticket.device.serial_number}` : ''}
              </span>
            )}
            {ticket.warranty_status && (
              <span>
                <span className="font-semibold text-slate-800">Warranty </span>
                {String(ticket.warranty_status).replace(/_/g, ' ')}
                {ticket.is_chargeable != null ? (ticket.is_chargeable ? ' · chargeable' : ' · not chargeable') : ''}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Ticket Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200/80 shadow-md overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 pb-4">
                <CardTitle className="text-xl text-slate-900">Issue details</CardTitle>
                <p className="text-sm text-slate-500 font-normal">What the customer reported and where service is needed</p>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
              <p className="text-slate-800 leading-relaxed whitespace-pre-wrap">{ticket.issue_description}</p>
              {(ticket.parent_ticket || (ticket.follow_up_tickets && ticket.follow_up_tickets.length > 0)) && (
                <div className="mt-4 text-sm text-gray-700">
                  {ticket.parent_ticket && (
                    <div>
                      Follow-up of:
                      <button
                        onClick={() => router.push(`/engineer/ticket/${ticket.parent_ticket.id}`)}
                        className="ml-2 text-blue-600 hover:underline"
                      >
                        {ticket.parent_ticket.ticket_number}
                      </button>
                    </div>
                  )}
                  {ticket.follow_up_tickets && ticket.follow_up_tickets.length > 0 && (
                    <div className="mt-2">
                      Follow-up tickets:
                      {ticket.follow_up_tickets.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => router.push(`/engineer/ticket/${t.id}`)}
                          className="ml-2 text-blue-600 hover:underline"
                        >
                          {t.ticket_number}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="mt-4 text-sm text-gray-600">
                <div><strong>Address:</strong> {ticket.service_address}</div>
                {ticket.device && (
                  <div className="mt-1">
                    <strong>Device:</strong> {ticket.device.brand} {ticket.device.model_number} (SN: {ticket.device.serial_number})
                  </div>
                )}
                {ticket.warranty_status && (
                  <div className="mt-1">
                    <strong>Warranty:</strong> {ticket.warranty_status.replace('_', ' ')} {ticket.is_chargeable ? '(chargeable)' : '(not chargeable)'}
                  </div>
                )}
                {(ticket?.otp_start_verified_at ||
                  ticket?.otp_complete_verified_at ||
                  ticket?.customer_otp_verified) && (
                  <div className="mt-2 rounded-md bg-slate-50 border border-slate-100 px-2 py-1.5 text-xs text-slate-600 space-y-0.5">
                    {ticket.otp_start_verified_at && (
                      <div>
                        Start-work OTP verified: {new Date(ticket.otp_start_verified_at).toLocaleString()}
                      </div>
                    )}
                    {(ticket.otp_complete_verified_at || ticket.customer_otp_verified) && (
                      <div>
                        Completion OTP verified:{' '}
                        {ticket.otp_complete_verified_at
                          ? new Date(ticket.otp_complete_verified_at).toLocaleString()
                          : '(flag set)'}
                      </div>
                    )}
                  </div>
                )}
                {ticket.oem_instructions && (
                  <div className="mt-1 text-amber-700">
                    <strong>OEM Instructions:</strong> {ticket.oem_instructions}
                  </div>
                )}
              </div>
              {ticket.issue_photos?.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Customer Photos/Videos</h4>
                  <ul className="list-disc list-inside text-sm text-blue-600 space-y-1">
                    {ticket.issue_photos.map((url, idx) => (
                      <li key={`${url}-${idx}`}>
                        <a href={url} target="_blank" rel="noreferrer" className="hover:underline">{url}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              </CardContent>
            </Card>

            <Card className="border-slate-200/80 shadow-md">
              <CardHeader className="pb-2 border-b border-slate-100 bg-gradient-to-r from-teal-50/50 to-transparent">
                <CardTitle className="text-lg text-slate-900">Customer preferred visit slots</CardTitle>
                <p className="text-sm text-slate-500 font-normal">When the customer prefers the engineer to visit</p>
              </CardHeader>
              <CardContent className="pt-4">
                <PreferredVisitSlots slots={ticket.preferred_time_slots} variant="embedded" />
              </CardContent>
            </Card>

            {(aiSummary || aiChecklist || aiParts || aiSlaRisk) && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-semibold">AI Insights</h2>
                  <ComingSoon variant="badge" message="Coming Soon" />
                </div>
                {aiSummary && (
                  <div>
                    <h3 className="font-semibold">Summary</h3>
                    <p className="text-sm text-gray-700">{aiSummary.summary}</p>
                    {aiSummary.highlights?.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-2">
                        {aiSummary.highlights.map((item, idx) => (
                          <li key={idx}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {aiChecklist && (
                  <div>
                    <h3 className="font-semibold">Checklist</h3>
                    <ol className="list-decimal list-inside text-sm text-gray-700">
                      {aiChecklist.steps?.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {aiParts && (
                  <div>
                    <h3 className="font-semibold">Suggested Parts</h3>
                    {aiParts.suggestions?.length > 0 ? (
                      <ul className="list-disc list-inside text-sm text-gray-700">
                        {aiParts.suggestions.map((part, idx) => (
                          <li key={idx}>
                            {part.part_name || part.part_id} (confidence {Math.round((part.confidence || 0) * 100)}%)
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-600">{aiParts.note}</p>
                    )}
                  </div>
                )}
                {aiSlaRisk && (
                  <div>
                    <h3 className="font-semibold">SLA Risk</h3>
                    <p className="text-sm text-gray-700">Risk score: {aiSlaRisk.sla_breach_risk ?? 'n/a'}</p>
                    {aiSlaRisk.reasons?.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {aiSlaRisk.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {aiSatisfactionRisk && (
                  <div>
                    <h3 className="font-semibold">Satisfaction Risk</h3>
                    <p className="text-sm text-gray-700">Risk score: {aiSatisfactionRisk.risk_score ?? 'n/a'}</p>
                    {aiSatisfactionRisk.reasons?.length > 0 && (
                      <ul className="list-disc list-inside text-sm text-gray-600 mt-1">
                        {aiSatisfactionRisk.reasons.map((reason, idx) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {photoQuality && (
                  <div>
                    <h3 className="font-semibold">Photo Quality</h3>
                    <p className="text-sm text-gray-700">Overall: {photoQuality.overall_quality}</p>
                  </div>
                )}
              </div>
            )}

            {ticket.ai_triage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-blue-900">AI Triage Suggestions</h3>
                  <ComingSoon variant="badge" message="Coming Soon" />
                </div>
                <p><strong>Category:</strong> {ticket.ai_triage.category}</p>
                <p><strong>Suggested Parts:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  {ticket.ai_triage.suggested_parts?.map((part, idx) => (
                    <li key={idx}>{part.part_name}</li>
                  ))}
                </ul>
              </div>
            )}

            {isAdminViewOnly && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
                <strong>Admin view.</strong> You are viewing this ticket as an admin. Only the assigned engineer can update ETA, confirm arrival, add parts, or resolve the ticket. Use your dashboard to reassign or approve actions.
              </div>
            )}

            {!isAdminViewOnly && (
            <>
            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">On-site Workflow</h2>
              {ticket.status === 'assigned' && (
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 space-y-2">
                  <p className="font-medium text-amber-900">Start service (OTP + hierarchy approval)</p>
                  {!ticket.start_approval && (
                    <button
                      onClick={acceptTicket}
                      disabled={acceptLoading}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
                    >
                      {acceptLoading ? 'Accepting...' : 'Accept ticket'}
                    </button>
                  )}
                  {ticket.start_approval?.status === 'pending' && (
                    <p className="text-amber-800 text-sm">Start approval pending from city admin. You can request start OTP after approval.</p>
                  )}
                  {ticket.start_approval?.status === 'approved' && (
                    <div className="space-y-2">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={requestStartOtp}
                          disabled={startOtpLoading}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {startOtpLoading ? 'Sending...' : 'Request start OTP (sends to customer email)'}
                        </button>
                        <input
                          type="text"
                          value={startOtpInput}
                          onChange={(e) => setStartOtpInput(e.target.value)}
                          placeholder="Enter OTP from customer"
                          className="px-3 py-2 border border-gray-300 rounded-lg w-32"
                          maxLength={6}
                        />
                        <button
                          onClick={verifyStartOtp}
                          disabled={startOtpLoading || !startOtpInput.trim()}
                          className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                        >
                          {startOtpLoading ? 'Verifying...' : 'Verify & start service'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">ETA Start</label>
                  <input
                    type="datetime-local"
                    value={etaStart}
                    onChange={(e) => setEtaStart(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">ETA End</label>
                  <input
                    type="datetime-local"
                    value={etaEnd}
                    onChange={(e) => setEtaEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {ticket.status === 'assigned' && ticket.start_approval?.status === 'approved' && (
                  <span className="text-sm text-gray-500 self-center">Use OTP flow above to start.</span>
                )}
                {ticket.status === 'assigned' && !ticket.start_approval?.status && (
                  <span className="text-sm text-gray-500 self-center">Accept ticket first.</span>
                )}
                {ticket.status === 'assigned' && (
                  <button
                    onClick={startJobWithEta}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    title="Alternative: use OTP flow above for customer verification"
                  >
                    Start Job (no OTP)
                  </button>
                )}
                {ticket.status === 'in_progress' && (
                  <button
                    onClick={startJobWithEta}
                    className="hidden"
                  />
                )}
                <button
                  onClick={confirmArrival}
                  className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  Confirm Arrival
                </button>
                <button
                  onClick={shareLiveLocation}
                  className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-800"
                >
                  {shareLocationLoading ? 'Sharing...' : 'Share Location'}
                </button>
                <button
                  onClick={getRoute}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  {routeLoading ? 'Routing...' : 'Get Route'}
                </button>
                <button
                  onClick={generateAutoNotes}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700"
                >
                  Generate Notes
                </button>
                <button
                  onClick={checkPhotoQuality}
                  className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
                >
                  Check Photo Quality
                </button>
                {arrivalStatus === 'confirmed' && (
                  <span className="text-green-600 text-sm self-center">Arrival confirmed</span>
                )}
              </div>
              {routeError && (
                <div className="text-sm text-red-600">{routeError}</div>
              )}
              {routeInfo && (
                <div className="text-sm text-gray-700">
                  <div>Distance: {(routeInfo.distance_m / 1000).toFixed(1)} km</div>
                  <div>ETA: {Math.round(routeInfo.duration_s / 60)} min</div>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${ticket.service_latitude},${ticket.service_longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Open in Maps
                  </a>
                </div>
              )}
              {mapUrl && (
                <div className="mt-3">
                  <img src={mapUrl} alt="Map preview" className="w-full rounded-lg border" />
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Parts Used</h2>
              <div className="flex gap-2">
                <select
                  value={partSelection.part_id}
                  onChange={(e) => setPartSelection({ ...partSelection, part_id: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Select part</option>
                  {inventoryParts.map((part) => (
                    <option key={part.id} value={part.part_id}>
                      {part.part_name} (Stock: {part.current_stock})
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  min="1"
                  value={partSelection.quantity}
                  onChange={(e) => setPartSelection({ ...partSelection, quantity: e.target.value })}
                  className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
                />
                <button
                  onClick={addPartUsage}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPartPhotoFile(e.target.files?.[0] || null)}
                  className="text-sm"
                />
                <button
                  onClick={uploadPartPhoto}
                  className="bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-800"
                >
                  Upload Part Photo
                </button>
                {partPhotoUrl && (
                  <a href={partPhotoUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                    View uploaded
                  </a>
                )}
              </div>
              {partsUsed.length > 0 && (
                <ul className="text-sm text-gray-600 space-y-2">
                  {partsUsed.map((part, idx) => (
                    <li key={`${part.part_id}-${idx}`} className="flex justify-between items-center border rounded p-2">
                      <span>
                        {part.part_name} (Qty: {part.quantity})
                        {part.part_photo_url && (
                          <a href={part.part_photo_url} target="_blank" rel="noreferrer" className="ml-2 text-blue-600 hover:underline">
                            Photo
                          </a>
                        )}
                      </span>
                      <button
                        onClick={() => setPartsUsed(partsUsed.filter((_, i) => i !== idx))}
                        className="text-red-600"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <div className="flex gap-2">
                <button
                  onClick={requestPartsApproval}
                  disabled={partsRequestLoading || partsUsed.length === 0}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                >
                  {partsRequestLoading ? 'Requesting...' : 'Request Parts Approval'}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Resolution</h2>
              <textarea
                rows={5}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter resolution notes..."
              />
              <div>
                <label className="block text-sm text-gray-600 mb-1">Resolution Photos (URLs)</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={resolutionPhotoInput}
                    onChange={(e) => setResolutionPhotoInput(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Paste photo URL"
                  />
                  <button
                    onClick={() => {
                      if (!resolutionPhotoInput.trim()) return
                      setResolutionPhotos([...resolutionPhotos, resolutionPhotoInput.trim()])
                      setResolutionPhotoInput('')
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    Add
                  </button>
                </div>
                <div className="flex items-center gap-3 mt-2 text-sm">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setResolutionPhotoFile(e.target.files?.[0] || null)}
                    className="text-sm"
                  />
                  <button
                    onClick={uploadResolutionPhoto}
                    className="bg-gray-700 text-white px-3 py-1 rounded-lg hover:bg-gray-800"
                  >
                    Upload Photo
                  </button>
                </div>
                {resolutionPhotos.length > 0 && (
                  <ul className="text-sm text-gray-600 mt-2 space-y-1">
                    {resolutionPhotos.map((url, idx) => (
                      <li key={`${url}-${idx}`} className="flex justify-between">
                        <span className="truncate">{url}</span>
                        <button
                          onClick={() => setResolutionPhotos(resolutionPhotos.filter((_, i) => i !== idx))}
                          className="text-red-600"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50 to-indigo-50/40 p-4 space-y-3 shadow-sm">
                <p className="font-semibold text-blue-950 text-sm">Completion OTP (sent to customer email)</p>
                <p className="text-xs text-blue-900/80">Ask the customer for the code after you tap Request. If they cannot provide it, escalate to City Admin — they can close the ticket without OTP.</p>
                <div className="flex flex-col sm:flex-row gap-2 sm:items-center flex-wrap">
                  <Button
                    type="button"
                    onClick={requestCompletionOtp}
                    disabled={completionOtpLoading}
                  >
                    {completionOtpLoading ? 'Sending...' : 'Request completion OTP'}
                  </Button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={completionOtpInput}
                    onChange={(e) => setCompletionOtpInput(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="px-3 py-2 border border-blue-200 rounded-lg w-36 bg-white text-slate-900"
                    maxLength={6}
                  />
                  <Button type="button" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-50" onClick={() => setOtpEscalateOpen(true)}>
                    No OTP from customer — escalate to City Admin
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">Customer Signature (URL/Base64)</label>
                  <input
                    value={customerSignature}
                    onChange={(e) => setCustomerSignature(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Paste signature URL or base64"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={customerOtpVerified}
                    onChange={(e) => setCustomerOtpVerified(e.target.checked)}
                  />
                  <span className="text-gray-700">OTP verified</span>
                </div>
              </div>
              <button
                onClick={resolveTicket}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
              >
                Mark as Resolved
              </button>
            </div>
            </>
            )}

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">Escalations & Safety</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="block text-gray-600 mb-1">Escalation Type</label>
                  <select
                    value={escalationForm.escalation_type}
                    onChange={(e) => setEscalationForm({ ...escalationForm, escalation_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="technical_issue">Technical issue</option>
                    <option value="parts_unavailable">Parts unavailable</option>
                    <option value="unsafe_condition">Unsafe to proceed</option>
                    <option value="customer_request">Customer request</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-600 mb-1">Escalation Level</label>
                  <select
                    value={escalationForm.escalation_level}
                    onChange={(e) => setEscalationForm({ ...escalationForm, escalation_level: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="city">City Admin</option>
                    <option value="state">State Admin</option>
                    <option value="country">Country Admin</option>
                  </select>
                </div>
              </div>
              <textarea
                rows={3}
                value={escalationForm.reason}
                onChange={(e) => setEscalationForm({ ...escalationForm, reason: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Describe the issue or unsafe condition..."
              />
              <button
                onClick={submitEscalation}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
              >
                Escalate Case
              </button>
            </div>
          </div>

          {/* AI Copilot Sidebar */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl font-semibold">AI Copilot Assistant</h2>
              <ComingSoon variant="badge" message="Coming Soon" />
            </div>
            <ComingSoon variant="card" message="AI Copilot – Coming Soon" />
          </div>
        </div>
      </div>

      {otpEscalateOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="otp-escalate-title"
        >
          <Card className="w-full max-w-lg shadow-2xl border-slate-200">
            <CardHeader>
              <CardTitle id="otp-escalate-title">Escalate to City Admin (no completion OTP)</CardTitle>
              <p className="text-sm text-slate-500 font-normal pt-1">
                City Admin can review and close the ticket without customer OTP when justified.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700">Reason</label>
                <textarea
                  rows={4}
                  className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  value={otpEscalateReason}
                  onChange={(e) => setOtpEscalateReason(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOtpEscalateOpen(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={submitOtpEscalationToCityAdmin} disabled={otpEscalateLoading}>
                  {otpEscalateLoading ? 'Sending…' : 'Submit escalation'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}




