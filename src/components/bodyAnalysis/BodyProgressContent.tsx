import { useMemo } from 'react'
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Button } from '../Button'
import { Card } from '../Card'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '../Table'
import { BodyAssessmentRecord, BodyProgressResponse } from '../../types'
import {
  formatMetricValue,
  lastCalendarMonthBuckets,
  METRIC_LABELS,
  metricValueInMonth,
  PROGRESS_CHART_METRICS,
  PROGRESS_MONTH_COUNT,
  PROGRESS_TABLE_METRICS,
} from '../../utils/bodyMetrics'

interface BodyProgressContentProps {
  progress: BodyProgressResponse | null
  history: BodyAssessmentRecord[]
  onOpenAssessment?: (assessmentId: number) => void
}

export function BodyProgressContent({
  progress,
  history,
  onOpenAssessment,
}: BodyProgressContentProps) {
  const monthBuckets = useMemo(() => lastCalendarMonthBuckets(PROGRESS_MONTH_COUNT), [])

  const chartData = useMemo(() => {
    return history
      .slice()
      .sort((a, b) => a.assessed_on.localeCompare(b.assessed_on))
      .map((row) => {
        const point: Record<string, string | number> = { date: row.assessed_on }
        for (const key of PROGRESS_CHART_METRICS) {
          const metric = row.metrics.find((m) => m.metric_key === key)
          if (metric) point[key] = metric.value
        }
        return point
      })
  }, [history])

  return (
    <div className="space-y-6">
      <p className="text-sm text-text-secondary">Rolling view of the last {PROGRESS_MONTH_COUNT} calendar months.</p>

      <Card className="p-4 sm:p-5 overflow-hidden">
        <h2 className="text-base font-semibold text-text-secondary mb-2">Month-by-month comparison</h2>
        <p className="text-sm text-text-secondary mb-4">
          Latest assessment in each calendar month (— if none recorded that month).
        </p>
        <div className="overflow-x-auto">
          <Table frozenColumnCount={1}>
            <TableHeader>
              <TableHeaderCell>Metric</TableHeaderCell>
              {monthBuckets.map((b) => (
                <TableHeaderCell key={b.key}>{b.label}</TableHeaderCell>
              ))}
            </TableHeader>
            <TableBody>
              {PROGRESS_TABLE_METRICS.map((metricKey) => (
                <TableRow key={metricKey}>
                  <TableCell>{METRIC_LABELS[metricKey] || metricKey}</TableCell>
                  {monthBuckets.map((b) => {
                    const val = metricValueInMonth(history, b.key, metricKey)
                    return (
                      <TableCell key={b.key}>
                        {val != null ? formatMetricValue(metricKey, val) : '—'}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {progress && (
        <Card className="p-4 sm:p-5">
          <h2 className="text-base font-semibold text-text-secondary mb-2">Change over period</h2>
          <p className="text-sm text-text-secondary mb-4">
            {progress.baseline_assessed_on && progress.latest_assessed_on
              ? `From ${progress.baseline_assessed_on} to ${progress.latest_assessed_on}`
              : 'Record at least two assessments in this period to see change.'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {progress.changes.map((row) => (
              <div key={row.metric_key} className="rounded-lg border border-border-light p-3">
                <p className="text-xs text-text-secondary">{METRIC_LABELS[row.metric_key] || row.metric_key}</p>
                <p className="text-lg font-semibold mt-1">
                  {row.latest_value != null ? formatMetricValue(row.metric_key, row.latest_value) : '—'}
                </p>
                {row.change_label ? (
                  <p className="text-sm mt-1 text-text-secondary">{row.change_label}</p>
                ) : (
                  <p className="text-sm text-text-secondary mt-1">Not enough data</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {chartData.length > 1 && (
        <Card className="p-4 sm:p-5">
          <h2 className="text-base font-semibold text-text-secondary mb-4">Trend</h2>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} width={40} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="weight_kg" name="Weight (kg)" stroke="#c9a227" dot={false} />
                <Line type="monotone" dataKey="body_fat_pct" name="Body fat %" stroke="#60a5fa" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      <Card className="p-4 sm:p-5">
        <h2 className="text-base font-semibold text-text-secondary mb-3">Assessment history</h2>
        {history.length === 0 ? (
          <p className="text-sm text-text-secondary">No assessments yet.</p>
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
                {onOpenAssessment ? (
                  <Button size="sm" variant="secondary" onClick={() => onOpenAssessment(item.id)}>
                    View
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
