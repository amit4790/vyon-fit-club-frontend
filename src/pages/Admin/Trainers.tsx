import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input, Select } from '../../components/Input'
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
import { TrainerRecord } from '../../types'

const DEFAULT_TRAINER_FORM = {
  full_name: '',
  email: '',
  phone_number: '',
  specialization: '',
  temporary_password: '',
  is_active: 'true',
}

type TrainerFormState = typeof DEFAULT_TRAINER_FORM

export default function AdminTrainers() {
  const navigate = useNavigate()
  const [trainers, setTrainers] = useState<TrainerRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTrainerId, setEditingTrainerId] = useState<number | null>(null)
  const [trainerForm, setTrainerForm] = useState<TrainerFormState>(DEFAULT_TRAINER_FORM)
  const [formError, setFormError] = useState<string | null>(null)
  const { toasts, removeToast, success, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    loadTrainers(true)
  }, [navigate])

  const loadTrainers = async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }
      const response = await adminService.getTrainers()
      setTrainers(response.data)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load trainers', apiError.message)
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  const openCreateTrainerModal = () => {
    setEditingTrainerId(null)
    setTrainerForm(DEFAULT_TRAINER_FORM)
    setFormError(null)
    setIsModalOpen(true)
  }

  const openEditTrainerModal = (trainer: TrainerRecord) => {
    setEditingTrainerId(trainer.id)
    setTrainerForm({
      full_name: trainer.full_name,
      email: trainer.email,
      phone_number: trainer.phone_number || '',
      specialization: trainer.specialization || '',
      temporary_password: '',
      is_active: trainer.is_active ? 'true' : 'false',
    })
    setFormError(null)
    setIsModalOpen(true)
  }

  const closeTrainerModal = () => {
    setIsModalOpen(false)
    setEditingTrainerId(null)
    setTrainerForm(DEFAULT_TRAINER_FORM)
    setFormError(null)
  }

  const updateFormField = (field: keyof TrainerFormState, value: string) => {
    setTrainerForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSaveTrainer = async () => {
    if (!trainerForm.full_name.trim()) {
      setFormError('Trainer Name is required')
      return
    }

    if (!trainerForm.email.trim()) {
      setFormError('Trainer Email is required')
      return
    }

    if (!trainerForm.phone_number.trim()) {
      setFormError('Trainer Phone Number is required')
      return
    }

    if (!editingTrainerId && !trainerForm.temporary_password.trim()) {
      setFormError('Temporary Password is required')
      return
    }

    try {
      setIsSubmitting(true)
      setFormError(null)

      const payload = {
        full_name: trainerForm.full_name.trim(),
        email: trainerForm.email.trim(),
        phone_number: trainerForm.phone_number.trim(),
        specialization: trainerForm.specialization.trim() || null,
        temporary_password: trainerForm.temporary_password,
        is_active: trainerForm.is_active === 'true',
      }

      if (editingTrainerId) {
        await adminService.updateTrainer(editingTrainerId, {
          full_name: payload.full_name,
          email: payload.email,
          phone_number: payload.phone_number,
          specialization: payload.specialization,
          is_active: payload.is_active,
        })
        success('Trainer updated', 'Trainer details were saved successfully')
      } else {
        await adminService.createTrainer(payload)
        success('Trainer added', 'New trainer was added successfully')
      }

      closeTrainerModal()
      await loadTrainers(true)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setFormError(apiError.message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTrainer = async (trainer: TrainerRecord) => {
    const confirmed = window.confirm(`Delete trainer ${trainer.full_name}?`)
    if (!confirmed) {
      return
    }

    try {
      await adminService.deleteTrainer(trainer.id)
      success('Trainer deleted', 'Trainer was marked inactive successfully')
      await loadTrainers(true)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to delete trainer', apiError.message)
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
      title="Trainers"
      subtitle="Manage trainer accounts"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5 lg:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">Trainer Management</h2>
            <p className="text-sm text-text-secondary mt-1">
              Add, edit and deactivate trainer accounts.
            </p>
          </div>

          <Button size="sm" onClick={openCreateTrainerModal}>Add Trainer</Button>
        </div>

        {isLoading ? (
          <p className="text-gray-500 py-8 text-center">Loading trainers...</p>
        ) : trainers.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No trainers found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableHeaderCell>Name</TableHeaderCell>
              <TableHeaderCell>Email</TableHeaderCell>
              <TableHeaderCell>Phone</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell className="text-right">Actions</TableHeaderCell>
            </TableHeader>
            <TableBody>
              {trainers.map((trainer) => (
                <TableRow
                  key={trainer.id}
                  onClick={() => navigate(`/admin/trainers/${trainer.id}`)}
                  className="cursor-pointer"
                >
                  <TableCell className="text-sm text-text-secondary">{trainer.full_name}</TableCell>
                  <TableCell className="text-sm text-text-secondary">{trainer.email}</TableCell>
                  <TableCell className="text-sm text-text-secondary">{trainer.phone_number || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        trainer.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {trainer.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(event) => {
                          event.stopPropagation()
                          openEditTrainerModal(trainer)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        className="bg-primary text-text-secondary hover:bg-primary-dark focus:ring-primary"
                        onClick={(event) => {
                          event.stopPropagation()
                          handleDeleteTrainer(trainer)
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={closeTrainerModal}
        title={editingTrainerId ? 'Edit Trainer' : 'Add Trainer'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeTrainerModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveTrainer} isLoading={isSubmitting}>
              {editingTrainerId ? 'Save Changes' : 'Create Trainer'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Trainer Name *"
            value={trainerForm.full_name}
            onChange={(event) => updateFormField('full_name', event.target.value)}
          />
          <Input
            label="Trainer Email *"
            type="email"
            value={trainerForm.email}
            onChange={(event) => updateFormField('email', event.target.value)}
          />
          <Input
            label="Phone Number *"
            value={trainerForm.phone_number}
            onChange={(event) => updateFormField('phone_number', event.target.value)}
          />
          <Input
            label="Specialization"
            value={trainerForm.specialization}
            onChange={(event) => updateFormField('specialization', event.target.value)}
          />
          {!editingTrainerId && (
            <Input
              label="Temporary Password *"
              type="password"
              value={trainerForm.temporary_password}
              onChange={(event) => updateFormField('temporary_password', event.target.value)}
            />
          )}
          <Select
            label="Status"
            value={trainerForm.is_active}
            options={[
              { value: 'true', label: 'Active' },
              { value: 'false', label: 'Inactive' },
            ]}
            onChange={(event) => updateFormField('is_active', event.target.value)}
          />
        </div>

        {formError && <p className="text-red-600 text-sm mt-4">{formError}</p>}
      </Modal>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
