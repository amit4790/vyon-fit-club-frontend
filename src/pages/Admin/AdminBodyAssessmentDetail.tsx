import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import AdminShell from '../../layouts/AdminShell'
import { BodyAssessmentDetailContent } from '../../components/bodyAnalysis/BodyAssessmentDetailContent'
import { gymService } from '../../services/gymService'
import { BodyAssessmentRecord } from '../../types'
import { bodyAnalysisPaths } from '../../utils/bodyAnalysisPaths'
import { ApiErrorHandler } from '../../api/errors'

export default function AdminBodyAssessmentDetail() {
  const { memberId, assessmentId } = useParams()
  const navigate = useNavigate()
  const mid = Number(memberId)
  const aid = Number(assessmentId)
  const paths = bodyAnalysisPaths(mid, 'admin')
  const [record, setRecord] = useState<BodyAssessmentRecord | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
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

  const userName = AuthService.getUserInfo()?.name || 'Admin'

  return (
    <AdminShell
      title="Assessment detail"
      subtitle={record?.assessed_on || ''}
      userName={userName}
      onLogout={() => {
        AuthService.logout()
        navigate('/')
      }}
    >
      <div className="mb-4">
        <Button variant="secondary" size="sm" onClick={() => navigate(paths.memberDetails)}>
          Back to member
        </Button>
      </div>
      {error ? (
        <Card className="p-5"><p className="text-red-500">{error}</p></Card>
      ) : !record ? (
        <p className="text-text-secondary">Loading...</p>
      ) : (
        <Card className="p-4 sm:p-5">
          <BodyAssessmentDetailContent record={record} />
        </Card>
      )}
    </AdminShell>
  )
}
