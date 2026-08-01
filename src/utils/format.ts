export function formatNumber(value: number): string {
  return value.toLocaleString('en-IN')
}

export function formatCurrency(value: number): string {
  const hasFraction = Math.abs(value % 1) > Number.EPSILON
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  })}`
}

export function formatPlanDurationSuffix(durationLabel: string): string {
  const normalized = durationLabel.trim().toLowerCase()
  if (normalized === '1 month' || normalized === '1month') {
    return '/ Month'
  }

  return `/ ${durationLabel.trim()}`
}

export function formatMembershipPlanName(planLabel: string | null | undefined): string {
  if (!planLabel) {
    return ''
  }

  // Strip trailing duration labels like " - 3 Months" while preserving named variants like " - Prime".
  return planLabel.replace(/\s*-\s*\d+\s*(day|days|month|months|year|years)\s*$/i, '').trim()
}

export function toTitleCase(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}
