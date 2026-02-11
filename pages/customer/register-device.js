import { useState } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { 
  Package, ArrowLeft, Camera, Upload, CheckCircle2, AlertCircle, FileSpreadsheet, FileText
} from 'lucide-react'

export default function RegisterDevice() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [bulkLoading, setBulkLoading] = useState(false)
  const [registrationMode, setRegistrationMode] = useState('single') // 'single' or 'bulk'
  const [bulkFile, setBulkFile] = useState(null)
  const [bulkResults, setBulkResults] = useState(null)
  const [formData, setFormData] = useState({
    serial_number: '',
    model_number: '',
    product_category: '',
    brand: '',
    purchase_date: '',
    invoice_number: '',
    invoice_photo: '',
    device_photo: '',
    qr_code: '',
    registration_method: 'serial',
    additional_info: ''
  })
  const [invoiceFile, setInvoiceFile] = useState(null)
  const [deviceFile, setDeviceFile] = useState(null)
  const [qrImageFile, setQrImageFile] = useState(null)
  const [qrDecodeLoading, setQrDecodeLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const [success, setSuccess] = useState(false)

  const productCategories = [
    'AC',
    'Washing Machine',
    'Refrigerator',
    'TV',
    'Microwave',
    'Water Purifier',
    'Air Purifier',
    'Geyser',
    'Other'
  ]

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSuccess(false)

    // Validation
    const newErrors = {}
    if (!formData.serial_number.trim()) {
      newErrors.serial_number = 'Serial number is required'
    }
    if (!formData.model_number.trim()) {
      newErrors.model_number = 'Model number is required'
    }
    if (!formData.product_category) {
      newErrors.product_category = 'Product category is required'
    }
    if (!formData.brand.trim()) {
      newErrors.brand = 'Brand is required'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const useUploadEndpoint = !!invoiceFile || !!deviceFile
      const response = await fetch(
        useUploadEndpoint
          ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/devices/register-with-files'
          : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/devices/',
        useUploadEndpoint
          ? {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: (() => {
                const fd = new FormData()
                fd.append('serial_number', formData.serial_number.trim())
                fd.append('model_number', formData.model_number.trim())
                fd.append('product_category', formData.product_category)
                fd.append('brand', formData.brand.trim())
                if (formData.purchase_date) fd.append('purchase_date', formData.purchase_date)
                if (formData.invoice_number) fd.append('invoice_number', formData.invoice_number.trim())
                if (formData.qr_code) fd.append('qr_code', formData.qr_code.trim())
                fd.append('registration_method', formData.registration_method || 'manual')
                if (formData.additional_info.trim()) fd.append('additional_info', formData.additional_info.trim())
                if (invoiceFile) fd.append('invoice_file', invoiceFile)
                if (deviceFile) fd.append('device_file', deviceFile)
                return fd
              })(),
            }
          : {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                serial_number: formData.serial_number.trim(),
                model_number: formData.model_number.trim(),
                product_category: formData.product_category,
                brand: formData.brand.trim(),
                purchase_date: formData.purchase_date || null,
                invoice_number: formData.invoice_number.trim() || null,
                invoice_photo: formData.invoice_photo.trim() || null,
                device_photo: formData.device_photo.trim() || null,
                qr_code: formData.qr_code.trim() || null,
                registration_method: formData.registration_method,
                additional_info: formData.additional_info.trim() ? { notes: formData.additional_info.trim() } : {}
              })
            }
      )

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
          router.push('/customer/dashboard')
        }, 2000)
      } else {
        setErrors({ submit: data.detail || 'Error registering device' })
      }
    } catch (error) {
      console.error('Error registering device:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const handleBulkFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel' &&
          !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        setErrors({ submit: 'Please upload a valid Excel file (.xlsx or .xls)' })
        return
      }
      setBulkFile(file)
      setErrors({})
      setBulkResults(null)
    }
  }

  const handleBulkSubmit = async (e) => {
    e.preventDefault()
    if (!bulkFile) {
      setErrors({ submit: 'Please select an Excel file to upload' })
      return
    }

    setBulkLoading(true)
    setErrors({})
    setBulkResults(null)

    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', bulkFile)

      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/devices/bulk-register', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setBulkResults(data)
        setBulkFile(null)
        // Reset file input
        const fileInput = document.getElementById('bulk-file-input')
        if (fileInput) fileInput.value = ''
      } else {
        setErrors({ submit: data.detail || 'Error processing Excel file' })
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      setErrors({ submit: 'Network error. Please try again.' })
    } finally {
      setBulkLoading(false)
    }
  }

  const handleQrDecode = async () => {
    if (!qrImageFile) return
    const token = localStorage.getItem('token')
    if (!token) return
    setQrDecodeLoading(true)
    try {
      const fd = new FormData()
      fd.append('qr_image', qrImageFile)
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/devices/qr-decode', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd
      })
      const data = await response.json()
      if (!response.ok) {
        setErrors({ submit: data.detail || 'QR decode failed' })
      } else {
        const parsed = data.parsed || {}
        setFormData(prev => ({
          ...prev,
          serial_number: parsed.serial_number || prev.serial_number,
          model_number: parsed.model_number || prev.model_number,
          brand: parsed.brand || prev.brand,
          product_category: parsed.product_category || prev.product_category,
          qr_code: data.raw_payload || prev.qr_code
        }))
      }
    } catch (error) {
      setErrors({ submit: 'QR decode failed' })
    } finally {
      setQrDecodeLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Package size={24} />
              Register New Device
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Mode Selection Tabs */}
            <div className="flex gap-2 mb-6 border-b">
              <button
                type="button"
                onClick={() => {
                  setRegistrationMode('single')
                  setBulkFile(null)
                  setBulkResults(null)
                  setErrors({})
                }}
                className={`px-4 py-2 font-medium transition-colors ${
                  registrationMode === 'single'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileText size={18} className="inline mr-2" />
                Single Device
              </button>
              <button
                type="button"
                onClick={() => {
                  setRegistrationMode('bulk')
                  setSuccess(false)
                  setErrors({})
                }}
                className={`px-4 py-2 font-medium transition-colors ${
                  registrationMode === 'bulk'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <FileSpreadsheet size={18} className="inline mr-2" />
                Bulk Upload (Excel)
              </button>
            </div>
            {registrationMode === 'bulk' ? (
              <div className="space-y-6">
                {bulkResults ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h3 className="font-bold text-green-900 mb-2">Bulk Registration Complete!</h3>
                      <div className="space-y-1 text-sm">
                        <p><strong>Total:</strong> {bulkResults.total}</p>
                        <p className="text-green-700"><strong>Successfully registered:</strong> {bulkResults.successful}</p>
                        {bulkResults.failed > 0 && (
                          <p className="text-red-700"><strong>Failed:</strong> {bulkResults.failed}</p>
                        )}
                      </div>
                    </div>
                    {bulkResults.errors && bulkResults.errors.length > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-64 overflow-y-auto">
                        <h4 className="font-bold text-red-900 mb-2">Errors:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                          {bulkResults.errors.map((error, idx) => (
                            <li key={idx}>{error}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div className="flex gap-4">
                      <Button
                        type="button"
                        onClick={() => {
                          setBulkResults(null)
                          setBulkFile(null)
                        }}
                        className="flex-1"
                      >
                        Register More Devices
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push('/customer/dashboard')}
                      >
                        Go to Dashboard
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleBulkSubmit} className="space-y-6">
                    {errors.submit && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                        <AlertCircle size={20} className="text-red-600" />
                        <p className="text-red-700">{errors.submit}</p>
                      </div>
                    )}

                    <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                      <Label htmlFor="bulk-file-input" className="cursor-pointer">
                        <div className="space-y-2">
                          <p className="text-lg font-medium text-gray-900">
                            {bulkFile ? bulkFile.name : 'Upload Excel File'}
                          </p>
                          <p className="text-sm text-gray-500">
                            Click to browse or drag and drop
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            Supported formats: .xlsx, .xls
                          </p>
                        </div>
                      </Label>
                      <Input
                        id="bulk-file-input"
                        type="file"
                        accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                        onChange={handleBulkFileChange}
                        className="hidden"
                      />
                      {bulkFile && (
                        <div className="mt-4 text-sm text-green-600">
                          ✓ File selected: {bulkFile.name} ({(bulkFile.size / 1024).toFixed(2)} KB)
                        </div>
                      )}
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-bold text-blue-900 mb-2">Excel File Format</h4>
                      <p className="text-sm text-blue-800 mb-2">
                        Your Excel file should have the following columns (first row should be headers):
                      </p>
                      <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                        <li><strong>serial_number</strong> (required) - Device serial number</li>
                        <li><strong>model_number</strong> (required) - Device model number</li>
                        <li><strong>product_category</strong> (required) - AC, Washing Machine, Refrigerator, TV, etc.</li>
                        <li><strong>brand</strong> (required) - Device brand name</li>
                        <li><strong>purchase_date</strong> (optional) - Format: YYYY-MM-DD</li>
                        <li><strong>invoice_number</strong> (optional) - Invoice number</li>
                      </ul>
                    </div>

                    <div className="flex gap-4">
                      <Button
                        type="submit"
                        disabled={bulkLoading || !bulkFile}
                        className="flex-1"
                      >
                        {bulkLoading ? 'Processing...' : 'Upload and Register Devices'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        disabled={bulkLoading}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            ) : success ? (
              <div className="text-center py-12">
                <CheckCircle2 size={64} className="mx-auto text-green-600 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">Device Registered Successfully!</h3>
                <p className="text-gray-600 mb-4">Redirecting to dashboard...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.submit && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                    <AlertCircle size={20} className="text-red-600" />
                    <p className="text-red-700">{errors.submit}</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="registration_method">
                      Registration Method
                    </Label>
                    <Select
                      value={formData.registration_method}
                      onValueChange={(value) => handleChange('registration_method', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="serial">Serial Number</SelectItem>
                        <SelectItem value="invoice">Invoice Photo</SelectItem>
                        <SelectItem value="qr">QR Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.registration_method === 'qr' && (
                    <div>
                      <Label htmlFor="qr_code">
                        QR Code
                      </Label>
                      <Input
                        id="qr_code"
                        value={formData.qr_code}
                        onChange={(e) => handleChange('qr_code', e.target.value)}
                        placeholder="Scan or enter QR code"
                      />
                      <div className="mt-2 space-y-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setQrImageFile(e.target.files?.[0] || null)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleQrDecode}
                          disabled={!qrImageFile || qrDecodeLoading}
                        >
                          {qrDecodeLoading ? 'Decoding...' : 'Decode QR Image'}
                        </Button>
                      </div>
                    </div>
                  )}
                  <div>
                    <Label htmlFor="serial_number">
                      Serial Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="serial_number"
                      value={formData.serial_number}
                      onChange={(e) => handleChange('serial_number', e.target.value)}
                      placeholder="Enter device serial number"
                      className={errors.serial_number ? 'border-red-500' : ''}
                    />
                    {errors.serial_number && (
                      <p className="text-sm text-red-600 mt-1">{errors.serial_number}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="model_number">
                      Model Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="model_number"
                      value={formData.model_number}
                      onChange={(e) => handleChange('model_number', e.target.value)}
                      placeholder="Enter model number"
                      className={errors.model_number ? 'border-red-500' : ''}
                    />
                    {errors.model_number && (
                      <p className="text-sm text-red-600 mt-1">{errors.model_number}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="brand">
                      Brand <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="brand"
                      value={formData.brand}
                      onChange={(e) => handleChange('brand', e.target.value)}
                      placeholder="e.g., Samsung, LG, Whirlpool"
                      className={errors.brand ? 'border-red-500' : ''}
                    />
                    {errors.brand && (
                      <p className="text-sm text-red-600 mt-1">{errors.brand}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="product_category">
                      Product Category <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={formData.product_category}
                      onValueChange={(value) => handleChange('product_category', value)}
                    >
                      <SelectTrigger className={errors.product_category ? 'border-red-500' : ''}>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {productCategories.map(category => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.product_category && (
                      <p className="text-sm text-red-600 mt-1">{errors.product_category}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="purchase_date">Purchase Date</Label>
                    <Input
                      id="purchase_date"
                      type="date"
                      value={formData.purchase_date}
                      onChange={(e) => handleChange('purchase_date', e.target.value)}
                    />
                  </div>

                  <div>
                    <Label htmlFor="invoice_number">Invoice Number</Label>
                    <Input
                      id="invoice_number"
                      value={formData.invoice_number}
                      onChange={(e) => handleChange('invoice_number', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                <div>
                  <Label>Invoice Photo Upload</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setInvoiceFile(e.target.files?.[0] || null)}
                  />
                  {invoiceFile && (
                    <p className="text-sm text-green-600 mt-1">Selected: {invoiceFile.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="invoice_photo">Invoice Photo URL</Label>
                  <Input
                    id="invoice_photo"
                    value={formData.invoice_photo}
                    onChange={(e) => handleChange('invoice_photo', e.target.value)}
                    placeholder="Paste image URL (optional)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Use either file upload or a URL</p>
                </div>

                <div>
                  <Label>Device Photo Upload</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setDeviceFile(e.target.files?.[0] || null)}
                  />
                  {deviceFile && (
                    <p className="text-sm text-green-600 mt-1">Selected: {deviceFile.name}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="device_photo">Device Photo URL</Label>
                  <Input
                    id="device_photo"
                    value={formData.device_photo}
                    onChange={(e) => handleChange('device_photo', e.target.value)}
                    placeholder="Paste image URL (optional)"
                  />
                  <p className="text-sm text-gray-500 mt-1">Use either file upload or a URL</p>
                </div>

                <div>
                  <Label htmlFor="additional_info">Additional Information</Label>
                  <Textarea
                    id="additional_info"
                    value={formData.additional_info}
                    onChange={(e) => handleChange('additional_info', e.target.value)}
                    rows={4}
                    placeholder="Any additional notes about the device..."
                  />
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? 'Registering...' : 'Register Device'}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                  >
                    Cancel
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
