import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ArrowLeft, Users, Plus, X, Edit, Eye, Search, Store } from 'lucide-react'
import { getApiBase } from '../../lib/api'

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState([])
  const [availableRoles, setAvailableRoles] = useState(['platform_admin', 'vendor']) // Default roles for Platform Admin
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [countries, setCountries] = useState([])
  const [states, setStates] = useState([])
  const [cities, setCities] = useState([])
  const [userFormData, setUserFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    password: '',
    role: 'platform_admin',
    is_active: true
  })
  const [vendorFormData, setVendorFormData] = useState({
    vendor_name: '',
    commission_rate: 0.15,
    country_id: null,
    state_id: null,
    city_id: null,
    user_full_name: '',
    user_email: '',
    user_phone: '',
    user_password: '',
    is_active: true
  })

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadUsers()
    loadAvailableRoles()
    loadCountries()
  }, [router])

  // Ensure role is set when availableRoles loads
  useEffect(() => {
    if (availableRoles.length > 0 && (!userFormData.role || !availableRoles.includes(userFormData.role))) {
      setUserFormData(prev => ({ ...prev, role: availableRoles[0] }))
    }
  }, [availableRoles.length]) // Only depend on length to avoid infinite loops

  const loadUsers = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(getApiBase() + '/users/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        // Filter to only show platform_admin and vendor roles
        const filtered = data.filter(user => 
          user.role === 'platform_admin' || user.role === 'vendor'
        )
        setUsers(filtered)
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading users:', error)
      setLoading(false)
    }
  }

  const loadAvailableRoles = async () => {
    const token = localStorage.getItem('token')
    try {
      const response = await fetch(getApiBase() + '/users/available-roles', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      if (response.ok) {
        const data = await response.json()
        // Fallback to default roles if API doesn't return them
        const roles = data.available_roles || ['platform_admin', 'vendor']
        setAvailableRoles(roles)
        if (roles.length > 0 && !userFormData.role) {
          setUserFormData(prev => ({ ...prev, role: roles[0] }))
        }
      } else {
        // Fallback if API fails
        const defaultRoles = ['platform_admin', 'vendor']
        setAvailableRoles(defaultRoles)
        setUserFormData(prev => ({ ...prev, role: prev.role || defaultRoles[0] }))
      }
    } catch (error) {
      console.error('Error loading available roles:', error)
      // Fallback if request fails
      const defaultRoles = ['platform_admin', 'vendor']
      setAvailableRoles(defaultRoles)
      setUserFormData(prev => ({ ...prev, role: prev.role || defaultRoles[0] }))
    }
  }

  const loadCountries = async () => {
    try {
      const response = await fetch(getApiBase() + '/locations/countries')
      if (response.ok) {
        const data = await response.json()
        setCountries(data)
      }
    } catch (error) {
      console.error('Error loading countries:', error)
    }
  }

  const loadStates = async (countryId) => {
    if (!countryId) {
      setStates([])
      setCities([])
      setVendorFormData(prev => ({ ...prev, state_id: null, city_id: null }))
      return
    }
    try {
      const response = await fetch(`${getApiBase()}/locations/states?country_id=${countryId}`)
      if (response.ok) {
        const data = await response.json()
        setStates(data)
      }
      setCities([])
      setVendorFormData(prev => ({ ...prev, city_id: null }))
    } catch (error) {
      console.error('Error loading states:', error)
    }
  }

  const loadCities = async (stateId) => {
    if (!stateId) {
      setCities([])
      setVendorFormData(prev => ({ ...prev, city_id: null }))
      return
    }
    try {
      const response = await fetch(`${getApiBase()}/locations/cities?state_id=${stateId}`)
      if (response.ok) {
        const data = await response.json()
        setCities(data)
      }
    } catch (error) {
      console.error('Error loading cities:', error)
    }
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const handleEditUser = (user) => {
    setSelectedUser(user)
    setUserFormData({
      full_name: user.full_name || '',
      email: user.email || '',
      phone: user.phone || '',
      password: '',
      role: user.role || 'platform_admin',
      is_active: user.is_active !== undefined ? user.is_active : true
    })
    setShowEditModal(true)
  }

  const handleUpdateUser = async () => {
    if (!selectedUser) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const updateData = { ...userFormData }
      if (!updateData.password) {
        delete updateData.password
      }

      const response = await fetch(`${getApiBase()}/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        alert('User updated successfully!')
        setShowEditModal(false)
        setSelectedUser(null)
        loadUsers()
      } else {
        const error = await response.json()
        alert(`Error: ${error.detail || 'Failed to update user'}`)
      }
    } catch (error) {
      console.error('Error updating user:', error)
      alert('Failed to update user. Please try again.')
    }
  }

  const handleCreateUser = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      // If creating vendor, use vendor creation endpoint
      if (userFormData.role === 'vendor') {
        // Validate vendor form
        if (!vendorFormData.vendor_name || !vendorFormData.user_full_name || !vendorFormData.user_email ||
            !vendorFormData.user_phone || !vendorFormData.user_password) {
          alert('Please fill in all required fields')
          return
        }

        const vendorData = {
          vendor_name: vendorFormData.vendor_name,
          vendor_email: vendorFormData.vendor_email,
          vendor_phone: vendorFormData.vendor_phone,
          vendor_code: vendorFormData.vendor_code,
          commission_rate: parseFloat(vendorFormData.commission_rate) || 0.15,
          country_id: vendorFormData.country_id ? parseInt(vendorFormData.country_id) : null,
          state_id: vendorFormData.state_id ? parseInt(vendorFormData.state_id) : null,
          city_id: vendorFormData.city_id ? parseInt(vendorFormData.city_id) : null,
          user_full_name: vendorFormData.user_full_name,
          user_email: vendorFormData.user_email,
          user_phone: vendorFormData.user_phone,
          user_password: vendorFormData.user_password,
          is_active: vendorFormData.is_active
        }

        const response = await fetch(getApiBase() + '/platform-admin/vendors', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(vendorData)
        })

        if (response.ok) {
          setShowCreateModal(false)
          setVendorFormData({
            vendor_name: '',
            commission_rate: 0.15,
            country_id: null,
            state_id: null,
            city_id: null,
            user_full_name: '',
            user_email: '',
            user_phone: '',
            user_password: '',
            is_active: true
          })
          setUserFormData(prev => ({ ...prev, role: 'platform_admin' }))
          loadUsers()
          alert('Vendor created successfully')
        } else {
          const error = await response.json()
          alert(`Error: ${error.detail || 'Failed to create vendor'}`)
        }
      } else {
        // Create platform admin user
        if (!userFormData.full_name || !userFormData.email || !userFormData.phone || !userFormData.password) {
          alert('Please fill in all required fields')
          return
        }

        const response = await fetch(getApiBase() + '/users/', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(userFormData)
        })

        if (response.ok) {
          setShowCreateModal(false)
          setUserFormData({
            full_name: '',
            email: '',
            phone: '',
            password: '',
            role: 'platform_admin',
            is_active: true
          })
          loadUsers()
          alert('User created successfully')
        } else {
          const error = await response.json()
          alert(`Error: ${error.detail || 'Failed to create user'}`)
        }
      }
    } catch (error) {
      console.error('Error creating user:', error)
      alert('Failed to create user. Please try again.')
    }
  }

  const getRoleDisplayName = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const filteredUsers = users.filter(user => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      user.full_name?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search) ||
      user.role?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      </div>
    )
  }

  const isVendorForm = userFormData.role === 'vendor'

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
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Users Management</h1>
              <p className="text-gray-600">Create and manage Platform Admins and Vendors</p>
            </div>
            <Button onClick={() => {
              // Ensure roles are loaded and default role is set
              if (availableRoles.length === 0) {
                loadAvailableRoles()
              }
              setUserFormData(prev => ({
                ...prev,
                role: prev.role || availableRoles[0] || 'platform_admin'
              }))
              setShowCreateModal(true)
            }}>
              <Plus size={18} className="mr-2" />
              Create User
            </Button>
          </div>
        </div>

        {/* Search */}
        <Card className="p-6 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <Input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
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
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {user.full_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{user.phone}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">
                        {getRoleDisplayName(user.role)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="View Details"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleViewUser(user)
                          }}
                        >
                          <Eye size={14} />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          title="Edit User"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleEditUser(user)
                          }}
                        >
                          <Edit size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredUsers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {searchTerm ? 'No users found matching your search' : 'No users found'}
              </div>
            )}
          </div>
        </Card>

        {/* Create User Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">
                  {isVendorForm ? 'Create New Vendor' : 'Create New Platform Admin'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCreateModal(false)
                    setUserFormData({
                      full_name: '',
                      email: '',
                      phone: '',
                      password: '',
                      role: 'platform_admin',
                      is_active: true
                    })
                    setVendorFormData({
                      vendor_name: '',
                      commission_rate: 0.15,
                      country_id: null,
                      state_id: null,
                      city_id: null,
                      user_full_name: '',
                      user_email: '',
                      user_phone: '',
                      user_password: '',
                      is_active: true
                    })
                  }}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Role Selection */}
                <div>
                  <Label>Role *</Label>
                  <Select
                    value={userFormData.role || 'platform_admin'}
                    onValueChange={(value) => {
                      setUserFormData({ ...userFormData, role: value })
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(availableRoles.length > 0 ? availableRoles : ['platform_admin', 'vendor']).map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {isVendorForm ? (
                  <>
                    {/* Vendor Information Section */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Store size={18} />
                        Vendor Information
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Vendor Name *</Label>
                          <Input
                            value={vendorFormData.vendor_name}
                            onChange={(e) => setVendorFormData({ ...vendorFormData, vendor_name: e.target.value })}
                            placeholder="Enter vendor company name"
                          />
                        </div>

                        <div>
                          <Label>Commission Rate (%)</Label>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={vendorFormData.commission_rate}
                            onChange={(e) => setVendorFormData({ ...vendorFormData, commission_rate: parseFloat(e.target.value) || 0.15 })}
                            placeholder="15"
                          />
                          <p className="text-xs text-gray-500 mt-1">Default: 15%</p>
                        </div>
                      </div>

                      {/* Location for Vendor */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div>
                          <Label>Country</Label>
                          <Select
                            value={vendorFormData.country_id?.toString() || ''}
                            onValueChange={(value) => {
                              setVendorFormData({ ...vendorFormData, country_id: parseInt(value), state_id: null, city_id: null })
                              loadStates(parseInt(value))
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              {countries.map((country) => (
                                <SelectItem key={country.id} value={country.id.toString()}>
                                  {country.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>State</Label>
                          <Select
                            value={vendorFormData.state_id?.toString() || ''}
                            onValueChange={(value) => {
                              setVendorFormData({ ...vendorFormData, state_id: parseInt(value), city_id: null })
                              loadCities(parseInt(value))
                            }}
                            disabled={!vendorFormData.country_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {states.map((state) => (
                                <SelectItem key={state.id} value={state.id.toString()}>
                                  {state.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label>City</Label>
                          <Select
                            value={vendorFormData.city_id?.toString() || ''}
                            onValueChange={(value) => {
                              setVendorFormData({ ...vendorFormData, city_id: parseInt(value) })
                            }}
                            disabled={!vendorFormData.state_id}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                            <SelectContent>
                              {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                  {city.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    {/* Vendor User Account Section */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold text-gray-900 mb-4">Vendor User Account</h4>
                      <p className="text-sm text-gray-600 mb-4">
                        This email and phone will be used for both the vendor account and user login.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Full Name *</Label>
                          <Input
                            value={vendorFormData.user_full_name}
                            onChange={(e) => setVendorFormData({ ...vendorFormData, user_full_name: e.target.value })}
                            placeholder="Enter full name"
                          />
                        </div>

                        <div>
                          <Label>Email *</Label>
                          <Input
                            type="email"
                            value={vendorFormData.user_email}
                            onChange={(e) => setVendorFormData({ ...vendorFormData, user_email: e.target.value })}
                            placeholder="vendor@example.com"
                          />
                          <p className="text-xs text-gray-500 mt-1">Used for vendor and user account</p>
                        </div>

                        <div>
                          <Label>Phone *</Label>
                          <Input
                            value={vendorFormData.user_phone}
                            onChange={(e) => setVendorFormData({ ...vendorFormData, user_phone: e.target.value })}
                            placeholder="+91 9876543210"
                          />
                          <p className="text-xs text-gray-500 mt-1">Used for vendor and user account</p>
                        </div>

                        <div>
                          <Label>Password *</Label>
                          <Input
                            type="password"
                            value={vendorFormData.user_password}
                            onChange={(e) => setVendorFormData({ ...vendorFormData, user_password: e.target.value })}
                            placeholder="Minimum 8 characters"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Platform Admin Form */}
                    <div>
                      <Label>Full Name *</Label>
                      <Input
                        value={userFormData.full_name}
                        onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                        placeholder="Enter full name"
                      />
                    </div>

                    <div>
                      <Label>Email *</Label>
                      <Input
                        type="email"
                        value={userFormData.email}
                        onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                        placeholder="Enter email"
                      />
                    </div>

                    <div>
                      <Label>Phone *</Label>
                      <Input
                        value={userFormData.phone}
                        onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <Label>Password *</Label>
                      <Input
                        type="password"
                        value={userFormData.password}
                        onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                        placeholder="Enter password"
                      />
                    </div>
                  </>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCreateModal(false)
                      setUserFormData({
                        full_name: '',
                        email: '',
                        phone: '',
                        password: '',
                        role: 'platform_admin',
                        is_active: true
                      })
                      setVendorFormData({
                        vendor_name: '',
                        vendor_email: '',
                        vendor_phone: '',
                        vendor_code: '',
                        commission_rate: 0.15,
                        country_id: null,
                        state_id: null,
                        city_id: null,
                        user_full_name: '',
                        user_email: '',
                        user_phone: '',
                        user_password: '',
                        is_active: true
                      })
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleCreateUser}>
                    {isVendorForm ? 'Create Vendor' : 'Create User'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View User Modal */}
        {showViewModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">User Details</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedUser(null)
                  }}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-gray-500">Full Name</Label>
                  <p className="text-gray-900 font-medium">{selectedUser.full_name}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Email</Label>
                  <p className="text-gray-900 font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Phone</Label>
                  <p className="text-gray-900 font-medium">{selectedUser.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-500">Role</Label>
                  <p className="text-gray-900 font-medium capitalize">
                    {getRoleDisplayName(selectedUser.role)}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-500">Status</Label>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    selectedUser.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                {selectedUser.created_at && (
                  <div>
                    <Label className="text-gray-500">Created At</Label>
                    <p className="text-gray-900 font-medium">
                      {new Date(selectedUser.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex justify-end mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false)
                    setSelectedUser(null)
                  }}
                >
                  Close
                </Button>
                <Button
                  className="ml-3"
                  onClick={() => {
                    setShowViewModal(false)
                    handleEditUser(selectedUser)
                  }}
                >
                  Edit User
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit User Modal */}
        {showEditModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Edit User</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                    setUserFormData({
                      full_name: '',
                      email: '',
                      phone: '',
                      password: '',
                      role: 'platform_admin',
                      is_active: true
                    })
                  }}
                >
                  <X size={20} />
                </Button>
              </div>

              <div className="space-y-4">
                {/* Role Selection */}
                <div>
                  <Label>Role *</Label>
                  <Select
                    value={userFormData.role || 'platform_admin'}
                    onValueChange={(value) => {
                      setUserFormData({ ...userFormData, role: value })
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {(availableRoles.length > 0 ? availableRoles : ['platform_admin', 'vendor']).map((role) => (
                        <SelectItem key={role} value={role}>
                          {getRoleDisplayName(role)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Full Name *</Label>
                  <Input
                    value={userFormData.full_name}
                    onChange={(e) => setUserFormData({ ...userFormData, full_name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <Label>Email *</Label>
                  <Input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({ ...userFormData, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>

                <div>
                  <Label>Phone *</Label>
                  <Input
                    value={userFormData.phone}
                    onChange={(e) => setUserFormData({ ...userFormData, phone: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <Label>Password (leave blank to keep current)</Label>
                  <Input
                    type="password"
                    value={userFormData.password}
                    onChange={(e) => setUserFormData({ ...userFormData, password: e.target.value })}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={userFormData.is_active}
                    onChange={(e) => setUserFormData({ ...userFormData, is_active: e.target.checked })}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label htmlFor="is_active" className="cursor-pointer">
                    Active
                  </Label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false)
                    setSelectedUser(null)
                    setUserFormData({
                      full_name: '',
                      email: '',
                      phone: '',
                      password: '',
                      role: 'platform_admin',
                      is_active: true
                    })
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleUpdateUser}>
                  Update User
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
