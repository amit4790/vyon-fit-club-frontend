import { BodyAssessmentRecord } from '../types'

export const METRIC_LABELS: Record<string, string> = {
  weight_kg: 'Weight',
  height_cm: 'Height',
  bmi: 'BMI',
  body_fat_pct: 'Body fat',
  muscle_mass_kg: 'Muscle mass',
  bmr_kcal: 'BMR',
  waist_cm: 'Waist',
  chest_cm: 'Chest',
  upper_chest_cm: 'Upper chest',
  shoulders_cm: 'Shoulders',
  neck_cm: 'Neck',
  abdomen_cm: 'Abdomen',
  hips_cm: 'Hips',
  upper_arm_left_cm: 'Left upper arm',
  upper_arm_right_cm: 'Right upper arm',
  forearm_left_cm: 'Left forearm',
  forearm_right_cm: 'Right forearm',
  thigh_left_cm: 'Left thigh',
  thigh_right_cm: 'Right thigh',
  calf_left_cm: 'Left calf',
  calf_right_cm: 'Right calf',
}

export const MACHINE_METRIC_FIELDS = [
  { key: 'weight_kg', label: 'Weight (kg) *', required: true },
  { key: 'height_cm', label: 'Height (cm)' },
  { key: 'body_fat_pct', label: 'Body fat (%)' },
  { key: 'muscle_mass_kg', label: 'Muscle mass (kg)' },
  { key: 'bmr_kcal', label: 'BMR (kcal)' },
] as const

export const CIRCUMFERENCE_METRIC_FIELDS = [
  { key: 'chest_cm', label: 'Chest (cm)' },
  { key: 'upper_chest_cm', label: 'Upper chest (cm)' },
  { key: 'shoulders_cm', label: 'Shoulders (cm)' },
  { key: 'neck_cm', label: 'Neck (cm)' },
  { key: 'waist_cm', label: 'Waist (cm)' },
  { key: 'abdomen_cm', label: 'Abdomen (cm)' },
  { key: 'hips_cm', label: 'Hips (cm)' },
  { key: 'upper_arm_left_cm', label: 'Left upper arm (cm)' },
  { key: 'upper_arm_right_cm', label: 'Right upper arm (cm)' },
  { key: 'forearm_left_cm', label: 'Left forearm (cm)' },
  { key: 'forearm_right_cm', label: 'Right forearm (cm)' },
  { key: 'thigh_left_cm', label: 'Left thigh (cm)' },
  { key: 'thigh_right_cm', label: 'Right thigh (cm)' },
  { key: 'calf_left_cm', label: 'Left calf (cm)' },
  { key: 'calf_right_cm', label: 'Right calf (cm)' },
] as const

export const PROGRESS_CHART_METRICS = ['weight_kg', 'body_fat_pct', 'muscle_mass_kg', 'waist_cm'] as const

export const PROGRESS_MONTH_COUNT = 3

/** All metrics shown on the 3-month progress comparison table (rows always shown). */
export const PROGRESS_TABLE_METRICS = [
  'weight_kg',
  'height_cm',
  'body_fat_pct',
  'muscle_mass_kg',
  'bmr_kcal',
  'bmi',
  ...CIRCUMFERENCE_METRIC_FIELDS.map((f) => f.key),
] as const

export const LATEST_SUMMARY_METRICS = ['weight_kg', 'body_fat_pct', 'muscle_mass_kg', 'bmi'] as const

export function formatMetricValue(key: string, value: number): string {
  if (key === 'bmi') {
    return value.toFixed(1)
  }
  if (key === 'body_fat_pct') {
    return `${value.toFixed(1)}%`
  }
  if (key.endsWith('_cm')) {
    return `${value.toFixed(1)} cm`
  }
  if (key === 'bmr_kcal') {
    return `${Math.round(value)} kcal`
  }
  return `${value.toFixed(1)} kg`
}

export function buildMetricsPayload(
  values: Record<string, string>
): Array<{ metric_key: string; value: number; source: 'machine' | 'manual' }> {
  const machineKeys = new Set<string>(MACHINE_METRIC_FIELDS.map((f) => f.key))
  const metrics: Array<{ metric_key: string; value: number; source: 'machine' | 'manual' }> = []

  for (const [key, raw] of Object.entries(values)) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const num = parseFloat(trimmed)
    if (Number.isNaN(num)) continue
    metrics.push({
      metric_key: key,
      value: num,
      source: machineKeys.has(key) ? 'machine' : 'manual',
    })
  }

  return metrics
}

export interface MonthBucket {
  key: string
  label: string
}

export function lastCalendarMonthBuckets(count: number): MonthBucket[] {
  const buckets: MonthBucket[] = []
  const now = new Date()
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })
    buckets.push({ key, label })
  }
  return buckets
}

export function metricValueInMonth(
  assessments: BodyAssessmentRecord[],
  monthKey: string,
  metricKey: string
): number | null {
  const inMonth = assessments.filter((a) => a.assessed_on.startsWith(monthKey))
  if (inMonth.length === 0) return null
  const latest = inMonth.reduce((best, row) => (row.assessed_on > best.assessed_on ? row : best))
  const metric = latest.metrics.find((m) => m.metric_key === metricKey)
  return metric?.value ?? null
}

export function assessmentsForChart(
  assessments: BodyAssessmentRecord[],
  months: number
): BodyAssessmentRecord[] {
  const cutoff = new Date()
  cutoff.setMonth(cutoff.getMonth() - months)
  cutoff.setDate(1)
  const cutoffIso = cutoff.toISOString().slice(0, 10)
  return assessments
    .filter((a) => a.assessed_on >= cutoffIso)
    .sort((a, b) => a.assessed_on.localeCompare(b.assessed_on))
}

export function draftStorageKey(memberId: number): string {
  return `vyon:body-assessment-draft:${memberId}`
}
