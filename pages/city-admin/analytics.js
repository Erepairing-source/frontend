import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeft, BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { ChartCard } from '../../components/analytics'
import { getApiBase } from '@lib/api'
import {
  ResponsiveContainer,
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts'

const COLORS = ['#0d9488', '#7c3aed', '#ea580c', '#16a34a', '#db2777']

export default function CityAdminAnalyticsPage() {
  const router = useRouter()
  const [timeRange, setTimeRange] = useState('30d')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')
    setLoading(true)
    try {
      const res = await fetch(`${getApiBase()}/city-admin/analytics?time_range=${timeRange}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setData(res.ok ? await res.json() : null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [timeRange])

  const kpis = useMemo(() => {
    const total = (data?.daily_trend || []).reduce((s, d) => s + (d.tickets || 0), 0)
    const statuses = Object.values(data?.status_distribution || {}).reduce((s, v) => s + (v || 0), 0)
    const priorities = Object.values(data?.priority_distribution || {}).reduce((s, v) => s + (v || 0), 0)
    return { total, statuses, priorities }
  }, [data])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/30">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.push('/city-admin/dashboard')} className="-ml-2 mb-2">
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="text-teal-600" /> City Analytics
            </h1>
          </div>
          <div className="flex gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={load}><RefreshCw size={16} className="mr-2" /> Refresh</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardHeader><CardTitle className="text-sm">Ticket Volume</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{kpis.total}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Status Entries</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{kpis.statuses}</p></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Priority Entries</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{kpis.priorities}</p></CardContent></Card>
        </div>

        {!loading && data && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <ChartCard title={`Daily trend (${data.period})`}>
              <div className="h-[260px]"><ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.daily_trend || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey="tickets" stroke="#0d9488" strokeWidth={2} dot={false} /></LineChart>
              </ResponsiveContainer></div>
            </ChartCard>
            <ChartCard title="Status distribution">
              <div className="h-[260px]"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(data.status_distribution || {}).map(([name, value]) => ({ name, value }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="value">{Object.keys(data.status_distribution || {}).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart>
              </ResponsiveContainer></div>
            </ChartCard>
            <ChartCard title="Priority distribution">
              <div className="h-[260px]"><ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(data.priority_distribution || {}).map(([name, value]) => ({ name, value }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#6366f1" /></BarChart>
              </ResponsiveContainer></div>
            </ChartCard>
          </div>
        )}
      </div>
    </div>
  )
}
