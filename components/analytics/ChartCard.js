import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'

/**
 * Consistent card wrapper for Recharts (or any chart) blocks.
 */
export default function ChartCard({ title, subtitle, children, className = '', contentClassName = '' }) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}
