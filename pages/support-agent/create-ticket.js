import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from '../../components/ui/button'
import { getApiBase } from '@lib/api'
import PreferredVisitSlotPicker from '../../components/customer/PreferredVisitSlotPicker'

function FormSection({ eyebrow, title, subtitle, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl border border-slate-200/80 bg-white shadow-md shadow-slate-200/40 overflow-hidden ${className}`}
    >
      <div className="px-5 sm:px-7 py-4 sm:py-5 bg-gradient-to-r from-slate-50 via-white to-teal-50/30 border-b border-slate-100">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-teal-700/90 mb-1">{eyebrow}</p>
        )}
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {subtitle && <p className="text-sm text-slate-600 mt-1 max-w-2xl">{subtitle}</p>}
      </div>
      <div className="p-5 sm:px-7 sm:py-5 space-y-4">{children}</div>
    </div>
  )
}

export default function SupportAgentCreateTicket() {
  const router = useRouter()
  const [customers, setCustomers] = useState([])
  const [customerId, setCustomerId] = useState('')
  const [devices, setDevices] = useState([])
  const [deviceId, setDeviceId] = useState('')
  const [formData, setFormData] = useState({
    issue_description: '',
    service_address: '',
    priority: 'medium',
    issue_language: 'en',
  })
  const [serviceLocation, setServiceLocation] = useState({ lat: '', lng: '' })
  const [geoLoading, setGeoLoading] = useState(false)
  const [issueAttachments, setIssueAttachments] = useState([])
  const [attachmentInput, setAttachmentInput] = useState('')
  const [contactPreferences, setContactPreferences] = useState({
    call: true,
    whatsapp: false,
    sms: false,
  })
  const [preferredTimeSlots, setPreferredTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${getApiBase()}/users/?role=customer`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setCustomers(Array.isArray(list) ? list : []))
      .catch(() => setCustomers([]))
  }, [])

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token || !customerId) {
      setDevices([])
      setDeviceId('')
      return
    }
    fetch(`${getApiBase()}/devices/?customer_id=${encodeURIComponent(customerId)}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => {
        setDevices(Array.isArray(list) ? list : [])
        setDeviceId('')
      })
      .catch(() => {
        setDevices([])
        setDeviceId('')
      })
  }, [customerId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!customerId) {
      alert('Select a customer.')
      return
    }
    if (!deviceId) {
      alert('Select a device registered to that customer.')
      return
    }
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      const response = await fetch(getApiBase() + '/tickets/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: parseInt(customerId, 10),
          issue_description: formData.issue_description,
          device_id: parseInt(deviceId, 10),
          service_address: formData.service_address,
          priority: formData.priority,
          issue_language: formData.issue_language,
          issue_photos: issueAttachments,
          service_latitude: serviceLocation.lat || null,
          service_longitude: serviceLocation.lng || null,
          contact_preferences: Object.keys(contactPreferences).filter((key) => contactPreferences[key]),
          preferred_time_slots: preferredTimeSlots,
        }),
      })
      const data = await response.json()
      if (response.ok) {
        router.push(`/tickets/${data.id}`)
      } else {
        const msg = typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail || data)
        alert('Error creating ticket: ' + msg)
      }
    } catch {
      alert('Network error.')
    } finally {
      setLoading(false)
    }
  }

  const selectedCustomer = customers.find((c) => String(c.id) === String(customerId))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-indigo-50/40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <Link href="/support-agent/dashboard" className="text-teal-700 hover:text-teal-900 font-medium text-sm">
            ← Back to support desk
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mt-4">Create ticket for customer</h1>
          <p className="text-slate-600 mt-2">
            Same payload as the customer portal: device, issue, address, visit preferences, and contact options. The ticket is
            attributed to the selected customer so city / state / country routing matches their profile.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection
            eyebrow="Step 1"
            title="Customer & device"
            subtitle="Only customers in your organization are listed. Devices load for the selected customer."
          >
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Customer *</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Select customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={String(c.id)}>
                    {c.full_name} ({c.email})
                  </option>
                ))}
              </select>
              {customers.length === 0 && (
                <p className="mt-2 text-sm text-amber-800">No customers found in your organization.</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Device *</label>
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
                disabled={!customerId}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white disabled:opacity-50"
              >
                <option value="">{customerId ? 'Select device' : 'Select a customer first'}</option>
                {devices.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {[d.brand, d.model_number, d.serial_number].filter(Boolean).join(' · ') || `Device #${d.id}`}
                  </option>
                ))}
              </select>
              {selectedCustomer && devices.length === 0 && (
                <p className="mt-2 text-sm text-slate-600">This customer has no registered devices yet.</p>
              )}
            </div>
          </FormSection>

          <FormSection eyebrow="Step 2" title="Issue" subtitle="Describe the problem clearly for triage and routing.">
            <textarea
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              required
              rows={6}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
              placeholder="Symptoms, error codes, when it started…"
            />
          </FormSection>

          <FormSection eyebrow="Step 3" title="Language & evidence" subtitle="Optional media URLs.">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Preferred language</label>
              <select
                value={formData.issue_language}
                onChange={(e) => setFormData({ ...formData, issue_language: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
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
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200"
                  placeholder="https://…"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (!attachmentInput.trim()) return
                    setIssueAttachments([...issueAttachments, attachmentInput.trim()])
                    setAttachmentInput('')
                  }}
                >
                  Add
                </Button>
              </div>
              {issueAttachments.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm">
                  {issueAttachments.map((url, idx) => (
                    <li key={`${url}-${idx}`} className="flex justify-between gap-2">
                      <span className="truncate">{url}</span>
                      <button
                        type="button"
                        className="text-red-600 shrink-0"
                        onClick={() => setIssueAttachments(issueAttachments.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </FormSection>

          <FormSection eyebrow="Step 4" title="Service location" subtitle="Where the engineer should visit.">
            <textarea
              value={formData.service_address}
              onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
              required
              rows={4}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
              placeholder="Address with landmark and PIN"
            />
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
                      headers: { Authorization: `Bearer ${token}` },
                    })
                    const data = await response.json()
                    if (response.ok) {
                      setServiceLocation({ lat: data.latitude.toString(), lng: data.longitude.toString() })
                    } else {
                      alert(data.detail || 'Geocode failed')
                    }
                  } catch {
                    alert('Geocode failed')
                  } finally {
                    setGeoLoading(false)
                  }
                }}
                disabled={geoLoading}
              >
                {geoLoading ? 'Locating…' : 'Pin from address'}
              </Button>
            </div>
          </FormSection>

          <FormSection eyebrow="Step 5" title="Preferred visit times" subtitle="Customer availability windows.">
            <PreferredVisitSlotPicker value={preferredTimeSlots} onChange={setPreferredTimeSlots} />
          </FormSection>

          <FormSection eyebrow="Step 6" title="Contact & priority" subtitle="How to reach the customer.">
            <div className="flex flex-wrap gap-3">
              {['call', 'whatsapp', 'sms'].map((pref) => (
                <label
                  key={pref}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 cursor-pointer ${
                    contactPreferences[pref] ? 'border-teal-400 bg-teal-50' : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={contactPreferences[pref]}
                    onChange={(e) => setContactPreferences({ ...contactPreferences, [pref]: e.target.checked })}
                  />
                  <span className="capitalize text-sm font-medium">{pref}</span>
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 bg-white"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </FormSection>

          <div className="flex gap-3">
            <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
              {loading ? 'Creating…' : 'Create ticket'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push('/support-agent/dashboard')}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
