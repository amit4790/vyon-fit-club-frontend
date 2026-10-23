import { Input } from '../Input'
import {
  FITNESS_GOAL_OPTIONS,
  INJURY_PAIN_OPTIONS,
  MEDICAL_CONDITION_OPTIONS,
  MedicalConditionKey,
  MedicalQuestionnaireFormState,
  InjuryPainKey,
  FitnessGoalKey,
  WORKOUT_FREQUENCY_OPTIONS,
  YesNoKey,
  WorkoutFrequencyKey,
  ageFromDateOfBirth,
} from '../../utils/medicalQuestionnaire'

function CheckboxGroup<T extends string>({
  options,
  selected,
  onChange,
  exclusiveNoneKey,
}: {
  options: { value: T; label: string }[]
  selected: T[]
  onChange: (next: T[]) => void
  exclusiveNoneKey?: T
}) {
  const toggle = (value: T) => {
    if (exclusiveNoneKey && value === exclusiveNoneKey) {
      onChange(selected.includes(value) ? [] : [value])
      return
    }
    const withoutExclusive = exclusiveNoneKey
      ? selected.filter((s) => s !== exclusiveNoneKey)
      : [...selected]
    if (withoutExclusive.includes(value)) {
      onChange(withoutExclusive.filter((s) => s !== value))
    } else {
      onChange([...withoutExclusive, value])
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = selected.includes(opt.value)
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={`min-h-[44px] px-3 py-2 rounded-lg border text-sm text-left transition-colors ${
              active
                ? 'border-primary bg-primary/20 text-text-primary'
                : 'border-border-light bg-bg-secondary/40 text-text-secondary hover:border-primary/50'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function YesNoRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: YesNoKey | ''
  onChange: (v: YesNoKey) => void
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm text-text-secondary">{label}</p>
      <div className="flex flex-wrap gap-2">
        {(['no', 'yes'] as YesNoKey[]).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={`min-h-[44px] px-4 rounded-lg border text-sm capitalize ${
              value === opt
                ? 'border-primary bg-primary/20'
                : 'border-border-light bg-bg-secondary/40'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

interface MedicalFitnessQuestionnaireProps {
  value: MedicalQuestionnaireFormState
  onChange: (next: MedicalQuestionnaireFormState) => void
  memberDateOfBirth?: string | null
  memberPhone?: string | null
  memberName: string
  assessedOn: string
}

export function MedicalFitnessQuestionnaire({
  value,
  onChange,
  memberDateOfBirth,
  memberPhone,
  memberName,
  assessedOn,
}: MedicalFitnessQuestionnaireProps) {
  const ageFromProfile = memberDateOfBirth
    ? ageFromDateOfBirth(memberDateOfBirth, assessedOn)
    : null

  const patch = (partial: Partial<MedicalQuestionnaireFormState>) => {
    onChange({ ...value, ...partial })
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border-light bg-bg-secondary/30 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-text-secondary text-xs">Member</p>
          <p className="font-medium text-text-primary">{memberName}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Assessment date</p>
          <p className="font-medium text-text-primary">{assessedOn}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs">Age</p>
          {ageFromProfile != null ? (
            <p className="font-medium text-text-primary">{ageFromProfile} years</p>
          ) : (
            <Input
              label=""
              type="number"
              min={1}
              max={120}
              placeholder="Years"
              value={value.ageYears}
              onChange={(e) => patch({ ageYears: e.target.value })}
            />
          )}
        </div>
        {memberPhone ? (
          <div>
            <p className="text-text-secondary text-xs">Contact</p>
            <p className="font-medium text-text-primary">{memberPhone}</p>
          </div>
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">1. Medical history</p>
        <p className="text-xs text-text-secondary">Do you have any of the following medical conditions?</p>
        <CheckboxGroup<MedicalConditionKey>
          options={MEDICAL_CONDITION_OPTIONS}
          selected={value.medicalConditions}
          exclusiveNoneKey="none"
          onChange={(medicalConditions) => patch({ medicalConditions })}
        />
        {value.medicalConditions.includes('other') ? (
          <Input
            label="Other condition"
            value={value.medicalConditionsOther}
            onChange={(e) => patch({ medicalConditionsOther: e.target.value })}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">2. Injury & pain</p>
        <p className="text-xs text-text-secondary">Any current injury or pain?</p>
        <CheckboxGroup<InjuryPainKey>
          options={INJURY_PAIN_OPTIONS}
          selected={value.injuryPain}
          exclusiveNoneKey="no"
          onChange={(injuryPain) => patch({ injuryPain })}
        />
        {value.injuryPain.includes('other') ? (
          <Input
            label="Other injury / pain"
            value={value.injuryPainOther}
            onChange={(e) => patch({ injuryPainOther: e.target.value })}
          />
        ) : null}
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-text-secondary">3. Medication & surgery</p>
        <p className="text-xs text-text-secondary">
          Currently taking medication or had major surgery?
        </p>
        <YesNoRow
          label=""
          value={value.medicationSurgery}
          onChange={(medicationSurgery) => patch({ medicationSurgery })}
        />
        {value.medicationSurgery === 'yes' ? (
          <textarea
            className="input-base w-full min-h-[4rem]"
            placeholder="Details"
            value={value.medicationSurgeryDetails}
            onChange={(e) => patch({ medicationSurgeryDetails: e.target.value })}
          />
        ) : null}
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium text-text-secondary">4. Exercise safety</p>
        <YesNoRow
          label="Chest pain, dizziness, or fainting during exercise?"
          value={value.exerciseChestPain}
          onChange={(exerciseChestPain) => patch({ exerciseChestPain })}
        />
        <YesNoRow
          label="Has a doctor advised you to avoid or restrict exercise?"
          value={value.exerciseDoctorRestrict}
          onChange={(exerciseDoctorRestrict) => patch({ exerciseDoctorRestrict })}
        />
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-text-secondary">5. Fitness goal</p>
        <CheckboxGroup<FitnessGoalKey>
          options={FITNESS_GOAL_OPTIONS}
          selected={value.fitnessGoals}
          onChange={(fitnessGoals) => patch({ fitnessGoals })}
        />
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium text-text-secondary">6. Training background</p>
        <YesNoRow
          label="Previous gym experience?"
          value={value.priorGym}
          onChange={(priorGym) => patch({ priorGym })}
        />
        <p className="text-xs text-text-secondary">Workout frequency</p>
        <div className="flex flex-wrap gap-2">
          {WORKOUT_FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => patch({ workoutFrequency: opt.value as WorkoutFrequencyKey })}
              className={`min-h-[44px] px-3 py-2 rounded-lg border text-sm ${
                value.workoutFrequency === opt.value
                  ? 'border-primary bg-primary/20'
                  : 'border-border-light bg-bg-secondary/40'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <label className="block text-sm text-text-secondary">Any other important information</label>
        <textarea
          className="input-base w-full min-h-[4rem]"
          value={value.otherImportantInfo}
          onChange={(e) => patch({ otherImportantInfo: e.target.value })}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border-light p-4 bg-bg-secondary/20">
        <p className="text-sm text-text-secondary">
          I confirm that the information provided above is correct. I agree to inform my trainer about
          any medical condition or change in my health.
        </p>
        <label className="flex items-start gap-3 cursor-pointer min-h-[44px]">
          <input
            type="checkbox"
            className="mt-1 h-5 w-5 rounded border-border-light"
            checked={value.declarationAccepted}
            onChange={(e) => patch({ declarationAccepted: e.target.checked })}
          />
          <span className="text-sm text-text-primary">Client accepts declaration</span>
        </label>
        <Input
          label="Client name (signature)"
          value={value.clientSignature}
          onChange={(e) => patch({ clientSignature: e.target.value })}
          placeholder="Type full name"
        />
      </div>
    </div>
  )
}
