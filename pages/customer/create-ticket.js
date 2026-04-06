import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import Button from '../../components/Button'
import { getApiBase } from '../../lib/api'
import ComingSoon from '../../components/ComingSoon'
import PreferredVisitSlotPicker from '../../components/customer/PreferredVisitSlotPicker'

function FormSection({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <div className={`rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40 overflow-hidden ${className}`}>
      <div className="px-5 sm:px-7 py-4 sm:py-5 bg-gradient-to-r from-slate-50 via-white to-teal-50/30 border-b border-slate-100">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700/90 mb-1">{eyebrow}</p>
        )}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      <div className="p-5 sm:p-7 space-y-4">{children}</div>
    </div>
  )
}

export default function CreateTicket() {
  const [formData, setFormData] = useState({
    issue_description: '',
    service_address: '',
    priority: 'medium',
    issue_language: 'en'
  })
  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState('')
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
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${getApiBase()}/devices/`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setDevices(Array.isArray(list) ? list : []))
      .catch(() => setDevices([]))
  }, [])

  useEffect(() => {
    if (device_id) setDeviceId(String(device_id))
  }, [device_id])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(getApiBase() + '/ai/self-diagnosis/questions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
      .then((res) => res.json())
      .then((data) => setSelfQuestions(data.questions || []))
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
        const response = await fetch(`${getApiBase()}/routes/geocode?${params.toString()}`, {
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
    if (!deviceId) {
      alert('Please select a registered device.')
      return
    }
    setLoading(true)

    const token = localStorage.getItem('token')

    try {
      const response = await fetch(getApiBase() + '/tickets/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issue_description: formData.issue_description,
          device_id: parseInt(deviceId, 10),
          service_address: formData.service_address,
          priority: formData.priority,
          issue_language: formData.issue_language,
          issue_photos: issueAttachments,
          service_latitude: serviceLocation.lat || null,
          service_longitude: serviceLocation.lng || null,
          contact_preferences: Object.keys(contactPreferences).filter((key) => contactPreferences[key]),
          preferred_time_slots: preferredTimeSlots
        })
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
      const response = await fetch(getApiBase() + '/ai/triage', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          issue_description: formData.issue_description,
          device_category: null,
          device_model: null,
          issue_photos: issueAttachments
        })
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        alert('Error getting AI suggestions: ' + (errorData.detail || 'Unknown error'))
        return
      }

      const data = await response.json()
      setAiTriage(data)
      if (data.suggested_priority) {
        setFormData({ ...formData, priority: data.suggested_priority })
      }
    } catch (err) {
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
      const response = await fetch(getApiBase() + '/ai/self-diagnosis/assess', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
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

  const selectedDev = devices.find((d) => String(d.id) === deviceId)
  const selectedDeviceLabel = selectedDev
    ? [selectedDev.brand, selectedDev.model_number, selectedDev.serial_number].filter(Boolean).join(' · ')
    : ''

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-indigo-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-10 text-center sm:text-left">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-teal-700 hover:text-teal-900 font-medium mb-4 inline-flex items-center gap-1"
          >
            ← Back
          </button>
          <div className="inline-block sm:block rounded-2xl bg-white/70 backdrop-blur border border-white/60 shadow-lg shadow-teal-900/5 px-6 py-5 sm:px-8 sm:py-6">
            <p className="text-xs font-semibold uppercase tracking-widest text-teal-800/80 mb-2">New service request</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Create a service ticket
            </h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              Tell us what&apos;s wrong, where to visit, and when you&apos;re available — we&apos;ll route your request to the right team.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2 space-y-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <FormSection
                eyebrow="Step 1"
                title="Device"
                subtitle="Choose the product that needs service. Only devices registered to your account appear here."
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Registered device *</label>
                  <select
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                    required
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-inner focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition"
                  >
                    <option value="">Select a device</option>
                    {devices.map((d) => (
                      <option key={d.id} value={String(d.id)}>
                        {[d.brand, d.model_number, d.serial_number].filter(Boolean).join(' · ') || `Device #${d.id}`}
                      </option>
                    ))}
                  </select>
                  {devices.length === 0 && (
                    <p className="mt-3 text-sm text-amber-800 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                      No devices found. Register a device first, then return here to create a ticket.
                    </p>
                  )}
                  {deviceId && selectedDeviceLabel && (
                    <p className="mt-2 text-sm text-slate-600">
                      Selected: <span className="font-medium text-slate-800">{selectedDeviceLabel}</span>
                    </p>
                  )}
                </div>
              </FormSection>

              <FormSection
                eyebrow="Step 2"
                title="Describe the issue"
                subtitle="Clear details help us assign the right engineer and parts."
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">What&apos;s happening? *</label>
                  <textarea
                    value={formData.issue_description}
                    onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
                    onBlur={getAITriage}
                    required
                    rows={6}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500/40 focus:border-teal-400 transition resize-y min-h-[140px]"
                    placeholder="Example: Washing machine stops mid-cycle with an error code, water not draining…"
                  />
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={getAITriage}
                      className="text-sm font-semibold text-teal-700 hover:text-teal-900"
                    >
                      Get AI suggestions
                    </button>
                    <ComingSoon variant="badge" message="Coming Soon" />
                  </div>
                  {aiTriage?.summary && (
                    <div className="mt-4 rounded-xl border border-teal-100 bg-teal-50/50 px-4 py-3 text-sm text-slate-800">
                      <div className="font-semibold text-teal-900 mb-1">AI summary</div>
                      <div>{aiTriage.summary}</div>
                      {aiTriage.key_symptoms?.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600">
                          Symptoms: {aiTriage.key_symptoms.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {selfQuestions.length > 0 && (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/40 p-4 space-y-3">
                    <h3 className="font-semibold text-indigo-950">Quick self-check (optional)</h3>
                    {selfQuestions.map((q) => (
                      <div key={q.id}>
                        <label className="block text-sm font-medium text-slate-700 mb-1">{q.question}</label>
                        <select
                          value={selfAnswers[q.id] || ''}
                          onChange={(e) => setSelfAnswers({ ...selfAnswers, [q.id]: e.target.value })}
                          className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white"
                        >
                          <option value="">Select</option>
                          {q.options.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={runSelfDiagnosis}
                      className="text-sm font-semibold text-indigo-800 hover:text-indigo-950"
                    >
                      {selfLoading ? 'Checking…' : 'Run self-check'}
                    </button>
                    {selfResult?.assessment && (
                      <div className="text-sm text-slate-700 pt-2 border-t border-indigo-100">
                        <div>
                          Likely issue: <strong>{selfResult.assessment.likely_issue}</strong>
                        </div>
                        <div>Confidence: {Math.round(selfResult.assessment.confidence * 100)}%</div>
                      </div>
                    )}
                  </div>
                )}
              </FormSection>

              <FormSection
                eyebrow="Step 3"
                title="Language & evidence"
                subtitle="Optional links to photos or short videos help diagnose faster."
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Preferred language</label>
                  <select
                    value={formData.issue_language}
                    onChange={(e) => setFormData({ ...formData, issue_language: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/40"
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
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Photo / video URLs</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="url"
                      value={attachmentInput}
                      onChange={(e) => setAttachmentInput(e.target.value)}
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/40"
                      placeholder="https://…"
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
                    <ul className="mt-3 space-y-2">
                      {issueAttachments.map((url, idx) => (
                        <li
                          key={`${url}-${idx}`}
                          className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 border border-slate-100 px-3 py-2 text-sm"
                        >
                          <span className="truncate text-slate-700">{url}</span>
                          <button
                            type="button"
                            onClick={() => setIssueAttachments(issueAttachments.filter((_, i) => i !== idx))}
                            className="text-red-600 hover:text-red-800 font-medium shrink-0"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FormSection>

              <FormSection
                eyebrow="Step 4"
                title="Service location"
                subtitle="Full address where the engineer should visit. You can pin from the address or use GPS."
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Address *</label>
                  <textarea
                    value={formData.service_address}
                    onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-500/40"
                    placeholder="House / flat, street, landmark, city, PIN…"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={async () => {
                      if (!formData.service_address.trim()) return
                      setGeoLoading(true)
                      const token = localStorage.getItem('token')
                      try {
                        const params = new URLSearchParams({ address: formData.service_address })
                        const response = await fetch(`${getApiBase()}/routes/geocode?${params.toString()}`, {
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
                    {geoLoading ? 'Locating…' : 'Pin from address'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (typeof navigator === 'undefined' || !navigator.geolocation) {
                        alert('Location is not available in this browser.')
                        return
                      }
                      navigator.geolocation.getCurrentPosition(
                        (pos) => {
                          setServiceLocation({
                            lat: String(pos.coords.latitude),
                            lng: String(pos.coords.longitude)
                          })
                        },
                        () => alert('Could not read your location. Allow access or use address pin.'),
                        { enableHighAccuracy: true, timeout: 20000, maximumAge: 60000 }
                      )
                    }}
                  >
                    Use my location (GPS)
                  </Button>
                </div>
                {serviceLocation.lat && serviceLocation.lng && (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-100 px-3 py-2 text-sm text-emerald-900">
                    <span className="font-medium">Coordinates saved:</span>{' '}
                    {serviceLocation.lat}, {serviceLocation.lng}
                  </div>
                )}
                <p className="text-xs text-slate-500">
                  Address lookup uses OpenStreetMap when paid map keys are not configured. GPS uses your device only.
                </p>
              </FormSection>

              <FormSection
                eyebrow="Step 5"
                title="Preferred visit times"
                subtitle="Tap the time bands that work for you — pick as many as you need across the week."
              >
                <PreferredVisitSlotPicker value={preferredTimeSlots} onChange={setPreferredTimeSlots} />
              </FormSection>

              <FormSection
                eyebrow="Step 6"
                title="Contact & priority"
                subtitle="How we should reach you, and how urgent this visit is."
              >
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-3">Contact preferences</label>
                  <div className="flex flex-wrap gap-3">
                    {['call', 'whatsapp', 'sms'].map((pref) => (
                      <label
                        key={pref}
                        className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 cursor-pointer transition ${
                          contactPreferences[pref]
                            ? 'border-teal-400 bg-teal-50 text-teal-950 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          checked={contactPreferences[pref]}
                          onChange={(e) =>
                            setContactPreferences({ ...contactPreferences, [pref]: e.target.checked })
                          }
                        />
                        <span className="capitalize text-sm font-medium">{pref}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-800 mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-teal-500/40"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </FormSection>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Button type="submit" disabled={loading} className="flex-1 sm:flex-none sm:min-w-[200px]" size="lg">
                  {loading ? 'Creating…' : 'Submit ticket'}
                </Button>
                <Button type="button" onClick={() => router.back()} variant="secondary" size="lg">
                  Cancel
                </Button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 sm:p-7 bg-gradient-to-br from-white to-teal-50/50 border-teal-100/80 shadow-lg shadow-teal-900/5 sticky top-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl" aria-hidden>
                  🤖
                </span>
                <h3 className="font-bold text-slate-900 text-lg">AI triage</h3>
                <ComingSoon variant="badge" message="Coming Soon" />
              </div>
              <ComingSoon variant="card" message="Smart triage suggestions will appear here." />
              <div className="mt-6 pt-6 border-t border-teal-100 text-xs text-slate-600 space-y-2">
                <p className="font-semibold text-slate-800">Tips</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Mention sounds, error codes, and when the issue started.</li>
                  <li>Add photo links if safe to share.</li>
                  <li>Select multiple visit windows — we&apos;ll optimize scheduling.</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
