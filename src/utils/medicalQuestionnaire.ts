import { MedicalQuestionnaireRecord } from '../types'

export type MedicalConditionKey =
  | 'none'
  | 'high_bp'
  | 'diabetes'
  | 'heart'
  | 'asthma'
  | 'thyroid'
  | 'other'

export type InjuryPainKey = 'no' | 'back_neck' | 'knee' | 'shoulder' | 'other'

export type FitnessGoalKey =
  | 'weight_loss'
  | 'fat_loss'
  | 'muscle_gain'
  | 'strength'
  | 'general_fitness'
  | 'sports_performance'

export type WorkoutFrequencyKey = '2_3' | '4_5' | '6'
export type YesNoKey = 'no' | 'yes'

export type MedicalQuestionnaireFormState = {
  ageYears: string
  medicalConditions: MedicalConditionKey[]
  medicalConditionsOther: string
  injuryPain: InjuryPainKey[]
  injuryPainOther: string
  medicationSurgery: YesNoKey | ''
  medicationSurgeryDetails: string
  exerciseChestPain: YesNoKey | ''
  exerciseDoctorRestrict: YesNoKey | ''
  fitnessGoals: FitnessGoalKey[]
  priorGym: YesNoKey | ''
  workoutFrequency: WorkoutFrequencyKey | ''
  otherImportantInfo: string
  declarationAccepted: boolean
  clientSignature: string
}

export const MEDICAL_CONDITION_OPTIONS: { value: MedicalConditionKey; label: string }[] = [
  { value: 'none', label: 'None' },
  { value: 'high_bp', label: 'High BP' },
  { value: 'diabetes', label: 'Diabetes' },
  { value: 'heart', label: 'Heart problem' },
  { value: 'asthma', label: 'Asthma' },
  { value: 'thyroid', label: 'Thyroid' },
  { value: 'other', label: 'Other' },
]

export const INJURY_PAIN_OPTIONS: { value: InjuryPainKey; label: string }[] = [
  { value: 'no', label: 'No' },
  { value: 'back_neck', label: 'Back / neck' },
  { value: 'knee', label: 'Knee' },
  { value: 'shoulder', label: 'Shoulder' },
  { value: 'other', label: 'Other' },
]

export const FITNESS_GOAL_OPTIONS: { value: FitnessGoalKey; label: string }[] = [
  { value: 'weight_loss', label: 'Weight loss' },
  { value: 'fat_loss', label: 'Fat loss' },
  { value: 'muscle_gain', label: 'Muscle gain' },
  { value: 'strength', label: 'Strength' },
  { value: 'general_fitness', label: 'General fitness' },
  { value: 'sports_performance', label: 'Sports performance' },
]

export const WORKOUT_FREQUENCY_OPTIONS: { value: WorkoutFrequencyKey; label: string }[] = [
  { value: '2_3', label: '2–3 days / week' },
  { value: '4_5', label: '4–5 days / week' },
  { value: '6', label: '6 days / week' },
]

export function emptyMedicalQuestionnaireForm(): MedicalQuestionnaireFormState {
  return {
    ageYears: '',
    medicalConditions: [],
    medicalConditionsOther: '',
    injuryPain: [],
    injuryPainOther: '',
    medicationSurgery: '',
    medicationSurgeryDetails: '',
    exerciseChestPain: '',
    exerciseDoctorRestrict: '',
    fitnessGoals: [],
    priorGym: '',
    workoutFrequency: '',
    otherImportantInfo: '',
    declarationAccepted: false,
    clientSignature: '',
  }
}

export function ageFromDateOfBirth(dob: string, asOfIso: string): number | null {
  const d = new Date(`${dob}T12:00:00`)
  const asOf = new Date(`${asOfIso}T12:00:00`)
  if (Number.isNaN(d.getTime()) || Number.isNaN(asOf.getTime())) return null
  let years = asOf.getFullYear() - d.getFullYear()
  const beforeBirthday =
    asOf.getMonth() < d.getMonth() ||
    (asOf.getMonth() === d.getMonth() && asOf.getDate() < d.getDate())
  if (beforeBirthday) years -= 1
  return years >= 0 ? years : null
}

