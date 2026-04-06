/**
 * Client-side export helpers (CSV + JSON) for admin dashboards.
 */

function escapeCsvCell(value) {
  if (value === null || value === undefined) return ''
  const s = String(value)
  if (/[",\r\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`
  return s
}

/**
 * @param {string[]} headers
 * @param {Record<string, unknown>[]} rows - objects with keys matching headers
 */
export function rowsToCsv(headers, rows) {
  const lines = [headers.map(escapeCsvCell).join(',')]
  for (const row of rows) {
    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(','))
  }
  return lines.join('\r\n')
}

export function downloadBlob(content, filename, mimeType) {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export function downloadCsv(filename, headers, rows) {
  const csv = rowsToCsv(headers, rows)
  downloadBlob(csv, filename, 'text/csv;charset=utf-8')
}

export function downloadJson(filename, data) {
  const str = JSON.stringify(data, null, 2)
  downloadBlob(str, filename, 'application/json')
}
