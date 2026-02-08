import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import Button from '../../components/Button'
import StatCard from '../../components/StatCard'

export default function EngineerDashboard({ user }) {
  const [tickets, setTickets] = useState([])
  const [profile, setProfile] = useState(null)
  const [etaEstimates, setEtaEstimates] = useState({})
  const [etaLoading, setEtaLoading] = useState({})
  const [autoEtaEnabled, setAutoEtaEnabled] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    fetch('http://localhost:8000/api/v1/tickets/?assigned_to_me=true', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setTickets(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })

    fetch('http://localhost:8000/api/v1/users/me', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setProfile(data)
      })
      .catch(err => {
        console.error('Profile error:', err)
      })
  }, [router])

  useEffect(() => {
    if (!autoEtaEnabled) return
    if (!tickets.length) return
    if (!navigator.geolocation) return

    const updateEtas = () => {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const token = localStorage.getItem('token')
        const origin = {
          lat: position.coords.latitude.toString(),
          lng: position.coords.longitude.toString()
        }
        const candidates = tickets.filter(t => t.service_latitude && t.service_longitude).slice(0, 8)
        await Promise.all(candidates.map(async (ticket) => {
          try {
            const params = new URLSearchParams({
              origin_lat: origin.lat,
              origin_lng: origin.lng,
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
      })
    }

    updateEtas()
    const interval = setInterval(updateEtas, 60000)
    return () => clearInterval(interval)
  }, [autoEtaEnabled, tickets])

  const stats = {
    assigned: tickets.filter(t => t.status === 'assigned').length,
    inProgress: tickets.filter(t => t.status === 'in_progress').length,
    completed: tickets.filter(t => t.status === 'resolved').length
  }
  const totalJobs = tickets.length
  const ftfr = totalJobs > 0 ? Math.round((stats.completed / totalJobs) * 100) : 0
  const followUps = tickets
    .filter(t => t.parent_ticket_id)
    .sort((a, b) => {
      const aDate = a.follow_up_preferred_date ? new Date(a.follow_up_preferred_date).getTime() : 0
      const bDate = b.follow_up_preferred_date ? new Date(b.follow_up_preferred_date).getTime() : 0
      return aDate - bDate
    })

  const startTicket = async (ticketId) => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`http://localhost:8000/api/v1/tickets/${ticketId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        router.push(`/engineer/ticket/${ticketId}`)
      }
    } catch (err) {
      alert('Error starting ticket')
    }
  }

  const getDistanceKm = (aLat, aLng, bLat, bLng) => {
    const toRad = (v) => (v * Math.PI) / 180
    const R = 6371
    const dLat = toRad(bLat - aLat)
    const dLng = toRad(bLng - aLng)
    const lat1 = toRad(aLat)
    const lat2 = toRad(bLat)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const sortedTickets = [...tickets].sort((a, b) => {
    const aSla = a.sla_deadline ? new Date(a.sla_deadline).getTime() : Number.MAX_SAFE_INTEGER
    const bSla = b.sla_deadline ? new Date(b.sla_deadline).getTime() : Number.MAX_SAFE_INTEGER
    if (aSla !== bSla) return aSla - bSla

    if (profile?.current_location_lat && profile?.current_location_lng && a.service_latitude && a.service_longitude && b.service_latitude && b.service_longitude) {
      const aDist = getDistanceKm(
        parseFloat(profile.current_location_lat),
        parseFloat(profile.current_location_lng),
        parseFloat(a.service_latitude),
        parseFloat(a.service_longitude)
      )
      const bDist = getDistanceKm(
        parseFloat(profile.current_location_lat),
        parseFloat(profile.current_location_lng),
        parseFloat(b.service_latitude),
        parseFloat(b.service_longitude)
      )
      return aDist - bDist
    }
    return 0
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Engineer Dashboard</h1>
        <p className="text-gray-600">Manage your assigned service tickets</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Assigned Tickets"
          value={stats.assigned}
          icon={{ emoji: '📋', bg: 'bg-yellow-100', color: 'text-yellow-600' }}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={{ emoji: '🔧', bg: 'bg-blue-100', color: 'text-blue-600' }}
        />
        <StatCard
          title="Completed Today"
          value={stats.completed}
          icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }}
        />
        <StatCard
          title="FTFR"
          value={`${ftfr}%`}
          icon={{ emoji: '🎯', bg: 'bg-purple-100', color: 'text-purple-600' }}
        />
      </div>


      <div className="flex justify-between items-center mb-6">
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
            if (!token) {
              router.push('/login')
              return
            }
            try {
              const response = await fetch('http://localhost:8000/api/v1/tickets/assigned/calendar', {
                headers: { Authorization: `Bearer ${token}` }
              })
              if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                const a = document.createElement('a')
                a.href = url
                a.download = 'engineer_schedule.ics'
                a.click()
                window.URL.revokeObjectURL(url)
              }
            } catch (error) {
              alert('Error downloading calendar')
            }
          }}
        >
          Download Calendar (ICS)
        </Button>
      </div>

      {/* Engineer Profile */}
      {profile && (
        <Card className="p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">My Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Name</span>
                <span>{profile.full_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Skill Level</span>
                <span className="capitalize">{profile.engineer_skill_level || 'n/a'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Availability</span>
                <span className={profile.is_available ? 'text-green-600' : 'text-red-600'}>
                  {profile.is_available ? 'Available' : 'Busy'}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Assigned Tickets</span>
                <span>{stats.assigned}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">In Progress</span>
                <span>{stats.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Specialization</span>
                <span>{profile.engineer_specialization || 'n/a'}</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Upcoming Schedule */}
      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Upcoming Follow-ups</h2>
        {followUps.length === 0 ? (
          <p className="text-sm text-gray-600">No follow-up visits assigned.</p>
        ) : (
          <div className="space-y-3">
            {followUps.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between border rounded-lg p-4">
                <div>
                  <div className="font-semibold">{ticket.ticket_number}</div>
                  <div className="text-sm text-gray-600">{ticket.issue_category || 'Follow-up visit'}</div>
                  <div className="text-xs text-gray-500">
                    {ticket.follow_up_preferred_date
                      ? `Preferred: ${new Date(ticket.follow_up_preferred_date).toLocaleString()}`
                      : 'Preferred date pending'}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/engineer/ticket/${ticket.id}`)}
                >
                  Open
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Tickets List */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Today&apos;s Route</h2>
        {sortedTickets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-lg text-gray-600">No tickets assigned to you yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedTickets.map((ticket) => (
              <Card key={ticket.id} hover className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{ticket.ticket_number}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        ticket.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{ticket.issue_category || 'General Issue'}</p>
                    {ticket.customer_name && (
                      <p className="text-sm text-gray-700">Customer: {ticket.customer_name}</p>
                    )}
                    <p className="text-sm text-gray-600">{ticket.service_address || 'No address provided'}</p>
                    {ticket.service_latitude && ticket.service_longitude && (
                      <img
                        src={`http://localhost:8000/api/v1/routes/static-map?latitude=${ticket.service_latitude}&longitude=${ticket.service_longitude}&zoom=13`}
                        alt="Map thumbnail"
                        className="mt-2 h-16 w-28 rounded border object-cover"
                      />
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Priority: <span className="font-semibold capitalize">{ticket.priority}</span></span>
                      <span>•</span>
                      <span>{new Date(ticket.created_at).toLocaleDateString()}</span>
                      {ticket.sla_deadline && (
                        <>
                          <span>•</span>
                          <span>SLA: {new Date(ticket.sla_deadline).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                      {ticket.warranty_status && (
                        <span className="px-2 py-1 rounded bg-gray-100">
                          {ticket.warranty_status.replace('_', ' ')}
                        </span>
                      )}
                      <span className={`px-2 py-1 rounded ${ticket.parts_ready ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ticket.parts_ready ? 'Parts ready' : 'Waiting parts'}
                      </span>
                    </div>
                    {ticket.preferred_time_slots?.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Preferred slots: {ticket.preferred_time_slots.map((slot) => `${slot.day} ${slot.slot}`).join(', ')}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {ticket.status === 'assigned' && (
                      <Button
                        onClick={() => startTicket(ticket.id)}
                        size="sm"
                      >
                        Start Job
                      </Button>
                    )}
                    {ticket.status === 'in_progress' && (
                      <Button
                        onClick={() => router.push(`/engineer/ticket/${ticket.id}`)}
                        variant="success"
                        size="sm"
                      >
                        Continue
                      </Button>
                    )}
                            {ticket.service_latitude && ticket.service_longitude && (
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
                                Map
                              </Button>
                            )}
                            {ticket.service_latitude && ticket.service_longitude && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  window.open(
                                    `http://localhost:8000/api/v1/routes/static-map?latitude=${ticket.service_latitude}&longitude=${ticket.service_longitude}`,
                                    '_blank'
                                  )
                                }}
                              >
                                Preview
                              </Button>
                            )}
                            {ticket.service_latitude && ticket.service_longitude && (
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
                            )}
                  </div>
                </div>
                        {etaEstimates[ticket.id] && (
                          <div className="text-xs text-gray-600 mt-2">
                            {etaEstimates[ticket.id].distanceKm} km • {etaEstimates[ticket.id].etaMin} min
                          </div>
                        )}
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
