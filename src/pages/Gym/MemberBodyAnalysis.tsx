import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../services/auth'
import { Card } from '../../components/Card'
import GymTabletShell from '../../layouts/GymTabletShell'
import { MemberBodyAnalysisSection } from '../../components/bodyAnalysis/MemberBodyAnalysisSection'
import { gymService } from '../../services/gymService'
import { MemberRecord } from '../../types'
import { ApiErrorHandler } from '../../api/errors'

export default function GymMemberBodyAnalysis() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const id = Number(memberId)
  const [member, setMember] = useState<MemberRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
      .then((res) => setMember(res.data))
      .catch((err) => setError(ApiErrorHandler.parse(err).message))
      .finally(() => setIsLoading(false))
  }, [id, navigate])

  return (
    <GymTabletShell
      title={member?.full_name || 'Member'}
      subtitle={member ? `ID ${member.id} · Body analysis` : 'Body analysis'}
      backTo="/gym/members"
    >
      {isLoading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : error ? (
        <Card className="p-5"><p className="text-red-500">{error}</p></Card>
      ) : (
        <Card className="p-4 sm:p-5">
          <MemberBodyAnalysisSection memberId={id} context="gym" />
        </Card>
      )}
    </GymTabletShell>
  )
}
