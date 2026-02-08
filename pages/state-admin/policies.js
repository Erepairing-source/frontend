import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Label } from '../../components/ui/label'
import { Badge } from '../../components/ui/badge'
import { X } from 'lucide-react'

export default function StatePolicies() {
  const router = useRouter()
  const [policies, setPolicies] = useState([])
  const [cities, setCities] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingPolicy, setEditingPolicy] = useState(null)
  const [form, setForm] = useState({
    sla_type: 'resolution',
    target_hours: 24,
    product_category: '',
    city_id: 'all'
  })

  const loadData = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const policiesRes = await fetch('http://localhost:8000/api/v1/state-admin/sla-policies', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (policiesRes.ok) {
        setPolicies(await policiesRes.json())
      }

      const citiesRes = await fetch('http://localhost:8000/api/v1/state-admin/cities', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (citiesRes.ok) {
        setCities(await citiesRes.json())
      }
    } catch (error) {
      console.error('Error loading policies:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    const token = localStorage.getItem('token')
    if (!token) return
    try {
      const url = editingPolicy
        ? `http://localhost:8000/api/v1/state-admin/sla-policies/${editingPolicy.id}`
        : 'http://localhost:8000/api/v1/state-admin/sla-policies'
      const method = editingPolicy ? 'PUT' : 'POST'
      const payload = {
        ...form,
        target_hours: parseInt(form.target_hours, 10),
        city_id: form.city_id === 'all' ? null : parseInt(form.city_id, 10)
      }
      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (response.ok) {
        setShowModal(false)
        setEditingPolicy(null)
        setForm({ sla_type: 'resolution', target_hours: 24, product_category: '', city_id: 'all' })
        loadData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error saving policy')
      }
    } catch (error) {
      alert('Error saving policy')
    }
  }

  const handleDelete = async (policyId) => {
    const token = localStorage.getItem('token')
    if (!token) return
    if (!confirm('Delete this policy?')) return
    try {
      const response = await fetch(`http://localhost:8000/api/v1/state-admin/sla-policies/${policyId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        loadData()
      } else {
        const error = await response.json()
        alert(error.detail || 'Error deleting policy')
      }
    } catch (error) {
      alert('Error deleting policy')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading policies...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Regional SLA Policies</h1>
            <p className="text-gray-600">Configure SLA targets per city and product category.</p>
          </div>
          <Button onClick={() => setShowModal(true)}>Add Policy</Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Policies</CardTitle>
          </CardHeader>
          <CardContent>
            {policies.length === 0 ? (
              <p className="text-sm text-gray-600">No policies configured.</p>
            ) : (
              <div className="space-y-3">
                {policies.map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-4 flex justify-between items-center">
                    <div>
                      <div className="font-semibold">{policy.sla_type.replace('_', ' ')} SLA</div>
                      <div className="text-sm text-gray-600">
                        Target: {policy.target_hours}h • Category: {policy.product_category || 'All'} • City: {policy.city_id || 'All'}
                      </div>
                      <div className="mt-2">
                        <Badge className={policy.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}>
                          {policy.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditingPolicy(policy)
                          setForm({
                            sla_type: policy.sla_type,
                            target_hours: policy.target_hours,
                            product_category: policy.product_category || '',
                            city_id: policy.city_id ? policy.city_id.toString() : 'all'
                          })
                          setShowModal(true)
                        }}
                      >
                        Edit
                      </Button>
                      <Button variant="outline" onClick={() => handleDelete(policy.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="max-w-md w-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{editingPolicy ? 'Edit Policy' : 'Add Policy'}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={() => {
                    setShowModal(false)
                    setEditingPolicy(null)
                  }}>
                    <X size={20} />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>SLA Type</Label>
                  <Select value={form.sla_type} onValueChange={(value) => setForm({ ...form, sla_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="resolution">Resolution</SelectItem>
                      <SelectItem value="assignment">Assignment</SelectItem>
                      <SelectItem value="first_response">First response</SelectItem>
                      <SelectItem value="on_site">On site</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Target Hours</Label>
                  <Input
                    type="number"
                    value={form.target_hours}
                    onChange={(e) => setForm({ ...form, target_hours: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Product Category</Label>
                  <Input
                    value={form.product_category}
                    onChange={(e) => setForm({ ...form, product_category: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <Label>City Scope</Label>
                  <Select value={form.city_id} onValueChange={(value) => setForm({ ...form, city_id: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Cities</SelectItem>
                      {cities.map(city => (
                        <SelectItem key={city.id ?? `noid-${city.name}`} value={city.id != null ? String(city.id) : `noid-${city.name}`}>{city.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSave} className="flex-1">
                    Save Policy
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowModal(false)
                      setEditingPolicy(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
