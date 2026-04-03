import { useState } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { getApiBase } from '../lib/api'

export default function RoleAssistantChat({ role, page, title = 'AI Role Assistant' }) {
  const [sessionId, setSessionId] = useState('')
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: `Hi! Ask me anything about your ${String(role || '').replace(/_/g, ' ')} dashboard, tickets, and available actions.`,
      actions: [],
    },
  ])

  const askAssistant = async () => {
    const text = query.trim()
    if (!text || loading) return
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
    if (!token) {
      setMessages((prev) => [...prev, { sender: 'assistant', text: 'Please log in first to use role assistant.', actions: [] }])
      return
    }

    setMessages((prev) => [...prev, { sender: 'user', text, actions: [] }])
    setQuery('')
    setLoading(true)
    try {
      const res = await fetch(`${getApiBase()}/ai/role-assistant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role,
          page,
          message: text,
          session_id: sessionId || undefined,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.detail || 'Failed to get assistant response')
      }
      if (data?.session_id) setSessionId(data.session_id)
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: data?.reply || 'No response generated.',
          actions: Array.isArray(data?.actions) ? data.actions : [],
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'assistant', text: err.message || 'Request failed. Please try again.', actions: [] },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="h-72 overflow-y-auto border rounded-lg p-3 bg-gray-50 space-y-3">
        {messages.map((m, idx) => (
          <div key={idx} className={m.sender === 'user' ? 'text-right' : 'text-left'}>
            <div
              className={`inline-block max-w-[90%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-800'
              }`}
            >
              {m.text}
            </div>
            {m.sender === 'assistant' && Array.isArray(m.actions) && m.actions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {m.actions.slice(0, 4).map((a, aIdx) => (
                  <button
                    key={`${idx}-${aIdx}`}
                    className="text-xs px-2 py-1 rounded border bg-white hover:bg-gray-100"
                    onClick={() => {
                      if (a?.url) window.location.href = a.url
                    }}
                  >
                    {a?.title || 'Open'}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') askAssistant()
          }}
          placeholder="Ask about tickets, SLA, dashboard actions..."
          disabled={loading}
        />
        <Button onClick={askAssistant} disabled={loading || !query.trim()}>
          {loading ? '...' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
