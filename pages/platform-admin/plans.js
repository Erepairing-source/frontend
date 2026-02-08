import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import { Button } from '../../components/ui/button'
import StatCard from '../../components/StatCard'
import PlanModal from '../../components/PlanModal'
import { ArrowLeft, Plus } from 'lucide-react'

export default function PlansPage() {
  const router = useRouter()
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    loadPlans()
  }, [router])

  const loadPlans = () => {
    const token = localStorage.getItem('token')
    if (!token) return

    fetch('http://localhost:8000/api/v1/platform-admin/plans', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        setPlans(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error loading plans:', err)
        setLoading(false)
      })
  }

  const handleCreatePlan = () => {
    setSelectedPlan(null)
    setShowPlanModal(true)
  }

  const handleEditPlan = (plan) => {
    setSelectedPlan(plan)
    setShowPlanModal(true)
  }

  const handleSavePlan = async (planData) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const url = selectedPlan
        ? `http://localhost:8000/api/v1/platform-admin/plans/${selectedPlan.id}`
        : 'http://localhost:8000/api/v1/platform-admin/plans'
      
      const method = selectedPlan ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(planData)
      })

      if (response.ok) {
        setShowPlanModal(false)
        setSelectedPlan(null)
        loadPlans()
      } else {
        const error = await response.json()
        alert(error.detail || 'Failed to save plan')
      }
    } catch (error) {
      console.error('Error saving plan:', error)
      alert('Failed to save plan')
    }
  }

  const handleDeletePlan = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return

    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/v1/platform-admin/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      })

      if (response.ok) {
        loadPlans()
      } else {
        alert('Failed to delete plan')
      }
    } catch (error) {
      console.error('Error deleting plan:', error)
      alert('Failed to delete plan')
    }
  }

  const handleTogglePlanStatus = async (plan) => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(`http://localhost:8000/api/v1/platform-admin/plans/${plan.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !plan.is_active })
      })

      if (response.ok) {
        loadPlans()
      } else {
        alert('Failed to update plan status')
      }
    } catch (error) {
      console.error('Error updating plan:', error)
      alert('Failed to update plan status')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  const activePlans = plans.filter(p => p.is_active).length
  const visiblePlans = plans.filter(p => p.is_visible).length

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
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
              <p className="text-gray-600">Create, edit, and manage subscription plans</p>
            </div>
            <Button onClick={handleCreatePlan} variant="default">
              <Plus size={18} className="mr-2" />
              Create New Plan
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Plans"
            value={plans.length}
            icon={{ emoji: '📋', bg: 'bg-indigo-100', color: 'text-indigo-600' }}
          />
          <StatCard
            title="Active Plans"
            value={activePlans}
            icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }}
          />
          <StatCard
            title="Visible Plans"
            value={visiblePlans}
            icon={{ emoji: '👁️', bg: 'bg-blue-100', color: 'text-blue-600' }}
          />
        </div>

        {/* Plans Grid */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id} hover className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{plan.name}</h3>
                  <div className="flex gap-2">
                    {!plan.is_visible && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">Hidden</span>
                    )}
                    {!plan.is_active && (
                      <span className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded">Inactive</span>
                    )}
                    {plan.is_active && plan.is_visible && (
                      <span className="px-2 py-1 bg-green-100 text-green-600 text-xs rounded">Active</span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 text-sm mb-4">{plan.description || 'No description'}</p>
                <div className="mb-4 space-y-1">
                  <div>
                    <span className="text-xl font-bold">₹{Math.round(plan.monthly_price || 0).toLocaleString('en-IN')}</span>
                    <span className="text-gray-600 text-sm">/month</span>
                  </div>
                  <div>
                    <span className="text-lg font-semibold">₹{Math.round(plan.annual_price || 0).toLocaleString('en-IN')}</span>
                    <span className="text-gray-600 text-sm">/year</span>
                  </div>
                  {plan.max_engineers && (
                    <p className="text-xs text-gray-500">Max Engineers: {plan.max_engineers === -1 ? 'Unlimited' : plan.max_engineers}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Button
                    variant="default"
                    size="default"
                    className="w-full"
                    onClick={() => handleEditPlan(plan)}
                  >
                    Edit Plan
                  </Button>
                  <Button
                    variant={plan.is_active ? "destructive" : "default"}
                    size="default"
                    className={`w-full ${!plan.is_active ? '!bg-green-600 hover:!bg-green-700 !text-white' : ''}`}
                    onClick={() => handleTogglePlanStatus(plan)}
                  >
                    {plan.is_active ? 'Deactivate Plan' : 'Activate Plan'}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </Card>

        {/* Plan Modal */}
        <PlanModal
          plan={selectedPlan}
          isOpen={showPlanModal}
          onClose={() => {
            setShowPlanModal(false)
            setSelectedPlan(null)
          }}
          onSave={handleSavePlan}
          onDelete={handleDeletePlan}
        />
      </div>
    </div>
  )
}



