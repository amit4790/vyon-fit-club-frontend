import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { BodyAssessmentForm } from '../../components/bodyAnalysis/BodyAssessmentForm'
import { bodyAnalysisPaths } from '../../utils/bodyAnalysisPaths'
export default function AdminBodyAssessmentNew() {
  const { memberId } = useParams()
  const navigate = useNavigate()
  const id = Number(memberId)
  const paths = bodyAnalysisPaths(id, 'admin')
  const [memberName, setMemberName] = useState('')
  const [memberDateOfBirth, setMemberDateOfBirth] = useState<string | null>(null)
  const [memberPhone, setMemberPhone] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }
    if (!id || Number.isNaN(id)) {
      navigate('/admin/members')
      return
    }
    void adminService
      .getMemberById(id)
      .then((res) => {
        setMemberName(res.data.full_name)
        setMemberDateOfBirth(res.data.date_of_birth || null)
        setMemberPhone(res.data.mobile_number || null)
      })
      .catch(() => navigate(paths.memberDetails))
  }, [id, navigate, paths.memberDetails])

  const userName = AuthService.getUserInfo()?.name || 'Admin'

  return (
    <AdminShell
      title="New body assessment"
      subtitle={memberName || `Member #${id}`}
      userName={userName}
      onLogout={() => {
        AuthService.logout()
        navigate('/')
      }}
    >
      <BodyAssessmentForm
        memberId={id}
        memberName={memberName || `Member #${id}`}
        memberDateOfBirth={memberDateOfBirth}
        memberPhone={memberPhone}
        onCancel={() => navigate(paths.memberDetails)}
        onComplete={() => navigate(paths.memberDetails)}
      />
    </AdminShell>
  )
}
