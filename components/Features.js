import { 
  Bot, 
  Users, 
  Shield, 
  Smartphone, 
  TrendingUp, 
  MapPin,
  Package,
  Clock,
  Globe,
  Sparkles
} from "lucide-react"

export default function Features() {
  const features = [
    {
      icon: Bot,
      title: "AI-Powered Triage",
      description: "Automatic case categorization, priority assignment, and parts prediction using advanced AI algorithms.",
      gradient: "from-blue-500 to-purple-600",
      comingSoon: false
    },
    {
      icon: Users,
      title: "Multi-Level Admin Hierarchy",
      description: "City → State → Country → King Admin structure with role-based access control and feature flags.",
      gradient: "from-green-500 to-teal-600",
      comingSoon: false
    },
    {
      icon: Smartphone,
      title: "Mobile-First Engineer App",
      description: "Offline-capable mobile app for field engineers with real-time sync and WhatsApp integration.",
      gradient: "from-orange-500 to-red-600",
      comingSoon: false
    },
    {
      icon: Package,
      title: "Inventory Management",
      description: "Real-time parts tracking, damaged goods return workflow, and automated reorder thresholds.",
      gradient: "from-purple-500 to-pink-600",
      comingSoon: false
    },
    {
      icon: Clock,
      title: "SLA Monitoring",
      description: "Real-time SLA tracking, breach prediction, and automated escalation workflows.",
      gradient: "from-indigo-500 to-blue-600",
      comingSoon: false
    },
    {
      icon: MapPin,
      title: "Smart Routing",
      description: "AI-optimized engineer assignment based on location, skills, and parts availability.",
      gradient: "from-cyan-500 to-blue-600",
      comingSoon: false
    },
    {
      icon: Shield,
      title: "Security & Compliance",
      description: "Enterprise-grade security with audit logs, encryption, and compliance reporting.",
      gradient: "from-gray-600 to-gray-800",
      comingSoon: false
    },
    {
      icon: TrendingUp,
      title: "Advanced Analytics",
      description: "Comprehensive dashboards, KPI monitoring, and predictive insights for business growth.",
      gradient: "from-yellow-500 to-orange-600",
      comingSoon: false
    },
    {
      icon: Globe,
      title: "Multi-Tenant Architecture",
      description: "White-label solution with per-tenant customization, branding, and feature toggles.",
      gradient: "from-emerald-500 to-green-600",
      comingSoon: false
    },
  ]

  return (
    <section id="features" className="py-20 bg-gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Everything You Need for{" "}
            <span className="bg-gradient-hero bg-clip-text text-transparent">
              Modern Helpdesk
            </span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Comprehensive platform designed specifically for hardware manufacturers 
            with AI automation, multi-level administration, and real-time operations.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <div
                key={index}
                className={`group relative bg-card p-8 rounded-2xl shadow-elegant hover:shadow-glow transition-all duration-300 hover:-translate-y-2 border ${
                  feature.comingSoon ? 'opacity-75' : ''
                }`}
              >
                {feature.comingSoon && (
                  <div className="absolute -top-2 -right-2 z-10">
                    <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg">
                      Coming Soon
                    </div>
                  </div>
                )}
                
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.gradient} p-3 mb-6 group-hover:scale-110 transition-transform duration-300 flex items-center justify-center ${
                feature.comingSoon ? 'opacity-80' : ''
              }`}>
                <IconComponent className="w-6 h-6 text-white" />
              </div>
                
                <h3 className={`text-xl font-semibold mb-4 group-hover:text-primary transition-colors ${
                  feature.comingSoon ? 'text-muted-foreground' : ''
                }`}>
                  {feature.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
                
                {feature.comingSoon && (
                  <div className="mt-4 flex items-center gap-2 text-sm text-purple-600">
                    <Sparkles className="h-4 w-4" />
                    <span className="font-medium">AI-Powered Feature</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

