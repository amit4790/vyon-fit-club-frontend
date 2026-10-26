import React, { useEffect, useState } from 'react'
import { Button } from '../Button'
import { Input, Select } from '../Input'
import { gymService, LAST_TRAINER_STORAGE_KEY } from '../../services/gymService'
import { GymTrainerOption } from '../../types'
import { ApiErrorHandler } from '../../api/errors'
import {
  buildMetricsPayload,
  buildTargetsPayload,
  CIRCUMFERENCE_METRIC_FIELDS,
  draftStorageKey,
  MACHINE_EXTRA_FIELDS,
  prefillMetricsFromLatest,
  prefillTargetsFromLatest,
} from '../../utils/bodyMetrics'
import { MedicalFitnessQuestionnaire } from './MedicalFitnessQuestionnaire'
import { MetricMeasurementTable } from './MetricCurrentTargetFields'
import {
  buildMedicalQuestionnairePayload,
  emptyMedicalQuestionnaireForm,
  fitnessGoalsToPrimaryGoal,
  MedicalQuestionnaireFormState,
  questionnaireFromRecord,
  validateMedicalQuestionnaireForm,
} from '../../utils/medicalQuestionnaire'

function todayIso(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

interface DraftState {
  conductedBy: string
  assessedOn: string
  assessmentType: string
  metricValues: Record<string, string>
  observations: string
  questionnaire: MedicalQuestionnaireFormState
  nextDate: string
  bmiSource?: 'calculated' | 'manual'
}

interface BodyAssessmentFormProps {
  memberId: number
  memberName: string
  memberDateOfBirth?: string | null
  memberPhone?: string | null
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
  memberDateOfBirth,
  memberPhone,
  onCancel,
  onComplete,
}: BodyAssessmentFormProps) {
  const [trainers, setTrainers] = useState<GymTrainerOption[]>([])
  const [conductedBy, setConductedBy] = useState('')
  const [assessedOn, setAssessedOn] = useState(todayIso())
  const [assessmentType, setAssessmentType] = useState('monthly_review')
  const [metricValues, setMetricValues] = useState<Record<string, string>>({})
  const [observations, setObservations] = useState('')
  const [questionnaire, setQuestionnaire] = useState<MedicalQuestionnaireFormState>(
    emptyMedicalQuestionnaireForm()
  )
  const [nextDate, setNextDate] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const [bmiSource, setBmiSource] = useState<'calculated' | 'manual'>('manual')

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
      setMetricValues(draft.metricValues || {})
      setObservations(draft.observations || '')
      if (draft.questionnaire) {
        setQuestionnaire(draft.questionnaire)
      } else {
        const legacyMedical = (draft as { medicalHistory?: string }).medicalHistory
        if (legacyMedical) {
          setQuestionnaire((q) => ({ ...q, otherImportantInfo: legacyMedical }))
        }
      }
      setNextDate(draft.nextDate || '')
      setBmiSource(draft.bmiSource === 'calculated' ? 'calculated' : 'manual')
    } catch {
      /* ignore corrupt draft */
    }
  }, [memberId])

  useEffect(() => {
    let cancelled = false
    void gymService.listBodyAssessments(memberId).then((res) => {
      if (cancelled) return
      const history = res.data || []
      if (history.length === 0) return

      setMetricValues((prev) => prefillTargetsFromLatest(prefillMetricsFromLatest(prev, history), history))
      const latest = history[0]
      if (latest?.medical_questionnaire) {
        const fromLatest = questionnaireFromRecord(latest.medical_questionnaire)
        fromLatest.declarationAccepted = false
        setQuestionnaire(fromLatest)
      }
    })
    return () => {
      cancelled = true
    }
  }, [memberId])

  const setMetric = (key: string, value: string) => {
    if (key === 'bmi') {
      setBmiSource('manual')
    }
    setMetricValues((prev) => ({ ...prev, [key]: value }))
  }

  const saveDraft = () => {
    const payload: DraftState = {
      conductedBy,
      assessedOn,
      assessmentType,
      metricValues,
      observations,
      questionnaire,
      nextDate,
      bmiSource,
    }
    localStorage.setItem(draftStorageKey(memberId), JSON.stringify(payload))
    setDraftSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
  }

  const completeAssessment = async () => {
    if (!conductedBy) {
      setError('Select the trainer conducting this assessment.')
      return
    }
    const metrics = buildMetricsPayload(metricValues, {
      bmiSource: metricValues.bmi?.trim() ? bmiSource : undefined,
    })
    if (!metrics.some((m) => m.metric_key === 'weight_kg')) {
      setError('Weight (kg) is required.')
      return
    }

    const questionnaireError = validateMedicalQuestionnaireForm(
      questionnaire,
      memberDateOfBirth,
      assessedOn
    )
    if (questionnaireError) {
      setError(questionnaireError)
      return
    }

    const medicalQuestionnaire = buildMedicalQuestionnairePayload(
      questionnaire,
      memberDateOfBirth,
      assessedOn
    )
    const primaryGoal = fitnessGoalsToPrimaryGoal(questionnaire.fitnessGoals)
    const metricTargets = buildTargetsPayload(metricValues)

    try {
      setIsSubmitting(true)
      setError(null)
      localStorage.setItem(LAST_TRAINER_STORAGE_KEY, conductedBy)
      await gymService.createBodyAssessment(memberId, {
        conducted_by_trainer_id: Number(conductedBy),
        assessed_on: assessedOn,
        assessment_type: assessmentType as 'initial' | 'monthly_review' | 'follow_up' | 'other',
        device_name: null,
        measurement_method: null,
        primary_goal: primaryGoal,
        trainer_observations: observations || null,
        medical_history: questionnaire.otherImportantInfo || null,
        medical_questionnaire: medicalQuestionnaire,
        metric_targets: metricTargets,
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

  const bodyCompositionRows = [
    { key: 'weight_kg', label: 'Weight (kg) *' },
    { key: 'height_cm', label: 'Height (cm)', targetDisabled: true },
    { key: 'bmi', label: 'BMI' },
    ...MACHINE_EXTRA_FIELDS.map((f) => ({ key: f.key, label: f.label })),
  ]

  return (
    <div className="space-y-6 pb-28">
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
        </div>
      </Section>

      <Section title="Medical & fitness questionnaire">
        <p className="text-xs text-text-secondary -mt-1">
          Matches the in-club intake form. Answers are saved with this assessment and prefilled from the
          last visit when starting a new one.
        </p>
        <MedicalFitnessQuestionnaire
          value={questionnaire}
          onChange={setQuestionnaire}
          memberName={memberName}
          memberDateOfBirth={memberDateOfBirth}
          memberPhone={memberPhone}
          assessedOn={assessedOn}
        />
      </Section>

      <Section title="Body composition">
        <p className="text-xs text-text-secondary -mt-1 mb-4">
          Current readings from the scale plus optional program targets. Empty fields are prefilled from the
          last assessment when you start a new one.
        </p>
        <MetricMeasurementTable rows={bodyCompositionRows} values={metricValues} onChange={setMetric} />
      </Section>

      <Section title="Circumference measurements (manual)">
        <p className="text-xs text-text-secondary -mt-1 mb-4">
          Tape measurements — current and optional target. Prefilled from the last assessment when blank.
        </p>
        <MetricMeasurementTable
          rows={CIRCUMFERENCE_METRIC_FIELDS.map((f) => ({ key: f.key, label: f.label }))}
          values={metricValues}
          onChange={setMetric}
        />
      </Section>

      <Section title="Trainer notes">
        <Input
          label="Next assessment date"
          type="date"
          value={nextDate}
          onChange={(e) => setNextDate(e.target.value)}
        />
        <label className="block text-sm text-text-secondary">Observations</label>
        <textarea
          className="input-base w-full min-h-[6rem]"
          value={observations}
          onChange={(e) => setObservations(e.target.value)}
          placeholder="Training notes for this session (optional)"
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
