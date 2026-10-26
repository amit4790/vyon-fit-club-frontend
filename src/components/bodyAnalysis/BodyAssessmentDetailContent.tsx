import { BodyAssessmentRecord } from '../../types'
import { MedicalQuestionnaireDetail } from './MedicalQuestionnaireDetail'
import {
  CIRCUMFERENCE_METRIC_FIELDS,
  formatMetricValue,
  MACHINE_METRIC_FIELDS,
  METRIC_LABELS,
} from '../../utils/bodyMetrics'

function MetricGrid({ keys, record }: { keys: readonly { key: string }[]; record: BodyAssessmentRecord }) {
  const map = new Map(record.metrics.map((m) => [m.metric_key, m.value]))
  const targets = record.metric_targets || {}
  const visible = keys.filter((k) => map.has(k.key) || targets[k.key] != null)
  if (visible.length === 0) {
    return <p className="text-sm text-text-secondary">No readings recorded in this section.</p>
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {visible.map((field) => {
        const current = map.get(field.key)
        const target = targets[field.key]
        return (
          <div key={field.key} className="rounded-lg border border-border-light p-3">
            <p className="text-xs text-text-secondary">{METRIC_LABELS[field.key] || field.key}</p>
            {current != null ? (
              <p className="font-semibold">
                <span className="text-text-secondary text-xs font-normal">Current </span>
                {formatMetricValue(field.key, current)}
              </p>
            ) : null}
            {target != null ? (
              <p className="font-semibold text-primary mt-1">
                <span className="text-text-secondary text-xs font-normal">Target </span>
                {formatMetricValue(field.key, target)}
              </p>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

const BODY_COMPOSITION_KEYS = [...MACHINE_METRIC_FIELDS, { key: 'bmi' }] as const

export function BodyAssessmentDetailContent({ record }: { record: BodyAssessmentRecord }) {
  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">
        {record.assessed_on} · {record.conducted_by_trainer_name || `Trainer #${record.conducted_by_trainer_id}`}
      </p>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-text-secondary">Body composition</h2>
        <MetricGrid keys={BODY_COMPOSITION_KEYS} record={record} />
      </section>

      <section className="space-y-3">
        <h2 className="text-base font-semibold text-text-secondary">Circumference</h2>
        <MetricGrid keys={CIRCUMFERENCE_METRIC_FIELDS} record={record} />
      </section>

      {record.medical_questionnaire ? (
        <MedicalQuestionnaireDetail questionnaire={record.medical_questionnaire} />
      ) : record.medical_history ? (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text-secondary">Medical history (legacy)</h2>
          <p className="text-sm whitespace-pre-wrap">{record.medical_history}</p>
        </section>
      ) : null}

      {(record.primary_goal || record.trainer_observations || record.next_assessment_date) && (
        <section className="space-y-3">
          <h2 className="text-base font-semibold text-text-secondary">Trainer notes</h2>
          {record.primary_goal ? (
            <p><span className="text-text-secondary">Goals:</span> {record.primary_goal}</p>
          ) : null}
          {record.trainer_observations ? (
            <p className="text-sm whitespace-pre-wrap">{record.trainer_observations}</p>
          ) : null}
          {record.next_assessment_date ? (
            <p className="text-sm text-text-secondary">Next assessment: {record.next_assessment_date}</p>
          ) : null}
        </section>
      )}
    </div>
  )
}
