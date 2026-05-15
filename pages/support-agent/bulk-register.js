import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { ArrowLeft, FileSpreadsheet, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Label } from '../../components/ui/label'
import { getApiBase } from '@lib/api'

export default function SupportAgentBulkRegister() {
  const router = useRouter()

  const [customerFile, setCustomerFile] = useState(null)
  const [customerSendEmail, setCustomerSendEmail] = useState(true)
  const [customerLoading, setCustomerLoading] = useState(false)
  const [customerResults, setCustomerResults] = useState(null)

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

  const downloadDeviceTemplate = async () => {
    const headers = authHeaders()
    if (!headers) return
    try {
      const res = await fetch(`${getApiBase()}/devices/bulk-register-template`, { headers })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.detail || 'Failed to download template')
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'bulk_device_registration_template.xlsx'
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
          Register many customers and their devices for your organization. Use the templates — device rows must include
          customer email, phone, and full name (or customer_id for existing accounts).
        </p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileSpreadsheet className="w-5 h-5 text-teal-600" />
              Bulk register customers
            </CardTitle>
            <p className="text-sm text-slate-600 font-normal">
              Required: full_name, email, phone. Optional: password, country/state/city (same as org admin Add User).
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
                </div>
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
              Device columns plus customer_email, customer_phone, customer_full_name (or customer_id). Existing customers
              are matched by email/phone; new ones are created automatically.
            </p>
          </CardHeader>
          <CardContent>
            {deviceResults ? (
              <div className="rounded-lg border border-green-200 bg-green-50 p-4 space-y-2 text-sm">
                <p className="font-semibold text-green-900">{deviceResults.message || 'Device upload complete'}</p>
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
                <Button variant="outline" size="sm" onClick={() => setDeviceResults(null)}>
                  Upload another
                </Button>
              </div>
            ) : (
              <form onSubmit={submitDevices} className="space-y-4">
                <div>
                  <Label htmlFor="sa-bulk-device-file">Excel file (.xlsx)</Label>
                  <input
                    id="sa-bulk-device-file"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={onDeviceFile}
                    className="mt-1 block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded file:border"
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button type="submit" disabled={deviceLoading || !deviceFile} className="bg-teal-600 hover:bg-teal-700">
                    <Upload className="w-4 h-4 mr-1" />
                    {deviceLoading ? 'Uploading…' : 'Upload devices'}
                  </Button>
                  <Button type="button" variant="outline" onClick={downloadDeviceTemplate}>
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


