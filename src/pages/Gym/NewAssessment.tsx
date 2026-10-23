import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../services/auth'
import { BodyAssessmentForm } from '../../components/bodyAnalysis/BodyAssessmentForm'
import GymTabletShell from '../../layouts/GymTabletShell'
import { gymService } from '../../services/gymService'
import { bodyAnalysisPaths } from '../../utils/bodyAnalysisPaths'
import { ApiErrorHandler } from '../../api/errors'

export default function GymNewAssessment() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const id = Number(memberId)
  const paths = bodyAnalysisPaths(id, 'gym')
  const [memberName, setMemberName] = useState('')
  const [memberDateOfBirth, setMemberDateOfBirth] = useState<string | null>(null)
  const [memberPhone, setMemberPhone] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessGymTablet()) {
      navigate('/login')
      return
    }
    if (!id || Number.isNaN(id)) {
      navigate('/gym/members')
      return
    }
    void gymService
      .getMember(id)
      .then((res) => {
        setMemberName(res.data.full_name)
        setMemberDateOfBirth(res.data.date_of_birth || null)
        setMemberPhone(res.data.mobile_number || null)
      })
      .catch((err) => {
        ApiErrorHandler.parse(err)
        navigate(paths.memberDetails)
      })
  }, [id, navigate, paths.memberDetails])

  return (
    <GymTabletShell
      title="New body assessment"
      subtitle={memberName || `Member #${id}`}
      backTo={paths.memberDetails}
    >
      <BodyAssessmentForm
        memberId={id}
        memberName={memberName || `Member #${id}`}
        memberDateOfBirth={memberDateOfBirth}
        memberPhone={memberPhone}
        onCancel={() => navigate(paths.memberDetails)}
        onComplete={() => navigate(paths.memberDetails)}
      />
    </GymTabletShell>
  )
}
