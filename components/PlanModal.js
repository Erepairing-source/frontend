import { useState, useEffect } from 'react'
import { X, Save, Trash2 } from 'lucide-react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { Switch } from './ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

export default function PlanModal({ plan, isOpen, onClose, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    name: '',
    plan_type: 'starter',
    monthly_price: 0,
    annual_price: 0,
    max_engineers: null,
    description: '',
    is_active: true,
    is_visible: true,
    display_order: 0,
    features: {
      ai_triage: false,
      demand_forecasting: false,
      copilot: false,
      multilingual_chatbot: false,
      advanced_analytics: false
    }
  })

  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        plan_type: plan.plan_type || 'starter',
        monthly_price: plan.monthly_price || 0,
        annual_price: plan.annual_price || 0,
        max_engineers: plan.max_engineers || null,
        description: plan.description || '',
        is_active: plan.is_active !== undefined ? plan.is_active : true,
        is_visible: plan.is_visible !== undefined ? plan.is_visible : true,
        display_order: plan.display_order || 0,
        features: plan.features || {
          ai_triage: false,
          demand_forecasting: false,
          copilot: false,
          multilingual_chatbot: false,
          advanced_analytics: false
        }
      })
    } else {
      // Reset for new plan
      setFormData({
        name: '',
        plan_type: 'starter',
        monthly_price: 0,
        annual_price: 0,
        max_engineers: null,
        description: '',
        is_active: true,
        is_visible: true,
        display_order: 0,
        features: {
          ai_triage: false,
          demand_forecasting: false,
          copilot: false,
          multilingual_chatbot: false,
          advanced_analytics: false
        }
      })
    }
  }, [plan, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('Form submitted with data:', formData)
    onSave(formData)
  }

  const handleFeatureToggle = (feature) => {
    setFormData({
      ...formData,
      features: {
        ...formData.features,
        [feature]: !formData.features[feature]
      }
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">
            {plan ? 'Edit Plan' : 'Create New Plan'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                placeholder="e.g., Starter, Growth, Enterprise"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan_type">Plan Type *</Label>
              <Select
                value={formData.plan_type}
                onValueChange={(value) => setFormData({...formData, plan_type: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="growth">Growth</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="monthly_price">Monthly Price (₹) *</Label>
              <Input
                id="monthly_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.monthly_price}
                onChange={(e) => setFormData({...formData, monthly_price: parseFloat(e.target.value) || 0})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="annual_price">Annual Price (₹) *</Label>
              <Input
                id="annual_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.annual_price}
                onChange={(e) => setFormData({...formData, annual_price: parseFloat(e.target.value) || 0})}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="max_engineers">Max Engineers (-1 for unlimited)</Label>
              <Input
                id="max_engineers"
                type="number"
                value={formData.max_engineers || ''}
                onChange={(e) => setFormData({...formData, max_engineers: e.target.value ? parseInt(e.target.value) : null})}
                placeholder="Leave empty for unlimited"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({...formData, display_order: parseInt(e.target.value) || 0})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows={3}
              placeholder="Plan description for customers"
            />
          </div>

          <div className="space-y-4">
            <Label>Features</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(formData.features).map((feature) => (
                <div key={feature} className="flex items-center justify-between p-3 border rounded-lg">
                  <Label htmlFor={feature} className="cursor-pointer flex-1">
                    {feature.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </Label>
                  <Switch
                    id={feature}
                    checked={formData.features[feature]}
                    onCheckedChange={() => handleFeatureToggle(feature)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <Label htmlFor="is_visible" className="cursor-pointer">Visible on Landing Page</Label>
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) => setFormData({...formData, is_visible: checked})}
              />
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4 border-t">
            {plan && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(plan.id)}
              >
                <Trash2 size={16} className="mr-2" />
                Delete
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              <Save size={16} className="mr-2" />
              {plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

