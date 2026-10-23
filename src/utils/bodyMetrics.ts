import { BodyAssessmentRecord } from '../types'

export const METRIC_LABELS: Record<string, string> = {
  weight_kg: 'Weight',
  height_cm: 'Height',
  bmi: 'BMI',
  body_fat_pct: 'Body fat',
  visceral_fat_level: 'Visceral fat',
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

export const MACHINE_CORE_FIELDS = [
  { key: 'weight_kg', label: 'Weight (kg) *', required: true },
  { key: 'height_cm', label: 'Height (cm)' },
] as const

export const MACHINE_EXTRA_FIELDS = [
  { key: 'body_fat_pct', label: 'Body fat (%)' },
  { key: 'visceral_fat_level', label: 'Visceral fat (level)' },
  { key: 'muscle_mass_kg', label: 'Muscle mass (kg)' },
  { key: 'bmr_kcal', label: 'BMR (kcal)' },
] as const

/** All machine inputs (core + extra); used for payload source=machine and detail view. */
export const MACHINE_METRIC_FIELDS = [...MACHINE_CORE_FIELDS, ...MACHINE_EXTRA_FIELDS] as const

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
  'visceral_fat_level',
  'muscle_mass_kg',
  'bmr_kcal',
  'bmi',
  ...CIRCUMFERENCE_METRIC_FIELDS.map((f) => f.key),
] as const

export const LATEST_SUMMARY_METRICS = ['weight_kg', 'body_fat_pct', 'muscle_mass_kg', 'bmi'] as const

export function calculateBmi(weightKg: number | null, heightCm: number | null): number | null {
  if (weightKg == null || heightCm == null || heightCm <= 0) {
    return null
  }
  const heightM = heightCm / 100
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10
}

export function formatMetricValue(key: string, value: number): string {
  if (key === 'bmi') {
    return value.toFixed(1)
  }
  if (key === 'body_fat_pct') {
    return `${value.toFixed(1)}%`
  }
  if (key === 'visceral_fat_level') {
    return value % 1 === 0 ? String(Math.round(value)) : value.toFixed(1)
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
  values: Record<string, string>,
  options?: { bmiSource?: 'calculated' | 'manual' }
): Array<{ metric_key: string; value: number; source: 'machine' | 'manual' | 'calculated' }> {
  const machineKeys = new Set<string>(MACHINE_METRIC_FIELDS.map((f) => f.key))
  const metrics: Array<{ metric_key: string; value: number; source: 'machine' | 'manual' | 'calculated' }> = []

  for (const [key, raw] of Object.entries(values)) {
    const trimmed = raw.trim()
    if (!trimmed) continue
    const num = parseFloat(trimmed)
    if (Number.isNaN(num)) continue
    let source: 'machine' | 'manual' | 'calculated' = machineKeys.has(key) ? 'machine' : 'manual'
    if (key === 'bmi' && options?.bmiSource) {
      source = options.bmiSource
    }
    metrics.push({
      metric_key: key,
      value: num,
      source,
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

export function latestAssessmentRecord(
  assessments: BodyAssessmentRecord[]
): BodyAssessmentRecord | null {
  if (assessments.length === 0) {
    return null
  }
  return assessments
    .slice()
    .sort((a, b) => b.assessed_on.localeCompare(a.assessed_on) || b.id - a.id)[0]
}

/** Prefill empty metric fields from the most recent assessment. */
export function prefillMetricsFromLatest(
  current: Record<string, string>,
  assessments: BodyAssessmentRecord[]
): Record<string, string> {
  const latest = latestAssessmentRecord(assessments)
  if (!latest) {
    return current
  }
  const next = { ...current }
  let changed = false
  for (const metric of latest.metrics) {
    if (!next[metric.metric_key]?.trim()) {
      next[metric.metric_key] = String(metric.value)
      changed = true
    }
  }
  return changed ? next : current
}
