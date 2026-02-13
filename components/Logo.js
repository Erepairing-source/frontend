/**
 * eRepairing logo – inline eR icon + eRepairing.com text.
 * Uses bg-gradient-hero; scales with className (e.g. h-8, h-10, h-12).
 */
export default function Logo({ className = '', size = 'default', ...rest }) {
  const isSmall = size === 'small' || className.includes('h-8') || className.includes('h-9')
  const isLarge = size === 'large' || className.includes('h-14') || className.includes('h-16')

  const iconSize = isSmall ? 'w-6 h-6' : isLarge ? 'w-10 h-10' : 'w-8 h-8'
  const textSize = isSmall ? 'text-base' : isLarge ? 'text-2xl' : 'text-xl'
  const iconTextSize = isSmall ? 'text-xs' : isLarge ? 'text-base' : 'text-sm'

  return (
    <span
      className={`inline-flex items-center gap-2 shrink-0 ${className}`}
      {...rest}
    >
      <div className={`${iconSize} bg-gradient-hero rounded-lg flex items-center justify-center shrink-0`}>
        <span className={`text-primary-foreground font-bold ${iconTextSize}`}>eR</span>
      </div>
      <span className={`${textSize} font-bold bg-gradient-hero bg-clip-text text-transparent whitespace-nowrap`}>
        eRepairing.com
      </span>
    </span>
  )
}

/** For use in tight spaces (e.g. favicon-style, small nav) – icon only. */
export function LogoIcon({ className = '', size = 40 }) {
  return (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      <div
        className="bg-gradient-hero rounded-lg flex items-center justify-center text-primary-foreground font-bold"
        style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
      >
        eR
      </div>
    </span>
  )
}
