import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../Button'
import { gymService } from '../../services/gymService'
import { BodyAnalysisOverview, BodyAssessmentRecord } from '../../types'
import { ApiErrorHandler } from '../../api/errors'
import { bodyAnalysisPaths, BodyAnalysisContext } from '../../utils/bodyAnalysisPaths'
import { formatMetricValue, LATEST_SUMMARY_METRICS, METRIC_LABELS } from '../../utils/bodyMetrics'

interface MemberBodyAnalysisSectionProps {
  memberId: number
  context: BodyAnalysisContext
}

export function MemberBodyAnalysisSection({ memberId, context }: MemberBodyAnalysisSectionProps) {
  const navigate = useNavigate()
  const paths = bodyAnalysisPaths(memberId, context)
  const [overview, setOverview] = useState<BodyAnalysisOverview | null>(null)
  const [history, setHistory] = useState<BodyAssessmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [overviewRes, historyRes] = await Promise.all([
        gymService.getBodyAnalysisOverview(memberId),
        gymService.listBodyAssessments(memberId),
      ])
      setOverview(overviewRes)
      setHistory(historyRes.data || [])
    } catch (err: any) {
      setError(ApiErrorHandler.parse(err).message)
    } finally {
      setIsLoading(false)
    }
  }, [memberId])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <>
      <div className="flex flex-wrap gap-2 mb-3">
        <Button size="sm" onClick={() => navigate(paths.newAssessment)}>New assessment</Button>
        <Button size="sm" variant="secondary" onClick={() => navigate(paths.progress)}>
          View progress
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading body analysis...</p>
      ) : error ? (
        <p className="text-sm text-red-500">{error}</p>
      ) : (
        <>
          <div className="flex flex-wrap justify-between gap-2 mb-3">
            <p className="text-sm text-text-secondary">
              {overview?.latest_assessed_on
                ? `Latest assessment · ${overview.latest_assessed_on}`
                : 'No assessments yet'}
            </p>
            <span className="text-xs rounded-full bg-bg-secondary px-3 py-1 border border-border-light">
              {overview?.assessment_count ?? 0} assessment(s)
            </span>
          </div>
          {overview && Object.keys(overview.latest_metrics).length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {LATEST_SUMMARY_METRICS
                .filter((key) => overview.latest_metrics[key] !== undefined)
                .map((key) => (
                  <div key={key} className="rounded-lg border border-border-light p-3 bg-bg-secondary/40">
                    <p className="text-xs text-text-secondary">{METRIC_LABELS[key] || key}</p>
                    <p className="text-lg font-semibold text-text-primary mt-1">
                      {formatMetricValue(key, overview.latest_metrics[key])}
                    </p>
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-sm text-text-secondary mb-4">No readings recorded yet.</p>
          )}
          {overview?.next_assessment_date ? (
            <p className="text-sm text-text-secondary mb-4">
              Next assessment due: {overview.next_assessment_date}
            </p>
          ) : null}

          {history.length === 0 ? (
            <p className="text-sm text-text-secondary">No completed assessments.</p>
          ) : (
            <ul className="divide-y divide-border-light">
              {history.map((item) => (
                <li key={item.id} className="py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-medium text-text-primary">{item.assessed_on}</p>
                    <p className="text-sm text-text-secondary">
                      {item.conducted_by_trainer_name || `Trainer #${item.conducted_by_trainer_id}`}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(paths.assessmentDetail(item.id))}
                  >
                    View
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  )
}
