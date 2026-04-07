import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/router'
import { ArrowLeft, BarChart3, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card'
import { ChartCard } from '../../components/analytics'
import { getApiBase } from '@lib/api'
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts'

const COLORS = ['#4f46e5', '#14b8a6', '#f59e0b', '#ef4444', '#a855f7']

export default function OrganizationAdminAnalyticsPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('30d')
  const [data, setData] = useState(null)

  const load = async () => {
    const token = localStorage.getItem('token')
    if (!token) return router.push('/login')
    const res = await fetch(`${getApiBase()}/org-admin/analytics?period=${period}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    setData(res.ok ? await res.json() : null)
  }
  useEffect(() => { load() }, [period])

  const openTickets = useMemo(() => {
    if (!data?.tickets) return 0
    return (data.tickets.total || 0) - (data.tickets.resolved || 0)
  }, [data])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/20 to-cyan-50/20">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.push('/organization-admin/dashboard')} className="-ml-2 mb-2">
              <ArrowLeft size={16} className="mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2"><BarChart3 className="text-indigo-600" /> Organization Analytics</h1>
          </div>
          <div className="flex gap-2">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem><SelectItem value="90d">Last 90 days</SelectItem><SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={load}><RefreshCw size={16} className="mr-2" /> Refresh</Button>
          </div>
        </div>

        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card><CardHeader><CardTitle className="text-sm">Tickets</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{data.tickets?.total || 0}</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Resolved</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{data.tickets?.resolved || 0}</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">Open</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{openTickets}</p></CardContent></Card>
              <Card><CardHeader><CardTitle className="text-sm">SLA Compliance</CardTitle></CardHeader><CardContent><p className="text-3xl font-bold">{(data.tickets?.sla_compliance || 0).toFixed(1)}%</p></CardContent></Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <ChartCard title={`Daily trend (${data.period || period})`}><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={data.daily_trends || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Line type="monotone" dataKey="tickets" stroke="#4f46e5" strokeWidth={2} dot={false} /></LineChart></ResponsiveContainer></div></ChartCard>
              <ChartCard title="Status distribution"><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={Object.entries(data.status_distribution || {}).map(([name, value]) => ({ name, value }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="value">{Object.keys(data.status_distribution || {}).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar></BarChart></ResponsiveContainer></div></ChartCard>
              <ChartCard title="Priority distribution"><div className="h-[260px]"><ResponsiveContainer width="100%" height="100%"><BarChart data={Object.entries(data.priority_distribution || {}).map(([name, value]) => ({ name, value }))}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" tick={{ fontSize: 10 }} /><YAxis /><Tooltip /><Bar dataKey="value" fill="#a855f7" /></BarChart></ResponsiveContainer></div></ChartCard>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
