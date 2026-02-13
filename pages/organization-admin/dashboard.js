import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import { Input } from '../../components/ui/input'
import { Textarea } from '../../components/ui/textarea'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Switch } from '../../components/ui/switch'
import { Badge } from '../../components/ui/badge'
import { 
  Building2, Users, Ticket, Package, Shield, BarChart3, Settings, 
  Plus, Search, Filter, Download, Eye, Edit, Trash2, Save, X,
  TrendingUp, Clock, CheckCircle2, XCircle, AlertCircle,
  Sparkles, Brain, MessageSquare, TrendingDown, Route, Zap,
  Globe, MapPin, Link2, Database, Code, Webhook, CreditCard,
  FileText, List, Grid, Calendar, DollarSign, Activity, FileSpreadsheet, Upload,
  Target, Gauge, Award, AlertTriangle, RefreshCw, Play, Pause
} from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { getApiBase } from '../../lib/api'

export default function OrganizationAdminDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  
  // Data states
  const [products, setProducts] = useState([])
  const [slaPolicies, setSlaPolicies] = useState([])
  const [servicePolicies, setServicePolicies] = useState([])
  const [integrations, setIntegrations] = useState([])
  const [partners, setPartners] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [parts, setParts] = useState([])
  const [inventory, setInventory] = useState([])
  const [transactions, setTransactions] = useState([])
  const [reorderRequests, setReorderRequests] = useState([])
  const [productParts, setProductParts] = useState({}) // {productId: [parts]}
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [users, setUsers] = useState([])
  const [availableRoles, setAvailableRoles] = useState([])
  const [aiCostToServe, setAiCostToServe] = useState([])
  const [aiInventoryForecast, setAiInventoryForecast] = useState([])
  const [aiRouteEngineerId, setAiRouteEngineerId] = useState('')
  const [aiRouteResult, setAiRouteResult] = useState(null)
  
  // Location data for inventory form
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  
  // Modal states
  const [showProductModal, setShowProductModal] = useState(false)
  const [productUploadMode, setProductUploadMode] = useState('single') // 'single' or 'bulk'
  const [bulkProductFile, setBulkProductFile] = useState(null)
  const [bulkProductResults, setBulkProductResults] = useState(null)
  const [bulkProductLoading, setBulkProductLoading] = useState(false)
  const [showSLAModal, setShowSLAModal] = useState(false)
  const [showIntegrationModal, setShowIntegrationModal] = useState(false)
  const [showPartnerModal, setShowPartnerModal] = useState(false)
  const [showFeatureModal, setShowFeatureModal] = useState(false)
  const [showPartModal, setShowPartModal] = useState(false)
  const [partUploadMode, setPartUploadMode] = useState('single') // 'single' or 'bulk'
  const [bulkPartFile, setBulkPartFile] = useState(null)
  const [bulkPartResults, setBulkPartResults] = useState(null)
  const [bulkPartLoading, setBulkPartLoading] = useState(false)
  const [showInventoryModal, setShowInventoryModal] = useState(false)
  const [inventoryUploadMode, setInventoryUploadMode] = useState('single') // 'single' or 'bulk'
  const [bulkInventoryFile, setBulkInventoryFile] = useState(null)
  const [bulkInventoryResults, setBulkInventoryResults] = useState(null)
  const [bulkInventoryLoading, setBulkInventoryLoading] = useState(false)
  const [showStockAdjustModal, setShowStockAdjustModal] = useState(false)
  const [showLinkPartModal, setShowLinkPartModal] = useState(false)
  const [showServicePolicyModal, setShowServicePolicyModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [showUpgradePlanModal, setShowUpgradePlanModal] = useState(false)
  const [availablePlans, setAvailablePlans] = useState([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [selectedUpgradePlan, setSelectedUpgradePlan] = useState(null)
  const [billingPeriod, setBillingPeriod] = useState('monthly')
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false)
  const [upgradeSuccessData, setUpgradeSuccessData] = useState(null)
  const [editingProduct, setEditingProduct] = useState(null)
  const [editingSLA, setEditingSLA] = useState(null)
  const [editingServicePolicy, setEditingServicePolicy] = useState(null)
  const [editingIntegration, setEditingIntegration] = useState(null)
  const [selectedInventory, setSelectedInventory] = useState(null)
  const [editingUser, setEditingUser] = useState(null)
  
  // Form states
  const [productForm, setProductForm] = useState({
    name: '',
    category: '',
    brand: '',
    model_number: '',
    description: '',
    default_warranty_months: 12,
    extended_warranty_available: false,
    manufacturing_year: new Date().getFullYear(),
    batch_number: '',
    specifications: {},
    is_active: true,
    // Advanced fields (optional)
    common_failures: [],
    recommended_parts: []
  })
  
  const [slaForm, setSlaForm] = useState({
    sla_type: 'resolution',
    target_hours: 24,
    product_category: '',
    priority_overrides: {},
    business_hours_only: false
  })
  
  const [integrationForm, setIntegrationForm] = useState({
    name: '',
    integration_type: 'webhook',
    provider: '',
    config: {},
    webhook_url: '',
    api_endpoint: '',
    sync_direction: 'bidirectional',
    sync_frequency: 'realtime',
    is_active: false
  })
  const [oemSyncSettings, setOemSyncSettings] = useState({
    enabled: false,
    interval_minutes: 1440,
    batch_size: 200
  })
  const [integrationConfigJson, setIntegrationConfigJson] = useState('{}')
  
  const [userForm, setUserForm] = useState({
    email: '',
    phone: '',
    full_name: '',
    password: '',
    role: 'customer',
    country_id: null,
    state_id: null,
    city_id: null,
    engineer_skill_level: '',
    engineer_specialization: []
  })
  
  const [partForm, setPartForm] = useState({
    sku: '',
    name: '',
    description: '',
    cost_price: 0,
    selling_price: 0,
    unit: 'piece',
    applicable_products: [],
    compatible_models: []
  })
  
  const [inventoryForm, setInventoryForm] = useState({
    part_id: '',
    country_id: '',
    state_id: '',
    city_id: '',
    warehouse_name: '',
    current_stock: 0,
    min_threshold: 0,
    max_threshold: null
  })
  
  const [stockAdjustForm, setStockAdjustForm] = useState({
    transaction_type: 'adjustment',
    quantity: 0,
    notes: ''
  })
  
  const [servicePolicyForm, setServicePolicyForm] = useState({
    policy_type: 'warranty',
    rules: {},
    product_category: '',
    product_id: null,
    is_active: true,
    _rulesRaw: '{}' // Store raw JSON string for textarea
  })

  const [partnerForm, setPartnerForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    country_id: null,
    state_id: null,
    city_id: null,
    product_categories: [],
    service_regions: []
  })

  useEffect(() => {
    loadDashboardData()
    loadCountries()
  }, [activeTab])

  // Load countries on mount - using comprehensive API
  const loadCountries = async () => {
    try {
      // Try API first (comprehensive data), fallback to database
      const response = await fetch(getApiBase() + '/locations/countries?use_api=true')
      if (response.ok) {
        const data = await response.json()
        console.log('Countries loaded from API:', data.length)
        setCountries(data)
      } else {
        // Fallback to database
        const dbResponse = await fetch(getApiBase() + '/locations/countries')
        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          console.log('Countries loaded from database:', dbData.length)
          setCountries(dbData)
        }
      }
    } catch (error) {
      console.error('Error loading countries:', error)
      // Final fallback - try database without API
      try {
        const dbResponse = await fetch(getApiBase() + '/locations/countries')
        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          setCountries(dbData)
        }
      } catch (dbError) {
        console.error('Database fallback also failed:', dbError)
      }
    }
  }

  // Load states when country is selected - using comprehensive API
  // Special handling for India with Bharat API
  const loadStates = async (countryId) => {
    if (!countryId) {
      setStates([])
      setCities([])
      return
    }
    try {
      // Find country code from countries list
      const selectedCountry = countries.find(c => {
        // Handle both API response (no id) and database response (has id)
        if (c.id) {
          return c.id.toString() === countryId.toString()
        } else {
          return c.code === countryId || c.code?.toLowerCase() === countryId.toString().toLowerCase()
        }
      })
      
      const countryCode = selectedCountry?.code || (selectedCountry?.name?.toLowerCase() === 'india' ? 'IN' : null)
      
      // Special handling for India - ALWAYS use India-specific endpoint for comprehensive data
      if (countryCode && countryCode.toUpperCase() === 'IN') {
        try {
          console.log('Loading Indian states from India-specific endpoint...')
          const response = await fetch(getApiBase() + '/locations/india/states?use_api=true')
          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Indian states loaded: ${data.length} states/UTs`)
            if (data && data.length > 0) {
              setStates(data)
              setInventoryForm(prev => ({...prev, state_id: '', city_id: ''}))
              setPartnerForm(prev => ({...prev, state_id: null, city_id: null}))
              setCities([])
              return
            }
          } else {
            const errorText = await response.text()
            console.error('India states API error:', response.status, errorText)
          }
        } catch (indiaApiError) {
          console.error('India states API failed:', indiaApiError)
        }
      }
      
      // Try CountryStateCity API for other countries
      if (countryCode && typeof countryCode === 'string' && countryCode.length === 2 && countryCode.toUpperCase() !== 'IN') {
        try {
          const response = await fetch(`${getApiBase()}/locations/countries/${countryCode}/states?use_api=true`)
          if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
              setStates(data)
              setInventoryForm(prev => ({...prev, state_id: '', city_id: ''}))
              setPartnerForm(prev => ({...prev, state_id: null, city_id: null}))
              setCities([])
              return
            }
          }
        } catch (apiError) {
          console.log('API failed, falling back to database:', apiError)
        }
      }
      
      // Fallback to database with use_api=true to trigger India detection
      // The backend will detect India by country_id and use Bharat API
      if (selectedCountry?.id) {
        const dbResponse = await fetch(`${getApiBase()}/locations/states?country_id=${selectedCountry.id}&use_api=true`)
        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          if (dbData && dbData.length > 0) {
            setStates(dbData)
            setInventoryForm(prev => ({...prev, state_id: '', city_id: ''}))
            setPartnerForm(prev => ({...prev, state_id: null, city_id: null}))
            setCities([])
            return
          }
        }
      } else {
        // Try with the countryId directly, with use_api=true
        const dbResponse = await fetch(`${getApiBase()}/locations/states?country_id=${countryId}&use_api=true`)
        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          if (dbData && dbData.length > 0) {
            setStates(dbData)
            setInventoryForm(prev => ({...prev, state_id: '', city_id: ''}))
            setPartnerForm(prev => ({...prev, state_id: null, city_id: null}))
            setCities([])
            return
          }
        }
      }
      
      // If all else fails, show error
      console.error('Failed to load states for country:', countryId)
      setStates([])
      setCities([])
      
      // Reset state and city when country changes
      setInventoryForm(prev => ({...prev, state_id: '', city_id: ''}))
      setPartnerForm(prev => ({...prev, state_id: null, city_id: null}))
    } catch (error) {
      console.error('Error loading states:', error)
      setStates([])
      setCities([])
    }
  }

  // Load cities when state is selected - using comprehensive API
  // Special handling for India with Bharat API
  const loadCities = async (stateIdOrName) => {
    if (!stateIdOrName) {
      setCities([])
      return
    }
    try {
      // Find state and country codes from states list
      // Handle both numeric IDs, string identifiers, and state names
      const selectedState = states.find(s => {
        // Try matching by ID (if both have IDs)
        if (s.id && typeof stateIdOrName === 'number') {
          return s.id === stateIdOrName
        }
        if (s.id && typeof stateIdOrName === 'string' && !isNaN(parseInt(stateIdOrName))) {
          return s.id.toString() === stateIdOrName
        }
        // Try matching by name
        if (s.name && typeof stateIdOrName === 'string') {
          return s.name.toLowerCase() === stateIdOrName.toLowerCase()
        }
        // Try matching by code
        if (s.code && typeof stateIdOrName === 'string') {
          return s.code.toLowerCase() === stateIdOrName.toLowerCase()
        }
        // Try matching by string identifier (e.g., "state-0")
        if (typeof stateIdOrName === 'string' && stateIdOrName.startsWith('state-')) {
          const index = parseInt(stateIdOrName.replace('state-', ''))
          return states.indexOf(s) === index
        }
        return false
      })
      
      if (!selectedState) {
        // If not found, try using stateIdOrName directly as state name (for India API)
        console.log('State not found in states list, trying direct lookup:', stateIdOrName)
        // For India, we can try using the value directly as state name
        if (typeof stateIdOrName === 'string' && !stateIdOrName.startsWith('state-')) {
          // Might be a state name, try India API directly
          try {
            const response = await fetch(`${getApiBase()}/locations/india/states/${encodeURIComponent(stateIdOrName)}/cities?use_api=true`)
            if (response.ok) {
              const data = await response.json()
              if (data && data.length > 0) {
                setCities(data)
                setInventoryForm(prev => ({...prev, city_id: ''}))
                setPartnerForm(prev => ({...prev, city_id: null}))
                return
              }
            }
          } catch (error) {
            console.error('Direct India API call failed:', error)
          }
        }
        console.error('State not found in states list:', stateIdOrName)
        setCities([])
        return
      }
      
      const stateCode = selectedState?.code
      const countryCode = selectedState?.country_code || 'IN' // Default to IN if not specified
      const stateName = selectedState?.name
      
      // Special handling for India - ALWAYS use India-specific endpoint with state name
      if (countryCode && countryCode.toUpperCase() === 'IN' && stateName) {
        try {
          console.log(`Loading Indian cities for state: ${stateName}...`)
          const response = await fetch(`${getApiBase()}/locations/india/states/${encodeURIComponent(stateName)}/cities?use_api=true`)
          if (response.ok) {
            const data = await response.json()
            console.log(`✅ Indian cities loaded for ${stateName}: ${data.length} cities`)
            if (data && data.length > 0) {
              setCities(data)
              setInventoryForm(prev => ({...prev, city_id: ''}))
              setPartnerForm(prev => ({...prev, city_id: null}))
              return
            }
          } else {
            const errorText = await response.text()
            console.error('India cities API error:', response.status, errorText)
          }
        } catch (indiaApiError) {
          console.error('India cities API failed:', indiaApiError)
        }
      }
      
      // Try CountryStateCity API for other countries
      if (countryCode && stateCode && 
          typeof countryCode === 'string' && countryCode.length === 2 &&
          typeof stateCode === 'string' && stateCode.length >= 2 &&
          countryCode.toUpperCase() !== 'IN') {
        try {
          const response = await fetch(`${getApiBase()}/locations/countries/${countryCode}/states/${stateCode}/cities?use_api=true`)
          if (response.ok) {
            const data = await response.json()
            if (data && data.length > 0) {
              setCities(data)
              setInventoryForm(prev => ({...prev, city_id: ''}))
              setPartnerForm(prev => ({...prev, city_id: null}))
              return
            }
          }
        } catch (apiError) {
          console.log('API failed, falling back to database:', apiError)
        }
      }
      
      // Fallback to database - try by state_id if we have it
      if (selectedState?.id) {
        const dbResponse = await fetch(`${getApiBase()}/locations/cities?state_id=${selectedState.id}`)
        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          if (dbData && dbData.length > 0) {
            setCities(dbData)
            setInventoryForm(prev => ({...prev, city_id: ''}))
            setPartnerForm(prev => ({...prev, city_id: null}))
            return
          }
        }
      } else {
        // Try with the stateId directly
        const dbResponse = await fetch(`${getApiBase()}/locations/cities?state_id=${stateId}`)
        if (dbResponse.ok) {
          const dbData = await dbResponse.json()
          if (dbData && dbData.length > 0) {
            setCities(dbData)
            setInventoryForm(prev => ({...prev, city_id: ''}))
            setPartnerForm(prev => ({...prev, city_id: null}))
            return
          }
        }
      }
      
      // If all else fails, show error
      console.error('Failed to load cities for state:', stateId, stateName)
      setCities([])
      
      // Reset city when state changes
      setInventoryForm(prev => ({...prev, city_id: ''}))
      setPartnerForm(prev => ({...prev, city_id: null}))
    } catch (error) {
      console.error('Error loading cities:', error)
      setCities([])
    }
  }

  const loadDashboardData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    const headers = { 'Authorization': `Bearer ${token}` }

    try {
      // Load dashboard overview
      const dashboardRes = await fetch(getApiBase() + '/org-admin/dashboard', { headers })
      if (dashboardRes.ok) {
        const data = await dashboardRes.json()
        setDashboardData(data)
      }

      // Load tab-specific data
      if (activeTab === 'products') {
        const productsRes = await fetch(getApiBase() + '/org-admin/products', { headers })
        if (productsRes.ok) {
          const data = await productsRes.json()
          setProducts(data)
          
          // Load parts for each product
          const partsMap = {}
          for (const product of data) {
            const partsRes = await fetch(`${getApiBase()}/org-admin/products/${product.id}/parts`, { headers })
            if (partsRes.ok) {
              const partsData = await partsRes.json()
              partsMap[product.id] = partsData
            }
          }
          setProductParts(partsMap)
        }
      }

      if (activeTab === 'sla-policies') {
        const slaRes = await fetch(getApiBase() + '/org-admin/sla-policies', { headers })
        if (slaRes.ok) {
          const data = await slaRes.json()
          setSlaPolicies(data)
        }
        
        const serviceRes = await fetch(getApiBase() + '/org-admin/service-policies', { headers })
        if (serviceRes.ok) {
          const data = await serviceRes.json()
          setServicePolicies(data)
        }
      }

      if (activeTab === 'integrations') {
        const intRes = await fetch(getApiBase() + '/org-admin/integrations', { headers })
        if (intRes.ok) {
          const data = await intRes.json()
          setIntegrations(data)
        }
      }

      if (activeTab === 'partners' && dashboardData?.organization?.org_type === 'oem') {
        const partnersRes = await fetch(getApiBase() + '/org-admin/partners', { headers })
        if (partnersRes.ok) {
          const data = await partnersRes.json()
          setPartners(data)
        }
      }

      if (activeTab === 'analytics') {
        try {
          const analyticsRes = await fetch(getApiBase() + '/org-admin/analytics?period=30d', { headers })
          if (analyticsRes.ok) {
            const data = await analyticsRes.json()
            setAnalytics(data)
          } else {
            console.error('Failed to load analytics:', analyticsRes.status, analyticsRes.statusText)
            const errorData = await analyticsRes.json().catch(() => ({}))
            console.error('Error details:', errorData)
            // Set empty analytics object to show error state
            setAnalytics(null)
          }
        } catch (error) {
          console.error('Error fetching analytics:', error)
          setAnalytics(null)
        }
      }

      if (activeTab === 'users' || activeTab === 'overview') {
        // Load available roles
        const rolesRes = await fetch(getApiBase() + '/users/available-roles', { headers })
        if (rolesRes.ok) {
          const rolesData = await rolesRes.json()
          setAvailableRoles(rolesData.available_roles || [])
        }
        
        // Load users
        const usersRes = await fetch(getApiBase() + '/users/', { headers })
        if (usersRes.ok) {
          const usersData = await usersRes.json()
          setUsers(Array.isArray(usersData) ? usersData : [])
        }
      }

      if (activeTab === 'inventory') {
        // Load parts
        const partsRes = await fetch(getApiBase() + '/org-admin/inventory/parts', { headers })
        if (partsRes.ok) {
          const partsData = await partsRes.json()
          setParts(Array.isArray(partsData) ? partsData : [])
        } else {
          console.error('Error loading parts:', partsRes.status, partsRes.statusText)
        }

        // Load inventory stock
        const inventoryRes = await fetch(getApiBase() + '/org-admin/inventory/stock', { headers })
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json()
          setInventory(Array.isArray(inventoryData) ? inventoryData : [])
        } else {
          console.error('Error loading inventory:', inventoryRes.status, inventoryRes.statusText)
        }

        // Load transactions
        const transactionsRes = await fetch(getApiBase() + '/org-admin/inventory/transactions?limit=50', { headers })
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json()
          setTransactions(Array.isArray(transactionsData) ? transactionsData : (transactionsData?.transactions || []))
        } else {
          console.error('Error loading transactions:', transactionsRes.status, transactionsRes.statusText)
        }

        // Load reorder requests
        const reorderRes = await fetch(getApiBase() + '/org-admin/inventory/reorder-requests', { headers })
        if (reorderRes.ok) {
          const reorderData = await reorderRes.json()
          setReorderRequests(Array.isArray(reorderData) ? reorderData : (reorderData?.requests || []))
        } else {
          console.error('Error loading reorder requests:', reorderRes.status, reorderRes.statusText)
        }
      }

      const costRes = await fetch(getApiBase() + '/org-admin/ai/cost-to-serve', { headers })
      if (costRes.ok) {
        setAiCostToServe(await costRes.json())
      }

      const invRes = await fetch(getApiBase() + '/org-admin/ai/inventory-forecast', { headers })
      if (invRes.ok) {
        setAiInventoryForecast(await invRes.json())
      }

      setLoading(false)
    } catch (error) {
      console.error('Error loading dashboard:', error)
      setLoading(false)
    }
  }

  const runRouteOptimizer = async () => {
    const token = localStorage.getItem('token')
    if (!aiRouteEngineerId) {
      alert('Select engineer')
      return
    }
    try {
      const response = await fetch(getApiBase() + '/org-admin/ai/route-optimizer', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ engineer_id: parseInt(aiRouteEngineerId) })
      })
      if (response.ok) {
        setAiRouteResult(await response.json())
      } else {
        const data = await response.json()
        alert(data.detail || 'Route optimizer failed')
      }
    } catch (error) {
      alert('Route optimizer failed')
    }
  }

  const handleCreateProduct = async () => {
    const token = localStorage.getItem('token')
    
    // Validate required fields
    if (!productForm.name || !productForm.category) {
      alert('Please fill in all required fields (Name and Category)')
      return
    }
    
    try {
      const url = editingProduct 
        ? `${getApiBase()}/org-admin/products/${editingProduct.id}`
        : getApiBase() + '/org-admin/products'
      const method = editingProduct ? 'PUT' : 'POST'
      
      // Prepare data - ensure specifications is an object, not a string
      // Include manufacturing_year and batch_number in specifications if provided
      const specs = typeof productForm.specifications === 'string' 
        ? (() => {
            try {
              return productForm.specifications.trim() ? JSON.parse(productForm.specifications) : {}
            } catch {
              return {}
            }
          })()
        : productForm.specifications || {}
      
      // Add manufacturing_year and batch_number to specifications
      if (productForm.manufacturing_year) {
        specs.manufacturing_year = productForm.manufacturing_year
      }
      if (productForm.batch_number) {
        specs.batch_number = productForm.batch_number
      }
      
      const payload = {
        ...productForm,
        specifications: specs,
        model_number: productForm.model_number, // This will be used to create ProductModel
        common_failures: Array.isArray(productForm.common_failures) 
          ? productForm.common_failures 
          : (productForm.common_failures || '').split('\n').filter(f => f.trim()),
        recommended_parts: Array.isArray(productForm.recommended_parts)
          ? productForm.recommended_parts
          : (productForm.recommended_parts || '').split(',').map(p => p.trim()).filter(p => p)
      }
      
      // Remove fields that shouldn't be sent directly
      delete payload.manufacturing_year
      delete payload.batch_number
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        setShowProductModal(false)
        setEditingProduct(null)
        setProductForm({
          name: '',
          category: '',
          brand: '',
          model_number: '',
          description: '',
          default_warranty_months: 12,
          extended_warranty_available: false,
          manufacturing_year: new Date().getFullYear(),
          batch_number: '',
          specifications: {},
          is_active: true,
          common_failures: [],
          recommended_parts: []
        })
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error saving product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Error saving product: ' + error.message)
    }
  }

  const handleEditProduct = (product) => {
    setEditingProduct(product)
    setProductUploadMode('single')
    setProductForm({
      name: product.name || '',
      category: product.category || '',
      brand: product.brand || '',
      model_number: product.model_number || '',
      description: product.description || '',
      default_warranty_months: product.default_warranty_months || 12,
      extended_warranty_available: product.extended_warranty_available || false,
      manufacturing_year: product.manufacturing_year || new Date().getFullYear(),
      batch_number: product.batch_number || '',
      specifications: product.specifications || {},
      is_active: product.is_active !== undefined ? product.is_active : true,
      common_failures: product.common_failures || [],
      recommended_parts: product.recommended_parts || []
    })
    setShowProductModal(true)
  }

  const handleBulkProductFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel' &&
          !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please upload a valid Excel file (.xlsx or .xls)')
        return
      }
      setBulkProductFile(file)
      setBulkProductResults(null)
    }
  }

  const handleBulkProductSubmit = async (e) => {
    e.preventDefault()
    if (!bulkProductFile) {
      alert('Please select an Excel file to upload')
      return
    }

    setBulkProductLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', bulkProductFile)

      const response = await fetch(getApiBase() + '/org-admin/products/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setBulkProductResults(data)
        setBulkProductFile(null)
        // Reset file input
        const fileInput = document.getElementById('bulk-product-file-input')
        if (fileInput) fileInput.value = ''
        // Reload products
        loadDashboardData()
      } else {
        alert(data.detail || 'Error processing Excel file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Network error. Please try again.')
    } finally {
      setBulkProductLoading(false)
    }
  }

  const handleDownloadTemplate = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(getApiBase() + '/org-admin/products/bulk-upload-template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Product_Bulk_Upload_Template.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }))
        console.error('Error downloading template:', errorData)
        alert(`Error downloading template: ${errorData.detail || errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      alert(`Error downloading template: ${error.message || 'Network error'}`)
    }
  }

  const handleDeleteProduct = async (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/org-admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error deleting product')
      }
    } catch (error) {
      console.error('Error deleting product:', error)
      alert('Error deleting product')
    }
  }

  const handleCreateSLAPolicy = async () => {
    const token = localStorage.getItem('token')
    try {
      const url = editingSLA 
        ? `${getApiBase()}/org-admin/sla-policies/${editingSLA.id}`
        : getApiBase() + '/org-admin/sla-policies'
      const method = editingSLA ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(slaForm)
      })
      
      if (response.ok) {
        setShowSLAModal(false)
        setEditingSLA(null)
        setSlaForm({
          sla_type: 'resolution',
          target_hours: 24,
          product_category: '',
          priority_overrides: {},
          business_hours_only: false
        })
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error saving SLA policy')
      }
    } catch (error) {
      console.error('Error saving SLA policy:', error)
      alert('Error saving SLA policy')
    }
  }

  const handleEditSLA = (policy) => {
    setEditingSLA(policy)
    setSlaForm({
      sla_type: policy.sla_type || 'resolution',
      target_hours: policy.target_hours || 24,
      product_category: policy.product_category || '',
      priority_overrides: policy.priority_overrides || {},
      business_hours_only: policy.business_hours_only || false,
      is_active: policy.is_active !== undefined ? policy.is_active : true
    })
    setShowSLAModal(true)
  }

  const handleDeleteSLA = async (policyId) => {
    if (!confirm('Are you sure you want to delete this SLA policy?')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/org-admin/sla-policies/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error deleting SLA policy')
      }
    } catch (error) {
      console.error('Error deleting SLA policy:', error)
      alert('Error deleting SLA policy')
    }
  }

  const handleCreateUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      // Validate required fields
      if (!userForm.email || !userForm.phone || !userForm.full_name || !userForm.role) {
        alert('Please fill in all required fields')
        return
      }

      // Validate password for new users
      if (!editingUser && !userForm.password) {
        alert('Password is required for new users')
        return
      }

      // Validate phone number format (basic validation)
      const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/
      if (!phoneRegex.test(userForm.phone.replace(/\s/g, ''))) {
        alert('Please enter a valid phone number')
        return
      }

      const cityRequiredRoles = ['city_admin', 'support_engineer']
      const stateRequiredRoles = ['state_admin']
      const countryRequiredRoles = ['country_admin']
      if (cityRequiredRoles.includes(userForm.role) && !userForm.city_id) {
        alert('City is required for this role')
        return
      }
      if (stateRequiredRoles.includes(userForm.role) && !userForm.state_id) {
        alert('State is required for this role')
        return
      }
      if (countryRequiredRoles.includes(userForm.role) && !userForm.country_id) {
        alert('Country is required for this role')
        return
      }

      const url = editingUser 
        ? `${getApiBase()}/users/${editingUser.id}`
        : getApiBase() + '/users/'
      const method = editingUser ? 'PUT' : 'POST'
      
      // Convert location IDs to integers
      // Handle cases where state_id/city_id might be codes instead of IDs
      let countryId = null
      let stateId = null
      let cityId = null

      if (userForm.country_id) {
        countryId = typeof userForm.country_id === 'string' ? parseInt(userForm.country_id) : userForm.country_id
      }

      if (userForm.state_id) {
        // Check if it's a numeric string or already a number
        if (typeof userForm.state_id === 'string') {
          // Try to find the state by code and get its ID
          const state = states.find(s => {
            if (s.id) {
              return s.id.toString() === userForm.state_id
            } else {
              return s.code === userForm.state_id || s.name === userForm.state_id
            }
          })
          stateId = state?.id ? parseInt(state.id) : (parseInt(userForm.state_id) || null)
        } else {
          stateId = userForm.state_id
        }
      }

      if (userForm.city_id) {
        // Check if it's a numeric string or already a number
        if (typeof userForm.city_id === 'string') {
          // Try to find the city by code and get its ID
          const city = cities.find(c => {
            if (c.id) {
              return c.id.toString() === userForm.city_id
            } else {
              return c.code === userForm.city_id || c.name === userForm.city_id
            }
          })
          cityId = city?.id ? parseInt(city.id) : (parseInt(userForm.city_id) || null)
        } else {
          cityId = userForm.city_id
        }
      }
      
      // Prepare user data
      const userData = {
        email: userForm.email.trim(),
        phone: userForm.phone.trim(),
        full_name: userForm.full_name.trim(),
        role: userForm.role,
        country_id: countryId,
        state_id: stateId,
        city_id: cityId,
        engineer_skill_level: userForm.engineer_skill_level || null,
        engineer_specialization: userForm.engineer_specialization || []
      }

      // Add password for new users
      if (!editingUser) {
        userData.password = userForm.password
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      })
      
      if (response.ok) {
        setShowUserModal(false)
        setEditingUser(null)
        setUserForm({
          email: '',
          phone: '',
          full_name: '',
          password: '',
          role: 'customer',
          country_id: null,
          state_id: null,
          city_id: null,
          engineer_skill_level: '',
          engineer_specialization: []
        })
        loadDashboardData()
        alert(editingUser ? 'User updated successfully' : 'User created successfully')
      } else {
        const error = await response.json()
        alert(error.detail || `Error ${editingUser ? 'updating' : 'creating'} user`)
      }
    } catch (error) {
      console.error(`Error ${editingUser ? 'updating' : 'creating'} user:`, error)
      alert(`Error ${editingUser ? 'updating' : 'creating'} user`)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user)
    setUserForm({
      email: user.email,
      phone: user.phone,
      full_name: user.full_name,
      password: '', // Don't pre-fill password
      role: user.role,
      country_id: user.country_id || null,
      state_id: user.state_id || null,
      city_id: user.city_id || null,
      engineer_skill_level: user.engineer_skill_level || '',
      engineer_specialization: user.engineer_specialization ? (Array.isArray(user.engineer_specialization) ? user.engineer_specialization : user.engineer_specialization.split(',')) : []
    })
    setShowUserModal(true)
  }

  const handleCreateServicePolicy = async () => {
    const token = localStorage.getItem('token')
    
    // Parse rules from raw JSON string
    let rules = servicePolicyForm.rules
    if (servicePolicyForm._rulesRaw !== undefined) {
      try {
        rules = JSON.parse(servicePolicyForm._rulesRaw)
      } catch (err) {
        alert('Invalid JSON format in Rules field. Please fix the JSON syntax before saving.')
        return
      }
    }
    
    const payload = {
      policy_type: servicePolicyForm.policy_type,
      rules: rules,
      product_category: servicePolicyForm.product_category || null,
      product_id: servicePolicyForm.product_id || null,
      is_active: servicePolicyForm.is_active
    }
    
    try {
      const url = editingServicePolicy 
        ? `${getApiBase()}/org-admin/service-policies/${editingServicePolicy.id}`
        : getApiBase() + '/org-admin/service-policies'
      const method = editingServicePolicy ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        setShowServicePolicyModal(false)
        setEditingServicePolicy(null)
        setServicePolicyForm({
          policy_type: 'warranty',
          rules: {},
          product_category: '',
          product_id: null,
          is_active: true,
          _rulesRaw: '{}'
        })
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error saving service policy')
      }
    } catch (error) {
      console.error('Error saving service policy:', error)
      alert('Error saving service policy')
    }
  }

  const handleEditServicePolicy = (policy) => {
    setEditingServicePolicy(policy)
    const rules = policy.rules || {}
    setServicePolicyForm({
      policy_type: policy.policy_type,
      rules: rules,
      product_category: policy.product_category || '',
      product_id: policy.product_id || null,
      is_active: policy.is_active !== undefined ? policy.is_active : true,
      _rulesRaw: JSON.stringify(rules, null, 2)
    })
    setShowServicePolicyModal(true)
  }

  const handleDeleteServicePolicy = async (policyId) => {
    if (!confirm('Are you sure you want to delete this service policy?')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/org-admin/service-policies/${policyId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error deleting service policy')
      }
    } catch (error) {
      console.error('Error deleting service policy:', error)
      alert('Error deleting service policy')
    }
  }

  const handleCreateIntegration = async () => {
    const token = localStorage.getItem('token')
    
    // Validation
    if (!integrationForm.name || !integrationForm.name.trim()) {
      alert('Please enter an integration name')
      return
    }
    
    if (!integrationForm.integration_type) {
      alert('Please select an integration type')
      return
    }
    
    // Parse config JSON
    let config = {}
    try {
      if (integrationConfigJson && integrationConfigJson.trim()) {
        config = JSON.parse(integrationConfigJson)
      }
    } catch (e) {
      alert('Invalid JSON in configuration field. Please check the format.')
      return
    }
    
    try {
      const url = editingIntegration 
        ? `${getApiBase()}/org-admin/integrations/${editingIntegration.id}`
        : getApiBase() + '/org-admin/integrations'
      const method = editingIntegration ? 'PUT' : 'POST'
      
      if (integrationForm.integration_type === 'api') {
        config = {
          ...config,
          oem_sync_enabled: oemSyncSettings.enabled,
          oem_sync_interval_minutes: parseInt(oemSyncSettings.interval_minutes, 10),
          oem_sync_batch_size: parseInt(oemSyncSettings.batch_size, 10)
        }
      }

      const payload = {
        ...integrationForm,
        config: config
      }
      
      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        const result = await response.json()
        setShowIntegrationModal(false)
        setEditingIntegration(null)
        setIntegrationForm({
          name: '',
          integration_type: 'webhook',
          provider: '',
          config: {},
          webhook_url: '',
          api_endpoint: '',
          sync_direction: 'bidirectional',
          sync_frequency: 'realtime',
          is_active: false
        })
        setOemSyncSettings({
          enabled: false,
          interval_minutes: 1440,
          batch_size: 200
        })
        setIntegrationConfigJson('{}')
        loadDashboardData()
        alert(editingIntegration ? 'Integration updated successfully!' : 'Integration created successfully!')
      } else {
        const error = await response.json()
        alert(error.detail || 'Error saving integration')
      }
    } catch (error) {
      console.error('Error saving integration:', error)
      alert('Error saving integration: ' + error.message)
    }
  }

  const handleEditIntegration = (integration) => {
    setEditingIntegration(integration)
    const config = integration.config || {}
    setIntegrationForm({
      name: integration.name || '',
      integration_type: integration.integration_type || 'webhook',
      provider: integration.provider || '',
      config: config,
      webhook_url: integration.webhook_url || '',
      api_endpoint: integration.api_endpoint || '',
      sync_direction: integration.sync_direction || 'bidirectional',
      sync_frequency: integration.sync_frequency || 'realtime',
      is_active: integration.is_active !== undefined ? integration.is_active : false
    })
    setOemSyncSettings({
      enabled: !!config.oem_sync_enabled,
      interval_minutes: config.oem_sync_interval_minutes || 1440,
      batch_size: config.oem_sync_batch_size || 200
    })
    setIntegrationConfigJson(JSON.stringify(config, null, 2))
    setShowIntegrationModal(true)
  }

  const handleDeleteIntegration = async (integrationId) => {
    if (!confirm('Are you sure you want to delete this integration?')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/org-admin/integrations/${integrationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error deleting integration')
      }
    } catch (error) {
      console.error('Error deleting integration:', error)
      alert('Error deleting integration')
    }
  }

  // Inventory handlers
  const handleCreatePart = async () => {
    const token = localStorage.getItem('token')
    if (!partForm.sku || !partForm.name) {
      alert('Please fill in SKU and Name')
      return
    }
    
    try {
      const response = await fetch(getApiBase() + '/org-admin/inventory/parts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(partForm)
      })
      
      if (response.ok) {
        setShowPartModal(false)
        setPartForm({
          sku: '',
          name: '',
          description: '',
          cost_price: 0,
          selling_price: 0,
          unit: 'piece',
          applicable_products: [],
          compatible_models: []
        })
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error creating part')
      }
    } catch (error) {
      console.error('Error creating part:', error)
      alert('Error creating part')
    }
  }

  const handleCreateInventory = async () => {
    const token = localStorage.getItem('token')
    if (!inventoryForm.part_id) {
      alert('Please select a part')
      return
    }
    if (!inventoryForm.city_id) {
      alert('Please select a city for this inventory item')
      return
    }

    const cid = parseInt(inventoryForm.country_id, 10)
    const sid = parseInt(inventoryForm.state_id, 10)
    const cityId = parseInt(inventoryForm.city_id, 10)
    const validCountryId = !isNaN(cid) && cid > 0
    const validStateId = !isNaN(sid) && sid > 0
    const validCityId = !isNaN(cityId) && cityId > 0
    const payload = {
      ...inventoryForm,
      country_id: validCountryId ? cid : null,
      state_id: validStateId ? sid : null,
      city_id: validCityId ? cityId : null
    }
    if (!validCountryId && inventoryForm.country_id) payload.country_code = String(inventoryForm.country_id).trim()
    if (!validStateId && inventoryForm.state_id) {
      const sv = String(inventoryForm.state_id).trim()
      if (sv.length <= 4 && sv === sv.toUpperCase()) payload.state_code = sv
      else payload.state_name = sv
    }
    if (!validCityId && inventoryForm.city_id) payload.city_name = String(inventoryForm.city_id).trim()
    
    try {
      const response = await fetch(getApiBase() + '/org-admin/inventory/stock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        setShowInventoryModal(false)
        setInventoryForm({
          part_id: '',
          country_id: '',
          state_id: '',
          city_id: '',
          warehouse_name: '',
          current_stock: 0,
          min_threshold: 0,
          max_threshold: null
        })
        // Reset location dropdowns
        setStates([])
        setCities([])
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error creating inventory')
      }
    } catch (error) {
      console.error('Error creating inventory:', error)
      alert('Error creating inventory')
    }
  }

  const handleBulkPartFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel' &&
          !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please upload a valid Excel file (.xlsx or .xls)')
        return
      }
      setBulkPartFile(file)
      setBulkPartResults(null)
    }
  }

  const handleBulkPartSubmit = async (e) => {
    e.preventDefault()
    if (!bulkPartFile) {
      alert('Please select an Excel file to upload')
      return
    }

    setBulkPartLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', bulkPartFile)

      const response = await fetch(getApiBase() + '/org-admin/inventory/parts/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setBulkPartResults(data)
        setBulkPartFile(null)
        const fileInput = document.getElementById('bulk-part-file-input')
        if (fileInput) fileInput.value = ''
        loadDashboardData()
      } else {
        alert(data.detail || 'Error processing Excel file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Network error. Please try again.')
    } finally {
      setBulkPartLoading(false)
    }
  }

  const handleDownloadPartTemplate = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(getApiBase() + '/org-admin/inventory/parts/bulk-upload-template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Parts_Bulk_Upload_Template.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }))
        console.error('Error downloading template:', errorData)
        alert(`Error downloading template: ${errorData.detail || errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      alert(`Error downloading template: ${error.message || 'Network error'}`)
    }
  }

  const handleBulkInventoryFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.type !== 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' && 
          file.type !== 'application/vnd.ms-excel' &&
          !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
        alert('Please upload a valid Excel file (.xlsx or .xls)')
        return
      }
      setBulkInventoryFile(file)
      setBulkInventoryResults(null)
    }
  }

  const handleBulkInventorySubmit = async (e) => {
    e.preventDefault()
    if (!bulkInventoryFile) {
      alert('Please select an Excel file to upload')
      return
    }

    setBulkInventoryLoading(true)
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', bulkInventoryFile)

      const response = await fetch(getApiBase() + '/org-admin/inventory/stock/bulk-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })

      const data = await response.json()

      if (response.ok) {
        setBulkInventoryResults(data)
        setBulkInventoryFile(null)
        const fileInput = document.getElementById('bulk-inventory-file-input')
        if (fileInput) fileInput.value = ''
        loadDashboardData()
      } else {
        alert(data.detail || 'Error processing Excel file')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      alert('Network error. Please try again.')
    } finally {
      setBulkInventoryLoading(false)
    }
  }

  const handleDownloadInventoryTemplate = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(getApiBase() + '/org-admin/inventory/stock/bulk-upload-template', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'Inventory_Stock_Bulk_Upload_Template.xlsx'
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        const errorData = await response.json().catch(() => ({ detail: `HTTP ${response.status}: ${response.statusText}` }))
        console.error('Error downloading template:', errorData)
        alert(`Error downloading template: ${errorData.detail || errorData.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error downloading template:', error)
      alert(`Error downloading template: ${error.message || 'Network error'}`)
    }
  }

  const loadAvailablePlans = async () => {
    setLoadingPlans(true)
    try {
      const response = await fetch(getApiBase() + '/platform-admin/plans/public')
      if (response.ok) {
        const data = await response.json()
        setAvailablePlans(Array.isArray(data) ? data : [])
      }
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const handleOpenUpgradeModal = () => {
    setShowUpgradePlanModal(true)
    loadAvailablePlans()
  }

  const handleUpgradePlan = async (planId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    try {
      const response = await fetch(getApiBase() + '/org-admin/subscription/upgrade', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: planId,
          billing_period: billingPeriod
        })
      })

      if (response.ok) {
        const data = await response.json()
        setUpgradeSuccessData(data)
        setShowUpgradePlanModal(false)
        setSelectedUpgradePlan(null)
        setShowUpgradeSuccess(true)
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error upgrading plan')
      }
    } catch (error) {
      console.error('Error upgrading plan:', error)
      alert('Error upgrading plan')
    }
  }

  const handleCreatePartner = async () => {
    const token = localStorage.getItem('token')
    
    if (!partnerForm.name || !partnerForm.email || !partnerForm.phone) {
      alert('Please fill in all required fields (Name, Email, Phone)')
      return
    }
    
    try {
      const response = await fetch(getApiBase() + '/org-admin/partners', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: partnerForm.name,
          email: partnerForm.email,
          phone: partnerForm.phone,
          address: partnerForm.address || '',
          country_id: partnerForm.country_id ? parseInt(partnerForm.country_id) : null,
          state_id: partnerForm.state_id ? parseInt(partnerForm.state_id) : null,
          city_id: partnerForm.city_id ? parseInt(partnerForm.city_id) : null,
          product_categories: partnerForm.product_categories || [],
          service_regions: partnerForm.service_regions || []
        })
      })
      
      if (response.ok) {
        setShowPartnerModal(false)
        setPartnerForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          country_id: null,
          state_id: null,
          city_id: null,
          product_categories: [],
          service_regions: []
        })
        // Reset location dropdowns
        setStates([])
        setCities([])
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error creating partner')
      }
    } catch (error) {
      console.error('Error creating partner:', error)
      alert('Error creating partner')
    }
  }

  const handleRequestReorder = async (inventoryItem) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login first')
      return
    }

    // Calculate suggested quantity (enough to reach max threshold)
    const suggestedQuantity = inventoryItem.max_threshold 
      ? Math.max(inventoryItem.max_threshold - inventoryItem.current_stock, inventoryItem.min_threshold)
      : inventoryItem.min_threshold * 2

    const quantity = prompt(
      `Request reorder for ${inventoryItem.part_name}?\n\n` +
      `Current Stock: ${inventoryItem.current_stock}\n` +
      `Min Threshold: ${inventoryItem.min_threshold}\n` +
      `Suggested Quantity: ${suggestedQuantity}\n\n` +
      `Enter quantity to request:`,
      suggestedQuantity.toString()
    )

    if (!quantity || isNaN(quantity) || parseInt(quantity) <= 0) {
      return
    }

    try {
      const response = await fetch(getApiBase() + '/org-admin/inventory/reorder-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          inventory_id: inventoryItem.id,
          requested_quantity: parseInt(quantity)
        })
      })

      if (response.ok) {
        alert('Reorder request created successfully!')
        // Reload reorder requests
        const reorderRes = await fetch(getApiBase() + '/org-admin/inventory/reorder-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (reorderRes.ok) {
          const reorderData = await reorderRes.json()
          setReorderRequests(Array.isArray(reorderData) ? reorderData : (reorderData?.requests || []))
        }
        // Reload inventory to update low stock status
        const inventoryRes = await fetch(getApiBase() + '/org-admin/inventory/stock', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json()
          setInventory(Array.isArray(inventoryData) ? inventoryData : [])
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.detail || 'Failed to create reorder request'}`)
      }
    } catch (error) {
      console.error('Error creating reorder request:', error)
      alert('Error creating reorder request. Please try again.')
    }
  }

  const handleApproveReorder = async (requestId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login first')
      return
    }

    if (!confirm('Are you sure you want to approve this reorder request?')) {
      return
    }

    try {
      const response = await fetch(`${getApiBase()}/org-admin/inventory/reorder-requests/${requestId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        alert('Reorder request approved successfully!')
        // Reload reorder requests
        const reorderRes = await fetch(getApiBase() + '/org-admin/inventory/reorder-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (reorderRes.ok) {
          const reorderData = await reorderRes.json()
          setReorderRequests(Array.isArray(reorderData) ? reorderData : (reorderData?.requests || []))
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.detail || 'Failed to approve reorder request'}`)
      }
    } catch (error) {
      console.error('Error approving reorder request:', error)
      alert('Error approving reorder request. Please try again.')
    }
  }

  const handleRejectReorder = async (requestId) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login first')
      return
    }

    const reason = prompt('Enter rejection reason (optional):')
    if (reason === null) {
      return // User cancelled
    }

    try {
      const response = await fetch(`${getApiBase()}/org-admin/inventory/reorder-requests/${requestId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rejection_reason: reason || undefined
        })
      })

      if (response.ok) {
        alert('Reorder request rejected')
        // Reload reorder requests
        const reorderRes = await fetch(getApiBase() + '/org-admin/inventory/reorder-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (reorderRes.ok) {
          const reorderData = await reorderRes.json()
          setReorderRequests(Array.isArray(reorderData) ? reorderData : (reorderData?.requests || []))
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.detail || 'Failed to reject reorder request'}`)
      }
    } catch (error) {
      console.error('Error rejecting reorder request:', error)
      alert('Error rejecting reorder request. Please try again.')
    }
  }

  const handleFulfillReorder = async (requestId, requestedQuantity) => {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('Please login first')
      return
    }

    const receivedQty = prompt(
      `Mark reorder request as fulfilled.\n\nRequested Quantity: ${requestedQuantity}\n\nEnter received quantity:`,
      requestedQuantity.toString()
    )

    if (!receivedQty || isNaN(receivedQty) || parseInt(receivedQty) <= 0) {
      return
    }

    try {
      const response = await fetch(`${getApiBase()}/org-admin/inventory/reorder-requests/${requestId}/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          received_quantity: parseInt(receivedQty)
        })
      })

      if (response.ok) {
        alert('Reorder request fulfilled and stock updated!')
        // Reload data
        const reorderRes = await fetch(getApiBase() + '/org-admin/inventory/reorder-requests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (reorderRes.ok) {
          const reorderData = await reorderRes.json()
          setReorderRequests(Array.isArray(reorderData) ? reorderData : (reorderData?.requests || []))
        }
        // Reload inventory
        const inventoryRes = await fetch(getApiBase() + '/org-admin/inventory/stock', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (inventoryRes.ok) {
          const inventoryData = await inventoryRes.json()
          setInventory(Array.isArray(inventoryData) ? inventoryData : [])
        }
        // Reload transactions
        const transactionsRes = await fetch(getApiBase() + '/org-admin/inventory/transactions?limit=50', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (transactionsRes.ok) {
          const transactionsData = await transactionsRes.json()
          setTransactions(Array.isArray(transactionsData) ? transactionsData : (transactionsData?.transactions || []))
        }
      } else {
        const errorData = await response.json()
        alert(`Error: ${errorData.detail || 'Failed to fulfill reorder request'}`)
      }
    } catch (error) {
      console.error('Error fulfilling reorder request:', error)
      alert('Error fulfilling reorder request. Please try again.')
    }
  }

  const handleAdjustStock = async () => {
    const token = localStorage.getItem('token')
    if (!selectedInventory || !stockAdjustForm.quantity) {
      alert('Please fill in all required fields')
      return
    }
    
    try {
      const response = await fetch(`${getApiBase()}/org-admin/inventory/stock/${selectedInventory.id}/adjust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stockAdjustForm)
      })
      
      if (response.ok) {
        setShowStockAdjustModal(false)
        setSelectedInventory(null)
        setStockAdjustForm({
          transaction_type: 'adjustment',
          quantity: 0,
          notes: ''
        })
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error adjusting stock')
      }
    } catch (error) {
      console.error('Error adjusting stock:', error)
      alert('Error adjusting stock')
    }
  }

  const handleLinkPartToProduct = async (partId, isRequired = false) => {
    if (!selectedProduct) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/org-admin/products/${selectedProduct.id}/parts`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          part_id: partId,
          is_required: isRequired,
          is_common: true,
          usage_frequency: 'occasional'
        })
      })
      
      if (response.ok) {
        setShowLinkPartModal(false)
        setSelectedProduct(null)
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error linking part')
      }
    } catch (error) {
      console.error('Error linking part:', error)
      alert('Error linking part')
    }
  }

  const handleUnlinkPartFromProduct = async (productId, partId) => {
    if (!confirm('Are you sure you want to unlink this part from the product?')) return
    
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(`${getApiBase()}/org-admin/products/${productId}/parts/${partId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        loadDashboardData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error unlinking part')
      }
    } catch (error) {
      console.error('Error unlinking part:', error)
      alert('Error unlinking part')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading organization dashboard...</p>
        </div>
      </div>
    )
  }

  const isOEM = dashboardData?.organization?.org_type === 'oem'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Organization Admin Dashboard
          </h1>
          <p className="text-gray-600">
            {dashboardData?.organization?.name} • {isOEM ? 'OEM' : 'Service Company'} Management
          </p>
        </div>

        {/* Key Metrics */}
        {dashboardData?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">
            <StatCard
              title="Total Tickets"
              value={dashboardData.stats.total_tickets}
              icon={<Ticket size={24} className="text-blue-600" />}
              bgColor="bg-blue-50"
            />
            <StatCard
              title="Open Tickets"
              value={dashboardData.stats.open_tickets}
              icon={<Clock size={24} className="text-yellow-600" />}
              bgColor="bg-yellow-50"
            />
            <StatCard
              title="Total Users"
              value={dashboardData.stats.total_users}
              icon={<Users size={24} className="text-indigo-600" />}
              bgColor="bg-indigo-50"
            />
            <StatCard
              title="Total Devices"
              value={dashboardData.stats.total_devices}
              icon={<Package size={24} className="text-purple-600" />}
              bgColor="bg-purple-50"
            />
            <StatCard
              title="Products"
              value={dashboardData.stats.total_products}
              icon={<List size={24} className="text-green-600" />}
              bgColor="bg-green-50"
            />
            <StatCard
              title="SLA Policies"
              value={dashboardData.stats.total_sla_policies}
              icon={<Target size={24} className="text-orange-600" />}
              bgColor="bg-orange-50"
            />
            <StatCard
              title="Integrations"
              value={dashboardData.stats.active_integrations}
              icon={<Link2 size={24} className="text-teal-600" />}
              bgColor="bg-teal-50"
            />
          </div>
        )}


        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 lg:grid-cols-9">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="sla-policies">SLA & Policies</TabsTrigger>
            {isOEM && <TabsTrigger value="partners">Partners</TabsTrigger>}
            <TabsTrigger value="integrations">Integrations</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Organization Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 size={20} />
                    Organization Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-500">Organization Name</Label>
                    <p className="font-semibold text-lg">{dashboardData?.organization?.name}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Type</Label>
                    <Badge className="ml-2">
                      {dashboardData?.organization?.org_type?.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p>{dashboardData?.organization?.email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Status</Label>
                    <Badge className={dashboardData?.organization?.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {dashboardData?.organization?.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  {(dashboardData?.organization?.city_name || dashboardData?.organization?.state_name || dashboardData?.organization?.country_name) && (
                    <div>
                      <Label className="text-gray-500">Location</Label>
                      <p>
                        {[dashboardData.organization.city_name, dashboardData.organization.state_name, dashboardData.organization.country_name]
                          .filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}
                  {dashboardData?.organization?.address && (
                    <div>
                      <Label className="text-gray-500">Address</Label>
                      <p className="whitespace-pre-wrap">{dashboardData.organization.address}</p>
                    </div>
                  )}
                  <Button variant="outline" className="w-full">
                    <Edit size={16} className="mr-2" />
                    Edit Organization
                  </Button>
                </CardContent>
              </Card>

              {/* Subscription Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Subscription
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardData?.subscription ? (
                    <>
                      <div>
                        <Label className="text-gray-500">Plan</Label>
                        <p className="font-semibold text-lg">{dashboardData.subscription.plan_name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Status</Label>
                        <Badge className={
                          dashboardData.subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                          dashboardData.subscription.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {dashboardData.subscription.status}
                        </Badge>
                      </div>
                      {dashboardData.subscription.end_date && (
                        <div>
                          <Label className="text-gray-500">Renews On</Label>
                          <p>{new Date(dashboardData.subscription.end_date).toLocaleDateString()}</p>
                        </div>
                      )}
                      <Button variant="outline" className="w-full" onClick={() => setActiveTab('subscription')}>
                        Manage Subscription
                      </Button>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-600 mb-4">No active subscription</p>
                      <Button onClick={() => setActiveTab('subscription')}>
                        View Plans
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* AI Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={20} />
                    Cost-to-Serve (AI)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiCostToServe.length === 0 ? (
                    <p className="text-sm text-gray-600">No cost-to-serve data yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Model</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">City</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Avg Cost</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiCostToServe.slice(0, 6).map((item, idx) => (
                            <tr key={`${item.model_number}-${idx}`} className="border-b">
                              <td className="py-2 px-3">{item.model_number}</td>
                              <td className="py-2 px-3">{item.city_name}</td>
                              <td className="py-2 px-3">₹{item.avg_cost}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} />
                    Inventory Forecast (AI)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {aiInventoryForecast.length === 0 ? (
                    <p className="text-sm text-gray-600">No forecast data yet.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Part</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">City</th>
                            <th className="text-left py-2 px-3 text-xs font-semibold text-gray-600">Forecast</th>
                          </tr>
                        </thead>
                        <tbody>
                          {aiInventoryForecast.slice(0, 6).map((item, idx) => (
                            <tr key={`${item.part_id}-${idx}`} className="border-b">
                              <td className="py-2 px-3">{item.part_name}</td>
                              <td className="py-2 px-3">{item.city_name}</td>
                              <td className="py-2 px-3">{item.predicted_demand}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Route size={20} />
                  Auto-Routing Optimizer (AI)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2 items-center">
                  <Select value={aiRouteEngineerId} onValueChange={setAiRouteEngineerId}>
                    <SelectTrigger className="w-[240px]">
                      <SelectValue placeholder="Select engineer" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.filter(u => u.role === 'support_engineer').map((u) => (
                        <SelectItem key={u.id} value={u.id.toString()}>{u.full_name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" onClick={runRouteOptimizer}>
                    Optimize
                  </Button>
                </div>
                {aiRouteResult && (
                  <div className="text-sm text-gray-700">
                    Optimized order: {aiRouteResult.optimized_order?.join(', ') || '—'}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => setActiveTab('products')}
                  >
                    <Package size={24} className="mb-2" />
                    <span>Manage Products</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => setActiveTab('sla-policies')}
                  >
                    <Target size={24} className="mb-2" />
                    <span>Configure SLA</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => setActiveTab('integrations')}
                  >
                    <Link2 size={24} className="mb-2" />
                    <span>Integrations</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto flex-col py-4"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <BarChart3 size={24} className="mb-2" />
                    <span>View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Package size={20} />
                    Product Catalog
                  </CardTitle>
                  <Button onClick={() => {
                    setEditingProduct(null)
                    setProductForm({
                      name: '',
                      category: '',
                      brand: '',
                      model_number: '',
                      description: '',
                      default_warranty_months: 12,
                      extended_warranty_available: false,
                      manufacturing_year: new Date().getFullYear(),
                      batch_number: '',
                      specifications: {},
                      is_active: true,
                      common_failures: [],
                      recommended_parts: []
                    })
                    setShowProductModal(true)
                  }}>
                    <Plus size={16} className="mr-2" />
                    Add Product
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <Package size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No products registered</p>
                    <Button onClick={() => setShowProductModal(true)}>
                      Create Your First Product
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {products.map(product => (
                      <Card key={product.id} className="hover:shadow-lg transition">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{product.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                              {product.brand && (
                                <p className="text-xs text-gray-500">{product.brand}</p>
                              )}
                            </div>
                            <Badge className={product.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {product.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="space-y-2 text-sm mb-4">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Models:</span>
                              <span className="font-semibold">{product.models_count}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Warranty:</span>
                              <span>{product.default_warranty_months} months</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Parts:</span>
                              <span className="font-semibold">
                                {productParts[product.id]?.length || 0} linked
                              </span>
                            </div>
                            {productParts[product.id] && productParts[product.id].length > 0 && (
                              <div className="mt-2 pt-2 border-t">
                                <p className="text-xs text-gray-500 mb-1">Common Parts:</p>
                                <div className="flex flex-wrap gap-1">
                                  {productParts[product.id].slice(0, 3).map(pp => (
                                    <Badge key={pp.id} variant="outline" className="text-xs">
                                      {pp.part_name}
                                    </Badge>
                                  ))}
                                  {productParts[product.id].length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{productParts[product.id].length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleEditProduct(product)}
                            >
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setSelectedProduct(product)
                                setShowLinkPartModal(true)
                              }}
                            >
                              <Link2 size={14} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Inventory Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Parts Management */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Package size={20} />
                      Parts Catalog
                    </CardTitle>
                    <Button onClick={() => setShowPartModal(true)}>
                      <Plus size={16} className="mr-2" />
                      Add Part
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {parts.length === 0 ? (
                    <div className="text-center py-8">
                      <Package size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No parts registered</p>
                      <Button onClick={() => setShowPartModal(true)}>
                        Add Your First Part
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {parts.map(part => (
                        <div key={part.id} className="border rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold">{part.name}</p>
                              <p className="text-sm text-gray-600">SKU: {part.sku}</p>
                              <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                <span>Cost: ₹{part.cost_price || 0}</span>
                                <span>Price: ₹{part.selling_price || 0}</span>
                              </div>
                            </div>
                            <Badge className={part.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {part.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Inventory Stock */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Activity size={20} />
                      Stock Levels
                    </CardTitle>
                    <Button onClick={() => {
                      setShowInventoryModal(true)
                      // Reset location dropdowns when opening modal
                      setStates([])
                      setCities([])
                    }}>
                      <Plus size={16} className="mr-2" />
                      Add Stock
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {inventory.length === 0 ? (
                    <div className="text-center py-8">
                      <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No inventory entries</p>
                      <Button onClick={() => {
                        setShowInventoryModal(true)
                        // Reset location dropdowns when opening modal
                        setStates([])
                        setCities([])
                      }}>
                        Add Inventory Entry
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {inventory.map(inv => (
                        <div key={inv.id} className="border rounded-lg p-3 hover:bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-semibold">{inv.part_name}</p>
                              <p className="text-sm text-gray-600">SKU: {inv.sku}</p>
                              <div className="flex gap-4 mt-2 text-xs">
                                <span className={inv.is_low_stock ? 'text-red-600 font-semibold' : 'text-gray-600'}>
                                  Stock: {inv.current_stock}
                                </span>
                                <span className="text-gray-500">Min: {inv.min_threshold}</span>
                                {inv.warehouse_name && (
                                  <span className="text-gray-500">{inv.warehouse_name}</span>
                                )}
                              </div>
                              {inv.used_by_products && inv.used_by_products.length > 0 && (
                                <div className="mt-2 pt-2 border-t">
                                  <p className="text-xs text-gray-500 mb-1">Used by Products:</p>
                                  <div className="flex flex-wrap gap-1">
                                    {inv.used_by_products.map((prod, idx) => (
                                      <Badge 
                                        key={idx} 
                                        variant="outline" 
                                        className={`text-xs ${prod.is_required ? 'border-red-300 text-red-700' : ''}`}
                                      >
                                        {prod.product_name}
                                        {prod.is_required && ' *'}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setSelectedInventory(inv)
                                  setStockAdjustForm({
                                    transaction_type: 'adjustment',
                                    quantity: inv.current_stock,
                                    notes: ''
                                  })
                                  setShowStockAdjustModal(true)
                                }}
                              >
                                <Edit size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Low Stock Alerts */}
            {inventory.filter(inv => inv.is_low_stock).length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-800">
                    <AlertTriangle size={20} />
                    Low Stock Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {inventory.filter(inv => inv.is_low_stock).map(inv => (
                      <div key={inv.id} className="flex justify-between items-center p-2 bg-white rounded">
                        <div>
                          <p className="font-semibold">{inv.part_name}</p>
                          <p className="text-sm text-gray-600">
                            Current: {inv.current_stock} | Min: {inv.min_threshold}
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRequestReorder(inv)}
                        >
                          Request Reorder
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Transactions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List size={20} />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No transactions yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 text-sm font-semibold">Date</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Part</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Type</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Quantity</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Stock</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">User</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.slice(0, 10).map(trans => (
                          <tr key={trans.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3 text-sm">
                              {new Date(trans.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3 text-sm">{trans.part_name}</td>
                            <td className="py-2 px-3">
                              <Badge variant="outline" className="capitalize">
                                {trans.transaction_type}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-sm">{trans.quantity}</td>
                            <td className="py-2 px-3 text-sm">
                              {trans.previous_stock} → {trans.new_stock}
                            </td>
                            <td className="py-2 px-3 text-sm">{trans.performed_by || 'System'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reorder Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package size={20} />
                  Reorder Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reorderRequests.length === 0 ? (
                  <p className="text-center text-gray-600 py-8">No reorder requests</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 px-3 text-sm font-semibold">Date</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Part</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">SKU</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Requested Qty</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Current Stock</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Status</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Requested By</th>
                          <th className="text-left py-2 px-3 text-sm font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reorderRequests.map(req => (
                          <tr key={req.id} className="border-b hover:bg-gray-50">
                            <td className="py-2 px-3 text-sm">
                              {new Date(req.created_at).toLocaleDateString()}
                            </td>
                            <td className="py-2 px-3 text-sm font-medium">{req.part_name}</td>
                            <td className="py-2 px-3 text-sm text-gray-600">{req.sku || 'N/A'}</td>
                            <td className="py-2 px-3 text-sm">{req.requested_quantity}</td>
                            <td className="py-2 px-3 text-sm">{req.current_stock}</td>
                            <td className="py-2 px-3">
                              <Badge 
                                variant={
                                  req.status === 'pending' ? 'warning' :
                                  req.status === 'approved' ? 'success' :
                                  req.status === 'fulfilled' ? 'success' :
                                  req.status === 'rejected' ? 'danger' : 'outline'
                                }
                                className="capitalize"
                              >
                                {req.status}
                              </Badge>
                            </td>
                            <td className="py-2 px-3 text-sm">{req.requested_by?.name || 'N/A'}</td>
                            <td className="py-2 px-3">
                              <div className="flex gap-2">
                                {req.status === 'pending' && (
                                  <>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-green-600 hover:text-green-700"
                                      onClick={() => handleApproveReorder(req.id)}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => handleRejectReorder(req.id)}
                                    >
                                      Reject
                                    </Button>
                                  </>
                                )}
                                {req.status === 'approved' && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    className="text-blue-600 hover:text-blue-700"
                                    onClick={() => handleFulfillReorder(req.id, req.requested_quantity)}
                                  >
                                    Mark Fulfilled
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* SLA & Policies Tab */}
          <TabsContent value="sla-policies" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* SLA Policies */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Target size={20} />
                      SLA Policies
                    </CardTitle>
                    <Button size="sm" onClick={() => {
                      setEditingSLA(null)
                      setSlaForm({
                        sla_type: 'resolution',
                        target_hours: 24,
                        product_category: '',
                        priority_overrides: {},
                        business_hours_only: false
                      })
                      setShowSLAModal(true)
                    }}>
                      <Plus size={14} className="mr-1" />
                      Add Policy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {slaPolicies.length === 0 ? (
                    <div className="text-center py-8">
                      <Target size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No SLA policies configured</p>
                      <Button size="sm" onClick={() => setShowSLAModal(true)}>
                        Create SLA Policy
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {slaPolicies.map(policy => (
                        <div key={policy.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold capitalize">{policy.sla_type?.replace('_', ' ')}</h4>
                              <p className="text-sm text-gray-600">
                                Target: {policy.target_hours} hours
                              </p>
                              {policy.product_category && (
                                <Badge variant="outline" className="mt-1">
                                  {policy.product_category}
                                </Badge>
                              )}
                            </div>
                            <Badge className={policy.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {policy.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="mt-2">
                            <pre className="text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                              {JSON.stringify(policy.rules, null, 2)}
                            </pre>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="ghost" size="sm" onClick={() => handleEditServicePolicy(policy)}>
                              <Edit size={14} className="mr-1" />
                              Edit
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteServicePolicy(policy.id)} className="text-red-600 hover:text-red-700">
                              <Trash2 size={14} className="mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Service Policies */}
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Shield size={20} />
                      Service Policies
                    </CardTitle>
                    <Button size="sm" onClick={() => {
                      setEditingServicePolicy(null)
        setServicePolicyForm({
          policy_type: 'warranty',
          rules: {},
          product_category: '',
          product_id: null,
          is_active: true,
          _rulesRaw: '{}'
        })
                      setShowServicePolicyModal(true)
                    }}>
                      <Plus size={14} className="mr-1" />
                      Add Policy
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {servicePolicies.length === 0 ? (
                    <div className="text-center py-8">
                      <Shield size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No service policies configured</p>
                      <Button size="sm" onClick={() => {
                        setEditingServicePolicy(null)
        setServicePolicyForm({
          policy_type: 'warranty',
          rules: {},
          product_category: '',
          product_id: null,
          is_active: true,
          _rulesRaw: '{}'
        })
                        setShowServicePolicyModal(true)
                      }}>
                        <Plus size={14} className="mr-1" />
                        Create Policy
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {servicePolicies.map(policy => (
                        <div key={policy.id} className="p-4 border rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold capitalize">{policy.policy_type?.replace('_', ' ')}</h4>
                              {policy.product_category && (
                                <Badge variant="outline" className="mt-1">
                                  {policy.product_category}
                                </Badge>
                              )}
                            </div>
                            <Badge className={policy.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                              {policy.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          <div className="flex gap-2 mt-3">
                            <Button variant="ghost" size="sm">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Partners Tab (OEM only) */}
          {isOEM && (
            <TabsContent value="partners" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      <Building2 size={20} />
                      Service Partners
                    </CardTitle>
                    <Button onClick={() => {
                      // Ensure countries are loaded when opening modal
                      if (countries.length === 0) {
                        loadCountries()
                      }
                      setShowPartnerModal(true)
                    }}>
                      <Plus size={16} className="mr-2" />
                      Register Partner
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {partners.length === 0 ? (
                    <div className="text-center py-12">
                      <Building2 size={48} className="mx-auto text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-4">No service partners registered</p>
                      <Button onClick={() => {
                      // Ensure countries are loaded when opening modal
                      if (countries.length === 0) {
                        loadCountries()
                      }
                      setShowPartnerModal(true)
                    }}>
                        Register Your First Partner
                      </Button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-semibold">Partner Name</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold">Phone</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                            <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {partners.map(partner => (
                            <tr key={partner.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 font-medium">{partner.name}</td>
                              <td className="py-3 px-4">{partner.email}</td>
                              <td className="py-3 px-4">{partner.phone}</td>
                              <td className="py-3 px-4">
                                <Badge className={partner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                                  {partner.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex gap-2">
                                  <Button variant="ghost" size="sm">
                                    <Eye size={14} />
                                  </Button>
                                  <Button variant="ghost" size="sm">
                                    <Edit size={14} />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Link2 size={20} />
                    System Integrations
                  </CardTitle>
                  <Button onClick={() => {
                    setEditingIntegration(null)
                    setIntegrationForm({
                      name: '',
                      integration_type: 'webhook',
                      provider: '',
                      config: {},
                      webhook_url: '',
                      api_endpoint: '',
                      sync_direction: 'bidirectional',
                      sync_frequency: 'realtime',
                      is_active: false
                    })
                    setIntegrationConfigJson('{}')
                    setEditingIntegration(null)
                    setShowIntegrationModal(true)
                  }}>
                    <Plus size={16} className="mr-2" />
                    Add Integration
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {integrations.length === 0 ? (
                  <div className="text-center py-12">
                    <Link2 size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-gray-600 mb-4">No integrations configured</p>
                    <Button onClick={() => setShowIntegrationModal(true)}>
                      Connect Your First Integration
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {integrations.map(integration => (
                      <Card key={integration.id} className="hover:shadow-lg transition">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="font-bold text-lg">{integration.name}</h3>
                              <p className="text-sm text-gray-600 capitalize">
                                {integration.integration_type?.replace('_', ' ')}
                              </p>
                              {integration.provider && (
                                <p className="text-xs text-gray-500">{integration.provider}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <Badge className={
                                integration.status === 'active' ? 'bg-green-100 text-green-700' :
                                integration.status === 'error' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }>
                                {integration.status}
                              </Badge>
                              {integration.is_active && (
                                <Badge className="bg-blue-100 text-blue-700">Active</Badge>
                              )}
                            </div>
                          </div>
                          {integration.last_sync_at && (
                            <p className="text-xs text-gray-500 mb-2">
                              Last sync: {new Date(integration.last_sync_at).toLocaleString()}
                            </p>
                          )}
                          {integration.last_sync_stats && (
                            <p className="text-xs text-gray-500 mb-4">
                              Synced {integration.last_sync_stats.synced}/{integration.last_sync_stats.total} • Failed {integration.last_sync_stats.failed}
                            </p>
                          )}
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex-1"
                              onClick={() => handleEditIntegration(integration)}
                            >
                              <Edit size={14} className="mr-1" />
                              Configure
                            </Button>
                            {integration.integration_type === 'api' && integration.is_active && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={async () => {
                                  const token = localStorage.getItem('token')
                                  try {
                                    const response = await fetch(getApiBase() + '/warranty/sync-all', {
                                      method: 'POST',
                                      headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                      },
                                      body: JSON.stringify({ limit: 50 })
                                    })
                                    const data = await response.json()
                                    if (response.ok) {
                                      alert(`OEM warranty sync started. Synced: ${data.synced}, Failed: ${data.failed}`)
                                    } else {
                                      alert(data.detail || 'Warranty sync failed')
                                    }
                                  } catch (error) {
                                    alert('Warranty sync failed')
                                  }
                                }}
                              >
                                Sync OEM
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                const token = localStorage.getItem('token')
                                try {
                                  const response = await fetch(
                                    `${getApiBase()}/org-admin/integrations/${integration.id}`,
                                    {
                                      method: 'PUT',
                                      headers: {
                                        'Authorization': `Bearer ${token}`,
                                        'Content-Type': 'application/json'
                                      },
                                      body: JSON.stringify({
                                        ...integration,
                                        is_active: !integration.is_active
                                      })
                                    }
                                  )
                                  if (response.ok) {
                                    loadDashboardData()
                                  } else {
                                    alert('Error updating integration status')
                                  }
                                } catch (error) {
                                  console.error('Error updating integration:', error)
                                  alert('Error updating integration status')
                                }
                              }}
                            >
                              {integration.is_active ? <Pause size={14} /> : <Play size={14} />}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Subscription Tab */}
          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <Users size={20} />
                    Organization Users
                  </CardTitle>
                  <Button onClick={() => {
                    setEditingUser(null)
                    setUserForm({
                      email: '',
                      phone: '',
                      full_name: '',
                      password: '',
                      role: 'customer',
                      country_id: null,
                      state_id: null,
                      city_id: null,
                      engineer_skill_level: '',
                      engineer_specialization: []
                    })
                    setShowUserModal(true)
                  }}>
                    <Plus size={16} className="mr-2" />
                    Create User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users size={48} className="mx-auto mb-4 text-gray-400" />
                      <p>No users found</p>
                      <p className="text-sm mt-2">Create your first user to get started</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Phone</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {users.map((user) => (
                            <tr key={user.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{user.full_name}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{user.phone}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className="capitalize">
                                  {user.role?.replace('_', ' ')}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <Badge className={user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                  {user.is_active ? 'Active' : 'Inactive'}
                                </Badge>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit size={14} className="mr-1" />
                                    Edit
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard size={20} />
                  Subscription Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {dashboardData?.subscription ? (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-500">Current Plan</Label>
                        <p className="font-semibold text-lg">{dashboardData.subscription.plan_name}</p>
                      </div>
                      <div>
                        <Label className="text-gray-500">Status</Label>
                        <Badge className={
                          dashboardData.subscription.status === 'active' ? 'bg-green-100 text-green-700' :
                          dashboardData.subscription.status === 'trial' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }>
                          {dashboardData.subscription.status}
                        </Badge>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={handleOpenUpgradeModal}
                    >
                      Upgrade Plan
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600 mb-4">No active subscription</p>
                    <Button onClick={() => router.push('/get-started')}>
                      View Available Plans
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Feature Flags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap size={20} />
                  Feature Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-semibold">AI Triage</Label>
                    <p className="text-sm text-gray-600">Automatically categorize and prioritize tickets</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-semibold">Parts Forecasting</Label>
                    <p className="text-sm text-gray-600">AI-powered inventory demand prediction</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-semibold">Multilingual Chatbot</Label>
                    <p className="text-sm text-gray-600">AI chatbot in multiple languages</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-semibold">Advanced Analytics</Label>
                    <p className="text-sm text-gray-600">Deep insights and custom reports</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-semibold">API Access</Label>
                    <p className="text-sm text-gray-600">REST API for custom integrations</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <Label className="font-semibold">IoT Integration</Label>
                    <p className="text-sm text-gray-600">Connect IoT devices for predictive maintenance</p>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            {analytics ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 size={24} />
                    Analytics Dashboard
                  </CardTitle>
                  <Select 
                    defaultValue="30d" 
                    onValueChange={async (value) => {
                      const token = localStorage.getItem('token')
                      if (!token) return
                      try {
                        const analyticsRes = await fetch(`${getApiBase()}/org-admin/analytics?period=${value}`, {
                          headers: {
                            'Authorization': `Bearer ${token}`
                          }
                        })
                        if (analyticsRes.ok) {
                          const data = await analyticsRes.json()
                          setAnalytics(data)
                        }
                      } catch (error) {
                        console.error('Error loading analytics:', error)
                      }
                    }}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7d">Last 7 Days</SelectItem>
                      <SelectItem value="30d">Last 30 Days</SelectItem>
                      <SelectItem value="90d">Last 90 Days</SelectItem>
                      <SelectItem value="1y">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-500">Total Tickets</Label>
                        <Ticket size={20} className="text-blue-600" />
                      </div>
                      <p className="text-3xl font-bold">{analytics.tickets?.total || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Period: {analytics.period || '30d'}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-500">SLA Compliance</Label>
                        <Target size={20} className="text-green-600" />
                      </div>
                      <p className="text-3xl font-bold">{analytics.tickets?.sla_compliance?.toFixed(1) || 0}%</p>
                      <p className="text-xs text-gray-500 mt-1">Compliance rate</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-500">Resolved</Label>
                        <CheckCircle2 size={20} className="text-purple-600" />
                      </div>
                      <p className="text-3xl font-bold">{analytics.tickets?.resolved || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Resolved tickets</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-500">Total Users</Label>
                        <Users size={20} className="text-indigo-600" />
                      </div>
                      <p className="text-3xl font-bold">{analytics.users?.total || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Organization users</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-500">Total Devices</Label>
                        <Package size={20} className="text-purple-600" />
                      </div>
                      <p className="text-3xl font-bold">{analytics.devices?.total || 0}</p>
                      <p className="text-xs text-gray-500 mt-1">Registered devices</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-500">Open Tickets</Label>
                        <Clock size={20} className="text-orange-600" />
                      </div>
                      <p className="text-3xl font-bold">{(analytics.tickets?.total || 0) - (analytics.tickets?.resolved || 0)}</p>
                      <p className="text-xs text-gray-500 mt-1">Currently open</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ticket Trends Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp size={20} />
                        Ticket Trends
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.daily_trends && analytics.daily_trends.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <AreaChart data={analytics.daily_trends}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="day" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Legend />
                            <Area 
                              type="monotone" 
                              dataKey="tickets" 
                              stroke="#3b82f6" 
                              fill="#3b82f6" 
                              fillOpacity={0.6}
                              name="New Tickets"
                            />
                            <Area 
                              type="monotone" 
                              dataKey="resolved" 
                              stroke="#10b981" 
                              fill="#10b981" 
                              fillOpacity={0.6}
                              name="Resolved"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <BarChart3 size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-sm">No data available for the selected period</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Ticket Status Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Activity size={20} />
                        Ticket Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.status_distribution && Object.keys(analytics.status_distribution).length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={Object.entries(analytics.status_distribution).map(([name, value]) => ({
                            name: name.charAt(0).toUpperCase() + name.slice(1).replace('_', ' '),
                            value: value
                          }))}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: 12 }}
                              angle={-45}
                              textAnchor="end"
                              height={60}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8b5cf6" name="Count" />
                          </BarChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <Activity size={48} className="mx-auto text-gray-400 mb-4" />
                          <p className="text-sm">No status data available</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Performance Metrics Line Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp size={20} />
                      Performance Metrics Over Time
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analytics.daily_trends && analytics.daily_trends.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={analytics.daily_trends}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="day" 
                            tick={{ fontSize: 12 }}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                          />
                          <YAxis tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="tickets" 
                            stroke="#3b82f6" 
                            strokeWidth={2}
                            name="New Tickets"
                            dot={{ r: 4 }}
                          />
                          <Line 
                            type="monotone" 
                            dataKey="resolved" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            name="Resolved"
                            dot={{ r: 4 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-gray-500">
                        <TrendingUp size={48} className="mx-auto text-gray-400 mb-4" />
                        <p className="text-sm">No trend data available for the selected period</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <BarChart3 size={48} className="mx-auto text-gray-400 mb-4 animate-pulse" />
                  <p className="text-gray-600 mb-2">Loading analytics...</p>
                  <p className="text-xs text-gray-400">Fetching data from database</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Modals */}
        {/* Create Product Modal */}
        {showProductModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {editingProduct ? 'Edit Product' : productUploadMode === 'bulk' ? 'Bulk Upload Products' : 'Create New Product'}
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowProductModal(false)
                    setProductUploadMode('single')
                    setBulkProductFile(null)
                    setBulkProductResults(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Selection Tabs - Only show if not editing */}
                {!editingProduct && (
                  <div className="flex gap-2 mb-6 border-b">
                    <button
                      type="button"
                      onClick={() => {
                        setProductUploadMode('single')
                        setBulkProductFile(null)
                        setBulkProductResults(null)
                      }}
                      className={`px-4 py-2 font-medium transition-colors ${
                        productUploadMode === 'single'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FileText size={18} className="inline mr-2" />
                      Single Product
                    </button>
                    <button
                      type="button"
                      onClick={() => setProductUploadMode('bulk')}
                      className={`px-4 py-2 font-medium transition-colors ${
                        productUploadMode === 'bulk'
                          ? 'border-b-2 border-blue-600 text-blue-600'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <FileSpreadsheet size={18} className="inline mr-2" />
                      Bulk Upload (Excel)
                    </button>
                  </div>
                )}

                {productUploadMode === 'bulk' && !editingProduct ? (
                  <div className="space-y-6">
                    {bulkProductResults ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-green-600" />
                            Bulk Upload Complete!
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Total:</strong> {bulkProductResults.total}</p>
                            <p className="text-green-700"><strong>Successfully processed:</strong> {bulkProductResults.successful}</p>
                            {bulkProductResults.failed > 0 && (
                              <p className="text-red-700"><strong>Failed:</strong> {bulkProductResults.failed}</p>
                            )}
                          </div>
                        </div>
                        {bulkProductResults.errors && bulkProductResults.errors.length > 0 && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-64 overflow-y-auto">
                            <h4 className="font-bold text-red-900 mb-2">Errors:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                              {bulkProductResults.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {bulkProductResults.products && bulkProductResults.products.length > 0 && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg max-h-64 overflow-y-auto">
                            <h4 className="font-bold text-blue-900 mb-2">Created Products:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-blue-700">
                              {bulkProductResults.products.map((product, idx) => (
                                <li key={idx}>
                                  {product.product_name} ({product.status})
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={() => {
                              setBulkProductResults(null)
                              setBulkProductFile(null)
                            }}
                            className="flex-1"
                          >
                            Upload More Products
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowProductModal(false)
                              setProductUploadMode('single')
                              setBulkProductResults(null)
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleBulkProductSubmit} className="space-y-6">
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                          <Label htmlFor="bulk-product-file-input" className="cursor-pointer">
                            <div className="space-y-2">
                              <p className="text-lg font-medium text-gray-900">
                                {bulkProductFile ? bulkProductFile.name : 'Upload Excel File'}
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
                            id="bulk-product-file-input"
                            type="file"
                            accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                            onChange={handleBulkProductFileChange}
                            className="hidden"
                          />
                          {bulkProductFile && (
                            <div className="mt-4 text-sm text-green-600">
                              ✓ File selected: {bulkProductFile.name} ({(bulkProductFile.size / 1024).toFixed(2)} KB)
                            </div>
                          )}
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-blue-900">Excel File Format</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadTemplate}
                            >
                              <Download size={14} className="mr-2" />
                              Download Template
                            </Button>
                          </div>
                          <p className="text-sm text-blue-800 mb-2">
                            Your Excel file should have the following columns (first row should be headers):
                          </p>
                          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                            <li><strong>product_name</strong> (required) - Product name e.g., &quot;Split AC 1.5T&quot;</li>
                            <li><strong>category</strong> (required) - ac, refrigerator, washing_machine, tv, microwave, air_purifier, water_purifier, other</li>
                            <li><strong>brand</strong> (optional) - Brand name</li>
                            <li><strong>description</strong> (optional) - Product description</li>
                            <li><strong>default_warranty_months</strong> (optional) - Default warranty in months</li>
                            <li><strong>extended_warranty_available</strong> (optional) - true/false</li>
                            <li><strong>model_number</strong> (optional) - Model number for product model</li>
                            <li><strong>model_name</strong> (optional) - Model name</li>
                            <li><strong>specifications</strong> (optional) - JSON string e.g., {'{"capacity": "1.5T"}'}</li>
                            <li><strong>common_failures</strong> (optional) - Comma-separated failures</li>
                            <li><strong>recommended_parts</strong> (optional) - Comma-separated part IDs</li>
                          </ul>
                        </div>

                        <div className="flex gap-4">
                          <Button
                            type="submit"
                            disabled={bulkProductLoading || !bulkProductFile}
                            className="flex-1"
                          >
                            {bulkProductLoading ? 'Processing...' : 'Upload and Create Products'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowProductModal(false)
                              setProductUploadMode('single')
                            }}
                            disabled={bulkProductLoading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                <div className="space-y-4">
                <div>
                  <Label>Product Name *</Label>
                  <Input
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    placeholder="e.g., Split AC 1.5T"
                    maxLength={255}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Category *</Label>
                    <Select value={productForm.category} onValueChange={(val) => setProductForm({...productForm, category: val})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ac">AC</SelectItem>
                        <SelectItem value="refrigerator">Refrigerator</SelectItem>
                        <SelectItem value="washing_machine">Washing Machine</SelectItem>
                        <SelectItem value="tv">TV</SelectItem>
                        <SelectItem value="microwave">Microwave</SelectItem>
                        <SelectItem value="air_purifier">Air Purifier</SelectItem>
                        <SelectItem value="water_purifier">Water Purifier</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Brand *</Label>
                    <Input
                      value={productForm.brand}
                      onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                      placeholder="e.g., CoolAir"
                      maxLength={100}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Model Number *</Label>
                    <Input
                      value={productForm.model_number}
                      onChange={(e) => setProductForm({...productForm, model_number: e.target.value})}
                      placeholder="e.g., XYZ-123"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label>Manufacturing Year</Label>
                    <Input
                      type="number"
                      value={productForm.manufacturing_year}
                      onChange={(e) => setProductForm({...productForm, manufacturing_year: parseInt(e.target.value) || new Date().getFullYear()})}
                      min="2000"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                </div>
                <div>
                  <Label>Batch Number (Optional)</Label>
                  <Input
                    value={productForm.batch_number}
                    onChange={(e) => setProductForm({...productForm, batch_number: e.target.value})}
                    placeholder="e.g., BATCH-2024-001"
                    maxLength={100}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Default Warranty (months)</Label>
                    <Input
                      type="number"
                      value={productForm.default_warranty_months}
                      onChange={(e) => setProductForm({...productForm, default_warranty_months: parseInt(e.target.value) || 12})}
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-6">
                    <Switch
                      checked={productForm.extended_warranty_available}
                      onCheckedChange={(val) => setProductForm({...productForm, extended_warranty_available: val})}
                    />
                    <Label>Extended Warranty Available</Label>
                  </div>
                </div>
                <div>
                  <Label>Additional Specifications (Optional)</Label>
                  <Textarea
                    value={typeof productForm.specifications === 'object' ? JSON.stringify(productForm.specifications, null, 2) : productForm.specifications || '{}'}
                    onChange={(e) => {
                      try {
                        const specs = e.target.value.trim() ? JSON.parse(e.target.value) : {}
                        setProductForm({...productForm, specifications: specs})
                      } catch (err) {
                        // Invalid JSON, but allow typing
                        setProductForm({...productForm, specifications: e.target.value})
                      }
                    }}
                    rows={3}
                    placeholder='{"capacity": "1.5T", "voltage": "220V", "power": "1500W"}'
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter additional specifications as JSON (optional)</p>
                </div>
                
                {/* Advanced Fields - Collapsible */}
                <details className="border rounded-lg p-4">
                  <summary className="cursor-pointer font-medium text-sm text-gray-700 hover:text-gray-900">
                    Advanced Settings (Optional)
                  </summary>
                  <div className="mt-4 space-y-4">
                    <div>
                      <Label>Common Failures (for AI diagnostics)</Label>
                      <Textarea
                        value={Array.isArray(productForm.common_failures) ? productForm.common_failures.join('\n') : ''}
                        onChange={(e) => {
                          const failures = e.target.value.split('\n').filter(f => f.trim())
                          setProductForm({...productForm, common_failures: failures})
                        }}
                        rows={3}
                        placeholder="Compressor failure&#10;Refrigerant leak&#10;PCB malfunction"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter common failure patterns, one per line (optional)</p>
                    </div>
                    <div>
                      <Label>Recommended Parts (comma-separated part IDs)</Label>
                      <Input
                        value={Array.isArray(productForm.recommended_parts) ? productForm.recommended_parts.join(', ') : ''}
                        onChange={(e) => {
                          const parts = e.target.value.split(',').map(p => p.trim()).filter(p => p)
                          setProductForm({...productForm, recommended_parts: parts})
                        }}
                        placeholder="1, 2, 3"
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter part IDs separated by commas (optional)</p>
                    </div>
                  </div>
                </details>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={productForm.is_active}
                    onCheckedChange={(val) => setProductForm({...productForm, is_active: val})}
                  />
                  <Label>Product is Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateProduct} className="flex-1">
                    <Save size={16} className="mr-2" />
                    {editingProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowProductModal(false)
                    setProductUploadMode('single')
                  }}>
                    Cancel
                  </Button>
                </div>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create SLA Policy Modal */}
        {showSLAModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{editingSLA ? 'Edit SLA Policy' : 'Create SLA Policy'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowSLAModal(false)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>SLA Type *</Label>
                  <Select value={slaForm.sla_type} onValueChange={(val) => setSlaForm({...slaForm, sla_type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="first_response">First Response</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="resolution">Resolution</SelectItem>
                      <SelectItem value="on_site">On-Site Visit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Time (hours) *</Label>
                  <Input
                    type="number"
                    value={slaForm.target_hours}
                    onChange={(e) => setSlaForm({...slaForm, target_hours: parseInt(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Product Category (optional)</Label>
                  <Select value={slaForm.product_category || undefined} onValueChange={(val) => setSlaForm({...slaForm, product_category: val === 'all' ? '' : val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="ac">AC</SelectItem>
                      <SelectItem value="refrigerator">Refrigerator</SelectItem>
                      <SelectItem value="washing_machine">Washing Machine</SelectItem>
                      <SelectItem value="tv">TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={slaForm.business_hours_only}
                    onCheckedChange={(val) => setSlaForm({...slaForm, business_hours_only: val})}
                  />
                  <Label>Business Hours Only</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateSLAPolicy} className="flex-1">
                    <Save size={16} className="mr-2" />
                    {editingSLA ? 'Update Policy' : 'Create Policy'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowSLAModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Integration Modal */}
        {showIntegrationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{editingIntegration ? 'Edit Integration' : 'Add Integration'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowIntegrationModal(false)
                    setEditingIntegration(null)
                    setIntegrationForm({
                      name: '',
                      integration_type: 'webhook',
                      provider: '',
                      config: {},
                      webhook_url: '',
                      api_endpoint: '',
                      sync_direction: 'bidirectional',
                      sync_frequency: 'realtime',
                      is_active: false
                    })
                    setOemSyncSettings({
                      enabled: false,
                      interval_minutes: 1440,
                      batch_size: 200
                    })
                    setIntegrationConfigJson('{}')
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Configure an integration to connect with external systems like ERP, CRM, or payment gateways.
                  </p>
                </div>

                <div>
                  <Label>Integration Name *</Label>
                  <Input
                    value={integrationForm.name}
                    onChange={(e) => setIntegrationForm({...integrationForm, name: e.target.value})}
                    placeholder="e.g., SAP ERP Integration"
                    maxLength={255}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Integration Type *</Label>
                    <Select value={integrationForm.integration_type} onValueChange={(val) => setIntegrationForm({...integrationForm, integration_type: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="erp">ERP</SelectItem>
                        <SelectItem value="crm">CRM</SelectItem>
                        <SelectItem value="warehouse">Warehouse</SelectItem>
                        <SelectItem value="payment_gateway">Payment Gateway</SelectItem>
                        <SelectItem value="sms_provider">SMS Provider</SelectItem>
                        <SelectItem value="email_provider">Email Provider</SelectItem>
                        <SelectItem value="webhook">Webhook</SelectItem>
                        <SelectItem value="api">API</SelectItem>
                        <SelectItem value="iot">IoT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Provider</Label>
                    <Input
                      value={integrationForm.provider}
                      onChange={(e) => setIntegrationForm({...integrationForm, provider: e.target.value})}
                      placeholder="e.g., SAP, Salesforce, Twilio"
                      maxLength={100}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Webhook URL</Label>
                    <Input
                      value={integrationForm.webhook_url}
                      onChange={(e) => setIntegrationForm({...integrationForm, webhook_url: e.target.value})}
                      placeholder="https://..."
                      type="url"
                    />
                    <p className="text-xs text-gray-500 mt-1">For receiving webhook events</p>
                  </div>
                  <div>
                    <Label>API Endpoint</Label>
                    <Input
                      value={integrationForm.api_endpoint}
                      onChange={(e) => setIntegrationForm({...integrationForm, api_endpoint: e.target.value})}
                      placeholder="https://api.example.com"
                      type="url"
                    />
                    <p className="text-xs text-gray-500 mt-1">External API base URL</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Sync Direction</Label>
                    <Select value={integrationForm.sync_direction} onValueChange={(val) => setIntegrationForm({...integrationForm, sync_direction: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="inbound">Inbound Only</SelectItem>
                        <SelectItem value="outbound">Outbound Only</SelectItem>
                        <SelectItem value="bidirectional">Bidirectional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Sync Frequency</Label>
                    <Select value={integrationForm.sync_frequency} onValueChange={(val) => setIntegrationForm({...integrationForm, sync_frequency: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {integrationForm.integration_type === 'api' && (
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>OEM Sync Enabled</Label>
                      <Select
                        value={oemSyncSettings.enabled ? 'enabled' : 'disabled'}
                        onValueChange={(val) => setOemSyncSettings({ ...oemSyncSettings, enabled: val === 'enabled' })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="enabled">Enabled</SelectItem>
                          <SelectItem value="disabled">Disabled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Sync Interval (min)</Label>
                      <Input
                        type="number"
                        value={oemSyncSettings.interval_minutes}
                        onChange={(e) => setOemSyncSettings({ ...oemSyncSettings, interval_minutes: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>Batch Size</Label>
                      <Input
                        type="number"
                        value={oemSyncSettings.batch_size}
                        onChange={(e) => setOemSyncSettings({ ...oemSyncSettings, batch_size: e.target.value })}
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label>Configuration (JSON)</Label>
                  <Textarea
                    value={integrationConfigJson}
                    onChange={(e) => setIntegrationConfigJson(e.target.value)}
                    placeholder='{"api_key": "your-key", "api_secret": "your-secret"}'
                    rows={6}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Enter configuration as JSON (API keys, credentials, etc.)
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={integrationForm.is_active}
                    onCheckedChange={(checked) => setIntegrationForm({...integrationForm, is_active: checked})}
                  />
                  <Label>Integration is Active</Label>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Button onClick={handleCreateIntegration} className="flex-1">
                    <Save size={16} className="mr-2" />
                    {editingIntegration ? 'Update Integration' : 'Create Integration'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowIntegrationModal(false)
                    setEditingIntegration(null)
                    setIntegrationForm({
                      name: '',
                      integration_type: 'webhook',
                      provider: '',
                      config: {},
                      webhook_url: '',
                      api_endpoint: '',
                      sync_direction: 'bidirectional',
                      sync_frequency: 'realtime',
                      is_active: false
                    })
                    setIntegrationConfigJson('{}')
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Partner Modal */}
        {showPartnerModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Register Service Partner</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowPartnerModal(false)
                    setPartnerForm({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      country_id: null,
                      state_id: null,
                      city_id: null,
                      product_categories: [],
                      service_regions: []
                    })
                    setStates([])
                    setCities([])
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Register a service partner organization that will handle service requests for your products.
                  </p>
                </div>

                <div>
                  <Label>Partner Name *</Label>
                  <Input
                    value={partnerForm.name}
                    onChange={(e) => setPartnerForm({...partnerForm, name: e.target.value})}
                    placeholder="e.g., ABC Service Solutions"
                    maxLength={255}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={partnerForm.email}
                      onChange={(e) => setPartnerForm({...partnerForm, email: e.target.value})}
                      placeholder="partner@example.com"
                      maxLength={255}
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({...partnerForm, phone: e.target.value})}
                      placeholder="+91 1234567890"
                      maxLength={20}
                    />
                  </div>
                </div>

                <div>
                  <Label>Address</Label>
                  <Textarea
                    value={partnerForm.address}
                    onChange={(e) => setPartnerForm({...partnerForm, address: e.target.value})}
                    rows={3}
                    placeholder="Full address"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Country</Label>
                    <Select
                      value={partnerForm.country_id?.toString() || ''}
                      onValueChange={(value) => {
                        const countryId = value ? parseInt(value) : null
                        setPartnerForm({...partnerForm, country_id: countryId, state_id: null, city_id: null})
                        if (countryId) {
                          loadStates(countryId)
                        } else {
                          setStates([])
                          setCities([])
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country, index) => {
                          const value = country.id ? country.id.toString() : (country.code || `country-${index}`)
                          const key = country.id || country.code || `country-${index}`
                          return (
                            <SelectItem key={key} value={value}>
                              {country.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>State</Label>
                    <Select
                      value={partnerForm.state_id?.toString() || ''}
                      onValueChange={(value) => {
                        // Handle both numeric IDs and string identifiers (for API responses)
                        let stateId = null
                        let stateName = null
                        
                        // Try to parse as integer first
                        const parsedId = parseInt(value)
                        if (!isNaN(parsedId) && parsedId.toString() === value) {
                          // It's a numeric ID
                          stateId = parsedId
                          // Find state name from states list
                          const selectedState = states.find(s => s.id === parsedId)
                          stateName = selectedState?.name
                        } else {
                          // It's a string identifier (state name, code, or "state-X")
                          const selectedState = states.find(s => {
                            if (s.name === value) return true
                            if (s.code === value) return true
                            const index = states.indexOf(s)
                            if (`state-${index}` === value) return true
                            return false
                          })
                          stateName = selectedState?.name || value // Use value as state name if not found
                          stateId = selectedState?.id || value // Use value as fallback identifier
                        }
                        
                        setPartnerForm({...partnerForm, state_id: stateId, city_id: null})
                        if (stateName || stateId) {
                          // Use state name for India API (preferred), stateId as fallback
                          loadCities(stateName || stateId)
                        } else {
                          setCities([])
                        }
                      }}
                      disabled={!partnerForm.country_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {states.map((state, index) => {
                          // Handle both API responses (id: null) and database responses (id: number)
                          const value = state.id ? state.id.toString() : (state.code || state.name || `state-${index}`)
                          const key = state.id || state.code || state.name || `state-${index}`
                          return (
                            <SelectItem key={key} value={value}>
                              {state.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>City</Label>
                    <Select
                      value={partnerForm.city_id?.toString() || ''}
                      onValueChange={(value) => {
                        const cityId = value ? parseInt(value) : null
                        setPartnerForm({...partnerForm, city_id: cityId})
                      }}
                      disabled={!partnerForm.state_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        {cities.map((city, index) => {
                          // Handle both API responses (id: null) and database responses (id: number)
                          const value = city.id ? city.id.toString() : (city.name || `city-${index}`)
                          const key = city.id || city.name || `city-${index}`
                          return (
                            <SelectItem key={key} value={value}>
                              {city.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Product Categories (Optional)</Label>
                  <Input
                    value={Array.isArray(partnerForm.product_categories) ? partnerForm.product_categories.join(', ') : ''}
                    onChange={(e) => {
                      const categories = e.target.value.split(',').map(c => c.trim()).filter(c => c)
                      setPartnerForm({...partnerForm, product_categories: categories})
                    }}
                    placeholder="ac, refrigerator, washing_machine (comma-separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list of product categories this partner will service</p>
                </div>

                <div>
                  <Label>Service Regions (Optional)</Label>
                  <Input
                    value={Array.isArray(partnerForm.service_regions) ? partnerForm.service_regions.join(', ') : ''}
                    onChange={(e) => {
                      const regions = e.target.value.split(',').map(r => r.trim()).filter(r => r)
                      setPartnerForm({...partnerForm, service_regions: regions})
                    }}
                    placeholder="North Zone, South Zone (comma-separated)"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list of service regions</p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreatePartner} className="flex-1">
                    <Save size={16} className="mr-2" />
                    Register Partner
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowPartnerModal(false)
                    setPartnerForm({
                      name: '',
                      email: '',
                      phone: '',
                      address: '',
                      country_id: null,
                      state_id: null,
                      city_id: null,
                      product_categories: [],
                      service_regions: []
                    })
                    setStates([])
                    setCities([])
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Part Modal */}
        {showPartModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{partUploadMode === 'bulk' ? 'Bulk Upload Parts' : 'Create New Part'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowPartModal(false)
                    setPartUploadMode('single')
                    setBulkPartFile(null)
                    setBulkPartResults(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Selection Tabs */}
                <div className="flex gap-2 mb-6 border-b">
                  <button
                    type="button"
                    onClick={() => {
                      setPartUploadMode('single')
                      setBulkPartFile(null)
                      setBulkPartResults(null)
                    }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      partUploadMode === 'single'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText size={18} className="inline mr-2" />
                    Single Part
                  </button>
                  <button
                    type="button"
                    onClick={() => setPartUploadMode('bulk')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      partUploadMode === 'bulk'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileSpreadsheet size={18} className="inline mr-2" />
                    Bulk Upload (Excel)
                  </button>
                </div>

                {partUploadMode === 'bulk' ? (
                  <div className="space-y-6">
                    {bulkPartResults ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-green-600" />
                            Bulk Upload Complete!
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Total:</strong> {bulkPartResults.total}</p>
                            <p className="text-green-700"><strong>Successfully processed:</strong> {bulkPartResults.successful}</p>
                            {bulkPartResults.failed > 0 && (
                              <p className="text-red-700"><strong>Failed:</strong> {bulkPartResults.failed}</p>
                            )}
                          </div>
                        </div>
                        {bulkPartResults.errors && bulkPartResults.errors.length > 0 && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-64 overflow-y-auto">
                            <h4 className="font-bold text-red-900 mb-2">Errors:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                              {bulkPartResults.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={() => {
                              setBulkPartResults(null)
                              setBulkPartFile(null)
                            }}
                            className="flex-1"
                          >
                            Upload More Parts
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPartModal(false)
                              setPartUploadMode('single')
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleBulkPartSubmit} className="space-y-6">
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                          <Label htmlFor="bulk-part-file-input" className="cursor-pointer">
                            <div className="space-y-2">
                              <p className="text-lg font-medium text-gray-900">
                                {bulkPartFile ? bulkPartFile.name : 'Upload Excel File'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Click to browse or drag and drop
                              </p>
                            </div>
                          </Label>
                          <Input
                            id="bulk-part-file-input"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleBulkPartFileChange}
                            className="hidden"
                          />
                          {bulkPartFile && (
                            <div className="mt-4 text-sm text-green-600">
                              ✓ File selected: {bulkPartFile.name}
                            </div>
                          )}
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-blue-900">Excel File Format</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadPartTemplate}
                            >
                              <Download size={14} className="mr-2" />
                              Download Template
                            </Button>
                          </div>
                          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                            <li><strong>sku</strong> (required) - Unique SKU code</li>
                            <li><strong>name</strong> (required) - Part name</li>
                            <li><strong>description</strong> (optional) - Part description</li>
                            <li><strong>cost_price</strong> (optional) - Cost price</li>
                            <li><strong>selling_price</strong> (optional) - Selling price</li>
                            <li><strong>unit</strong> (optional) - Unit of measurement</li>
                            <li><strong>applicable_products</strong> (optional) - Comma-separated product categories</li>
                            <li><strong>compatible_models</strong> (optional) - Comma-separated model numbers</li>
                          </ul>
                        </div>
                        <div className="flex gap-4">
                          <Button
                            type="submit"
                            disabled={bulkPartLoading || !bulkPartFile}
                            className="flex-1"
                          >
                            {bulkPartLoading ? 'Processing...' : 'Upload and Create Parts'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPartModal(false)
                              setPartUploadMode('single')
                            }}
                            disabled={bulkPartLoading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>SKU *</Label>
                    <Input
                      value={partForm.sku}
                      onChange={(e) => setPartForm({...partForm, sku: e.target.value})}
                      placeholder="e.g., PART-001"
                      maxLength={100}
                    />
                  </div>
                  <div>
                    <Label>Unit</Label>
                    <Select value={partForm.unit} onValueChange={(val) => setPartForm({...partForm, unit: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="piece">Piece</SelectItem>
                        <SelectItem value="kg">Kilogram</SelectItem>
                        <SelectItem value="liter">Liter</SelectItem>
                        <SelectItem value="meter">Meter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Part Name *</Label>
                  <Input
                    value={partForm.name}
                    onChange={(e) => setPartForm({...partForm, name: e.target.value})}
                    placeholder="e.g., Compressor Motor"
                    maxLength={255}
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={partForm.description}
                    onChange={(e) => setPartForm({...partForm, description: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Cost Price (₹)</Label>
                    <Input
                      type="number"
                      value={partForm.cost_price}
                      onChange={(e) => setPartForm({...partForm, cost_price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Selling Price (₹)</Label>
                    <Input
                      type="number"
                      value={partForm.selling_price}
                      onChange={(e) => setPartForm({...partForm, selling_price: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreatePart} className="flex-1">
                    <Save size={16} className="mr-2" />
                    Create Part
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowPartModal(false)
                    setPartUploadMode('single')
                  }}>
                    Cancel
                  </Button>
                </div>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Inventory Modal */}
        {showInventoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{inventoryUploadMode === 'bulk' ? 'Bulk Upload Inventory' : 'Add Inventory Entry'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowInventoryModal(false)
                    setInventoryUploadMode('single')
                    setBulkInventoryFile(null)
                    setBulkInventoryResults(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Mode Selection Tabs */}
                <div className="flex gap-2 mb-6 border-b">
                  <button
                    type="button"
                    onClick={() => {
                      setInventoryUploadMode('single')
                      setBulkInventoryFile(null)
                      setBulkInventoryResults(null)
                    }}
                    className={`px-4 py-2 font-medium transition-colors ${
                      inventoryUploadMode === 'single'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileText size={18} className="inline mr-2" />
                    Single Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setInventoryUploadMode('bulk')}
                    className={`px-4 py-2 font-medium transition-colors ${
                      inventoryUploadMode === 'bulk'
                        ? 'border-b-2 border-blue-600 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <FileSpreadsheet size={18} className="inline mr-2" />
                    Bulk Upload (Excel)
                  </button>
                </div>

                {inventoryUploadMode === 'bulk' ? (
                  <div className="space-y-6">
                    {bulkInventoryResults ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h3 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                            <CheckCircle2 size={20} className="text-green-600" />
                            Bulk Upload Complete!
                          </h3>
                          <div className="space-y-1 text-sm">
                            <p><strong>Total:</strong> {bulkInventoryResults.total}</p>
                            <p className="text-green-700"><strong>Successfully processed:</strong> {bulkInventoryResults.successful}</p>
                            {bulkInventoryResults.failed > 0 && (
                              <p className="text-red-700"><strong>Failed:</strong> {bulkInventoryResults.failed}</p>
                            )}
                          </div>
                        </div>
                        {bulkInventoryResults.errors && bulkInventoryResults.errors.length > 0 && (
                          <div className="p-4 bg-red-50 border border-red-200 rounded-lg max-h-64 overflow-y-auto">
                            <h4 className="font-bold text-red-900 mb-2">Errors:</h4>
                            <ul className="list-disc list-inside space-y-1 text-sm text-red-700">
                              {bulkInventoryResults.errors.map((error, idx) => (
                                <li key={idx}>{error}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <div className="flex gap-4">
                          <Button
                            type="button"
                            onClick={() => {
                              setBulkInventoryResults(null)
                              setBulkInventoryFile(null)
                            }}
                            className="flex-1"
                          >
                            Upload More Inventory
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowInventoryModal(false)
                              setInventoryUploadMode('single')
                            }}
                          >
                            Close
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleBulkInventorySubmit} className="space-y-6">
                        <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
                          <FileSpreadsheet size={48} className="mx-auto text-gray-400 mb-4" />
                          <Label htmlFor="bulk-inventory-file-input" className="cursor-pointer">
                            <div className="space-y-2">
                              <p className="text-lg font-medium text-gray-900">
                                {bulkInventoryFile ? bulkInventoryFile.name : 'Upload Excel File'}
                              </p>
                              <p className="text-sm text-gray-500">
                                Click to browse or drag and drop
                              </p>
                            </div>
                          </Label>
                          <Input
                            id="bulk-inventory-file-input"
                            type="file"
                            accept=".xlsx,.xls"
                            onChange={handleBulkInventoryFileChange}
                            className="hidden"
                          />
                          {bulkInventoryFile && (
                            <div className="mt-4 text-sm text-green-600">
                              ✓ File selected: {bulkInventoryFile.name}
                            </div>
                          )}
                        </div>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-bold text-blue-900">Excel File Format</h4>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={handleDownloadInventoryTemplate}
                            >
                              <Download size={14} className="mr-2" />
                              Download Template
                            </Button>
                          </div>
                          <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
                            <li><strong>part_sku</strong> (required) - Part SKU code (must exist)</li>
                            <li><strong>current_stock</strong> (required) - Current stock quantity</li>
                            <li><strong>min_threshold</strong> (required) - Minimum stock threshold</li>
                            <li><strong>max_threshold</strong> (optional) - Maximum stock threshold</li>
                            <li><strong>warehouse_name</strong> (optional) - Warehouse name</li>
                            <li><strong>city_id</strong> (required) - City ID for the inventory location</li>
                            <li><strong>state_id</strong> (optional) - Must match city_id if provided</li>
                            <li><strong>country_id</strong> (optional) - Auto-derived from city</li>
                          </ul>
                        </div>
                        <div className="flex gap-4">
                          <Button
                            type="submit"
                            disabled={bulkInventoryLoading || !bulkInventoryFile}
                            className="flex-1"
                          >
                            {bulkInventoryLoading ? 'Processing...' : 'Upload and Create Inventory'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowInventoryModal(false)
                              setInventoryUploadMode('single')
                            }}
                            disabled={bulkInventoryLoading}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                <div className="space-y-4">
                <div>
                  <Label>Part *</Label>
                  <Select value={inventoryForm.part_id} onValueChange={(val) => setInventoryForm({...inventoryForm, part_id: val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select part" />
                    </SelectTrigger>
                    <SelectContent>
                      {parts.map(part => (
                        <SelectItem key={part.id} value={part.id.toString()}>
                          {part.name} ({part.sku})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Warehouse Name</Label>
                  <Input
                    value={inventoryForm.warehouse_name}
                    onChange={(e) => setInventoryForm({...inventoryForm, warehouse_name: e.target.value})}
                    placeholder="e.g., Main Warehouse"
                    maxLength={255}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Country (Optional)</Label>
                    <Select 
                      value={inventoryForm.country_id || undefined} 
                      onValueChange={(val) => {
                        const countryId = val === 'none' ? '' : val
                        setInventoryForm({...inventoryForm, country_id: countryId, state_id: '', city_id: ''})
                        // Pass the actual value (could be ID number or country code string)
                        loadStates(countryId || null)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {countries.map((country, index) => {
                          // Handle both API response (no id) and database response (has id)
                          const value = country.id ? country.id.toString() : (country.code || `country-${index}`)
                          const key = country.id || country.code || `country-${index}`
                          return (
                            <SelectItem key={key} value={value}>
                              {country.name} {country.code ? `(${country.code})` : ''}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>State (Optional)</Label>
                    <Select 
                      value={inventoryForm.state_id || undefined} 
                      onValueChange={(val) => {
                        const stateId = val === 'none' ? '' : val
                        setInventoryForm({...inventoryForm, state_id: stateId, city_id: ''})
                        // Pass the actual value (could be ID or code)
                        loadCities(stateId || null)
                      }}
                      disabled={!inventoryForm.country_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {states.map((state, index) => {
                          // Handle both API response (no id) and database response (has id)
                          const value = state.id ? state.id.toString() : (state.code || `state-${index}`)
                          const key = state.id || state.code || `state-${index}`
                          return (
                            <SelectItem key={key} value={value}>
                              {state.name} {state.code ? `(${state.code})` : ''}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>City (Optional)</Label>
                    <Select 
                      value={inventoryForm.city_id || undefined} 
                      onValueChange={(val) => {
                        const cityId = val === 'none' ? '' : val
                        setInventoryForm({...inventoryForm, city_id: cityId})
                      }}
                      disabled={!inventoryForm.state_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {cities.map((city, index) => {
                          // Handle both API response (no id) and database response (has id)
                          const value = city.id ? city.id.toString() : `city-${index}`
                          const key = city.id || `city-${index}`
                          return (
                            <SelectItem key={key} value={value}>
                              {city.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Current Stock</Label>
                    <Input
                      type="number"
                      value={inventoryForm.current_stock}
                      onChange={(e) => setInventoryForm({...inventoryForm, current_stock: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Min Threshold</Label>
                    <Input
                      type="number"
                      value={inventoryForm.min_threshold}
                      onChange={(e) => setInventoryForm({...inventoryForm, min_threshold: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label>Max Threshold (Optional)</Label>
                    <Input
                      type="number"
                      value={inventoryForm.max_threshold || ''}
                      onChange={(e) => setInventoryForm({...inventoryForm, max_threshold: e.target.value ? parseInt(e.target.value) : null})}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateInventory} className="flex-1">
                    <Save size={16} className="mr-2" />
                    Add Inventory
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowInventoryModal(false)
                    setInventoryUploadMode('single')
                  }}>
                    Cancel
                  </Button>
                </div>
                </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Stock Adjustment Modal */}
        {showStockAdjustModal && selectedInventory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-lg w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Adjust Stock: {selectedInventory.part_name}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowStockAdjustModal(false)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Current Stock</Label>
                  <p className="font-semibold text-lg">{selectedInventory.current_stock}</p>
                </div>
                <div>
                  <Label>Transaction Type *</Label>
                  <Select 
                    value={stockAdjustForm.transaction_type} 
                    onValueChange={(val) => setStockAdjustForm({...stockAdjustForm, transaction_type: val})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="in">Stock In</SelectItem>
                      <SelectItem value="out">Stock Out</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>
                    {stockAdjustForm.transaction_type === 'adjustment' ? 'New Stock Level' : 'Quantity'} *
                  </Label>
                  <Input
                    type="number"
                    value={stockAdjustForm.quantity}
                    onChange={(e) => setStockAdjustForm({...stockAdjustForm, quantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={stockAdjustForm.notes}
                    onChange={(e) => setStockAdjustForm({...stockAdjustForm, notes: e.target.value})}
                    rows={3}
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAdjustStock} className="flex-1">
                    <Save size={16} className="mr-2" />
                    Adjust Stock
                  </Button>
                  <Button variant="outline" onClick={() => setShowStockAdjustModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Creation/Edit Modal */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{editingUser ? 'Edit User' : 'Create New User'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowUserModal(false)
                    setEditingUser(null)
                    setUserForm({
                      email: '',
                      phone: '',
                      full_name: '',
                      password: '',
                      role: 'customer',
                      country_id: null,
                      state_id: null,
                      city_id: null,
                      engineer_skill_level: '',
                      engineer_specialization: []
                    })
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Full Name *</Label>
                    <Input
                      value={userForm.full_name}
                      onChange={(e) => setUserForm({...userForm, full_name: e.target.value})}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                      placeholder="user@example.com"
                    />
                  </div>
                  <div>
                    <Label>Phone *</Label>
                    <Input
                      type="tel"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                      placeholder="+911234567890"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter phone number (e.g., +911234567890)</p>
                  </div>
                  <div>
                    <Label>Role *</Label>
                    <Select 
                      value={userForm.role} 
                      onValueChange={(val) => setUserForm({...userForm, role: val})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((role) => (
                          <SelectItem key={role} value={role}>
                            {role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {!editingUser && (
                    <div>
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={userForm.password}
                        onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                        placeholder="Enter password"
                      />
                    </div>
                  )}
                  {userForm.role === 'support_engineer' && (
                    <div>
                      <Label>Skill Level</Label>
                      <Select 
                        value={userForm.engineer_skill_level || ''} 
                        onValueChange={(val) => setUserForm({...userForm, engineer_skill_level: val})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select skill level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="junior">Junior</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                          <SelectItem value="expert">Expert</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                
                {/* Location fields */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Country (Optional)</Label>
                    <Select 
                      value={userForm.country_id || undefined} 
                      onValueChange={(val) => {
                        const countryId = val === 'none' ? null : parseInt(val)
                        setUserForm({...userForm, country_id: countryId, state_id: null, city_id: null})
                        if (countryId) {
                          loadStates(countryId)
                        } else {
                          setStates([])
                          setCities([])
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {countries.map((country) => (
                          <SelectItem key={country.id} value={country.id.toString()}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>State (Optional)</Label>
                    <Select 
                      value={userForm.state_id ? (typeof userForm.state_id === 'number' ? userForm.state_id.toString() : userForm.state_id) : undefined} 
                      onValueChange={(val) => {
                        if (val === 'none') {
                          setUserForm({...userForm, state_id: null, city_id: null})
                          setCities([])
                          return
                        }
                        // Find the state to get its ID
                        const state = states.find(s => {
                          if (s.id) {
                            return s.id.toString() === val
                          } else {
                            return s.code === val || s.name === val
                          }
                        })
                        // Use the actual ID if available, otherwise try to parse
                        const stateId = state?.id ? state.id : (parseInt(val) || val)
                        setUserForm({...userForm, state_id: stateId, city_id: null})
                        if (stateId) {
                          loadCities(stateId)
                        } else {
                          setCities([])
                        }
                      }}
                      disabled={!userForm.country_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {states.map((state) => {
                          // Always use ID if available, otherwise use code or name
                          const value = state.id ? state.id.toString() : (state.code || state.name || `state-${state.name}`)
                          return (
                            <SelectItem key={value} value={value}>
                              {state.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>City (Optional)</Label>
                    <Select 
                      value={userForm.city_id ? (typeof userForm.city_id === 'number' ? userForm.city_id.toString() : userForm.city_id) : undefined} 
                      onValueChange={(val) => {
                        if (val === 'none') {
                          setUserForm({...userForm, city_id: null})
                          return
                        }
                        // Find the city to get its ID
                        const city = cities.find(c => {
                          if (c.id) {
                            return c.id.toString() === val
                          } else {
                            return c.code === val || c.name === val
                          }
                        })
                        // Use the actual ID if available, otherwise try to parse
                        const cityId = city?.id ? city.id : (parseInt(val) || val)
                        setUserForm({...userForm, city_id: cityId})
                      }}
                      disabled={!userForm.state_id}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select city" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {cities.map((city) => {
                          // Always use ID if available, otherwise use code or name
                          const value = city.id ? city.id.toString() : (city.code || city.name || `city-${city.name}`)
                          return (
                            <SelectItem key={value} value={value}>
                              {city.name}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleCreateUser} className="flex-1">
                    <Save size={16} className="mr-2" />
                    {editingUser ? 'Update User' : 'Create User'}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowUserModal(false)
                    setEditingUser(null)
                    setUserForm({
                      email: '',
                      phone: '',
                      full_name: '',
                      password: '',
                      role: 'customer',
                      country_id: null,
                      state_id: null,
                      city_id: null,
                      engineer_skill_level: '',
                      engineer_specialization: []
                    })
                  }}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Link Part to Product Modal */}
        {showLinkPartModal && selectedProduct && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Link Parts to: {selectedProduct.name}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowLinkPartModal(false)
                    setSelectedProduct(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Select Part to Link</Label>
                  <div className="space-y-2 mt-2 max-h-64 overflow-y-auto">
                    {parts.filter(part => {
                      // Filter out already linked parts
                      const linkedParts = productParts[selectedProduct.id] || []
                      return !linkedParts.some(pp => pp.part_id === part.id)
                    }).map(part => (
                      <div key={part.id} className="border rounded-lg p-3 hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{part.name}</p>
                            <p className="text-sm text-gray-600">SKU: {part.sku}</p>
                            <p className="text-xs text-gray-500">Price: ₹{part.selling_price || 0}</p>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleLinkPartToProduct(part.id, false)}
                            >
                              Link
                            </Button>
                            <Button 
                              size="sm"
                              onClick={() => handleLinkPartToProduct(part.id, true)}
                            >
                              Link (Required)
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {parts.filter(part => {
                      const linkedParts = productParts[selectedProduct.id] || []
                      return !linkedParts.some(pp => pp.part_id === part.id)
                    }).length === 0 && (
                      <p className="text-center text-gray-500 py-4">All parts are already linked</p>
                    )}
                  </div>
                </div>
                
                {productParts[selectedProduct.id] && productParts[selectedProduct.id].length > 0 && (
                  <div>
                    <Label>Currently Linked Parts</Label>
                    <div className="space-y-2 mt-2">
                      {productParts[selectedProduct.id].map(pp => (
                        <div key={pp.id} className="border rounded-lg p-3 flex justify-between items-center">
                          <div>
                            <p className="font-semibold">{pp.part_name}</p>
                            <p className="text-sm text-gray-600">SKU: {pp.sku}</p>
                            <div className="flex gap-2 mt-1">
                              {pp.is_required && (
                                <Badge className="bg-red-100 text-red-700">Required</Badge>
                              )}
                              {pp.is_common && (
                                <Badge variant="outline">Common</Badge>
                              )}
                              {pp.stock && (
                                <Badge className={pp.stock.is_low_stock ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}>
                                  Stock: {pp.stock.current}
                                </Badge>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleUnlinkPartFromProduct(selectedProduct.id, pp.part_id)}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Create Service Policy Modal */}
        {showServicePolicyModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{editingServicePolicy ? 'Edit Service Policy' : 'Create Service Policy'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => setShowServicePolicyModal(false)}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Policy Type *</Label>
                  <Select value={servicePolicyForm.policy_type} onValueChange={(val) => setServicePolicyForm({...servicePolicyForm, policy_type: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="warranty">Warranty</SelectItem>
                      <SelectItem value="chargeable">Chargeable</SelectItem>
                      <SelectItem value="parts">Parts</SelectItem>
                      <SelectItem value="pricing">Pricing</SelectItem>
                      <SelectItem value="replacement">Replacement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Product Category (optional)</Label>
                  <Select value={servicePolicyForm.product_category || undefined} onValueChange={(val) => setServicePolicyForm({...servicePolicyForm, product_category: val === 'all' ? '' : val})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All products" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="ac">AC</SelectItem>
                      <SelectItem value="refrigerator">Refrigerator</SelectItem>
                      <SelectItem value="washing_machine">Washing Machine</SelectItem>
                      <SelectItem value="tv">TV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Rules (JSON) *</Label>
                  <Textarea
                    value={servicePolicyForm._rulesRaw !== undefined ? servicePolicyForm._rulesRaw : JSON.stringify(servicePolicyForm.rules, null, 2)}
                    onChange={(e) => {
                      const newValue = e.target.value
                      // Update raw value immediately so user can type
                      setServicePolicyForm(prev => ({
                        ...prev,
                        _rulesRaw: newValue
                      }))
                      // Try to parse JSON in the background
                      try {
                        const parsed = JSON.parse(newValue)
                        setServicePolicyForm(prev => ({
                          ...prev,
                          rules: parsed
                        }))
                      } catch (err) {
                        // Invalid JSON - user is still typing, that's OK
                        // Keep the raw value for display
                      }
                    }}
                    placeholder='{"warranty_period_months": 12, "conditions": []}'
                    rows={8}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">Enter valid JSON format. Example: {'{"warranty_period_months": 12, "conditions": []}'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={servicePolicyForm.is_active}
                    onCheckedChange={(val) => setServicePolicyForm({...servicePolicyForm, is_active: val})}
                  />
                  <Label>Active</Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateServicePolicy} className="flex-1">
                    <Save size={16} className="mr-2" />
                    {editingServicePolicy ? 'Update Policy' : 'Create Policy'}
                  </Button>
                  <Button variant="outline" onClick={() => setShowServicePolicyModal(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade Plan Modal */}
        {showUpgradePlanModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard size={20} />
                    Upgrade Subscription Plan
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowUpgradePlanModal(false)
                    setSelectedUpgradePlan(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {dashboardData?.subscription && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Current Plan:</strong> {dashboardData.subscription.plan_name} ({dashboardData.subscription.status})
                    </p>
                  </div>
                )}

                <div>
                  <Label className="mb-2 block">Billing Period</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={billingPeriod === 'monthly' ? 'default' : 'outline'}
                      onClick={() => setBillingPeriod('monthly')}
                    >
                      Monthly
                    </Button>
                    <Button
                      variant={billingPeriod === 'annual' ? 'default' : 'outline'}
                      onClick={() => setBillingPeriod('annual')}
                    >
                      Annual (Save 20%)
                    </Button>
                  </div>
                </div>

                {loadingPlans ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading plans...</p>
                  </div>
                ) : availablePlans.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No plans available</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {availablePlans
                      .filter(plan => plan.is_active && plan.is_visible)
                      .map((plan) => {
                        const price = billingPeriod === 'annual' 
                          ? (plan.annual_price || 0) 
                          : (plan.monthly_price || 0)
                        const isCurrentPlan = dashboardData?.subscription?.plan_name === plan.name
                        
                        return (
                          <Card 
                            key={plan.id} 
                            className={`p-4 cursor-pointer transition-all ${
                              selectedUpgradePlan === plan.id 
                                ? 'border-2 border-blue-600 bg-blue-50' 
                                : 'border hover:border-blue-300'
                            } ${isCurrentPlan ? 'opacity-60' : ''}`}
                            onClick={() => !isCurrentPlan && setSelectedUpgradePlan(plan.id)}
                          >
                            <div className="space-y-3">
                              <div className="flex justify-between items-start">
                                <h3 className="font-bold text-lg">{plan.name}</h3>
                                {isCurrentPlan && (
                                  <Badge className="bg-green-100 text-green-700">Current</Badge>
                                )}
                              </div>
                              <p className="text-sm text-gray-600">{plan.description || 'No description'}</p>
                              <div>
                                <span className="text-2xl font-bold">₹{Math.round(price).toLocaleString('en-IN')}</span>
                                <span className="text-gray-600 text-sm">/{billingPeriod === 'annual' ? 'year' : 'month'}</span>
                              </div>
                              {plan.max_engineers && (
                                <p className="text-xs text-gray-500">
                                  Max Engineers: {plan.max_engineers === -1 ? 'Unlimited' : plan.max_engineers}
                                </p>
                              )}
                              {plan.features && Object.keys(plan.features).length > 0 && (
                                <div className="text-xs text-gray-600">
                                  <p className="font-semibold mb-1">Features:</p>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {Object.entries(plan.features).slice(0, 3).map(([key, value]) => (
                                      <li key={key}>{key}: {String(value)}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {selectedUpgradePlan === plan.id && (
                                <div className="pt-2 border-t">
                                  <CheckCircle2 size={16} className="text-blue-600 inline mr-1" />
                                  <span className="text-sm text-blue-600 font-semibold">Selected</span>
                                </div>
                              )}
                            </div>
                          </Card>
                        )
                      })}
                  </div>
                )}

                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    onClick={() => selectedUpgradePlan && handleUpgradePlan(selectedUpgradePlan)}
                    disabled={!selectedUpgradePlan || loadingPlans}
                    className="flex-1"
                  >
                    {selectedUpgradePlan ? 'Upgrade to Selected Plan' : 'Select a Plan to Upgrade'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowUpgradePlanModal(false)
                      setSelectedUpgradePlan(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade Success Modal */}
        {showUpgradeSuccess && upgradeSuccessData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center gap-2 text-green-600">
                    <CheckCircle2 size={24} />
                    Subscription Upgraded Successfully!
                  </CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowUpgradeSuccess(false)
                    setUpgradeSuccessData(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">New Plan:</span>
                      <span className="font-bold text-lg text-gray-900">{upgradeSuccessData.plan_name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Billing Period:</span>
                      <span className="font-semibold text-gray-900 capitalize">{upgradeSuccessData.billing_period}</span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-green-200">
                      <span className="text-sm text-gray-600">Price:</span>
                      <span className="font-bold text-xl text-green-600">
                        ₹{upgradeSuccessData.price.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>✓ Your subscription has been updated and is now active.</strong>
                    <br />
                    The new plan features are available immediately.
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => {
                    setShowUpgradeSuccess(false)
                    setUpgradeSuccessData(null)
                  }}
                >
                  Got it!
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

