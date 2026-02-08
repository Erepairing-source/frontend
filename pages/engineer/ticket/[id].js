import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

export default function EngineerTicketDetail() {
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

  useEffect(() => {
    if (!id) return

    const token = localStorage.getItem('token')
    fetch(`http://localhost:8000/api/v1/tickets/${id}`, {
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
      ? `http://localhost:8000/api/v1/inventory/stock?city_id=${cityId}`
      : 'http://localhost:8000/api/v1/inventory/stock'
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
          fetch('http://localhost:8000/api/v1/ai/tickets/summary', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          }),
          fetch('http://localhost:8000/api/v1/ai/tickets/checklist', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          }),
          fetch('http://localhost:8000/api/v1/ai/tickets/parts-suggestions', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          }),
          fetch('http://localhost:8000/api/v1/ai/tickets/sla-risk', {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ ticket_id: ticket.id })
          }),
          fetch('http://localhost:8000/api/v1/ai/tickets/satisfaction-risk', {
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
      const response = await fetch('http://localhost:8000/api/v1/ai/tickets/auto-notes', {
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
      const response = await fetch('http://localhost:8000/api/v1/ai/photos/quality', {
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
      const response = await fetch('http://localhost:8000/api/v1/ai/copilot/query', {
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

    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tickets/${id}/resolve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          resolution_notes: resolutionNotes,
          parts_used: partsUsed,
          resolution_photos: resolutionPhotos,
          customer_signature: customerSignature || null,
          customer_otp_verified: customerOtpVerified
        }),
      })

      if (response.ok) {
        router.push('/engineer/dashboard')
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
        const response = await fetch(`http://localhost:8000/api/v1/tickets/${id}/arrival`, {
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
        const response = await fetch('http://localhost:8000/api/v1/users/me/location', {
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

  const startJobWithEta = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tickets/${id}/start`, {
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
        const refreshed = await fetch(`http://localhost:8000/api/v1/tickets/${id}`, {
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
      const response = await fetch(`http://localhost:8000/api/v1/tickets/${id}/resolution-photo`, {
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
      const response = await fetch(`http://localhost:8000/api/v1/tickets/${id}/parts/photo`, {
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
      const response = await fetch(`http://localhost:8000/api/v1/tickets/${id}/parts/request`, {
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
      const response = await fetch(`http://localhost:8000/api/v1/tickets/${id}/escalate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(escalationForm)
      })
      if (response.ok) {
        alert('Escalation submitted')
      } else {
        const error = await response.json()
        alert(error.detail || 'Error escalating')
      }
    } catch (err) {
      alert('Error escalating')
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
        const response = await fetch(`http://localhost:8000/api/v1/routes/directions?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (!response.ok) {
          setRouteError(data.detail || 'Unable to fetch route')
        } else {
          setRouteInfo(data)
          const mapRes = await fetch(`http://localhost:8000/api/v1/routes/static-map?latitude=${ticket.service_latitude}&longitude=${ticket.service_longitude}`, {
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold">Ticket: {ticket.ticket_number}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Ticket Info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Issue Details</h2>
              <p className="text-gray-700 mb-4">{ticket.issue_description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Status:</span>
                  <span className="ml-2 font-semibold">{ticket.status}</span>
                </div>
                <div>
                  <span className="text-gray-600">Priority:</span>
                  <span className="ml-2 font-semibold">{ticket.priority}</span>
                </div>
              </div>
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
            </div>

            {(aiSummary || aiChecklist || aiParts || aiSlaRisk) && (
              <div className="bg-white rounded-lg shadow p-6 space-y-4">
                <h2 className="text-xl font-semibold">AI Insights</h2>
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
                <h3 className="font-semibold text-blue-900 mb-3">AI Triage Suggestions</h3>
                <p><strong>Category:</strong> {ticket.ai_triage.category}</p>
                <p><strong>Suggested Parts:</strong></p>
                <ul className="list-disc list-inside ml-4">
                  {ticket.ai_triage.suggested_parts?.map((part, idx) => (
                    <li key={idx}>{part.part_name}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-white rounded-lg shadow p-6 space-y-4">
              <h2 className="text-xl font-semibold">On-site Workflow</h2>
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
              <div className="flex gap-2">
                <button
                  onClick={startJobWithEta}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Start Job
                </button>
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
            <h2 className="text-xl font-semibold mb-4">AI Copilot Assistant</h2>
            <div className="space-y-4">
              <textarea
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Ask for repair steps, troubleshooting..."
              />
              <button
                onClick={askCopilot}
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                Ask Copilot
              </button>

              {copilotResponse && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Response:</h4>
                  <p className="text-sm text-gray-700">{copilotResponse.answer}</p>
                  {copilotResponse.steps && copilotResponse.steps.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-semibold text-sm mb-2">Steps:</h5>
                      <ol className="list-decimal list-inside space-y-1 text-sm">
                        {copilotResponse.steps.map((step, idx) => (
                          <li key={idx}>{step.description}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}




