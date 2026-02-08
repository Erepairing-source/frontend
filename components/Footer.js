import { Button } from "./ui/button"
import { Mail, Phone, MapPin, Linkedin, Twitter, Github } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border scroll-mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-hero rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">eR</span>
              </div>
              <span className="text-xl font-bold bg-gradient-hero bg-clip-text text-transparent">
                eRepairing.com
              </span>
            </div>
            <p className="text-muted-foreground">
              The ultimate helpdesk platform for hardware manufacturers. 
              Streamline operations with AI-powered automation and multi-level administration.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon">
                <Linkedin size={18} />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter size={18} />
              </Button>
              <Button variant="ghost" size="icon">
                <Github size={18} />
              </Button>
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="font-semibold mb-4">Product</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
              <li><a href="#integrations" className="hover:text-primary transition-colors">Integrations</a></li>
              <li><a href="#api" className="hover:text-primary transition-colors">API Documentation</a></li>
              <li><a href="#security" className="hover:text-primary transition-colors">Security</a></li>
            </ul>
          </div>

          {/* Solutions */}
          <div>
            <h3 className="font-semibold mb-4">Solutions</h3>
            <ul className="space-y-3 text-muted-foreground">
              <li><a href="#pricing" className="hover:text-primary transition-colors">PC Manufacturers</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Laptop Brands</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Server Companies</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">Camera Brands</a></li>
              <li><a href="#pricing" className="hover:text-primary transition-colors">IoT Devices</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4">Contact</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail size={18} />
                <span>sales@erepairing.com</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone size={18} />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-start space-x-3 text-muted-foreground">
                <MapPin size={18} className="mt-1" />
                <span>Delhi NCR<br />India</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2025 eRepairing.com. All rights reserved.
            </div>
            <div className="flex space-x-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}