export function questionnaireFromRecord(
  record: MedicalQuestionnaireRecord | null | undefined
): MedicalQuestionnaireFormState {
  if (!record) return emptyMedicalQuestionnaireForm()
  return {
    ageYears: record.age_years != null ? String(record.age_years) : '',
    medicalConditions: (record.medical_conditions || []) as MedicalConditionKey[],
    medicalConditionsOther: record.medical_conditions_other || '',
    injuryPain: (record.injury_pain || []) as InjuryPainKey[],
    injuryPainOther: record.injury_pain_other || '',
    medicationSurgery: record.medication_surgery || '',
    medicationSurgeryDetails: record.medication_surgery_details || '',
    exerciseChestPain: record.exercise_chest_pain || '',
    exerciseDoctorRestrict: record.exercise_doctor_restrict || '',
    fitnessGoals: (record.fitness_goals || []) as FitnessGoalKey[],
    priorGym: record.prior_gym || '',
    workoutFrequency: record.workout_frequency || '',
    otherImportantInfo: record.other_important_info || '',
    declarationAccepted: record.declaration_accepted ?? false,
    clientSignature: record.client_signature || '',
  }
}

export function fitnessGoalsToPrimaryGoal(goals: FitnessGoalKey[]): string | null {
  if (goals.length === 0) return null
  const labels = goals.map((g) => FITNESS_GOAL_OPTIONS.find((o) => o.value === g)?.label || g)
  return labels.join(', ')
}

export function buildMedicalQuestionnairePayload(
  form: MedicalQuestionnaireFormState,
  memberDateOfBirth: string | null | undefined,
  assessedOn: string
): MedicalQuestionnaireRecord {
  const ageFromProfile =
    memberDateOfBirth ? ageFromDateOfBirth(memberDateOfBirth, assessedOn) : null
  const parsedAge = parseInt(form.ageYears, 10)
  const ageYears =
    ageFromProfile != null
      ? ageFromProfile
      : Number.isNaN(parsedAge) ? null : parsedAge

  return {
    age_years: ageYears,
    medical_conditions: form.medicalConditions,
    medical_conditions_other: form.medicalConditionsOther.trim() || null,
    injury_pain: form.injuryPain,
    injury_pain_other: form.injuryPainOther.trim() || null,
    medication_surgery: form.medicationSurgery || null,
    medication_surgery_details: form.medicationSurgeryDetails.trim() || null,
    exercise_chest_pain: form.exerciseChestPain || null,
    exercise_doctor_restrict: form.exerciseDoctorRestrict || null,
    fitness_goals: form.fitnessGoals,
    prior_gym: form.priorGym || null,
    workout_frequency: form.workoutFrequency || null,
    other_important_info: form.otherImportantInfo.trim() || null,
    declaration_accepted: form.declarationAccepted,
    client_signature: form.clientSignature.trim() || null,
  }
}

