import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { ApiErrorHandler } from '../../api/errors'
import { Card } from '../../components/Card'
import { MemberBodyAssessmentDetailContent } from '../../components/bodyAnalysis/MemberBodyAssessmentDetailContent'
import { MemberPageHeader } from '../../components/member/MemberPageHeader'
import { USER_ROLES } from '../../auth/roles'
import { AuthService } from '../../services/auth'
import { memberService } from '../../services/memberService'
import { MemberBodyAssessmentDetail } from '../../types'

export default function MemberBodyAssessmentDetailPage() {
  const { assessmentId } = useParams()
  const navigate = useNavigate()
  const id = Number(assessmentId)
  const [record, setRecord] = useState<MemberBodyAssessmentDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.hasRole(USER_ROLES.MEMBER)) {
      navigate('/login')
      return
    }
    if (!id || Number.isNaN(id)) {
      navigate('/member/body-assessments')
      return
    }
    void memberService
      .getBodyAssessment(id)
      .then((res) => setRecord(res.data))
      .catch((err) => {
        setError(ApiErrorHandler.parse(err).message)
      })
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader backTo="/member/body-assessments" backLabel="All assessments" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Assessment details</h1>
          <Lock className="w-5 h-5 text-gray-400" aria-hidden />
        </div>

        {isLoading ? (
          <p className="text-gray-600">Loading…</p>
        ) : error ? (
          <Card>
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        ) : record ? (
          <Card>
            <MemberBodyAssessmentDetailContent record={record} />
          </Card>
        ) : null}
      </div>
    </div>
  )
}
