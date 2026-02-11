import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { ArrowLeft, Package, Shield, FileText, Camera } from 'lucide-react'

export default function CustomerDeviceDetail() {
  const router = useRouter()
  const { id } = router.query
  const [device, setDevice] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    if (!id) return
    const loadDevice = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
        return
      }

      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/devices/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (response.ok) {
          const data = await response.json()
          setDevice(data)
        }
      } catch (error) {
        console.error('Error loading device:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDevice()
  }, [id, router])

  if (loading || !device) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading device details...</p>
        </div>
      </div>
    )
  }

  const warrantyBadge = device.warranty_status === 'in_warranty'
    ? { label: 'In Warranty', className: 'bg-green-100 text-green-700' }
    : device.warranty_status === 'out_of_warranty'
      ? { label: 'Out of Warranty', className: 'bg-red-100 text-red-700' }
      : { label: 'Unknown', className: 'bg-gray-100 text-gray-700' }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-6">
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package size={22} />
              {device.brand} {device.model_number}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-wrap gap-3">
              <Badge className={warrantyBadge.className}>
                <Shield size={12} className="mr-1" />
                {warrantyBadge.label}
              </Badge>
              <Badge variant="secondary">{device.product_category}</Badge>
              <Badge variant="outline">SN: {device.serial_number}</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Purchase Date</span>
                  <span>{device.purchase_date ? new Date(device.purchase_date).toLocaleDateString() : '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice Number</span>
                  <span>{device.invoice_number || '—'}</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">QR Code</span>
                  <span>{device.qr_code || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Registered</span>
                  <span>{device.created_at ? new Date(device.created_at).toLocaleDateString() : '—'}</span>
                </div>
              </div>
            </div>

            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield size={18} />
                  Warranty Coverage
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-700">
                {device.warranty_summary && (
                  <p className="text-gray-800">{device.warranty_summary}</p>
                )}
                {device.warranty_details ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Type</span>
                      <span className="capitalize">{device.warranty_details.warranty_type?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Valid Until</span>
                      <span>{new Date(device.warranty_details.end_date).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Covered Parts</div>
                      <div className="flex flex-wrap gap-2">
                        {(device.warranty_details.covered_parts || []).length > 0 ? (
                          device.warranty_details.covered_parts.map((part) => (
                            <Badge key={part} variant="secondary">{part}</Badge>
                          ))
                        ) : (
                          <span className="text-gray-600">Standard coverage</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500 mb-1">Covered Services</div>
                      <div className="flex flex-wrap gap-2">
                        {(device.warranty_details.covered_services || []).length > 0 ? (
                          device.warranty_details.covered_services.map((service) => (
                            <Badge key={service} variant="secondary">{service}</Badge>
                          ))
                        ) : (
                          <span className="text-gray-600">Parts + labour as per policy</span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">No warranty details available yet.</p>
                )}
                <div>
                  <Button
                    variant="outline"
                    onClick={async () => {
                      const token = localStorage.getItem('token')
                      if (!token) {
                        router.push('/login')
                        return
                      }
                      setSyncing(true)
                      try {
                        const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/warranty/sync', {
                          method: 'POST',
                          headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ device_id: device.id })
                        })
                        const data = await response.json()
                        if (!response.ok) {
                          alert(data.detail || 'Warranty sync failed')
                        } else {
                          alert('OEM warranty synced')
                          router.replace(router.asPath)
                        }
                      } catch (error) {
                        alert('Warranty sync failed')
                      } finally {
                        setSyncing(false)
                      }
                    }}
                    disabled={syncing}
                  >
                    {syncing ? 'Syncing...' : 'Sync OEM Warranty'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {(device.invoice_photo || device.device_photo) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {device.invoice_photo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <FileText size={16} />
                        Invoice Photo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href={device.invoice_photo} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Invoice
                      </a>
                    </CardContent>
                  </Card>
                )}
                {device.device_photo && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Camera size={16} />
                        Device Photo
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <a href={device.device_photo} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Photo
                      </a>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={() => router.push(`/customer/create-ticket?device_id=${device.id}`)}>
                Create Service Ticket
              </Button>
              <Button variant="outline" onClick={() => router.push('/customer/register-device')}>
                Register Another Device
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
