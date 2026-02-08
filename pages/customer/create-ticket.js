import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function CreateTicket() {
  const [formData, setFormData] = useState({
    issue_description: '',
    device_serial: '',
    service_address: '',
    priority: 'medium',
    issue_language: 'en'
  })
  const [serviceLocation, setServiceLocation] = useState({ lat: '', lng: '' })
  const [geoLoading, setGeoLoading] = useState(false)
  const [lastGeocodedAddress, setLastGeocodedAddress] = useState('')
  const [issueAttachments, setIssueAttachments] = useState([])
  const [attachmentInput, setAttachmentInput] = useState('')
  const [contactPreferences, setContactPreferences] = useState({
    call: true,
    whatsapp: false,
    sms: false
  })
  const [preferredTimeSlots, setPreferredTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [aiTriage, setAiTriage] = useState(null)
  const [selfQuestions, setSelfQuestions] = useState([])
  const [selfAnswers, setSelfAnswers] = useState({})
  const [selfResult, setSelfResult] = useState(null)
  const [selfLoading, setSelfLoading] = useState(false)
  const router = useRouter()
  const { device_id } = router.query

  useEffect(() => {
    if (!device_id) return
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`http://localhost:8000/api/v1/devices/${device_id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.serial_number) {
          setFormData(prev => ({ ...prev, device_serial: data.serial_number }))
        }
      })
      .catch(() => null)
  }, [device_id])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch('http://localhost:8000/api/v1/ai/self-diagnosis/questions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then(res => res.json())
      .then(data => setSelfQuestions(data.questions || []))
      .catch(() => null)
  }, [])

  useEffect(() => {
    const address = formData.service_address.trim()
    if (!address || address.length < 5) return
    if (address === lastGeocodedAddress) return
    const timeout = setTimeout(async () => {
      setGeoLoading(true)
      const token = localStorage.getItem('token')
      try {
        const params = new URLSearchParams({ address })
        const response = await fetch(`http://localhost:8000/api/v1/routes/geocode?${params.toString()}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const data = await response.json()
        if (response.ok) {
          setServiceLocation({ lat: data.latitude.toString(), lng: data.longitude.toString() })
          setLastGeocodedAddress(address)
        }
      } catch (error) {
        // silent on auto-geocode
      } finally {
        setGeoLoading(false)
      }
    }, 800)
    return () => clearTimeout(timeout)
  }, [formData.service_address, lastGeocodedAddress])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const token = localStorage.getItem('token')

    try {
      const response = await fetch('http://localhost:8000/api/v1/tickets/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue_description: formData.issue_description,
          device_serial: formData.device_serial,
          service_address: formData.service_address,
          priority: formData.priority,
          issue_language: formData.issue_language,
          issue_photos: issueAttachments,
          service_latitude: serviceLocation.lat || null,
          service_longitude: serviceLocation.lng || null,
          contact_preferences: Object.keys(contactPreferences).filter((key) => contactPreferences[key]),
          preferred_time_slots: preferredTimeSlots
        }),
      })

      const data = await response.json()

      if (response.ok) {
        router.push(`/customer/ticket/${data.id}`)
      } else {
        alert('Error creating ticket: ' + (data.detail || 'Unknown error'))
      }
    } catch (err) {
      alert('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const getAITriage = async () => {
    if (!formData.issue_description || formData.issue_description.trim().length < 10) {
      alert('Please enter at least 10 characters in the issue description to get AI suggestions')
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/triage', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          issue_description: formData.issue_description,
          device_category: null, // Could be enhanced to get from device selection
          device_model: null,
          issue_photos: issueAttachments
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        console.error('AI Triage error:', errorData)
        alert('Error getting AI suggestions: ' + (errorData.detail || 'Unknown error'))
        return
      }

      const data = await response.json()
      setAiTriage(data)
      if (data.suggested_priority) {
        setFormData({ ...formData, priority: data.suggested_priority })
      }
    } catch (err) {
      console.error('AI Triage error:', err)
      alert('Network error. Please check your connection and try again.')
    }
  }

  const runSelfDiagnosis = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setSelfLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/ai/self-diagnosis/assess', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issue_description: formData.issue_description,
          answers: selfAnswers
        })
      })
      const data = await response.json()
      if (response.ok) {
        setSelfResult(data)
        if (data.triage?.suggested_priority) {
          setFormData({ ...formData, priority: data.triage.suggested_priority })
        }
      }
    } catch (error) {
      // ignore
    } finally {
      setSelfLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-4 flex items-center gap-2"
        >
          ← Back
        </button>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Service Ticket</h1>
        <p className="text-gray-600">Describe your issue and we&apos;ll help you get it resolved</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Device Serial Number
                </label>
                <input
                  type="text"
                  value={formData.device_serial}
                  onChange={(e) => setFormData({ ...formData, device_serial: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter device serial number"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Description *
                </label>
                <textarea
                  value={formData.issue_description}
                  onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                  onBlur={getAITriage}
                  required
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Describe the issue in detail..."
                />
                <button
                  type="button"
                  onClick={getAITriage}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  🤖 Get AI Suggestions
                </button>
                {aiTriage?.summary && (
                  <div className="mt-2 text-sm text-gray-700">
                    <div className="font-semibold">AI Summary</div>
                    <div>{aiTriage.summary}</div>
                    {aiTriage.key_symptoms?.length > 0 && (
                      <div className="mt-1 text-xs text-gray-600">
                        Symptoms: {aiTriage.key_symptoms.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {selfQuestions.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2">Smart Self-Diagnosis</h3>
                  <div className="space-y-3">
                    {selfQuestions.map((q) => (
                      <div key={q.id}>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{q.question}</label>
                        <select
                          value={selfAnswers[q.id] || ''}
                          onChange={(e) => setSelfAnswers({ ...selfAnswers, [q.id]: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-white"
                        >
                          <option value="">Select</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={runSelfDiagnosis}
                      className="text-sm text-blue-700 font-medium"
                    >
                      {selfLoading ? 'Checking...' : 'Run Self-Diagnosis'}
                    </button>
                    {selfResult?.assessment && (
                      <div className="text-sm text-gray-700">
                        <div>Likely issue: <strong>{selfResult.assessment.likely_issue}</strong></div>
                        <div>Confidence: {Math.round(selfResult.assessment.confidence * 100)}%</div>
                        <div>Likely fix: {selfResult.assessment.likely_fix}</div>
                        {selfResult.triage?.suggested_parts?.length > 0 && (
                          <div className="mt-1 text-xs text-gray-600">
                            Suggested parts: {selfResult.triage.suggested_parts.map(p => p.part_name || p.part_id).join(', ')}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Language
                </label>
                <select
                  value={formData.issue_language}
                  onChange={(e) => setFormData({ ...formData, issue_language: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                  <option value="mr">Marathi</option>
                  <option value="ta">Tamil</option>
                  <option value="te">Telugu</option>
                  <option value="bn">Bengali</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Photos or Short Videos (URLs)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={attachmentInput}
                    onChange={(e) => setAttachmentInput(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    placeholder="Paste image/video URL and click Add"
                  />
                  <Button
                    type="button"
                    onClick={() => {
                      if (!attachmentInput.trim()) return
                      setIssueAttachments([...issueAttachments, attachmentInput.trim()])
                      setAttachmentInput('')
                    }}
                    size="lg"
                  >
                    Add
                  </Button>
                </div>
                {issueAttachments.length > 0 && (
                  <ul className="mt-3 space-y-2 text-sm text-gray-600">
                    {issueAttachments.map((url, idx) => (
                      <li key={`${url}-${idx}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="truncate">{url}</span>
                        <button
                          type="button"
                          onClick={() => setIssueAttachments(issueAttachments.filter((_, i) => i !== idx))}
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Address *
                </label>
                <textarea
                  value={formData.service_address}
                  onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Enter complete service address"
                />
                <div className="mt-2 flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!formData.service_address.trim()) return
                      setGeoLoading(true)
                      const token = localStorage.getItem('token')
                      try {
                        const params = new URLSearchParams({ address: formData.service_address })
                        const response = await fetch(`http://localhost:8000/api/v1/routes/geocode?${params.toString()}`, {
                          headers: { Authorization: `Bearer ${token}` }
                        })
                        const data = await response.json()
                        if (!response.ok) {
                          alert(data.detail || 'Address lookup failed')
                        } else {
                          setServiceLocation({ lat: data.latitude.toString(), lng: data.longitude.toString() })
                        }
                      } catch (error) {
                        alert('Address lookup failed')
                      } finally {
                        setGeoLoading(false)
                      }
                    }}
                    disabled={geoLoading}
                  >
                    {geoLoading ? 'Locating...' : 'Lookup Location'}
                  </Button>
                  {serviceLocation.lat && serviceLocation.lng && (
                    <span className="text-xs text-gray-500 self-center">
                      {serviceLocation.lat}, {serviceLocation.lng}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Preferred Visit Slots
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
                  {[
                    { day: 'Mon', slots: ['9-12', '12-4', '4-8'] },
                    { day: 'Tue', slots: ['9-12', '12-4', '4-8'] },
                    { day: 'Wed', slots: ['9-12', '12-4', '4-8'] },
                    { day: 'Thu', slots: ['9-12', '12-4', '4-8'] },
                    { day: 'Fri', slots: ['9-12', '12-4', '4-8'] },
                    { day: 'Sat', slots: ['9-12', '12-4', '4-8'] },
                    { day: 'Sun', slots: ['9-12', '12-4', '4-8'] }
                  ].map(({ day, slots }) => (
                    <div key={day} className="border rounded-lg p-3">
                      <div className="font-semibold mb-2">{day}</div>
                      <div className="space-y-1">
                        {slots.map((slot) => {
                          const key = `${day}-${slot}`
                          const checked = preferredTimeSlots.some((t) => t.day === day && t.slot === slot)
                          return (
                            <label key={key} className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setPreferredTimeSlots([...preferredTimeSlots, { day, slot }])
                                  } else {
                                    setPreferredTimeSlots(preferredTimeSlots.filter((t) => !(t.day === day && t.slot === slot)))
                                  }
                                }}
                              />
                              <span>{slot}</span>
                            </label>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Contact Preferences
                </label>
                <div className="flex flex-wrap gap-4 text-sm text-gray-700">
                  {['call', 'whatsapp', 'sms'].map((pref) => (
                    <label key={pref} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={contactPreferences[pref]}
                        onChange={(e) => setContactPreferences({ ...contactPreferences, [pref]: e.target.checked })}
                      />
                      <span className="capitalize">{pref}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1"
                  size="lg"
                >
                  {loading ? 'Creating...' : 'Create Ticket'}
                </Button>
                <Button
                  type="button"
                  onClick={() => router.back()}
                  variant="secondary"
                  size="lg"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* AI Triage Sidebar */}
        {aiTriage && (
          <div>
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🤖</span>
                <h3 className="font-bold text-blue-900">AI Triage Suggestions</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-blue-900">Category:</span>
                  <p className="text-blue-700 mt-1">{aiTriage.suggested_category}</p>
                </div>
                <div>
                  <span className="font-semibold text-blue-900">Priority:</span>
                  <p className="text-blue-700 mt-1 capitalize">{aiTriage.suggested_priority}</p>
                </div>
                <div>
                  <span className="font-semibold text-blue-900">Confidence:</span>
                  <p className="text-blue-700 mt-1">{(aiTriage.confidence_score * 100).toFixed(0)}%</p>
                </div>
                {aiTriage.suggested_parts && aiTriage.suggested_parts.length > 0 && (
                  <div>
                    <span className="font-semibold text-blue-900">Suggested Parts:</span>
                    <ul className="mt-1 space-y-1">
                      {aiTriage.suggested_parts.map((part, idx) => (
                        <li key={idx} className="text-blue-700">• {part.part_name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
