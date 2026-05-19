/** Match backend excel_fields.py — NA means not applicable for optional inputs. */
const NA_PATTERN = /^(na|n\/a|n\.a\.|none|nil|-|not applicable|not available)$/i

export function isNaValue(value) {
  const s = String(value ?? '').trim()
  return s !== '' && NA_PATTERN.test(s)
}

export function normalizeOptionalField(value) {
  const s = String(value ?? '').trim()
  if (!s || isNaValue(s)) return ''
  return s
}

/** Device brand: empty/NA allowed; backend stores N/A. */
export function normalizeBrandForSubmit(value) {
  const s = normalizeOptionalField(value)
  return s || 'N/A'
}
