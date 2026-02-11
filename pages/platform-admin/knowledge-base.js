import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import Card from '../../components/Card'
import Button from '../../components/Button'

export default function PlatformKnowledgeBase() {
  const router = useRouter()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({
    id: null,
    title: '',
    content: '',
    role: '',
    tags: '',
    source: '',
    is_active: true
  })

  const loadEntries = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/ai/knowledge-base', {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        setEntries(await response.json())
      }
    } catch (error) {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEntries()
  }, [])

  const saveEntry = async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/ai/knowledge-base/upsert', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id,
          title: form.title,
          content: form.content,
          role: form.role || null,
          tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
          source: form.source || null,
          is_active: form.is_active
        })
      })
      if (response.ok) {
        setForm({ id: null, title: '', content: '', role: '', tags: '', source: '', is_active: true })
        loadEntries()
      }
    } catch (error) {
      // ignore
    }
  }

  const deleteEntry = async (id) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    if (!confirm('Delete this entry?')) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/knowledge-base/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        loadEntries()
      }
    } catch (error) {
      // ignore
    }
  }

  const editEntry = async (id) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/knowledge-base/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      if (response.ok) {
        const entry = await response.json()
        setForm({
          id: entry.id,
          title: entry.title || '',
          content: entry.content || '',
          role: entry.role || '',
          tags: (entry.tags || []).join(', '),
          source: entry.source || '',
          is_active: entry.is_active !== false
        })
      }
    } catch (error) {
      // ignore
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading knowledge base...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:underline mb-4"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Knowledge Base</h1>
          <p className="text-gray-600">Manage documents used by AI/RAG</p>
        </div>

        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Add / Edit Entry</h2>
          <div className="grid grid-cols-1 gap-4">
            <input
              className="border border-gray-300 rounded-lg px-3 py-2"
              placeholder="Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <textarea
              className="border border-gray-300 rounded-lg px-3 py-2 min-h-[120px]"
              placeholder="Content"
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Role (optional)"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Tags (comma)"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
              <input
                className="border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Source URL (optional)"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
              />
              Active
            </label>
            <div>
              <Button onClick={saveEntry}>
                Save Entry
              </Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Entries</h2>
          {entries.length === 0 ? (
            <p className="text-gray-600">No entries yet.</p>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
                <div key={entry.id} className="border rounded-lg p-4 flex justify-between items-start">
                  <div>
                    <div className="font-semibold">{entry.title}</div>
                    <div className="text-xs text-gray-600">
                      Role: {entry.role || 'all'} • Tags: {(entry.tags || []).join(', ') || 'none'}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => editEntry(entry.id)}
                    >
                      Edit
                    </Button>
                    <Button variant="outline" onClick={() => deleteEntry(entry.id)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
