import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
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
import { TrainerRecord as TrainerApiRecord } from '../../types'

type TrainerRecord = {
  id: number
  name: string
  specialization: string
  clients: number
}

type ClassRecord = {
  id: number
  name: string
  trainer: string
  capacity: number
}

export default function AdminAttendance() {
  const navigate = useNavigate()
  const [trainers, setTrainers] = useState<TrainerRecord[]>([])
  const [classes, setClasses] = useState<ClassRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toasts, removeToast, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('admin')) {
      navigate('/login')
      return
    }

    loadData(true)
  }, [navigate])

  const loadData = async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }

      const [trainersResponse, classesResponse] = await Promise.all([
        adminService.getTrainers(),
        adminService.getClasses(),
      ])

      const trainerRows = (trainersResponse.data || []).map((trainer: TrainerApiRecord) => ({
        id: trainer.id,
        name: trainer.full_name,
        specialization: 'General',
        clients: 0,
      }))

      const classRows = (classesResponse as { data?: ClassRecord[] }).data || []

      setTrainers(trainerRows)
      setClasses(classRows)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load attendance data', apiError.message)
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    navigate('/')
  }

  const userInfo = AuthService.getUserInfo()
  const userName = userInfo?.name || 'Admin'

  return (
    <AdminShell
      title="Attendance"
      subtitle="Trainer and class capacity overview"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5 mb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">Attendance Monitor</h2>
            <p className="text-sm text-text-secondary mt-1">
              Use trainer clients and class capacity to monitor floor load.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => loadData(true)}>
            Refresh
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-8">
          <p className="text-center text-text-secondary">Loading attendance data...</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="p-5">
            <h3 className="text-md font-semibold text-text-secondary mb-3">Trainers</h3>
            <Table>
              <TableHeader>
                <TableHeaderCell>Name</TableHeaderCell>
                <TableHeaderCell>Specialization</TableHeaderCell>
                <TableHeaderCell>Active Clients</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {trainers.map((trainer) => (
                  <TableRow key={trainer.id}>
                    <TableCell className="text-sm text-text-secondary">{trainer.name}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{trainer.specialization}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{trainer.clients}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>

          <Card className="p-5">
            <h3 className="text-md font-semibold text-text-secondary mb-3">Classes</h3>
            <Table>
              <TableHeader>
                <TableHeaderCell>Class</TableHeaderCell>
                <TableHeaderCell>Trainer</TableHeaderCell>
                <TableHeaderCell>Capacity</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {classes.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="text-sm text-text-secondary">{row.name}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{row.trainer}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{row.capacity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
