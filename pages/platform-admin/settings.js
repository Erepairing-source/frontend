import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Textarea } from '../../components/ui/textarea'
import {
  ArrowLeft, Settings, Globe, CreditCard, Shield, Bell,
  Zap, Plug, Server, Save, RefreshCw, AlertCircle, CheckCircle2
} from 'lucide-react'

const SETTING_CATEGORIES = [
  { id: 'general', label: 'General', icon: Globe },
  { id: 'billing', label: 'Billing & Payments', icon: CreditCard },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'features', label: 'Features', icon: Zap },
  { id: 'integrations', label: 'Integrations', icon: Plug },
]

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({})
  const [activeTab, setActiveTab] = useState('general')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadSettings()
  }, [router])

  const loadSettings = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch('http://localhost:8000/api/v1/platform-admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (!response.ok) {
        // If no settings exist, initialize them
        if (response.status === 404 || response.status === 500) {
          const initResponse = await initializeSettings()
          if (initResponse) {
            // Retry loading after initialization
            const retryResponse = await fetch('http://localhost:8000/api/v1/platform-admin/settings', {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            if (retryResponse.ok) {
              const data = await retryResponse.json()
              setSettings(data)
              setLoading(false)
              return
            }
          }
        }
        throw new Error('Failed to fetch settings')
      }

      const data = await response.json()
      console.log('Settings loaded:', data)
      console.log('Settings keys:', Object.keys(data || {}))
      
      // Check if settings are empty
      if (!data || Object.keys(data).length === 0) {
        console.log('Settings are empty, attempting to initialize...')
        // Auto-initialize if empty
        const initSuccess = await initializeSettings()
        if (initSuccess) {
          // Reload settings after initialization
          const retryResponse = await fetch('http://localhost:8000/api/v1/platform-admin/settings', {
            headers: { 'Authorization': `Bearer ${token}` }
          })
          if (retryResponse.ok) {
            const retryData = await retryResponse.json()
            console.log('Settings after initialization:', retryData)
            setSettings(retryData)
            setLoading(false)
            return
          }
        }
      }
      
      setSettings(data || {})
      setLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      setMessage({ type: 'error', text: `Error loading settings: ${error.message}. Please check the console.` })
      setLoading(false)
    }
  }

  const initializeSettings = async () => {
    const token = localStorage.getItem('token')
    setSaving(true)
    try {
      const response = await fetch('http://localhost:8000/api/v1/platform-admin/settings/initialize', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: `Initialized ${data.created} default settings` })
        // Reload settings after initialization
        await loadSettings()
        setSaving(false)
        return true
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
        setMessage({ type: 'error', text: errorData.detail || 'Failed to initialize settings' })
        setSaving(false)
        return false
      }
    } catch (error) {
      console.error('Error initializing settings:', error)
      setMessage({ type: 'error', text: `Failed to initialize settings: ${error.message}` })
      setSaving(false)
      return false
    }
  }

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: {
          ...prev[category]?.[key],
          value: value
        }
      }
    }))
    setHasChanges(true)
    setMessage({ type: '', text: '' })
  }

  const handleSave = async () => {
    setSaving(true)
    const token = localStorage.getItem('token')
    
    try {
      const response = await fetch('http://localhost:8000/api/v1/platform-admin/settings', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' })
      setHasChanges(false)
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' })
    } finally {
      setSaving(false)
    }
  }

  const renderSettingField = (category, key, setting) => {
    if (!setting) return null

    const { value, type, description } = setting

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label className="text-base font-semibold">{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
              {description && <p className="text-sm text-gray-600 mt-1">{description}</p>}
            </div>
            <Switch
              checked={value === true || value === 'true'}
              onCheckedChange={(checked) => handleSettingChange(category, key, checked)}
            />
          </div>
        )

      case 'number':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
            {description && <p className="text-sm text-gray-600">{description}</p>}
            <Input
              id={key}
              type="number"
              value={value || ''}
              onChange={(e) => handleSettingChange(category, key, parseFloat(e.target.value) || 0)}
              className="max-w-xs"
            />
          </div>
        )

      case 'json':
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
            {description && <p className="text-sm text-gray-600">{description}</p>}
            <Textarea
              id={key}
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value || ''}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value)
                  handleSettingChange(category, key, parsed)
                } catch {
                  handleSettingChange(category, key, e.target.value)
                }
              }}
              rows={4}
              className="font-mono text-sm"
            />
          </div>
        )

      default:
        // Special handling for dropdown fields
        if (key === 'timezone') {
          const timezones = [
            'Asia/Kolkata', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
            'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Australia/Sydney', 'UTC'
          ]
          return (
            <div className="space-y-2">
              <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
              {description && <p className="text-sm text-gray-600">{description}</p>}
              <Select value={value || 'Asia/Kolkata'} onValueChange={(val) => handleSettingChange(category, key, val)}>
                <SelectTrigger className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map(tz => (
                    <SelectItem key={tz} value={tz}>{tz}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
        
        if (key === 'currency') {
          const currencies = ['INR', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD']
          return (
            <div className="space-y-2">
              <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
              {description && <p className="text-sm text-gray-600">{description}</p>}
              <Select value={value || 'INR'} onValueChange={(val) => handleSettingChange(category, key, val)}>
                <SelectTrigger className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {currencies.map(curr => (
                    <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
        
        if (key === 'language') {
          const languages = [
            { code: 'en', name: 'English' },
            { code: 'hi', name: 'Hindi' },
            { code: 'es', name: 'Spanish' },
            { code: 'fr', name: 'French' },
            { code: 'de', name: 'German' }
          ]
          return (
            <div className="space-y-2">
              <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
              {description && <p className="text-sm text-gray-600">{description}</p>}
              <Select value={value || 'en'} onValueChange={(val) => handleSettingChange(category, key, val)}>
                <SelectTrigger className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map(lang => (
                    <SelectItem key={lang.code} value={lang.code}>{lang.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
        
        if (key === 'payment_gateway') {
          const gateways = ['razorpay', 'stripe', 'paypal', 'payu', 'cashfree']
          return (
            <div className="space-y-2">
              <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
              {description && <p className="text-sm text-gray-600">{description}</p>}
              <Select value={value || 'razorpay'} onValueChange={(val) => handleSettingChange(category, key, val)}>
                <SelectTrigger className="max-w-md">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {gateways.map(gw => (
                    <SelectItem key={gw} value={gw}>{gw.charAt(0).toUpperCase() + gw.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )
        }
        
        return (
          <div className="space-y-2">
            <Label htmlFor={key}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Label>
            {description && <p className="text-sm text-gray-600">{description}</p>}
            <Input
              id={key}
              type="text"
              value={value || ''}
              onChange={(e) => handleSettingChange(category, key, e.target.value)}
              className="max-w-md"
            />
          </div>
        )
    }
  }

  const renderTabContent = () => {
    const categorySettings = settings[activeTab] || {}
    
    // Check if settings are empty (no categories at all)
    if (!settings || Object.keys(settings).length === 0) {
      return (
        <div className="text-center py-12">
          <Settings size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Settings Found</h2>
          <p className="text-gray-600 mb-6">
            Settings haven't been initialized yet. Click the button below to initialize default settings.
          </p>
          <Button onClick={initializeSettings} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
            {saving ? (
              <>
                <RefreshCw size={16} className="mr-2 animate-spin" />
                Initializing...
              </>
            ) : (
              <>
                <RefreshCw size={16} className="mr-2" />
                Initialize Default Settings
              </>
            )}
          </Button>
        </div>
      )
    }
    
    // Check if current category has no settings
    if (!categorySettings || Object.keys(categorySettings).length === 0) {
      return (
        <div className="text-center py-12">
          <p className="text-gray-600">No settings available for this category.</p>
          <Button 
            onClick={initializeSettings} 
            variant="outline" 
            className="mt-4"
            disabled={saving}
          >
            <RefreshCw size={16} className="mr-2" />
            Initialize Settings
          </Button>
        </div>
      )
    }

    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            {Object.keys(categorySettings).length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(categorySettings).map(([key, setting]) => {
                  if (!setting || typeof setting !== 'object') {
                    console.warn('Invalid setting format for', key, setting)
                    return null
                  }
                  return (
                    <div key={key}>
                      {renderSettingField(activeTab, key, setting)}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                No settings found for this category. Try refreshing or initializing settings.
              </div>
            )}
          </div>
        )

      case 'billing':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categorySettings).map(([key, setting]) => (
                <div key={key}>
                  {renderSettingField(activeTab, key, setting)}
                </div>
              ))}
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-3">
                <AlertCircle className="text-yellow-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-yellow-900 mb-1">Security Warning</h3>
                  <p className="text-sm text-yellow-800">
                    Changes to security settings may affect user access and authentication. Please review carefully before saving.
                  </p>
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categorySettings).map(([key, setting]) => (
                <div key={key}>
                  {renderSettingField(activeTab, key, setting)}
                </div>
              ))}
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categorySettings).map(([key, setting]) => (
                <div key={key}>
                  {renderSettingField(activeTab, key, setting)}
                </div>
              ))}
            </div>
          </div>
        )

      case 'features':
        return (
          <div className="space-y-6">
            <Card className="p-6 bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <Zap className="text-blue-600 mt-1" size={20} />
                <div>
                  <h3 className="font-semibold text-blue-900 mb-1">Feature Flags</h3>
                  <p className="text-sm text-blue-800">
                    Enable or disable platform features. Disabled features will be hidden from all users.
                  </p>
                </div>
              </div>
            </Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categorySettings).map(([key, setting]) => (
                <div key={key}>
                  {renderSettingField(activeTab, key, setting)}
                </div>
              ))}
            </div>
          </div>
        )

      case 'integrations':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(categorySettings).map(([key, setting]) => (
                <div key={key}>
                  {renderSettingField(activeTab, key, setting)}
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return <p className="text-gray-600">No settings available for this category.</p>
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/platform-admin/dashboard')}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Platform Settings</h1>
              <p className="text-gray-600">Configure platform-wide settings and preferences</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  console.log('Current settings state:', settings)
                  loadSettings()
                }}
                disabled={saving || loading}
              >
                <RefreshCw size={16} className="mr-2" />
                Refresh
              </Button>
              {Object.keys(settings).length === 0 && (
                <Button
                  onClick={initializeSettings}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <RefreshCw size={16} className="mr-2" />
                  Initialize Settings
                </Button>
              )}
              <Button
                onClick={handleSave}
                disabled={saving || !hasChanges}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {saving ? (
                  <>
                    <RefreshCw size={16} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Message */}
        {message.text && (
          <Card className={`p-4 mb-6 ${
            message.type === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <CheckCircle2 className="text-green-600" size={20} />
              ) : (
                <AlertCircle className="text-red-600" size={20} />
              )}
              <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {message.text}
              </p>
            </div>
          </Card>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b border-gray-200 overflow-x-auto">
            {SETTING_CATEGORIES.map(category => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.id)}
                  className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap flex items-center gap-2 ${
                    activeTab === category.id
                      ? 'border-b-2 border-blue-600 text-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Icon size={18} />
                  {category.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <Card className="p-6">
          {!loading && (
            <>
              {Object.keys(settings).length > 0 ? (
                <>
                  <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-800 border border-green-200">
                    ✓ Loaded {Object.keys(settings).length} category/categories: {Object.keys(settings).join(', ')}
                    {settings[activeTab] && ` • ${Object.keys(settings[activeTab]).length} settings in ${activeTab}`}
                  </div>
                  {renderTabContent()}
                </>
              ) : (
                <div className="text-center py-12">
                  <Settings size={64} className="mx-auto text-gray-400 mb-4" />
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">No Settings Found</h2>
                  <p className="text-gray-600 mb-6">
                    Settings haven't been loaded. Click the button below to initialize default settings.
                  </p>
                  <Button onClick={initializeSettings} className="bg-blue-600 hover:bg-blue-700" disabled={saving}>
                    {saving ? (
                      <>
                        <RefreshCw size={16} className="mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={16} className="mr-2" />
                        Initialize Default Settings
                      </>
                    )}
                  </Button>
                </div>
              )}
            </>
          )}
        </Card>

        {/* Save Button Footer */}
        {hasChanges && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <p className="text-gray-600">You have unsaved changes</p>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    loadSettings()
                    setHasChanges(false)
                  }}
                >
                  Discard
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? (
                    <>
                      <RefreshCw size={16} className="mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} className="mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
