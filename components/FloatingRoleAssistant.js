import { useState } from 'react'
import RoleAssistantChat from './RoleAssistantChat'

export default function FloatingRoleAssistant({ user }) {
  const [open, setOpen] = useState(false)

  if (!user?.role) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="w-[360px] max-w-[90vw] mb-3 shadow-xl">
          <div className="flex justify-between items-center bg-gray-900 text-white px-3 py-2 rounded-t-lg">
            <span className="text-sm font-semibold">AI Assistant</span>
            <button className="text-sm" onClick={() => setOpen(false)}>✕</button>
          </div>
          <div className="bg-white rounded-b-lg">
            <RoleAssistantChat role={user.role} page="global" title="AI Assistant" />
          </div>
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="bg-blue-600 text-white rounded-full px-4 py-3 shadow-lg hover:bg-blue-700"
      >
        {open ? 'Hide AI' : 'Ask AI'}
      </button>
    </div>
  )
}
