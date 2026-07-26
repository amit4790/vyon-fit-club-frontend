import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Card } from '../../components/Card'
import { Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from '../../components/Table'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { TrainerDetailRecord } from '../../types'

export default function AdminTrainerDetails() {
  const navigate = useNavigate()
  const { trainerId } = useParams<{ trainerId: string }>()
  const [trainer, setTrainer] = useState<TrainerDetailRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    const targetTrainerId = Number(trainerId)
    if (!targetTrainerId) {
      setError('Invalid trainer')
      setIsLoading(false)
      return
    }

    const loadDetails = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await adminService.getTrainerById(targetTrainerId)
        setTrainer(response.data)
      } catch (err: any) {
        const apiError = ApiErrorHandler.parse(err)
        setError(apiError.message)
      } finally {
        setIsLoading(false)
      }
    }

    loadDetails()
  }, [trainerId, navigate])

  const handleLogout = () => {
    AuthService.logout()
    navigate('/')
  }

  const userName = AuthService.getUserInfo()?.name || 'Admin'

  return (
    <AdminShell
      title="Trainer Details"
      subtitle="Read-only trainer profile and assigned members"
      userName={userName}
      onLogout={handleLogout}
    >
      {isLoading ? (
        <Card className="p-8"><p className="text-text-secondary">Loading trainer details...</p></Card>
      ) : error ? (
        <Card className="p-8"><p className="text-red-500">{error}</p></Card>
      ) : !trainer ? (
        <Card className="p-8"><p className="text-text-secondary">Trainer not found.</p></Card>
      ) : (
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <p><span className="text-text-secondary">Name:</span> {trainer.full_name}</p>
              <p><span className="text-text-secondary">Email:</span> {trainer.email}</p>
              <p><span className="text-text-secondary">Phone:</span> {trainer.phone_number || '-'}</p>
              <p><span className="text-text-secondary">Status:</span> {trainer.is_active ? 'Active' : 'Inactive'}</p>
              <p><span className="text-text-secondary">Specialization:</span> {trainer.specialization || 'Not specified'}</p>
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-text-secondary mb-3">Assigned Members</h2>
            {trainer.assigned_members.length === 0 ? (
              <p className="text-sm text-text-secondary">No assigned members.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableHeaderCell>Name</TableHeaderCell>
                  <TableHeaderCell>Mobile</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {trainer.assigned_members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>{member.full_name}</TableCell>
                      <TableCell>{member.mobile_number}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Card>
        </div>
      )}
    </AdminShell>
  )
}
