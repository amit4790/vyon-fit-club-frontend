import React, { useEffect, useState } from 'react'
import { Button } from '../Button'
import { Input, Select } from '../Input'
import { gymService, LAST_TRAINER_STORAGE_KEY } from '../../services/gymService'
import { GymTrainerOption } from '../../types'
import { ApiErrorHandler } from '../../api/errors'
import {
  buildMetricsPayload,
  CIRCUMFERENCE_METRIC_FIELDS,
  draftStorageKey,
  MACHINE_METRIC_FIELDS,
} from '../../utils/bodyMetrics'

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface DraftState {
  conductedBy: string
  assessedOn: string
  assessmentType: string
  deviceName: string
  metricValues: Record<string, string>
  primaryGoal: string
  observations: string
  medicalHistory: string
  nextDate: string
}

interface BodyAssessmentFormProps {
  memberId: number
  memberName: string
  onCancel: () => void
  onComplete: () => void
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border-light bg-bg-card p-4 sm:p-5 space-y-4">
      <h2 className="text-base font-semibold text-text-secondary">{title}</h2>
      {children}
    </section>
  )
}

export function BodyAssessmentForm({
  memberId,
  memberName,
  onCancel,
  onComplete,
}: BodyAssessmentFormProps) {
  const [trainers, setTrainers] = useState<GymTrainerOption[]>([])
  const [conductedBy, setConductedBy] = useState('')
  const [assessedOn, setAssessedOn] = useState(todayIso())
  const [assessmentType, setAssessmentType] = useState('monthly_review')
  const [deviceName, setDeviceName] = useState('')
  const [metricValues, setMetricValues] = useState<Record<string, string>>({})
  const [primaryGoal, setPrimaryGoal] = useState('')
  const [observations, setObservations] = useState('')
  const [medicalHistory, setMedicalHistory] = useState('')
  const [nextDate, setNextDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)

  useEffect(() => {
    void gymService
      .getTrainers()
      .then((res) => {
        setTrainers(res.data || [])
        const saved = localStorage.getItem(LAST_TRAINER_STORAGE_KEY)
        if (saved && res.data?.some((t) => String(t.id) === saved)) {
          setConductedBy(saved)
        }
      })
      .catch((err) => setError(ApiErrorHandler.parse(err).message))

    const raw = localStorage.getItem(draftStorageKey(memberId))
    if (!raw) return
    try {
      const draft = JSON.parse(raw) as DraftState
      setConductedBy(draft.conductedBy || '')
      setAssessedOn(draft.assessedOn || todayIso())
      setAssessmentType(draft.assessmentType || 'monthly_review')
      setDeviceName(draft.deviceName || '')
      setMetricValues(draft.metricValues || {})
      setPrimaryGoal(draft.primaryGoal || '')
      setObservations(draft.observations || '')
      setMedicalHistory(draft.medicalHistory || (draft as { focusNext?: string }).focusNext || '')
      setNextDate(draft.nextDate || '')
    } catch {
      /* ignore corrupt draft */
    }
  }, [memberId])

  const setMetric = (key: string, value: string) => {
    setMetricValues((prev) => ({ ...prev, [key]: value }))
  }

  const saveDraft = () => {
    const payload: DraftState = {
      conductedBy,
      assessedOn,
      assessmentType,
      deviceName,
      metricValues,
      primaryGoal,
      observations,
      medicalHistory,
      nextDate,
    }
    localStorage.setItem(draftStorageKey(memberId), JSON.stringify(payload))
    setDraftSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
  }

  const completeAssessment = async () => {
    if (!conductedBy) {
      setError('Select the trainer conducting this assessment.')
      return
    }
    const metrics = buildMetricsPayload(metricValues)
    if (!metrics.some((m) => m.metric_key === 'weight_kg')) {
      setError('Weight (kg) is required.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)
      localStorage.setItem(LAST_TRAINER_STORAGE_KEY, conductedBy)
      await gymService.createBodyAssessment(memberId, {
        conducted_by_trainer_id: Number(conductedBy),
        assessed_on: assessedOn,
        assessment_type: assessmentType as 'initial' | 'monthly_review' | 'follow_up' | 'other',
        device_name: deviceName || null,
        measurement_method: deviceName ? 'Body composition machine' : null,
        primary_goal: primaryGoal || null,
        trainer_observations: observations || null,
        medical_history: medicalHistory || null,
        next_assessment_date: nextDate || null,
        metrics,
      })
      localStorage.removeItem(draftStorageKey(memberId))
      onComplete()
    } catch (err: any) {
      setError(ApiErrorHandler.parse(err).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6 pb-28">
      <p className="text-sm text-text-secondary">
        Member: <span className="text-text-primary font-medium">{memberName}</span> (ID {memberId})
      </p>
      {error ? <p className="text-red-500 text-sm">{error}</p> : null}

      <Section title="Assessment details">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Select
            label="Conducted by *"
            value={conductedBy}
            options={[
              { value: '', label: 'Select trainer' },
              ...trainers.map((t) => ({ value: String(t.id), label: t.full_name })),
            ]}
            onChange={(e) => setConductedBy(e.target.value)}
          />
          <Input label="Assessment date *" type="date" value={assessedOn} onChange={(e) => setAssessedOn(e.target.value)} />
          <Select
            label="Assessment type"
            value={assessmentType}
            options={[
              { value: 'initial', label: 'Initial assessment' },
              { value: 'monthly_review', label: 'Monthly review' },
              { value: 'follow_up', label: 'Follow-up' },
              { value: 'other', label: 'Other' },
            ]}
            onChange={(e) => setAssessmentType(e.target.value)}
          />
          <Input
            label="Machine / device"
            value={deviceName}
            onChange={(e) => setDeviceName(e.target.value)}
            placeholder="e.g. in-club composition scale"
          />
        </div>
      </Section>

      <Section title="Body composition (machine)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MACHINE_METRIC_FIELDS.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              type="number"
              step="0.1"
              value={metricValues[field.key] || ''}
              onChange={(e) => setMetric(field.key, e.target.value)}
            />
          ))}
        </div>
      </Section>

      <Section title="Circumference measurements (manual)">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {CIRCUMFERENCE_METRIC_FIELDS.map((field) => (
            <Input
              key={field.key}
              label={field.label}
              type="number"
              step="0.1"
              value={metricValues[field.key] || ''}
              onChange={(e) => setMetric(field.key, e.target.value)}
            />
          ))}
        </div>
      </Section>

      <Section title="Trainer notes & goals">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input label="Primary goal" value={primaryGoal} onChange={(e) => setPrimaryGoal(e.target.value)} />
          <Input label="Next assessment date" type="date" value={nextDate} onChange={(e) => setNextDate(e.target.value)} />
        </div>
        <label className="block text-sm text-text-secondary">Observations</label>
        <textarea
          className="input-base w-full min-h-[6rem]"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
        />
        <label className="block text-sm text-text-secondary">Medical history</label>
        <textarea
          className="input-base w-full min-h-[6rem]"
          value={medicalHistory}
          onChange={(e) => setMedicalHistory(e.target.value)}
          placeholder="Injuries, conditions, medications, or restrictions relevant to training"
        />
      </Section>

      <div
        className="fixed bottom-0 left-0 right-0 z-40 border-t border-border-light bg-bg-card/95 backdrop-blur px-4 py-3 sm:px-6"
      >
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-text-secondary">
            {draftSavedAt ? `Draft saved at ${draftSavedAt} (this device only)` : 'Save a draft to continue later on this device.'}
          </p>
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="secondary" onClick={onCancel}>Cancel</Button>
            <Button variant="secondary" onClick={saveDraft}>Save draft</Button>
            <Button isLoading={isSubmitting} onClick={() => void completeAssessment()}>
              Complete assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
