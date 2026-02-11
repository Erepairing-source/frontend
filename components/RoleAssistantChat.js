import { useEffect, useState } from 'react'

export default function RoleAssistantChat({ role, page, title = 'AI Role Assistant' }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [sessionId, setSessionId] = useState('')

  const sessionKey = `role_assistant_session_${role}`

  const sendMessage = async (text) => {
    if (!text) return
    const token = localStorage.getItem('token')
    setMessages(prev => [...prev, { from: 'user', text }])
    setInput('')
    setLoading(true)
    try {
      const trimmed = text.trim()
      if (trimmed.startsWith('/reschedule')) {
        const payloadText = trimmed.replace('/reschedule', '').trim()
        let payload = {}
        if (payloadText) {
          try {
            payload = JSON.parse(payloadText)
          } catch (error) {
            setMessages(prev => [...prev, { from: 'assistant', text: 'To reschedule via chatbot, use: /reschedule {\"ticket_id\":123,\"preferred_date\":\"2026-03-15\",\"reason\":\"...\",\"service_address\":\"...\"}' }])
            setLoading(false)
            return
          }
        }
        const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/ai/chatbot/reschedule', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        })
        const data = await response.json()
        if (response.ok) {
          setMessages(prev => [...prev, { from: 'assistant', text: data.message || 'Ticket rescheduled successfully.' }])
        } else {
          setMessages(prev => [...prev, { from: 'assistant', text: data.detail || 'Reschedule failed.' }])
        }
        setLoading(false)
        return
      }
      const response = await fetch((process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1') + '/ai/role-assistant', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: text,
          role,
          page,
          session_id: sessionId || localStorage.getItem(sessionKey) || ''
        })
      })
      const data = await response.json()
      if (response.ok) {
        if (data.session_id) {
          setSessionId(data.session_id)
          localStorage.setItem(sessionKey, data.session_id)
        }
        setMessages(prev => [...prev, { from: 'assistant', text: data.reply, actions: data.actions || [] }])
      } else {
        setMessages(prev => [...prev, { from: 'assistant', text: data.detail || 'Assistant unavailable' }])
      }
    } catch (error) {
      setMessages(prev => [...prev, { from: 'assistant', text: 'Assistant unavailable' }])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (initialized) return
    setInitialized(true)
    const stored = localStorage.getItem(sessionKey)
    if (stored) {
      setSessionId(stored)
    }
    sendMessage('help')
  }, [initialized])

  return (
    <div className="border border-gray-200 rounded-xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button
          className="text-sm text-blue-600 hover:text-blue-700"
          onClick={() => sendMessage('what can I do here')}
        >
          Quick Help
        </button>
      </div>
      <div className="space-y-3 max-h-64 overflow-y-auto mb-3">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.from === 'user' ? 'text-right' : 'text-left'}>
            <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
              msg.from === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
            }`}>
              <pre className="whitespace-pre-wrap font-sans">{msg.text}</pre>
            </div>
            {msg.actions && msg.actions.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {msg.actions.map((action, actionIdx) => (
                  <button
                    key={actionIdx}
                    className="text-xs px-2 py-1 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    onClick={() => window.open(action.url, '_blank')}
                  >
                    {action.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className="flex gap-2 mb-2">
        {['What can I do?', 'Where are tickets?', 'What access do I have?', 'AI features?'].map((q) => (
          <button
            key={q}
            className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-600 hover:bg-gray-50"
            onClick={() => sendMessage(q)}
          >
            {q}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Ask about your role or dashboard..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              sendMessage(input)
            }
          }}
        />
        <button
          className="px-3 py-2 text-sm rounded-md bg-gray-900 text-white"
          disabled={loading}
          onClick={() => sendMessage(input)}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}
