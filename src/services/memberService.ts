import { httpClient } from '../api/http-client'
import { MemberBodyAssessmentDetail, MemberBodyAssessmentSummary } from '../types'

export const memberService = {
  listBodyAssessments: () =>
    httpClient.get<{ message: string; data: MemberBodyAssessmentSummary[] }>(
      '/member/body-assessments'
    ),

  getBodyAssessment: (assessmentId: number) =>
    httpClient.get<{ message: string; data: MemberBodyAssessmentDetail }>(
      `/member/body-assessments/${assessmentId}`
    ),
}
