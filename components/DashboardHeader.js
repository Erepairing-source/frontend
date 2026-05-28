export default function DashboardHeader({ title, subtitle, children, actions, className = '' }) {
  return (
    <div
      className={`relative mb-8 overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-6 shadow-sm shadow-blue-100/70 backdrop-blur ${className}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-sky-50/80" />
      <div className="pointer-events-none absolute -right-10 -top-12 h-36 w-36 rounded-full bg-blue-200/30 blur-2xl" />
      <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200/80 bg-white/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-700 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Dashboard
          </div>
          <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            <span className="bg-gradient-to-r from-slate-950 via-indigo-900 to-blue-700 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          {subtitle && (
            <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base">
              {subtitle}
            </p>
          )}
          {children && <div className="mt-3">{children}</div>}
        </div>
        {actions && <div className="flex flex-wrap gap-2 lg:justify-end">{actions}</div>}
      </div>
    </div>
  )
}
