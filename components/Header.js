import { Button } from "./ui/button"
import { Menu, X } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import Logo from "./Logo"

export default function Header({ user, setUser }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    if (setUser) setUser(null)
  }

  return (
    <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Logo width={140} height={40} className="h-10 w-auto" />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a 
              href="#features" 
              className="text-foreground hover:text-primary transition-smooth"
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById('features')
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Features
            </a>
            <a 
              href="#pricing" 
              className="text-foreground hover:text-primary transition-smooth"
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById('pricing')
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Pricing
            </a>
            <a 
              href="#demo" 
              className="text-foreground hover:text-primary transition-smooth"
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById('demo')
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Demo
            </a>
            <a 
              href="#contact" 
              className="text-foreground hover:text-primary transition-smooth"
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById('contact')
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }}
            >
              Contact
            </a>
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">{user.full_name || user.email}</span>
                <Button variant="ghost" onClick={handleLogout}>Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="hero">Get Started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border">
            <nav className="flex flex-col space-y-4 mt-4">
              <a 
                href="#features" 
                className="text-foreground hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMenuOpen(false)
                  const element = document.getElementById('features')
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Features
              </a>
              <a 
                href="#pricing" 
                className="text-foreground hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMenuOpen(false)
                  const element = document.getElementById('pricing')
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Pricing
              </a>
              <a 
                href="#demo" 
                className="text-foreground hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMenuOpen(false)
                  const element = document.getElementById('demo')
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Demo
              </a>
              <a 
                href="#contact" 
                className="text-foreground hover:text-primary transition-smooth"
                onClick={(e) => {
                  e.preventDefault()
                  setIsMenuOpen(false)
                  const element = document.getElementById('contact')
                  element?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                Contact
              </a>
              <div className="flex flex-col space-y-2 pt-4">
                {user ? (
                  <Button variant="ghost" className="w-full" onClick={handleLogout}>Logout</Button>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" className="w-full">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button variant="hero" className="w-full">Get Started</Button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}




