import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import AdminShell from '../../layouts/AdminShell'
import { BodyProgressContent } from '../../components/bodyAnalysis/BodyProgressContent'
import { adminService } from '../../services/adminService'
import { gymService } from '../../services/gymService'
import { BodyAssessmentRecord, BodyProgressResponse, MemberRecord } from '../../types'
import { bodyAnalysisPaths } from '../../utils/bodyAnalysisPaths'
import { ApiErrorHandler } from '../../api/errors'
import { PROGRESS_MONTH_COUNT } from '../../utils/bodyMetrics'

export default function AdminBodyProgress() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const id = Number(memberId)
  const paths = bodyAnalysisPaths(id, 'admin')
  const [member, setMember] = useState<MemberRecord | null>(null)
  const [progress, setProgress] = useState<BodyProgressResponse | null>(null)
  const [history, setHistory] = useState<BodyAssessmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }
    if (!id || Number.isNaN(id)) {
      navigate('/admin/members')
    }
  }, [id, navigate])

  useEffect(() => {
    if (!id || Number.isNaN(id)) return
    void load()
  }, [id])

  const load = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [memberRes, progressRes, historyRes] = await Promise.all([
        adminService.getMemberById(id),
        gymService.getBodyProgress(id, PROGRESS_MONTH_COUNT),
        gymService.listBodyAssessments(id),
      ])
      setMember(memberRes.data)
      setProgress(progressRes)
      setHistory(historyRes.data || [])
    } catch (err: any) {
      setError(ApiErrorHandler.parse(err).message)
    } finally {
      setIsLoading(false)
    }
  }

  const userName = AuthService.getUserInfo()?.name || 'Admin'

  return (
    <AdminShell
      title="Progress overview"
      subtitle={member?.full_name || ''}
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
      {isLoading ? (
        <Card className="p-5"><p className="text-text-secondary">Loading progress...</p></Card>
      ) : error ? (
        <Card className="p-5"><p className="text-red-500">{error}</p></Card>
      ) : (
        <BodyProgressContent
          progress={progress}
          history={history}
          onOpenAssessment={(assessmentId) => navigate(paths.assessmentDetail(assessmentId))}
        />
      )}
    </AdminShell>
  )
}
