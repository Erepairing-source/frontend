import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import StatCard from '../../../components/StatCard'
import { ArrowLeft, Building2 } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { getApiBase } from '../../../lib/api'

export default function CountryAdminPartnerDetail() {
  const router = useRouter()
  const { id } = router.query
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!id) return
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setLoading(true)
    fetch(`${getApiBase()}/country-admin/partners/${id}/detail`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async (res) => {
        if (!res.ok) {
          const j = await res.json().catch(() => ({}))
          throw new Error(j.detail || res.statusText)
        }
        return res.json()
      })
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [id, router])

  if (loading || !id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading partner…</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen px-4 py-12 max-w-2xl mx-auto">
        <p className="text-red-600 mb-4">{error || 'Failed to load'}</p>
        <Button variant="outline" onClick={() => router.push('/country-admin/dashboard')}>
          <ArrowLeft className="mr-2" size={18} /> Back
        </Button>
      </div>
    )
  }

  const { partner, metrics, status_distribution, priority_distribution, daily_trend } = data
  const statusData = Object.entries(status_distribution || {}).map(([name, value]) => ({ name, value }))
  const priorityData = Object.entries(priority_distribution || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/country-admin/dashboard" className="inline-flex items-center text-teal-700 hover:text-teal-900 text-sm font-medium mb-4">
            <ArrowLeft size={18} className="mr-2" /> National dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 size={28} className="text-teal-600" />
            {partner.name}
          </h1>
          <p className="text-gray-600 mt-1">{partner.email || '—'} {partner.phone ? `· ${partner.phone}` : ''}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Tickets" value={metrics.ticketsHandled} icon={{ emoji: '🎫', bg: 'bg-indigo-100', color: 'text-indigo-600' }} />
          <StatCard title="SLA %" value={`${metrics.slaAdherence}%`} icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }} />
          <StatCard title="MTTR (h)" value={metrics.mttr} icon={{ emoji: '⏱️', bg: 'bg-purple-100', color: 'text-purple-600' }} />
          <StatCard title="NPS" value={metrics.nps} icon={{ emoji: '💬', bg: 'bg-pink-100', color: 'text-pink-600' }} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Tickets per day (30d)</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={daily_trend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="tickets" stroke="#0d9488" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Status distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Priority mix</CardTitle>
          </CardHeader>
          <CardContent className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={priorityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#0891b2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
