import { MemberBodyAssessmentDetail } from '../../types'
import {
  CIRCUMFERENCE_METRIC_FIELDS,
  formatMetricValue,
  MACHINE_METRIC_FIELDS,
  METRIC_LABELS,
} from '../../utils/bodyMetrics'

const BODY_COMPOSITION_ORDER = [
  ...MACHINE_METRIC_FIELDS.map((f) => f.key),
  'bmi',
] as const

function RecordedMetrics({
  title,
  orderedKeys,
  metrics,
}: {
  title: string
  orderedKeys: readonly string[]
  metrics: MemberBodyAssessmentDetail['metrics']
}) {
  const map = new Map(metrics.map((m) => [m.metric_key, m.value]))
  const visible = orderedKeys.filter((key) => map.has(key))
  if (visible.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {visible.map((key) => (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-3">
            <p className="text-xs text-gray-500">{METRIC_LABELS[key] || key}</p>
            <p className="font-semibold text-gray-900 mt-1">{formatMetricValue(key, map.get(key)!)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export function MemberBodyAssessmentDetailContent({ record }: { record: MemberBodyAssessmentDetail }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-600">
        Assessment date: <span className="font-medium text-gray-900">{record.assessed_on}</span>
      </p>

      {record.fitness_goals ? (
        <section className="space-y-2">
          <h2 className="text-base font-semibold text-gray-900">Fitness goals</h2>
          <p className="text-sm text-gray-800">{record.fitness_goals}</p>
        </section>
      ) : null}

      <RecordedMetrics
        title="Body composition"
        orderedKeys={BODY_COMPOSITION_ORDER}
        metrics={record.metrics}
      />

      <RecordedMetrics
        title="Other measurements"
        orderedKeys={CIRCUMFERENCE_METRIC_FIELDS.map((f) => f.key)}
        metrics={record.metrics}
      />

      {record.metrics.length === 0 && !record.fitness_goals ? (
        <p className="text-sm text-gray-500">No measurements recorded for this visit.</p>
      ) : null}
    </div>
  )
}
