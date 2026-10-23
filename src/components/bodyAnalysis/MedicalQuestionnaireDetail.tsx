import { MedicalQuestionnaireRecord } from '../../types'
import { formatQuestionnaireForDisplay } from '../../utils/medicalQuestionnaire'

export function MedicalQuestionnaireDetail({
  questionnaire,
}: {
  questionnaire: MedicalQuestionnaireRecord
}) {
  const rows = formatQuestionnaireForDisplay(questionnaire)
  if (rows.length === 0) return null

  return (
    <section className="space-y-3">
      <h2 className="text-base font-semibold text-text-secondary">Medical & fitness questionnaire</h2>
      <dl className="space-y-2 text-sm">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg border border-border-light p-3">
            <dt className="text-xs text-text-secondary">{row.label}</dt>
            <dd className="text-text-primary mt-1 whitespace-pre-wrap">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}
