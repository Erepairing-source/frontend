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
  const [catalogDevices, setCatalogDevices] = useState([])
  const [deviceId, setDeviceId] = useState('')
  const [serialInput, setSerialInput] = useState('')
  const [serialProfileLoading, setSerialProfileLoading] = useState(false)
  const [serialProfileMessage, setSerialProfileMessage] = useState('')
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_company: '',
    customer_phone: '',
    issue_description: '',
    service_address: '',
    priority: 'medium',
    issue_language: 'en',
  })
  const [serviceLocation, setServiceLocation] = useState({ lat: '', lng: '' })
  const [geoLoading, setGeoLoading] = useState(false)
  const [issueAttachments, setIssueAttachments] = useState([])
  const [attachmentFiles, setAttachmentFiles] = useState([])
  const [uploadingAttachments, setUploadingAttachments] = useState(false)
  const [contactPreferences, setContactPreferences] = useState({
    call: true,
    whatsapp: false,
    sms: false,
  })
  const [preferredTimeSlots, setPreferredTimeSlots] = useState([])
  const [loading, setLoading] = useState(false)
  const [newDeviceData, setNewDeviceData] = useState({
    serial_number: '',
    model_number: '',
    product_category: '',
    brand: '',
  })
  const defaultCategories = ['ac', 'washing_machine', 'refrigerator', 'tv', 'microwave', 'water_purifier', 'air_purifier', 'laptop', 'computer', 'geyser', 'other']
  const defaultBrands = ['Samsung', 'LG', 'Whirlpool', 'Daikin', 'Voltas', 'Panasonic', 'Hitachi', 'Blue Star', 'Godrej', 'Haier', 'Other']

  const categoryOptions = Array.from(
    new Set([...defaultCategories, ...catalogDevices.map((d) => String(d.product_category || '').trim().toLowerCase()).filter(Boolean)])
  )
  const brandOptions = Array.from(
    new Set([...defaultBrands, ...catalogDevices.map((d) => String(d.brand || '').trim()).filter(Boolean)])
  )

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`${getApiBase()}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((profile) => {
        if (!profile) return
        setFormData((prev) => ({
          ...prev,
          customer_company: prev.customer_company || profile.organization_name || '',
        }))
      })
      .catch(() => null)
  }, [])

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
    if (!token) return
    fetch(`${getApiBase()}/devices/`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setCatalogDevices(Array.isArray(list) ? list : []))
      .catch(() => setCatalogDevices([]))
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
        const arr = Array.isArray(list) ? list : []
        setDevices(arr)
        // Keep selection when serial lookup pre-set device (same customer); clear if device not in new list
        setDeviceId((prev) => {
          if (prev && arr.some((d) => String(d.id) === String(prev))) return prev
          return ''
        })
      })
      .catch(() => {
        setDevices([])
        setDeviceId('')
      })
  }, [customerId])

  useEffect(() => {
    const selected = customers.find((c) => String(c.id) === String(customerId))
    if (!selected) return
    setFormData((prev) => ({
      ...prev,
      customer_name: selected.full_name || prev.customer_name,
      customer_email: selected.email || prev.customer_email,
      customer_phone: selected.phone || prev.customer_phone,
    }))
  }, [customerId, customers])

  useEffect(() => {
    if (!router.isReady) return
    const s = router.query.serial
    if (typeof s === 'string' && s.trim()) setSerialInput(s.trim())
  }, [router.isReady, router.query.serial])

  const loadDeviceProfile = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    const serial = serialInput.trim()
    if (!serial) {
      setSerialProfileMessage('Enter a serial number or Service Tag first.')
      return
    }
    setSerialProfileLoading(true)
    setSerialProfileMessage('')
    try {
      const res = await fetch(
        `${getApiBase()}/devices/service-profile/by-serial?serial=${encodeURIComponent(serial)}&include_ticket_history=true`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json()
      if (!res.ok) {
        const msg = typeof data.detail === 'string' ? data.detail : 'Device not found.'
        setSerialProfileMessage(msg)
        return
      }
      const dev = data.device
      const cust = data.customer
      if (cust?.id) setCustomerId(String(cust.id))
      if (dev?.id) setDeviceId(String(dev.id))
      setNewDeviceData((prev) => ({
        ...prev,
        serial_number: dev?.serial_number || prev.serial_number,
        model_number: dev?.model_number || prev.model_number,
        product_category: dev?.product_category || prev.product_category,
        brand: dev?.brand || prev.brand,
      }))
      setFormData((prev) => ({
        ...prev,
        customer_name: cust?.full_name || prev.customer_name,
        customer_email: cust?.email || prev.customer_email,
        customer_phone: cust?.phone || prev.customer_phone,
      }))
      setSerialProfileMessage(
        `Linked: ${dev?.brand || ''} ${dev?.model_number || ''} (${dev?.serial_number || ''}) — ${cust?.full_name || ''}`
      )
    } catch {
      setSerialProfileMessage('Network error.')
    } finally {
      setSerialProfileLoading(false)
    }
  }

  const tryAutofillFromCatalog = (candidateSerial, candidateModel) => {
    const serial = String(candidateSerial || '').trim().toLowerCase()
    const model = String(candidateModel || '').trim().toLowerCase()
    if (!serial && !model) return
    const matched =
      catalogDevices.find((d) => String(d.serial_number || '').trim().toLowerCase() === serial) ||
      catalogDevices.find((d) => String(d.model_number || '').trim().toLowerCase() === model)
    if (!matched) return
    setNewDeviceData((prev) => ({
      ...prev,
      serial_number: prev.serial_number || matched.serial_number || '',
      model_number: prev.model_number || matched.model_number || '',
      product_category: prev.product_category || matched.product_category || '',
      brand: prev.brand || matched.brand || '',
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.customer_name.trim() || !formData.customer_email.trim() || !formData.customer_company.trim() || !formData.customer_phone.trim()) {
      alert('Please enter customer name, email, company, and number.')
      return
    }
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      let resolvedCustomerId = customerId ? parseInt(customerId, 10) : null
      let resolvedDeviceId = deviceId ? parseInt(deviceId, 10) : null

      if (!resolvedDeviceId) {
        const requiredNewDevice = ['serial_number', 'model_number', 'product_category', 'brand']
        const missing = requiredNewDevice.filter((k) => !String(newDeviceData[k] || '').trim())
        if (missing.length > 0) {
          alert(
            'Every support ticket must be tied to a registered device. Use serial lookup/select an existing device, or fill all new device fields in Step 3.'
          )
          return
        }

        const deviceResp = await fetch(getApiBase() + '/devices/', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serial_number: newDeviceData.serial_number.trim(),
            model_number: newDeviceData.model_number.trim(),
            product_category: newDeviceData.product_category.trim(),
            brand: newDeviceData.brand.trim(),
            customer_id: resolvedCustomerId || undefined,
            support_customer: {
              full_name: formData.customer_name.trim(),
              email: formData.customer_email.trim().toLowerCase(),
              phone: formData.customer_phone.trim(),
            },
            registration_method: 'support_agent',
          }),
        })
        const deviceData = await deviceResp.json()
        if (!deviceResp.ok) {
          const msg = typeof deviceData.detail === 'string' ? deviceData.detail : JSON.stringify(deviceData.detail || deviceData)
          alert('Error registering device: ' + msg)
          return
        }
        resolvedDeviceId = deviceData.id
        resolvedCustomerId = resolvedCustomerId || deviceData.customer_id || null
        if (resolvedCustomerId) setCustomerId(String(resolvedCustomerId))
        if (resolvedDeviceId) setDeviceId(String(resolvedDeviceId))
      }

      const response = await fetch(getApiBase() + '/tickets/', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: resolvedCustomerId,
          customer_name: formData.customer_name.trim(),
          customer_company: formData.customer_company.trim(),
          customer_phone: formData.customer_phone.trim(),
          issue_description: formData.issue_description,
          device_id: resolvedDeviceId,
          device_serial: serialInput.trim() || undefined,
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

  const uploadSelectedAttachments = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    if (!attachmentFiles.length) return
    setUploadingAttachments(true)
    try {
      const uploaded = []
      for (const file of attachmentFiles) {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch(`${getApiBase()}/tickets/uploads`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        })
        const data = await res.json()
        if (!res.ok) {
          const msg = typeof data.detail === 'string' ? data.detail : 'Upload failed'
          throw new Error(msg)
        }
        if (data.url) uploaded.push(data.url)
      }
      setIssueAttachments((prev) => [...prev, ...uploaded])
      setAttachmentFiles([])
    } catch (err) {
      alert(`Attachment upload failed: ${err?.message || 'Unknown error'}`)
    } finally {
      setUploadingAttachments(false)
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
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <FormSection
            eyebrow="Step 1"
            title="Serial number / Service Tag"
            subtitle="Primary lookup — finds the asset, warranty state, owner, and past tickets."
          >
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                className="flex-1 px-4 py-3.5 rounded-xl border border-slate-200 bg-white font-mono text-sm"
                placeholder="e.g. ABC123XYZ or manufacturer serial"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => loadDeviceProfile()}
                disabled={serialProfileLoading}
                className="shrink-0 border-teal-400 text-teal-800 hover:bg-teal-50"
              >
                {serialProfileLoading ? 'Looking up…' : 'Lookup device'}
              </Button>
            </div>
            {serialProfileMessage && (
              <p className={`text-sm mt-2 ${serialProfileMessage.startsWith('Linked:') ? 'text-teal-800' : 'text-amber-800'}`}>
                {serialProfileMessage}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              If you do not use lookup, choose the customer and device in Step 3 — a device selection is required before submit.
            </p>
          </FormSection>

          <FormSection
            eyebrow="Step 2"
            title="Customer details"
            subtitle="Name, email, company, and phone are required."
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Name *</label>
                <input
                  value={formData.customer_name}
                  onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white"
                  placeholder="Customer name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.customer_email}
                  onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white"
                  placeholder="customer@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-800 mb-2">Number *</label>
                <input
                  value={formData.customer_phone}
                  onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                  required
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white"
                  placeholder="Phone number"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-800 mb-2">Company *</label>
                <input
                  value={formData.customer_company}
                  onChange={(e) => setFormData({ ...formData, customer_company: e.target.value })}
                  required
                  readOnly
                  aria-readonly="true"
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 cursor-not-allowed"
                  placeholder="Auto-filled from your organization"
                />
              </div>
            </div>
          </FormSection>

          <FormSection eyebrow="Step 3" title="Customer & device">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-2">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
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
              <label className="block text-sm font-semibold text-slate-800 mb-2">Device</label>
              <select
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
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
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                If no account/device exists yet, register device for this customer now
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={newDeviceData.serial_number}
                  onChange={(e) => {
                    const val = e.target.value
                    setNewDeviceData({ ...newDeviceData, serial_number: val })
                    tryAutofillFromCatalog(val, newDeviceData.model_number)
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                  placeholder="Serial number *"
                />
                <input
                  value={newDeviceData.model_number}
                  onChange={(e) => {
                    const val = e.target.value
                    setNewDeviceData({ ...newDeviceData, model_number: val })
                    tryAutofillFromCatalog(newDeviceData.serial_number, val)
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                  placeholder="Model number *"
                />
                <select
                  value={newDeviceData.product_category}
                  onChange={(e) => setNewDeviceData({ ...newDeviceData, product_category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Select category *</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.replace(/_/g, ' ')}
                    </option>
                  ))}
                </select>
                <select
                  value={newDeviceData.brand}
                  onChange={(e) => setNewDeviceData({ ...newDeviceData, brand: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="">Select brand *</option>
                  {brandOptions.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </FormSection>

          <FormSection eyebrow="Step 4" title="Issue" subtitle="Optional: describe the problem clearly for triage and routing.">
            <textarea
              value={formData.issue_description}
              onChange={(e) => setFormData({ ...formData, issue_description: e.target.value })}
              rows={6}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200"
              placeholder="Symptoms, error codes, when it started…"
            />
          </FormSection>

          <FormSection eyebrow="Step 5" title="Language & evidence" subtitle="Upload media evidence directly.">
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
              <label className="block text-sm font-semibold text-slate-800 mb-2">Photos / videos</label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => setAttachmentFiles(Array.from(e.target.files || []))}
                  className="flex-1 px-4 py-3 rounded-xl border border-slate-200"
                />
                <Button
                  type="button"
                  onClick={uploadSelectedAttachments}
                  disabled={uploadingAttachments || attachmentFiles.length === 0}
                >
                  {uploadingAttachments ? 'Uploading…' : 'Upload'}
                </Button>
              </div>
              {attachmentFiles.length > 0 && (
                <p className="mt-2 text-xs text-slate-600">
                  Selected: {attachmentFiles.map((f) => f.name).join(', ')}
                </p>
              )}
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

          <FormSection eyebrow="Step 6" title="Service location" subtitle="Include PIN / postal code for dispatch. Where the engineer should visit.">
            <textarea
              value={formData.service_address}
              onChange={(e) => setFormData({ ...formData, service_address: e.target.value })}
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

          <FormSection eyebrow="Step 7" title="Preferred visit times" subtitle="Customer availability windows.">
            <PreferredVisitSlotPicker value={preferredTimeSlots} onChange={setPreferredTimeSlots} />
          </FormSection>

          <FormSection eyebrow="Step 8" title="Contact & priority" subtitle="How to reach the customer.">
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