export function validateMedicalQuestionnaireForm(
  form: MedicalQuestionnaireFormState,
  memberDateOfBirth: string | null | undefined,
  _assessedOn: string
): string | null {
  const hasDob = Boolean(memberDateOfBirth)
  if (!hasDob) {
    const age = parseInt(form.ageYears, 10)
    if (Number.isNaN(age) || age < 1 || age > 120) {
      return 'Enter member age (years) — date of birth is not on file.'
    }
  }

  if (form.medicalConditions.length === 0) {
    return 'Select at least one medical condition option (or None).'
  }
  if (form.medicalConditions.includes('none') && form.medicalConditions.length > 1) {
    return 'Medical conditions: choose None or specific conditions, not both.'
  }
  if (form.medicalConditions.includes('other') && !form.medicalConditionsOther.trim()) {
    return 'Describe the other medical condition.'
  }

  if (form.injuryPain.length === 0) {
    return 'Select injury / pain options (or No).'
  }
  if (form.injuryPain.includes('no') && form.injuryPain.length > 1) {
    return 'Injury / pain: choose No or specific areas, not both.'
  }
  if (form.injuryPain.includes('other') && !form.injuryPainOther.trim()) {
    return 'Describe the other injury / pain.'
  }

  if (!form.medicationSurgery) {
    return 'Answer medication / surgery question.'
  }
  if (form.medicationSurgery === 'yes' && !form.medicationSurgeryDetails.trim()) {
    return 'Add medication / surgery details.'
  }
  if (!form.exerciseChestPain || !form.exerciseDoctorRestrict) {
    return 'Answer both exercise safety questions.'
  }
  if (form.fitnessGoals.length === 0) {
    return 'Select at least one fitness goal.'
  }
  if (!form.declarationAccepted) {
    return 'Client declaration must be accepted.'
  }

  return null
}

export function formatQuestionnaireForDisplay(
  q: MedicalQuestionnaireRecord
): { label: string; value: string }[] {
  const lines: { label: string; value: string }[] = []
  if (q.age_years != null) lines.push({ label: 'Age (at assessment)', value: String(q.age_years) })

  const conditions = q.medical_conditions ?? []
  const condLabels = conditions.map(
    (c) =>
      MEDICAL_CONDITION_OPTIONS.find((o) => o.value === c)?.label ||
      c
  )
  if (condLabels.length) {
    lines.push({
      label: 'Medical conditions',
      value:
        conditions.includes('other') && q.medical_conditions_other
          ? `${condLabels.filter((l) => l !== 'Other').join(', ')}${condLabels.length ? ', ' : ''}Other: ${q.medical_conditions_other}`
          : condLabels.join(', '),
    })
  }

  const injuries = q.injury_pain ?? []
  const injuryLabels = injuries.map(
    (c) => INJURY_PAIN_OPTIONS.find((o) => o.value === c)?.label || c
  )
  if (injuryLabels.length) {
    lines.push({
      label: 'Injury / pain',
      value:
        injuries.includes('other') && q.injury_pain_other
          ? `${injuryLabels.join(', ')} — ${q.injury_pain_other}`
          : injuryLabels.join(', '),
    })
  }

  if (q.medication_surgery) {
    lines.push({
      label: 'Medication / surgery',
      value:
        q.medication_surgery === 'yes'
          ? `Yes — ${q.medication_surgery_details || ''}`
          : 'No',
    })
  }
  if (q.exercise_chest_pain) {
    lines.push({
      label: 'Chest pain / dizziness during exercise',
      value: q.exercise_chest_pain === 'yes' ? 'Yes' : 'No',
    })
  }
  if (q.exercise_doctor_restrict) {
    lines.push({
      label: 'Doctor advised restrict exercise',
      value: q.exercise_doctor_restrict === 'yes' ? 'Yes' : 'No',
    })
  }
  if (q.fitness_goals?.length) {
    lines.push({
      label: 'Fitness goals',
      value: q.fitness_goals
        .map((g) => FITNESS_GOAL_OPTIONS.find((o) => o.value === g)?.label || g)
        .join(', '),
    })
  }
  if (q.prior_gym) {
    lines.push({ label: 'Previous gym experience', value: q.prior_gym === 'yes' ? 'Yes' : 'No' })
  }
  if (q.workout_frequency) {
    const freq = WORKOUT_FREQUENCY_OPTIONS.find((o) => o.value === q.workout_frequency)?.label
    if (freq) lines.push({ label: 'Workout frequency', value: freq })
  }
  if (q.other_important_info) {
    lines.push({ label: 'Other information', value: q.other_important_info })
  }
  if (q.client_signature) {
    lines.push({ label: 'Client signature', value: q.client_signature })
  }
  return lines
}
