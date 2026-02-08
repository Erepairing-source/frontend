import { Button } from "./ui/button"
import { ArrowRight, Shield, Users, Zap } from "lucide-react"
import Link from "next/link"

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-subtle opacity-50"></div>
      
      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Zap size={16} />
              <span>AI-Powered Helpdesk Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              The Ultimate{" "}
              <span className="bg-gradient-hero bg-clip-text text-transparent">
                Helpdesk Platform
              </span>{" "}
              for Hardware Manufacturers
            </h1>
            
            <p className="text-xl text-muted-foreground leading-relaxed">
              Multi-tenant, AI-powered platform for device manufacturers. Streamline case management, 
              field service operations, inventory tracking, and SLA compliance across all levels - 
              from customers to country-wide operations.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#demo">
                <Button variant="hero" size="xl" className="group">
                  Book a Demo
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </a>
              <Link href="/signup">
                <Button variant="outlineHero" size="xl">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 pt-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">95%</div>
                <div className="text-sm text-muted-foreground">SLA Compliance</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">30%</div>
                <div className="text-sm text-muted-foreground">Faster MTTR</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">85%</div>
                <div className="text-sm text-muted-foreground">First-Time Fix</div>
              </div>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative overflow-hidden rounded-2xl shadow-glow animate-float">
              <div className="w-full min-h-96 bg-gradient-hero rounded-2xl relative flex items-center justify-center">
                <img
                  src="/hero-dashboard.png"
                  alt="eRepairing.com Platform Admin Dashboard"
                  className="absolute inset-0 w-full h-full object-contain rounded-2xl"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl pointer-events-none"></div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -left-4 bg-card p-4 rounded-lg shadow-elegant border" style={{ animation: 'pulse-glow 2s ease-in-out infinite' }}>
              <Shield className="text-accent mb-2" size={24} />
              <div className="text-sm font-medium">Secure & Compliant</div>
            </div>

            <div className="absolute -bottom-4 -right-4 bg-card p-4 rounded-lg shadow-elegant border" style={{ animation: 'pulse-glow 2s ease-in-out infinite', animationDelay: '1s' }}>
              <Users className="text-primary mb-2" size={24} />
              <div className="text-sm font-medium">Multi-Tenant Ready</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

