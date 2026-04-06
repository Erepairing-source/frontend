import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import StatCard from '../../../components/StatCard'
import { ArrowLeft, Globe } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts'
import { getApiBase } from '@lib/api'

export default function CountryAdminStateDetail() {
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
    fetch(`${getApiBase()}/country-admin/states/${id}/detail`, {
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
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading state…</p>
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

  const { state, summary, cities, status_distribution, priority_distribution, daily_trend } = data
  const statusData = Object.entries(status_distribution || {}).map(([name, value]) => ({ name, value }))
  const priorityData = Object.entries(priority_distribution || {}).map(([name, value]) => ({ name, value }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Link href="/country-admin/dashboard" className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-4">
            <ArrowLeft size={18} className="mr-2" /> National dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Globe size={28} className="text-blue-600" />
            {state.name}
          </h1>
          <p className="text-gray-600 mt-1">State performance drill-down</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <StatCard title="SLA %" value={`${summary.slaCompliance}%`} icon={{ emoji: '✅', bg: 'bg-green-100', color: 'text-green-600' }} />
          <StatCard title="MTTR" value={`${summary.mttr}h`} icon={{ emoji: '⏱️', bg: 'bg-purple-100', color: 'text-purple-600' }} />
          <StatCard title="FTFR %" value={`${summary.ftfr}%`} icon={{ emoji: '⚡', bg: 'bg-orange-100', color: 'text-orange-600' }} />
          <StatCard title="NPS" value={summary.nps} icon={{ emoji: '💬', bg: 'bg-pink-100', color: 'text-pink-600' }} />
          <StatCard title="Status" value={summary.status} icon={{ emoji: '🌐', bg: 'bg-blue-100', color: 'text-blue-600' }} />
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
                  <Line type="monotone" dataKey="tickets" stroke="#2563eb" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Tickets by status</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
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
                <Bar dataKey="value" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Cities in this state</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">City</th>
                    <th className="text-left py-2 px-3">Tickets</th>
                    <th className="text-left py-2 px-3">SLA %</th>
                    <th className="text-left py-2 px-3">MTTR (h)</th>
                    <th className="text-left py-2 px-3">NPS</th>
                  </tr>
                </thead>
                <tbody>
                  {(cities || []).map((c) => (
                    <tr key={c.id} className="border-b hover:bg-gray-50">
                      <td className="py-2 px-3 font-medium">{c.name}</td>
                      <td className="py-2 px-3">{c.tickets}</td>
                      <td className="py-2 px-3">{c.slaCompliance}</td>
                      <td className="py-2 px-3">{c.mttr}</td>
                      <td className="py-2 px-3">{c.nps}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
