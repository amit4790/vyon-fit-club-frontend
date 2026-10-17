import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../services/auth'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { AdminListCard } from '../../components/admin/AdminListCard'
import GymTabletShell from '../../layouts/GymTabletShell'
import { gymService } from '../../services/gymService'
import { MemberRecord } from '../../types'
import { ApiErrorHandler } from '../../api/errors'

export default function GymMembers() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessGymTablet()) {
      navigate('/login')
    }
  }, [navigate])

  const load = async (nextPage: number, query: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await gymService.getMembers(nextPage, 20, query || undefined)
      setMembers(response.data || [])
      setPage(response.pagination.page)
      setTotalPages(response.pagination.total_pages)
    } catch (err: any) {
      setError(ApiErrorHandler.parse(err).message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    void load(page, activeSearch)
  }, [page, activeSearch])

  return (
    <GymTabletShell title="Members" subtitle="Select a member for body analysis">
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <Input
              value={search}
              placeholder="Search by name, mobile, or ID"
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setActiveSearch(search.trim())
                  setPage(1)
                }
              }}
            />
          </div>
          <Button
            size="sm"
            className="w-full sm:w-auto min-h-[44px]"
            onClick={() => {
              setActiveSearch(search.trim())
              setPage(1)
            }}
          >
            Search
          </Button>
        </div>

        {isLoading ? (
          <p className="text-center text-text-secondary py-8">Loading members...</p>
        ) : error ? (
          <p className="text-center text-red-500 py-8">{error}</p>
        ) : members.length === 0 ? (
          <p className="text-center text-text-secondary py-8">No members found.</p>
        ) : (
          <div className="space-y-3">
            {members.map((member) => (
              <AdminListCard
                key={member.id}
                title={member.full_name}
                subtitle={`ID ${member.id} · ${member.mobile_number}`}
                onClick={() => navigate(`/gym/members/${member.id}`)}
              />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mt-4">
            <p className="text-sm text-text-secondary">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
                Previous
              </Button>
              <Button
                size="sm"
                variant="secondary"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </GymTabletShell>
  )
}
