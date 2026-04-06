import { Button } from "./ui/button"
import { Switch } from "./ui/switch"
import { Check, Zap, Crown, Building, Users, FileText, Headphones, Star, Shield, Clock, BarChart3, Settings, Globe, Sparkles, Package, X } from "lucide-react"
import { useState, useEffect } from "react"
import { getApiBase } from '@lib/api'

export default function Pricing() {
  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(true)
  const [billingCycle, setBillingCycle] = useState('monthly')
  const [showComparison, setShowComparison] = useState(false)

  useEffect(() => {
    fetch(getApiBase() + '/platform-admin/plans/public')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setPlans(data)
        } else {
          setPlans([])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching plans:', err)
        setPlans([])
        setLoading(false)
      })
  }, [])

  const getPlanIcon = (planName) => {
    const name = planName.toLowerCase()
    if (name.includes('starter') || name.includes('basic')) return <Building className="h-8 w-8 text-blue-600" />
    if (name.includes('pro') || name.includes('professional')) return <Zap className="h-8 w-8 text-purple-600" />
    if (name.includes('enterprise') || name.includes('business')) return <Crown className="h-8 w-8 text-yellow-600" />
    return <Building className="h-8 w-8 text-blue-600" />
  }

  const formatPrice = (price) => {
    const numPrice = typeof price === 'string' ? parseFloat(price) : (price || 0)
    if (numPrice === 0) return "Custom"
    return `₹${Math.round(numPrice).toLocaleString('en-IN')}`
  }

  const getFeatureIcon = (feature) => {
    const featureLower = feature.toLowerCase()
    if (featureLower.includes('support')) return <Headphones className="h-4 w-4" />
    if (featureLower.includes('case') || featureLower.includes('ticket')) return <FileText className="h-4 w-4" />
    if (featureLower.includes('inventory')) return <Package className="h-4 w-4" />
    if (featureLower.includes('report') || featureLower.includes('analytics')) return <BarChart3 className="h-4 w-4" />
    if (featureLower.includes('api') || featureLower.includes('integration')) return <Settings className="h-4 w-4" />
    if (featureLower.includes('branding') || featureLower.includes('white')) return <Globe className="h-4 w-4" />
    if (featureLower.includes('security') || featureLower.includes('audit')) return <Shield className="h-4 w-4" />
    if (featureLower.includes('ai') || featureLower.includes('insight')) return <Sparkles className="h-4 w-4" />
    if (featureLower.includes('unlimited')) return <Star className="h-4 w-4" />
    return <Check className="h-4 w-4" />
  }

  const formatFeatureLabel = (key) => {
    const labels = {
      ai_triage: "AI Case Triage",
      demand_forecasting: "Parts Demand Forecasting",
      copilot: "AI Knowledge Assistant",
      multilingual_chatbot: "Multilingual Chatbot",
    }
    if (labels[key]) return labels[key]
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase())
  }

  const getEnabledFeatures = (plan) => {
    const features = plan?.features
    if (!features || typeof features !== 'object') return []
    return Object.entries(features)
      .filter(([, value]) => value === true)
      .map(([key]) => key)
  }

  const compareFeatureKeys = Array.from(
    new Set(plans.flatMap((plan) => getEnabledFeatures(plan)))
  )

  if (loading) {
    return (
      <section id="pricing" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Loading plans...</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="pricing" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Simple, Transparent{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Pricing
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Choose the perfect plan for your business size and scale as you grow
          </p>
          
          {/* Billing Cycle Toggle */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <span className={`text-sm font-medium transition-colors ${
              billingCycle === 'monthly' ? 'text-primary' : 'text-muted-foreground'
            }`}>
              Monthly
            </span>
            <div className="relative inline-flex items-center">
              <Switch
                checked={billingCycle === 'yearly'}
                onCheckedChange={(checked) => setBillingCycle(checked ? 'yearly' : 'monthly')}
                className="data-[state=checked]:bg-primary"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${
                billingCycle === 'yearly' ? 'text-primary' : 'text-muted-foreground'
              }`}>
                Yearly
              </span>
              {billingCycle === 'yearly' && (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold shadow-sm whitespace-nowrap">
                  Save 20%
                </span>
              )}
              {billingCycle === 'monthly' && (
                <span className="invisible px-2 py-1 text-xs whitespace-nowrap">
                  Save 20%
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => {
            const isPopular = index === 1
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white rounded-3xl p-8 shadow-xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
                  isPopular ? 'ring-2 ring-purple-500 shadow-2xl scale-105 bg-gradient-to-br from-purple-50 to-blue-50' : 'hover:shadow-xl'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                      ⭐ Most Popular
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <div className={`w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-r ${
                    isPopular ? 'from-purple-500 to-blue-500' : 
                    plan.name.toLowerCase().includes('basic') ? 'from-blue-500 to-blue-600' :
                    plan.name.toLowerCase().includes('pro') ? 'from-purple-500 to-purple-600' :
                    'from-yellow-500 to-yellow-600'
                  } p-5 shadow-lg`}>
                    <div className="text-white">
                      {getPlanIcon(plan.name)}
                    </div>
                  </div>
                  
                  <h3 className="text-3xl font-bold mb-3 text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 mb-6 text-base leading-relaxed">{plan.description || 'Comprehensive service management'}</p>
                  
                  <div className="flex items-baseline justify-center mb-3">
                    <span className="text-5xl font-bold text-gray-900">
                      {billingCycle === 'yearly' 
                        ? formatPrice(plan.annual_price)
                        : formatPrice(plan.monthly_price)
                      }
                    </span>
                    <span className="text-gray-500 ml-2 text-lg">
                      {billingCycle === 'yearly' ? '/year' : '/month'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-3">+18% GST</p>
                  <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium mb-4">
                    <Clock className="h-4 w-4 mr-2" />
                    14 days free trial
                  </div>
                </div>

                {/* Plan Limits */}
                {plan.max_engineers && (
                  <div className="bg-gray-50 rounded-2xl p-4 mb-6 space-y-3">
                    <h4 className="font-semibold text-gray-900 text-sm mb-3">Plan Includes:</h4>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm text-gray-700">Engineers</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {plan.max_engineers === -1 ? 'Unlimited' : `Up to ${plan.max_engineers}`}
                      </span>
                    </div>
                  </div>
                )}

                <ul className="space-y-3 mb-8">
                  {getEnabledFeatures(plan).length > 0 ? (
                    getEnabledFeatures(plan).map((featureKey) => {
                      const label = formatFeatureLabel(featureKey)
                      return (
                        <li key={`${plan.id}-${featureKey}`} className="flex items-start space-x-3 group">
                          <div className="flex-shrink-0 mt-0.5 text-green-600 group-hover:text-green-700 transition-colors">
                            {getFeatureIcon(label)}
                          </div>
                          <span className="text-sm text-gray-700 group-hover:text-gray-900 transition-colors">
                            {label}
                          </span>
                        </li>
                      )
                    })
                  ) : (
                    <li className="text-sm text-gray-500">Core service management features included</li>
                  )}
                </ul>

                <Button 
                  variant={isPopular ? "default" : "outline"}
                  size="lg" 
                  className={`w-full h-12 text-base font-semibold transition-all duration-300 ${
                    isPopular 
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl' 
                      : 'border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600 hover:bg-purple-50'
                  }`}
                  onClick={() => {
                    localStorage.setItem('selectedPlan', JSON.stringify(plan))
                    window.location.href = `/signup?plan=${plan.id}`
                  }}
                >
                  {((plan.monthly_price || 0) === 0 && (plan.annual_price || 0) === 0) ? "Contact Sales" : `Start Free Trial`}
                </Button>
              </div>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">
            All plans include free trial • +18% GST extra • No setup fees • Cancel anytime
          </p>
          <Button
            variant="ghost"
            className="text-primary hover:text-primary-glow"
            onClick={() => {
              setShowComparison((prev) => !prev)
              if (!showComparison) {
                requestAnimationFrame(() => {
                  const table = document.getElementById('pricing-feature-comparison')
                  if (table) table.scrollIntoView({ behavior: 'smooth', block: 'start' })
                })
              }
            }}
          >
            Compare all features →
          </Button>
        </div>

        {showComparison && (
          <div id="pricing-feature-comparison" className="mt-10 bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Feature comparison</h3>
              <Button variant="ghost" className="h-8 px-3 text-gray-600" onClick={() => setShowComparison(false)}>
                <X className="h-4 w-4 mr-1" /> Close
              </Button>
            </div>
            {compareFeatureKeys.length === 0 ? (
              <p className="px-6 py-6 text-sm text-gray-600">No feature flags are configured yet for comparison.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-white border-b">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-gray-700">Feature</th>
                      {plans.map((plan) => (
                        <th key={`head-${plan.id}`} className="text-center px-4 py-3 font-semibold text-gray-700">
                          {plan.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {compareFeatureKeys.map((featureKey) => (
                      <tr key={`row-${featureKey}`} className="border-b last:border-b-0">
                        <td className="px-6 py-3 text-gray-800">{formatFeatureLabel(featureKey)}</td>
                        {plans.map((plan) => {
                          const enabled = getEnabledFeatures(plan).includes(featureKey)
                          return (
                            <td key={`${plan.id}-${featureKey}`} className="px-4 py-3 text-center">
                              {enabled ? (
                                <Check className="h-4 w-4 text-green-600 mx-auto" />
                              ) : (
                                <X className="h-4 w-4 text-gray-300 mx-auto" />
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

