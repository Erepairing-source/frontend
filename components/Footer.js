import { Button } from "./ui/button"
import { Mail, Phone, MapPin, Linkedin, Twitter, Github } from "lucide-react"
import Link from "next/link"
import Logo from "./Logo"

export default function Footer() {
  return (
    <footer id="contact" className="bg-card border-t border-border scroll-mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <Logo className="h-12" />
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
                <span>hello@erepairing.com</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Mail size={18} />
                <a href="mailto:delhioneglobal@gmail.com" className="hover:text-primary transition-colors">delhioneglobal@gmail.com</a>
                <span className="text-xs text-muted-foreground">(Support)</span>
              </div>
              <div className="flex items-center space-x-3 text-muted-foreground">
                <Phone size={18} />
                <span>+91 99992 25600</span>
              </div>
              <div className="flex items-start space-x-3 text-muted-foreground">
                <MapPin size={18} className="mt-1 shrink-0" />
                <span>401 A, 89, Hemkunt Chambers, Nehru Place, New Delhi, Delhi 110019</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-col items-center justify-center gap-4 mb-6">
            <span className="text-sm text-muted-foreground">Powered by</span>
            <img
              src="/powered-by-delhi-one.png"
              alt="DELHI ONE"
              className="h-8 w-auto object-contain"
            />
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-muted-foreground text-sm">
              © 2026 eRepairing.com. All rights reserved.
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




