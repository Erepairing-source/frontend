/**
 * Simple row/column matrix table for heat-style admin views.
 * @param {{ rowKey: string, label: string }[]} rows
 * @param {{ colKey: string, label: string }[]} cols
 * @param {Record<string, Record<string, number|string>>} values - values[rowKey][colKey]
 */
export default function SimpleMatrix({ rows, cols, values, formatCell = (v) => v }) {
  if (!rows?.length || !cols?.length) {
    return <p className="text-sm text-gray-500">No matrix data</p>
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="text-left py-2 px-3 font-semibold text-gray-700 sticky left-0 bg-gray-50 z-10"> </th>
            {cols.map((c) => (
              <th key={c.colKey} className="text-center py-2 px-2 font-semibold text-gray-600 whitespace-nowrap">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.rowKey} className="border-b hover:bg-gray-50/80">
              <td className="py-2 px-3 font-medium text-gray-800 sticky left-0 bg-white z-10 whitespace-nowrap">
                {r.label}
              </td>
              {cols.map((c) => {
                const raw = values?.[r.rowKey]?.[c.colKey]
                const v = raw == null ? '—' : formatCell(raw, r.rowKey, c.colKey)
                return (
                  <td key={c.colKey} className="text-center py-2 px-2 text-gray-700">
                    {v}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
