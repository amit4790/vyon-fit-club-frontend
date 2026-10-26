export interface MetricRowDef {
  key: string
  label: string
  /** When false, the target cell is omitted (use sparingly). Default: show target column. */
  hasTarget?: boolean
  /** Target input shown but not editable (e.g. height). */
  targetDisabled?: boolean
}

function NumberCell({
  value,
  onChange,
  ariaLabel,
  disabled = false,
}: {
  value: string
  onChange: (value: string) => void
  ariaLabel: string
  disabled?: boolean
}) {
  return (
    <input
      type="number"
      step="0.1"
      aria-label={ariaLabel}
      disabled={disabled}
      className={`input-base w-full min-h-[44px] ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

export function MetricMeasurementTable({
  rows,
  values,
  onChange,
}: {
  rows: readonly MetricRowDef[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
}) {
  const showTargetColumn = rows.some((r) => r.hasTarget !== false)

  return (
    <div className="rounded-lg border border-border-light overflow-hidden">
      {showTargetColumn ? (
        <div
          className="hidden sm:grid sm:grid-cols-[minmax(0,1.4fr)_1fr_1fr] gap-3 px-4 py-3 bg-bg-secondary/50 border-b border-border-light text-xs font-semibold uppercase tracking-wide text-text-secondary"
        >
          <span>Measurement</span>
          <span>Current</span>
          <span>Target</span>
        </div>
      ) : null}

      <ul className="divide-y divide-border-light">
        {rows.map((field) => {
          const rowHasTarget = field.hasTarget !== false && showTargetColumn
          return (
            <li
              key={field.key}
              className={
                rowHasTarget
                  ? 'grid grid-cols-1 sm:grid-cols-[minmax(0,1.4fr)_1fr_1fr] gap-3 px-4 py-3 sm:items-center'
                  : 'grid grid-cols-1 sm:grid-cols-[minmax(0,1.4fr)_1fr] gap-3 px-4 py-3 sm:items-center'
              }
            >
              <p className="text-sm font-medium text-text-primary">{field.label}</p>
              <div className="space-y-1 sm:space-y-0">
                <p className="text-xs text-text-secondary sm:hidden">Current</p>
                <NumberCell
                  ariaLabel={`${field.label} current`}
                  value={values[field.key] || ''}
                  onChange={(v) => onChange(field.key, v)}
                />
              </div>
              {rowHasTarget ? (
                <div className="space-y-1 sm:space-y-0">
                  <p className="text-xs text-text-secondary sm:hidden">Target</p>
                  <NumberCell
                    ariaLabel={`${field.label} target`}
                    value={values[`target:${field.key}`] || ''}
                    onChange={(v) => onChange(`target:${field.key}`, v)}
                    disabled={field.targetDisabled === true}
                  />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/** @deprecated Use MetricMeasurementTable */
export function MetricCurrentTargetFields({
  fields,
  values,
  onChange,
  showTargets = true,
}: {
  fields: readonly MetricRowDef[]
  values: Record<string, string>
  onChange: (key: string, value: string) => void
  showTargets?: boolean
}) {
  const rows = fields.map((f) => ({
    ...f,
    hasTarget: showTargets,
  }))
  return <MetricMeasurementTable rows={rows} values={values} onChange={onChange} />
}
