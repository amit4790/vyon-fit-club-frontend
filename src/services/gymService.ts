import { httpClient } from '../api/http-client'
import {
  BodyAnalysisOverview,
  BodyAssessmentRecord,
  BodyProgressResponse,
  GymTrainerOption,
  MedicalQuestionnaireRecord,
  MemberListApiResponse,
  MemberOperationApiResponse,
} from '../types'

export interface CreateBodyAssessmentPayload {
  conducted_by_trainer_id: number
  assessed_on: string
  assessment_type: 'initial' | 'monthly_review' | 'follow_up' | 'other'
  measurement_method?: string | null
  device_name?: string | null
  primary_goal?: string | null
  trainer_observations?: string | null
  medical_history?: string | null
  medical_questionnaire?: MedicalQuestionnaireRecord | null
  metric_targets?: Record<string, number> | null
  next_assessment_date?: string | null
  metrics: Array<{ metric_key: string; value: number; source?: 'machine' | 'manual' | 'calculated' }>
}

export const gymService = {
  getTrainers: () => httpClient.get<{ message: string; data: GymTrainerOption[] }>('/gym/trainers'),

  getMembers: (page: number, pageSize: number, search?: string) =>
    httpClient.get<MemberListApiResponse>('/gym/members', {
      params: { page, page_size: pageSize, search: search || undefined },
    }),

  getMember: (memberId: number) =>
    httpClient.get<MemberOperationApiResponse>(`/gym/members/${memberId}`),

  getBodyAnalysisOverview: (memberId: number) =>
    httpClient.get<BodyAnalysisOverview>(`/gym/members/${memberId}/body-analysis/overview`),

  listBodyAssessments: (memberId: number) =>
    httpClient.get<{ message: string; data: BodyAssessmentRecord[] }>(
      `/gym/members/${memberId}/body-assessments`
    ),

  getBodyProgress: (memberId: number, months = 3) =>
    httpClient.get<BodyProgressResponse>(`/gym/members/${memberId}/body-assessments/progress`, {
      params: { months },
    }),

  createBodyAssessment: (memberId: number, payload: CreateBodyAssessmentPayload) =>
    httpClient.post<{ message: string; data: BodyAssessmentRecord }>(
      `/gym/members/${memberId}/body-assessments`,
      payload
    ),

  getBodyAssessment: (assessmentId: number) =>
    httpClient.get<{ message: string; data: BodyAssessmentRecord }>(
      `/gym/body-assessments/${assessmentId}`
    ),
}

export const LAST_TRAINER_STORAGE_KEY = 'vyon:gym:last-trainer-id'
