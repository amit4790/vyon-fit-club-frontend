import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../services/auth'
import { Card } from '../../components/Card'
import GymTabletShell from '../../layouts/GymTabletShell'
import { BodyProgressContent } from '../../components/bodyAnalysis/BodyProgressContent'
import { gymService } from '../../services/gymService'
import { BodyAssessmentRecord, BodyProgressResponse, MemberRecord } from '../../types'
import { bodyAnalysisPaths } from '../../utils/bodyAnalysisPaths'
import { ApiErrorHandler } from '../../api/errors'
import { PROGRESS_MONTH_COUNT } from '../../utils/bodyMetrics'

export default function GymProgress() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const id = Number(memberId)
  const paths = bodyAnalysisPaths(id, 'gym')
  const [member, setMember] = useState<MemberRecord | null>(null)
  const [progress, setProgress] = useState<BodyProgressResponse | null>(null)
  const [history, setHistory] = useState<BodyAssessmentRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessGymTablet()) {
      navigate('/login')
      return
    }
    if (!id || Number.isNaN(id)) {
      navigate('/gym/members')
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
        gymService.getMember(id),
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

  return (
    <GymTabletShell
      title="Progress overview"
      subtitle={member?.full_name || ''}
      backTo={paths.memberDetails}
    >
      {isLoading ? (
        <p className="text-text-secondary">Loading progress...</p>
      ) : error ? (
        <Card className="p-5"><p className="text-red-500">{error}</p></Card>
      ) : (
        <BodyProgressContent
          progress={progress}
          history={history}
          onOpenAssessment={(assessmentId) => navigate(paths.assessmentDetail(assessmentId))}
        />
      )}
    </GymTabletShell>
  )
}
