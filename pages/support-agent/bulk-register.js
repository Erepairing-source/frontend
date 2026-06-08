import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft, FileSpreadsheet, Search, Upload, User, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { Input } from '../../components/ui/input'
import { getApiBase } from '@lib/api'

export default function SupportAgentBulkRegister() {
  const router = useRouter()

  const [customerFile, setCustomerFile] = useState(null)
  const [customerSendEmail, setCustomerSendEmail] = useState(true)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerResults, setCustomerResults] = useState(null)

  const [customers, setCustomers] = useState([])
  const [customersLoading, setCustomersLoading] = useState(true)
  const [customerSearch, setCustomerSearch] = useState('')
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [showCustomerList, setShowCustomerList] = useState(false)

  const [deviceFile, setDeviceFile] = useState(null)
  const [deviceLoading, setDeviceLoading] = useState(false)
  const [deviceResults, setDeviceResults] = useState(null)

  const authHeaders = () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return null
    }
    return { Authorization: `Bearer ${token}` }
  }

  useEffect(() => {
    const headers = authHeaders()
    if (!headers) return
    setCustomersLoading(true)
    fetch(`${getApiBase()}/users/?role=customer`, { headers })
      .then((res) => (res.ok ? res.json() : []))
      .then((list) => setCustomers(Array.isArray(list) ? list : []))
      .catch(() => setCustomers([]))
      .finally(() => setCustomersLoading(false))
  }, [])

  const filteredCustomers = useMemo(() => {
    const q = customerSearch.trim().toLowerCase()
    if (!q) return customers.slice(0, 25)
    return customers
      .filter((c) => {
        const hay = `${c.full_name || ''} ${c.email || ''} ${c.phone || ''}`.toLowerCase()
        return hay.includes(q)
      })
      .slice(0, 25)
  }, [customers, customerSearch])

  const onCustomerFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCustomerFile(file)
    setCustomerResults(null)
  }

  const onDeviceFile = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setDeviceFile(file)
    setDeviceResults(null)
  }

  const selectCustomer = (customer) => {
    setSelectedCustomer(customer)
    setCustomerSearch('')
    setShowCustomerList(false)
    setDeviceFile(null)
    setDeviceResults(null)
    const input = document.getElementById('sa-bulk-device-file')
    if (input) input.value = ''
  }

  const clearSelectedCustomer = () => {
    setSelectedCustomer(null)
    setDeviceFile(null)
    setDeviceResults(null)
  }

  const downloadCustomerTemplate = async () => {
    const headers = authHeaders()
    if (!headers) return
    try {
      const res = await fetch(`${getApiBase()}/users/bulk-customers-template`, { headers })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.detail || 'Failed to download template')
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bulk_customers_template.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download template')
    }
  }

  const downloadLocationReference = async () => {
    const headers = authHeaders()
    if (!headers) return
    try {
      const res = await fetch(`${getApiBase()}/users/bulk-location-reference-template`, { headers })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.detail || 'Failed to download location reference')
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bulk_upload_location_reference.xlsx'
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download location reference')
    }
  }

  const downloadDeviceTemplate = async () => {
    if (!selectedCustomer) {
      alert('Select a customer first')
      return
    }
    const headers = authHeaders()
    if (!headers) return
    try {
      const res = await fetch(
        `${getApiBase()}/devices/bulk-register-template?customer_id=${selectedCustomer.id}`,
        { headers }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.detail || 'Failed to download template')
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `bulk_devices_${selectedCustomer.id}.xlsx`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch {
      alert('Failed to download template')
    }
  }

  const submitCustomers = async (e) => {
    e.preventDefault()
    if (!customerFile) {
      alert('Select an Excel file for customers')
      return
    }
    const headers = authHeaders()
    if (!headers) return
    setCustomerLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', customerFile)
      formData.append('send_email', customerSendEmail)
      const res = await fetch(`${getApiBase()}/users/bulk-customers`, {
        method: 'POST',
        headers,
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setCustomerResults(data)
        setCustomerFile(null)
        const input = document.getElementById('sa-bulk-customer-file')
        if (input) input.value = ''
        const refreshHeaders = authHeaders()
        if (refreshHeaders) {
          fetch(`${getApiBase()}/users/?role=customer`, { headers: refreshHeaders })
            .then((r) => (r.ok ? r.json() : []))
            .then((list) => setCustomers(Array.isArray(list) ? list : []))
            .catch(() => {})
        }
      } else {
        alert(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail) || 'Upload failed')
      }
    } catch {
      alert('Upload failed')
    } finally {
      setCustomerLoading(false)
    }
  }

  const submitDevices = async (e) => {
    e.preventDefault()
    if (!selectedCustomer) {
      alert('Select a customer first')
      return
    }
    if (!deviceFile) {
      alert('Select an Excel file for devices')
      return
    }
    const headers = authHeaders()
    if (!headers) return
    setDeviceLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', deviceFile)
      formData.append('customer_id', String(selectedCustomer.id))
      const res = await fetch(`${getApiBase()}/devices/bulk-register`, {
        method: 'POST',
        headers,
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setDeviceResults(data)
        setDeviceFile(null)
        const input = document.getElementById('sa-bulk-device-file')
        if (input) input.value = ''
      } else {
        alert(typeof data.detail === 'string' ? data.detail : JSON.stringify(data.detail) || 'Upload failed')
      }
    } catch {
      alert('Upload failed')
    } finally {
      setDeviceLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-indigo-50/40">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link href="/support-agent/dashboard" className="inline-flex items-center text-sm text-teal-700 hover:underline mb-6">
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to support desk
        </Link>

        <h1 className="text-3xl font-bold text-slate-900 mb-2">Bulk onboarding</h1>
        <p className="text-slate-600 mb-8">
          Register customers, then select a customer and bulk-upload their devices. All devices in the file are assigned
          to the customer you pick.
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
              Bulk register customers
            </CardTitle>
            <p className="text-sm text-slate-600 font-normal">
              Required: full_name, email, phone. Optional: password, country/state/city (same as org admin Add User).
              Optional columns may use NA, N/A, or be left blank.
            </p>
          </CardHeader>
          <CardContent>
            {customerResults ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2 text-sm">
                <p className="font-semibold text-green-900">Customer upload complete</p>
                <p>Created: {customerResults.created} · Skipped: {customerResults.skipped}</p>
                {customerResults.errors?.length > 0 && (
                  <ul className="list-disc list-inside text-amber-800 max-h-32 overflow-y-auto">
                    {customerResults.errors.slice(0, 8).map((err, i) => (
                      <li key={i}>
                        Row {err.row}: {err.error}
                      </li>
                    ))}
                  </ul>
                )}
                <Button variant="outline" size="sm" onClick={() => setCustomerResults(null)}>
                  Upload another
                </Button>
              </div>
            ) : (
              <form onSubmit={submitCustomers} className="space-y-4">
                <div>
                  <Label htmlFor="sa-bulk-customer-file">Excel file (.xlsx)</Label>
                  <input
                    id="sa-bulk-customer-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={onCustomerFile}
                    className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="sa-bulk-customer-email"
                    checked={customerSendEmail}
                    onChange={(e) => setCustomerSendEmail(e.target.checked)}
                  />
                  <Label htmlFor="sa-bulk-customer-email" className="cursor-pointer font-normal">
                    Email customers (set-password link if password column is blank)
                  </Label>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={customerLoading || !customerFile} className="bg-teal-600 hover:bg-teal-700">
                    <Upload className="w-4 h-4 mr-1" />
                    {customerLoading ? 'Uploading…' : 'Upload customers'}
                  </Button>
                  <Button type="button" variant="outline" onClick={downloadCustomerTemplate}>
                    Download template
                  </Button>
                  <Button type="button" variant="outline" onClick={downloadLocationReference}>
                    Download location IDs
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Use the location IDs file to copy valid country/state/city IDs or names before upload.
                </p>
              </form>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
              Bulk register customer devices
            </CardTitle>
            <p className="text-sm text-slate-600 font-normal">
              Step 1: Search and select a customer. Step 2: Download the device template. Step 3: Upload the filled Excel
              file — every row is registered to that customer. Optional columns (brand, purchase_date, invoice_number)
              may use NA or N/A if not applicable.
            </p>
          </CardHeader>
          <CardContent>
            {deviceResults ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2 text-sm">
                <p className="font-semibold text-green-900">{deviceResults.message || 'Device upload complete'}</p>
                {deviceResults.customer && (
                  <p className="text-slate-700">
                    Customer: <strong>{deviceResults.customer.full_name}</strong> ({deviceResults.customer.email})
                  </p>
                )}
                <p>
                  Successful: {deviceResults.successful}
                  {deviceResults.skipped > 0 && <> · Skipped (already exist): {deviceResults.skipped}</>}
                  {deviceResults.failed > 0 && <> · Failed: {deviceResults.failed}</>}
                </p>
                {deviceResults.skipped_rows?.length > 0 && (
                  <div className="text-amber-800">
                    <p className="font-medium mb-1">Skipped devices:</p>
                    <ul className="list-disc list-inside max-h-32 overflow-y-auto">
                      {deviceResults.skipped_rows.slice(0, 8).map((item, i) => (
                        <li key={i}>
                          Row {item.row}: {item.serial_number} — {item.reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {deviceResults.errors?.length > 0 && (
                  <ul className="list-disc list-inside text-red-800 max-h-32 overflow-y-auto">
                    {deviceResults.errors.slice(0, 8).map((msg, i) => (
                      <li key={i}>{msg}</li>
                    ))}
                  </ul>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setDeviceResults(null)
                    setDeviceFile(null)
                  }}
                >
                  Upload another file
                </Button>
              </div>
            ) : (
              <form onSubmit={submitDevices} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="sa-customer-search">Select customer *</Label>
                  {selectedCustomer ? (
                    <div className="flex items-start justify-between gap-2 rounded-lg border border-teal-200 bg-teal-50/80 p-3">
                      <div className="flex gap-2 min-w-0">
                        <User className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{selectedCustomer.full_name}</p>
                          <p className="text-sm text-slate-600 truncate">{selectedCustomer.email}</p>
                          <p className="text-sm text-slate-500">{selectedCustomer.phone}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={clearSelectedCustomer}
                        className="text-slate-400 hover:text-slate-700 shrink-0"
                        aria-label="Clear customer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="sa-customer-search"
                        type="search"
                        placeholder={customersLoading ? 'Loading customers…' : 'Type name, email, or phone…'}
                        value={customerSearch}
                        onChange={(e) => {
                          setCustomerSearch(e.target.value)
                          setShowCustomerList(true)
                        }}
                        onFocus={() => setShowCustomerList(true)}
                        className="pl-9"
                        disabled={customersLoading}
                        autoComplete="off"
                      />
                      {showCustomerList && !customersLoading && (
                        <ul className="absolute z-20 mt-1 w-full max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-lg text-sm">
                          {filteredCustomers.length === 0 ? (
                            <li className="px-3 py-2 text-slate-500">No customers match your search</li>
                          ) : (
                            filteredCustomers.map((c) => (
                              <li key={c.id}>
                                <button
                                  type="button"
                                  className="w-full text-left px-3 py-2 hover:bg-teal-50 border-b border-slate-100 last:border-0"
                                  onClick={() => selectCustomer(c)}
                                >
                                  <span className="font-medium text-slate-900">{c.full_name}</span>
                                  <span className="block text-slate-500 text-xs">
                                    {c.email} · {c.phone}
                                  </span>
                                </button>
                              </li>
                            ))
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="sa-bulk-device-file">Excel file (.xlsx)</Label>
                  <input
                    id="sa-bulk-device-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={onDeviceFile}
                    disabled={!selectedCustomer}
                    className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border disabled:opacity-50"
                  />
                  {!selectedCustomer && (
                    <p className="text-xs text-amber-700 mt-1">Select a customer before choosing a file.</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={deviceLoading || !deviceFile || !selectedCustomer}
                    className="bg-teal-600 hover:bg-teal-700"
                  >
                    <Upload className="w-4 h-4 mr-1" />
                    {deviceLoading ? 'Uploading…' : 'Upload devices'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={downloadDeviceTemplate}
                    disabled={!selectedCustomer}
                  >
                    Download template
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
