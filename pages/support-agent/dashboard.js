import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Plus, RefreshCw } from 'lucide-react'
import { getApiBase } from '@lib/api'

export default function SupportAgentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${getApiBase()}/tickets/?limit=200`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setTickets(await res.json())
      else setTickets([])
    } catch {
      setTickets([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-12 h-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  const openCount = tickets.filter((t) =>
    ['created', 'assigned', 'in_progress', 'waiting_parts'].includes(t.status)
  ).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-indigo-50/40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Support desk</h1>
            <p className="text-slate-600 mt-1">
              Raise tickets for customers in your organization. There is no per-user ticket cap — routing uses the customer’s
              location so city, state, and country admins see work in hierarchy.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={load}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Link href="/support-agent/create-ticket">
              <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                <Plus className="w-4 h-4 mr-1" />
                New ticket
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Total in org</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-slate-900">{tickets.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Open pipeline</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-teal-800">{openCount}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-500">Quick link</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/support-agent/create-ticket" className="text-teal-700 font-medium hover:underline">
                Create on behalf of customer →
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent tickets</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b text-slate-500">
                  <th className="py-2 pr-4">Number</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4">Priority</th>
                  <th className="py-2 pr-4">Customer</th>
                  <th className="py-2 pr-4">Created</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {tickets.map((t) => (
                  <tr key={t.id} className="border-b border-slate-100 hover:bg-slate-50/80">
                    <td className="py-2 pr-4 font-mono text-xs">{t.ticket_number}</td>
                    <td className="py-2 pr-4">
                      <Badge variant="secondary">{t.status}</Badge>
                    </td>
                    <td className="py-2 pr-4">{t.priority}</td>
                    <td className="py-2 pr-4">{t.customer_name || '—'}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {t.created_at ? new Date(t.created_at).toLocaleString() : ''}
                    </td>
                    <td className="py-2">
                      <Link href={`/tickets/${t.id}`} className="text-teal-700 hover:underline font-medium">
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tickets.length === 0 && <p className="text-slate-500 py-6">No tickets yet for your organization.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
