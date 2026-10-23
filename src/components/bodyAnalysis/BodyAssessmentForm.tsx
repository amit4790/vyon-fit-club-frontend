import React, { useEffect, useState } from 'react'
import { Button } from '../Button'
import { Input, Select } from '../Input'
import { gymService, LAST_TRAINER_STORAGE_KEY } from '../../services/gymService'
import { GymTrainerOption } from '../../types'
import { ApiErrorHandler } from '../../api/errors'
import {
  buildMetricsPayload,
  calculateBmi,
  CIRCUMFERENCE_METRIC_FIELDS,
  draftStorageKey,
  MACHINE_CORE_FIELDS,
  MACHINE_EXTRA_FIELDS,
  prefillMetricsFromLatest,
} from '../../utils/bodyMetrics'
import { MedicalFitnessQuestionnaire } from './MedicalFitnessQuestionnaire'
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
  deviceName: string
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
  const [deviceName, setDeviceName] = useState('')
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
      setDeviceName(draft.deviceName || '')
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

      setMetricValues((prev) => prefillMetricsFromLatest(prev, history))
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
    setMetricValues((prev) => ({ ...prev, [key]: value }))
  }

  const saveDraft = () => {
    const payload: DraftState = {
      conductedBy,
      assessedOn,
      assessmentType,
      deviceName,
      metricValues,
      observations,
      questionnaire,
      nextDate,
      bmiSource,
    }
    localStorage.setItem(draftStorageKey(memberId), JSON.stringify(payload))
    setDraftSavedAt(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))
  }

  const weightNum = parseFloat(metricValues.weight_kg || '')
  const heightNum = parseFloat(metricValues.height_cm || '')
  const calculatedBmi = calculateBmi(
    Number.isNaN(weightNum) ? null : weightNum,
    Number.isNaN(heightNum) ? null : heightNum
  )
  const canCalculateBmi = calculatedBmi != null

  const handleCalculateBmi = () => {
    if (calculatedBmi == null) return
    setMetric('bmi', String(calculatedBmi))
    setBmiSource('calculated')
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
        primary_goal: primaryGoal,
        trainer_observations: observations || null,
        medical_history: questionnaire.otherImportantInfo || null,
        medical_questionnaire: medicalQuestionnaire,
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

      <Section title="Body composition (machine)">
        <p className="text-xs text-text-secondary -mt-1 mb-2">
          Empty fields are prefilled from the last assessment. Change only what is different today.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {MACHINE_CORE_FIELDS.map((field) => (
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
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <Input
              label="BMI"
              type="number"
              step="0.1"
              value={metricValues.bmi || ''}
              onChange={(e) => {
                setBmiSource('manual')
                setMetric('bmi', e.target.value)
              }}
              placeholder="Use Calculate or enter from machine"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            className="shrink-0 sm:mb-0.5"
            disabled={!canCalculateBmi}
            onClick={handleCalculateBmi}
          >
            Calculate BMI
          </Button>
        </div>
        <p className="text-xs text-text-secondary -mt-1">
          Calculate uses weight and height. You can edit this value to match the machine reading.
        </p>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
          {MACHINE_EXTRA_FIELDS.map((field) => (
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
        <p className="text-xs text-text-secondary -mt-1 mb-2">
          Also prefilled from the last assessment when blank.
        </p>
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
