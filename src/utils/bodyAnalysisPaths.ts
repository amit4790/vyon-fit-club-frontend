export type BodyAnalysisContext = 'admin' | 'gym'

export function bodyAnalysisPaths(memberId: number, context: BodyAnalysisContext) {
  if (context === 'admin') {
    return {
      memberDetails: `/admin/members/${memberId}`,
      newAssessment: `/admin/members/${memberId}/body-assessments/new`,
      progress: `/admin/members/${memberId}/body-analysis/progress`,
      assessmentDetail: (assessmentId: number) =>
        `/admin/members/${memberId}/body-assessments/${assessmentId}`,
    }
  }

  return {
    memberDetails: `/gym/members/${memberId}`,
    newAssessment: `/gym/members/${memberId}/assessments/new`,
    progress: `/gym/members/${memberId}/progress`,
    assessmentDetail: (assessmentId: number) =>
      `/gym/members/${memberId}/assessments/${assessmentId}`,
  }
}
