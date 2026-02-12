import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Logo from './Logo'

export default function Layout({ children, user, setUser }) {
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userId')
    if (setUser) setUser(null)
    router.push('/login')
  }

  const getRoleDisplayName = (role) => {
    const roleNames = {
      'customer': 'Customer',
      'support_engineer': 'Engineer',
      'city_admin': 'City Admin',
      'state_admin': 'State Admin',
      'country_admin': 'Country Admin',
      'organization_admin': 'Organization Admin',
      'platform_admin': 'Platform Admin',
      'vendor': 'Vendor'
    }
    return roleNames[role] || 'User'
  }

  const getDashboardLink = (role) => {
    const links = {
      'customer': '/customer/dashboard',
      'support_engineer': '/engineer/dashboard',
      'city_admin': '/city-admin/dashboard',
      'state_admin': '/state-admin/dashboard',
      'country_admin': '/country-admin/dashboard',
      'organization_admin': '/organization-admin/dashboard',
      'org_admin': '/organization-admin/dashboard', // Alias for organization_admin
      'platform_admin': '/platform-admin/dashboard',
      'vendor': '/vendor/dashboard'
    }
    return links[role] || '/dashboard'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href={user ? getDashboardLink(user.role) : '/'} className="flex items-center">
                <Logo width={140} height={40} className="h-10 w-auto" />
              </Link>
            </div>

            {user ? (
              <div className="flex items-center space-x-4">
                <div className="hidden md:flex items-center space-x-4">
                  <span className="text-sm text-gray-600">
                    {user.full_name || user.email}
                  </span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    {getRoleDisplayName(user.role)}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      {!user && (
        <footer className="bg-gray-900 text-white mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center mb-4">
                  <Logo width={120} height={36} className="h-9 w-auto" />
                </div>
                <p className="text-gray-400 text-sm">AI-first Service Management Platform</p>
              </div>
              <div>
                <h5 className="font-semibold mb-4">Product</h5>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/features" className="hover:text-white transition">Features</Link></li>
                  <li><Link href="/pricing" className="hover:text-white transition">Pricing</Link></li>
                  <li><Link href="/integrations" className="hover:text-white transition">Integrations</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-4">Company</h5>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/about" className="hover:text-white transition">About</Link></li>
                  <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
                  <li><Link href="/careers" className="hover:text-white transition">Careers</Link></li>
                </ul>
              </div>
              <div>
                <h5 className="font-semibold mb-4">Support</h5>
                <ul className="space-y-2 text-sm text-gray-400">
                  <li><Link href="/docs" className="hover:text-white transition">Documentation</Link></li>
                  <li><Link href="/support" className="hover:text-white transition">Support</Link></li>
                  <li><Link href="/api-docs" className="hover:text-white transition">API Docs</Link></li>
                </ul>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
              <p>&copy; 2024 eRepairing.com. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

