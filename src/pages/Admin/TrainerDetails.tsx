import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input } from '../../components/Input'
import { Modal } from '../../components/Modal'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableHeaderCell,
  TableRow,
} from '../../components/Table'
import { ToastContainer, useToast } from '../../components/Toast'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import {
  AssignableMemberRecord,
  TrainerAssignedMember,
  TrainerDetailRecord,
} from '../../types'

export default function AdminTrainerDetails() {
  const navigate = useNavigate()
  const { trainerId } = useParams<{ trainerId: string }>()
  const [trainer, setTrainer] = useState<TrainerDetailRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<AssignableMemberRecord[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [unassigningMemberId, setUnassigningMemberId] = useState<number | null>(null)
  const { toasts, removeToast, success, error: errorToast } = useToast()

  const targetTrainerId = Number(trainerId)

  const loadDetails = async (showLoader = true) => {
    if (!targetTrainerId) {
      setError('Invalid trainer')
      setIsLoading(false)
      return
    }

    try {
      if (showLoader) {
        setIsLoading(true)
      }
      setError(null)
      const response = await adminService.getTrainerById(targetTrainerId)
      setTrainer(response.data)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setError(apiError.message)
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    void loadDetails(true)
  }, [trainerId, navigate])

  useEffect(() => {
    if (!isAssignModalOpen || !targetTrainerId) {
      return
    }

    const handle = window.setTimeout(async () => {
      try {
        setIsSearching(true)
        const response = await adminService.searchAssignableMembers(
          targetTrainerId,
          searchQuery.trim() || undefined
        )
        setSearchResults(response.data || [])
      } catch (err: any) {
        const apiError = ApiErrorHandler.parse(err)
        errorToast('Search failed', apiError.message)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => window.clearTimeout(handle)
  }, [isAssignModalOpen, searchQuery, targetTrainerId])

  const openAssignModal = () => {
    setSearchQuery('')
    setSearchResults([])
    setSelectedMemberId(null)
    setIsAssignModalOpen(true)
  }

  const closeAssignModal = () => {
    setIsAssignModalOpen(false)
    setSelectedMemberId(null)
    setSearchQuery('')
    setSearchResults([])
  }

  const handleAssignMember = async () => {
    if (!targetTrainerId || !selectedMemberId) {
      errorToast('Select a member', 'Pick a member from the search results')
      return
    }

    const selected = searchResults.find((row) => row.id === selectedMemberId)
    if (selected?.current_trainer_id) {
      const confirmed = window.confirm(
        `${selected.full_name} is already assigned to another trainer. Reassign to this trainer?`
      )
      if (!confirmed) {
        return
      }
    }

    try {
      setIsSubmitting(true)
      await adminService.assignMemberToTrainer(targetTrainerId, {
        member_id: selectedMemberId,
      })
      success('Member assigned', 'PT member linked to this trainer')
      closeAssignModal()
      await loadDetails(false)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Assign failed', apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUnassignMember = async (member: TrainerAssignedMember) => {
    if (!targetTrainerId) {
      return
    }
    const confirmed = window.confirm(`Remove ${member.full_name} from this trainer?`)
    if (!confirmed) {
      return
    }

    try {
      setUnassigningMemberId(member.id)
      await adminService.unassignMemberFromTrainer(targetTrainerId, member.id)
      success('Member unassigned', `${member.full_name} removed from this trainer`)
      await loadDetails(false)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Unassign failed', apiError.message)
    } finally {
      setUnassigningMemberId(null)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    navigate('/')
  }

  const userName = AuthService.getUserInfo()?.name || 'Admin'
  const assignedCount = trainer?.assigned_member_count ?? trainer?.assigned_members.length ?? 0

  return (
    <AdminShell
      title="Trainer Details"
      subtitle="Trainer profile and PT members"
      userName={userName}
      onLogout={handleLogout}
    >
      {isLoading ? (
        <Card className="p-8">
          <p className="text-text-secondary">Loading trainer details...</p>
        </Card>
      ) : error ? (
        <Card className="p-8">
          <p className="text-red-500">{error}</p>
        </Card>
      ) : !trainer ? (
        <Card className="p-8">
          <p className="text-text-secondary">Trainer not found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p>
                <span className="text-text-secondary">Name:</span> {trainer.full_name}
              </p>
              <p>
                <span className="text-text-secondary">Email:</span> {trainer.email}
              </p>
              <p>
                <span className="text-text-secondary">Phone:</span> {trainer.phone_number || '-'}
              </p>
              <p>
                <span className="text-text-secondary">Status:</span>{' '}
                {trainer.is_active ? 'Active' : 'Inactive'}
              </p>
              <p>
                <span className="text-text-secondary">Specialization:</span>{' '}
                {trainer.specialization || 'Not specified'}
              </p>
              <p>
                <span className="text-text-secondary">PT members:</span> {assignedCount}
              </p>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
              <h2 className="text-lg font-semibold text-text-secondary">Assigned Members</h2>
              <Button size="sm" onClick={openAssignModal} disabled={!trainer.is_active}>
                Assign Member
              </Button>
            </div>

            {trainer.assigned_members.length === 0 ? (
              <p className="text-sm text-text-secondary">No assigned members.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Mobile</TableHeaderCell>
                  <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {trainer.assigned_members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.mobile_number}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="secondary"
                          isLoading={unassigningMemberId === member.id}
                          onClick={() => void handleUnassignMember(member)}
                        >
                          Unassign
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}

      <Modal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        title="Assign PT Member"
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeAssignModal}>
              Cancel
            </Button>
            <Button
              onClick={() => void handleAssignMember()}
              isLoading={isSubmitting}
              disabled={!selectedMemberId}
            >
              Assign
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Search member"
            value={searchQuery}
            placeholder="Name or mobile"
            onChange={(event) => setSearchQuery(event.target.value)}
          />

          <div className="border border-border-light rounded-md max-h-64 overflow-y-auto">
            {isSearching ? (
              <p className="p-4 text-sm text-text-secondary">Searching...</p>
            ) : searchResults.length === 0 ? (
              <p className="p-4 text-sm text-text-secondary">No members found.</p>
            ) : (
              <ul className="divide-y divide-border-light">
                {searchResults.map((member) => {
                  const isSelected = selectedMemberId === member.id
                  return (
                    <li key={member.id}>
                      <button
                        type="button"
                        className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                          isSelected ? 'bg-primary/10 text-text-secondary' : 'hover:bg-bg-secondary'
                        }`}
                        onClick={() => setSelectedMemberId(member.id)}
                      >
                        <div className="font-medium">{member.full_name}</div>
                        <div className="text-text-secondary mt-0.5">
                          {member.mobile_number}
                          {member.current_trainer_id
                            ? ' · currently assigned to another trainer'
                            : ' · unassigned'}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </Modal>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
