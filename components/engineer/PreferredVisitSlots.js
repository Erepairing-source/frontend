/**
 * Customer preferred visit slots — chip grid aligned with eRepairing UI.
 * Expects slots: [{ day: 'Mon', slot: '9-12' }, ...]
 */
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['9-12', '12-4', '4-8']

function slotBand(slot) {
  if (!slot) return 'morning'
  const s = String(slot)
  if (s.startsWith('9')) return 'morning'
  if (s.startsWith('12')) return 'afternoon'
  return 'evening'
}

const bandStyle = {
  morning: 'bg-amber-50 text-amber-900 border-amber-200',
  afternoon: 'bg-sky-50 text-sky-900 border-sky-200',
  evening: 'bg-violet-50 text-violet-900 border-violet-200'
}

/**
 * @param {'standalone' | 'embedded'} variant — embedded: no duplicate frame/title (use inside a parent Card).
 */
export default function PreferredVisitSlots({ slots, variant = 'standalone' }) {
  const embedded = variant === 'embedded'

  if (!Array.isArray(slots) || slots.length === 0) {
    return (
      <p className="text-sm text-gray-500 italic">No preferred visit slots recorded for this ticket.</p>
    )
  }

  const byDay = {}
  for (const s of slots) {
    const d = (s.day || '').trim()
    if (!d) continue
    if (!byDay[d]) byDay[d] = []
    byDay[d].push(s.slot || '')
  }

  const grid = (
    <>
      {!embedded && (
        <h3 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <span
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-teal-100 text-teal-700 text-xs font-bold"
            aria-hidden
          >
            Wk
          </span>
          Preferred visit windows
        </h3>
      )}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {DAYS.map((day) => {
          const daySlots = byDay[day] || []
          return (
            <div
              key={day}
              className="rounded-lg border border-slate-100 bg-white p-2 min-h-[88px] shadow-sm"
            >
              <div className="text-xs font-bold text-slate-700 mb-2">{day}</div>
              <div className="flex flex-col gap-1.5">
                {daySlots.length === 0 ? (
                  <span className="text-[11px] text-slate-400">—</span>
                ) : (
                  daySlots.map((sl, i) => {
                    const band = slotBand(sl)
                    return (
                      <span
                        key={`${day}-${sl}-${i}`}
                        className={`inline-flex items-center justify-center rounded-md border px-2 py-1 text-xs font-medium ${bandStyle[band]}`}
                      >
                        {sl}
                      </span>
                    )
                  })
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-xs text-slate-500">
        As requested when the ticket was created ({SLOTS.join(', ')}).
      </p>
    </>
  )

  if (embedded) {
    return <div className="space-y-2">{grid}</div>
  }

  return (
    <div className="rounded-xl border border-slate-200/80 bg-gradient-to-br from-slate-50 to-white p-4 shadow-sm">
      {grid}
    </div>
  )
}
