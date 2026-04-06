import { useMemo } from 'react'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

const SLOT_DEFS = [
  {
    slot: '9-12',
    label: 'Morning',
    hint: '9 – 12',
    active: 'bg-amber-100 text-amber-950 border-amber-300 ring-2 ring-amber-400/60 shadow-sm',
    idle: 'bg-white text-slate-700 border-slate-200 hover:border-amber-200 hover:bg-amber-50/50'
  },
  {
    slot: '12-4',
    label: 'Afternoon',
    hint: '12 – 4',
    active: 'bg-sky-100 text-sky-950 border-sky-300 ring-2 ring-sky-400/60 shadow-sm',
    idle: 'bg-white text-slate-700 border-slate-200 hover:border-sky-200 hover:bg-sky-50/50'
  },
  {
    slot: '4-8',
    label: 'Evening',
    hint: '4 – 8',
    active: 'bg-violet-100 text-violet-950 border-violet-300 ring-2 ring-violet-400/60 shadow-sm',
    idle: 'bg-white text-slate-700 border-slate-200 hover:border-violet-200 hover:bg-violet-50/50'
  }
]

function slotKey(day, slot) {
  return `${day}|${slot}`
}

export default function PreferredVisitSlotPicker({ value, onChange }) {
  const selectedSet = useMemo(() => {
    const s = new Set()
    if (Array.isArray(value)) {
      for (const t of value) {
        if (t?.day && t?.slot) s.add(slotKey(t.day, t.slot))
      }
    }
    return s
  }, [value])

  const toggle = (day, slot) => {
    const k = slotKey(day, slot)
    const next = Array.isArray(value) ? [...value] : []
    const idx = next.findIndex((t) => t.day === day && t.slot === slot)
    if (idx >= 0) {
      next.splice(idx, 1)
    } else {
      next.push({ day, slot })
    }
    onChange(next)
  }

  const clearAll = () => onChange([])

  const count = Array.isArray(value) ? value.length : 0

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3 text-xs text-slate-600">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> Morning
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sky-400" /> Afternoon
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-400" /> Evening
          </span>
        </div>
        {count > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-teal-700 hover:text-teal-900 underline-offset-2 hover:underline"
          >
            Clear all ({count} selected)
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7 gap-3">
        {DAYS.map((day) => (
          <div
            key={day}
            className="rounded-xl border border-slate-200/80 bg-gradient-to-b from-white to-slate-50/80 p-3 shadow-sm"
          >
            <div className="text-xs font-bold uppercase tracking-wide text-slate-500 mb-2">{day}</div>
            <div className="flex flex-col gap-2">
              {SLOT_DEFS.map((def) => {
                const on = selectedSet.has(slotKey(day, def.slot))
                return (
                  <button
                    key={def.slot}
                    type="button"
                    onClick={() => toggle(day, def.slot)}
                    className={`w-full rounded-lg border px-2 py-2.5 text-left transition-all ${on ? def.active : def.idle}`}
                  >
                    <div className="text-sm font-semibold leading-tight">{def.label}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{def.hint}</div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-500">
        Pick any combination that works for you. Our team will try to match these windows when scheduling the engineer.
      </p>
    </div>
  )
}
