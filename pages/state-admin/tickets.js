import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Button } from '../../components/ui/button'
import { Badge } from '../../components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ArrowLeft, AlertTriangle, Filter } from 'lucide-react'
import { getApiBase } from '@lib/api'

export default function StateAdminTickets() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [cities, setCities] = useState([])
  const [selectedCity, setSelectedCity] = useState('all')
  const [tickets, setTickets] = useState([])
  const [escalations, setEscalations] = useState([])
  const hasLoadedOnce = useRef(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(getApiBase() + '/state-admin/cities', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setCities(Array.isArray(data) ? data : []))
      .catch(() => setCities([]))
  }, [])

  const load = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    setLoading(true)
    try {
      const ticketParams = new URLSearchParams({ limit: '500' })
      if (selectedCity !== 'all') ticketParams.append('city_id', selectedCity)
      const escParams = new URLSearchParams()
      if (selectedCity !== 'all') escParams.append('city_id', selectedCity)

      const ticketUrl = `${getApiBase()}/tickets/?${ticketParams.toString()}`
      const escUrl =
        escParams.toString().length > 0
          ? `${getApiBase()}/state-admin/escalations?${escParams.toString()}`
          : `${getApiBase()}/state-admin/escalations`

      const [tRes, eRes] = await Promise.all([
        fetch(ticketUrl, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(escUrl, { headers: { Authorization: `Bearer ${token}` } }),
      ])
      if (tRes.ok) setTickets(await tRes.json())
      else setTickets([])
      if (eRes.ok) setEscalations(await eRes.json())
      else setEscalations([])
    } catch {
      setTickets([])
      setEscalations([])
    } finally {
      setLoading(false)
      hasLoadedOnce.current = true
    }
  }, [router, selectedCity])

  useEffect(() => {
    load()
  }, [load])

  if (loading && !hasLoadedOnce.current) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" size="sm" className="mb-2 -ml-2" onClick={() => router.push('/state-admin/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">State tickets & escalations</h1>
          <p className="text-gray-600 mt-1">
            Same hierarchy as the state dashboard: tickets are scoped to your state (and organization when set). Filter by city
            to match the city drill-down. Support-created tickets use the customer&apos;s city and appear here.
          </p>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Filter size={18} className="text-gray-500 shrink-0" />
            <span className="text-sm font-medium text-gray-700">City</span>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="All cities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All cities in state</SelectItem>
                {cities.map((city) => (
                  <SelectItem
                    key={city.id != null ? String(city.id) : `noid-${city.name}`}
                    value={city.id != null ? String(city.id) : `noid-${city.name}`}
                  >
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {loading && (
              <span className="text-sm text-gray-500">Updating…</span>
            )}
          </div>
        </Card>

        <Tabs defaultValue="tickets" className="space-y-4">
          <TabsList>
            <TabsTrigger value="tickets">All tickets ({tickets.length})</TabsTrigger>
            <TabsTrigger value="escalations" className="gap-1">
              <AlertTriangle className="w-4 h-4" />
              Escalations ({escalations.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <CardTitle>Tickets</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b text-gray-500">
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
                      <tr key={t.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                        <td className="py-2 pr-4 font-mono text-xs">{t.ticket_number}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="secondary">{t.status}</Badge>
                        </td>
                        <td className="py-2 pr-4">{t.priority}</td>
                        <td className="py-2 pr-4">{t.customer_name || '—'}</td>
                        <td className="py-2 pr-4 text-gray-600">{t.created_at ? new Date(t.created_at).toLocaleString() : ''}</td>
                        <td className="py-2">
                          <Link href={`/tickets/${t.id}`} className="text-indigo-600 hover:underline font-medium">
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {tickets.length === 0 && <p className="text-gray-500 py-6">No tickets in this filter.</p>}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="escalations">
            <Card>
              <CardHeader>
                <CardTitle>Escalation queue</CardTitle>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left border-b text-gray-500">
                      <th className="py-2 pr-4">Ticket</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-4">Reason</th>
                      <th className="py-2 pr-4">OTP issue</th>
                      <th className="py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {escalations.map((e) => (
                      <tr key={e.id} className="border-b border-gray-100 hover:bg-gray-50/80">
                        <td className="py-2 pr-4 font-mono text-xs">{e.ticket_number || e.ticket_id}</td>
                        <td className="py-2 pr-4">{e.escalation_type || '—'}</td>
                        <td className="py-2 pr-4">
                          <Badge variant="outline">{e.status}</Badge>
                        </td>
                        <td className="py-2 pr-4 max-w-xs truncate" title={e.reason}>
                          {e.reason || '—'}
                        </td>
                        <td className="py-2 pr-4">{e.is_completion_otp ? 'Yes' : '—'}</td>
                        <td className="py-2">
                          <Link href={`/tickets/${e.ticket_id}`} className="text-indigo-600 hover:underline font-medium">
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {escalations.length === 0 && (
                  <p className="text-gray-500 py-6">No pending or acknowledged escalations in this filter.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
