import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'
import { ApiErrorHandler } from '../../api/errors'
import { Card } from '../../components/Card'
import { MemberPageHeader } from '../../components/member/MemberPageHeader'
import { USER_ROLES } from '../../auth/roles'
import { AuthService } from '../../services/auth'
import { memberService } from '../../services/memberService'
import { MemberBodyAssessmentSummary } from '../../types'

export default function MemberBodyAssessments() {
  const navigate = useNavigate()
  const [items, setItems] = useState<MemberBodyAssessmentSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.hasRole(USER_ROLES.MEMBER)) {
      navigate('/login')
      return
    }
    void memberService
      .listBodyAssessments()
      .then((res) => setItems(res.data || []))
      .catch((err) => setError(ApiErrorHandler.parse(err).message))
      .finally(() => setIsLoading(false))
  }, [navigate])

  return (
    <div className="min-h-screen bg-gray-50">
      <MemberPageHeader backTo="/member" backLabel="Dashboard" />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start gap-2 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">My body assessments</h1>
          <Lock className="w-5 h-5 text-gray-400 mt-1 shrink-0" aria-hidden />
        </div>
        <p className="text-sm text-gray-600 mb-6">
          View-only history of assessments recorded by your trainer at the club.
        </p>

        {isLoading ? (
          <p className="text-gray-600">Loading…</p>
        ) : error ? (
          <Card>
            <p className="text-red-600 text-sm">{error}</p>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <p className="text-gray-600 text-sm">No assessments on file yet.</p>
          </Card>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                <Link
                  to={`/member/body-assessments/${item.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-4 hover:border-primary/40 transition-colors"
                >
                  <p className="font-semibold text-gray-900">{item.assessed_on}</p>
                  {item.fitness_goals ? (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">Goals: {item.fitness_goals}</p>
                  ) : null}
                  <p className="text-xs text-primary mt-2 font-medium">View details</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
