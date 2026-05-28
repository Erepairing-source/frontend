import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import DashboardHeader from '../../components/DashboardHeader'
import { Plus, RefreshCw, Search, FileSpreadsheet } from 'lucide-react'
import { getApiBase } from '@lib/api'

export default function SupportAgentDashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tickets, setTickets] = useState([])
  const [lookupQ, setLookupQ] = useState('')
  const [lookupResult, setLookupResult] = useState(null)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState('')

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

  const runLookup = async () => {
    const raw = lookupQ.trim()
    if (!raw) return
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setLookupLoading(true)
    setLookupError('')
    setLookupResult(null)
    try {
      const res = await fetch(
        `${getApiBase()}/tickets/service-lookup?${new URLSearchParams({ q: raw }).toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setLookupError(typeof data?.detail === 'string' ? data.detail : JSON.stringify(data?.detail || data) || 'Lookup failed.')
        return
      }
      setLookupResult(data)
    } catch {
      setLookupError('Network error.')
    } finally {
      setLookupLoading(false)
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
        <DashboardHeader
          title="Support Desk Dashboard"
          subtitle="Device-first ticketing with human-readable references (ER-*). Search by ticket id, pincode, serial, or customer name; create tickets anchored to registered devices."
          actions={
            <>
              <Button variant="outline" size="sm" onClick={load}>
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Link href="/support-agent/bulk-register">
                <Button size="sm" variant="outline">
                  <FileSpreadsheet className="w-4 h-4 mr-1" />
                  Bulk register
                </Button>
              </Link>
              <Link href="/support-agent/create-ticket">
                <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
                  <Plus className="w-4 h-4 mr-1" />
                  New ticket
                </Button>
              </Link>
            </>
          }
        />

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
              <Link href="/support-agent/create-ticket" className="text-teal-700 font-medium hover:underline block">
                Create on behalf of customer →
              </Link>
              <Link href="/support-agent/bulk-register" className="text-teal-700 font-medium hover:underline block mt-1">
                Bulk customers & devices →
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8 border-teal-200/60 bg-white/90">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Service lookup</CardTitle>
            <p className="text-sm text-slate-600 font-normal">
              Same bar for ticket ids (ER-…), postal codes (e.g. 400001), device serial numbers, or customer names.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                value={lookupQ}
                onChange={(e) => setLookupQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), runLookup())}
                placeholder="ER-20260507-001  ·  8J3FN2  ·  400001  ·  Priya Sharma"
                className="flex-1 px-4 py-3 rounded-xl border border-slate-200 text-sm"
              />
              <Button type="button" onClick={runLookup} disabled={lookupLoading || !lookupQ.trim()} className="shrink-0 bg-teal-600 hover:bg-teal-700">
                <Search className="w-4 h-4 mr-2" />
                {lookupLoading ? 'Searching…' : 'Search'}
              </Button>
            </div>
            {lookupError && <p className="text-sm text-red-700">{lookupError}</p>}
            {lookupResult && (
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 text-sm space-y-3">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                  Interpreted as: {(lookupResult.interpreted_as || []).join(', ') || 'mixed'}
                </p>
                {lookupResult.ticket && (
                  <div>
                    <p className="font-semibold text-slate-900">Ticket</p>
                    <button
                      type="button"
                      className="text-teal-700 font-mono hover:underline"
                      onClick={() => router.push(`/tickets/${lookupResult.ticket.id}`)}
                    >
                      {lookupResult.ticket.ticket_number}
                    </button>
                    <span className="text-slate-600 ml-2">{lookupResult.ticket.status}</span>
                  </div>
                )}
                {lookupResult.device && (
                  <div>
                    <p className="font-semibold text-slate-900">Device</p>
                    <p className="text-slate-700">
                      {lookupResult.device.brand} {lookupResult.device.model_number} · SN{' '}
                      <span className="font-mono">{lookupResult.device.serial_number}</span> · Warranty:{' '}
                      {lookupResult.device.warranty_status}
                    </p>
                    {lookupResult.device.customer && (
                      <p className="text-slate-600 mt-1">
                        Owner: {lookupResult.device.customer.full_name}
                        {lookupResult.device.customer.phone ? ` · ${lookupResult.device.customer.phone}` : ''}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="text-teal-800 border-teal-300"
                        onClick={() =>
                          router.push(`/support-agent/create-ticket?serial=${encodeURIComponent(lookupResult.device.serial_number)}`)
                        }
                      >
                        New ticket on this device
                      </Button>
                    </div>
                    {lookupResult.device_ticket_history?.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-slate-600 border-t border-slate-200 pt-2">
                        {lookupResult.device_ticket_history.slice(0, 8).map((row) => (
                          <li key={row.id}>
                            <button type="button" className="text-teal-700 hover:underline font-mono mr-2" onClick={() => router.push(`/tickets/${row.id}`)}>
                              {row.ticket_number}
                            </button>
                            {row.status}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
                {lookupResult.tickets_by_pincode?.length > 0 && (
                  <div>
                    <p className="font-semibold text-slate-900">Tickets in postal area</p>
                    <ul className="mt-1 space-y-1 max-h-40 overflow-y-auto">
                      {lookupResult.tickets_by_pincode.slice(0, 15).map((row) => (
                        <li key={row.id}>
                          <button type="button" className="text-teal-700 hover:underline font-mono text-xs mr-2" onClick={() => router.push(`/tickets/${row.id}`)}>
                            {row.ticket_number}
                          </button>
                          <span className="text-slate-600">{row.customer_name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {lookupResult.customers?.length > 0 && !(lookupResult.device || lookupResult.ticket || lookupResult.tickets_by_pincode?.length) && (
                  <div>
                    <p className="font-semibold text-slate-900">Matching customers</p>
                    <ul className="mt-1 space-y-1">
                      {lookupResult.customers.slice(0, 12).map((c) => (
                        <li key={c.id} className="text-slate-700">
                          {c.full_name} — {c.email}
                          {c.address_pincode ? ` · PIN ${c.address_pincode}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {lookupResult.customers?.length > 0 && lookupResult.tickets_by_pincode?.length > 0 && (
                  <div>
                    <p className="font-semibold text-slate-900 mt-3">Customers with this PIN</p>
                    <ul className="mt-1 space-y-1">
                      {lookupResult.customers.slice(0, 8).map((c) => (
                        <li key={c.id} className="text-slate-700">
                          {c.full_name} — {c.phone}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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
