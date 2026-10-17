import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../services/auth'
import { Card } from '../../components/Card'
import GymTabletShell from '../../layouts/GymTabletShell'
import { BodyAssessmentDetailContent } from '../../components/bodyAnalysis/BodyAssessmentDetailContent'
import { gymService } from '../../services/gymService'
import { BodyAssessmentRecord } from '../../types'
import { bodyAnalysisPaths } from '../../utils/bodyAnalysisPaths'
import { ApiErrorHandler } from '../../api/errors'

export default function GymAssessmentDetail() {
  const { memberId, assessmentId } = useParams()
  const navigate = useNavigate()
  const mid = Number(memberId)
  const aid = Number(assessmentId)
  const paths = bodyAnalysisPaths(mid, 'gym')
  const [record, setRecord] = useState<BodyAssessmentRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessGymTablet()) {
      navigate('/login')
      return
    }
    if (!aid || Number.isNaN(aid)) {
      navigate(paths.memberDetails)
      return
    }
    void gymService
      .getBodyAssessment(aid)
      .then((res) => setRecord(res.data))
      .catch((err) => setError(ApiErrorHandler.parse(err).message))
  }, [aid, navigate, paths.memberDetails])

  return (
    <GymTabletShell
      title="Assessment detail"
      subtitle={record ? record.assessed_on : ''}
      backTo={paths.memberDetails}
    >
      {error ? (
        <Card className="p-5"><p className="text-red-500">{error}</p></Card>
      ) : !record ? (
        <p className="text-text-secondary">Loading...</p>
      ) : (
        <Card className="p-4 sm:p-5">
          <BodyAssessmentDetailContent record={record} />
        </Card>
      )}
    </GymTabletShell>
  )
}
