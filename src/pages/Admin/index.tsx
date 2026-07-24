/**
 * Admin Dashboard Page
 * System overview and statistics
 */

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { DashboardService, AdminDashboardResponse, AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { adminService } from '../../services/adminService'
import {
  MemberListPagination,
  MemberPayload,
  MemberRecord,
} from '../../types'
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

const DEFAULT_MEMBER_FORM = {
  full_name: '',
  mobile_number: '',
  joining_date: new Date().toISOString().slice(0, 10),
  status: 'active' as 'active' | 'inactive',
  email: '',
  date_of_birth: '',
  gender: '' as '' | 'male' | 'female' | 'other',
  address: '',
  emergency_contact: '',
  emergency_phone: '',
  notes: '',
}

type MemberFormState = typeof DEFAULT_MEMBER_FORM

export default function Admin() {
  const navigate = useNavigate()
  const [dashboard, setDashboard] = useState<AdminDashboardResponse | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [memberPage, setMemberPage] = useState(1)
  const [pageSize] = useState(10)
  const [pagination, setPagination] = useState<MemberListPagination>({
    page: 1,
    page_size: 10,
    total_items: 0,
    total_pages: 0,
  })
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
  const [isSubmittingMember, setIsSubmittingMember] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [memberForm, setMemberForm] = useState<MemberFormState>(DEFAULT_MEMBER_FORM)
  const [memberFormError, setMemberFormError] = useState<string | null>(null)
  const { toasts, removeToast, success, error: errorToast } = useToast()

  useEffect(() => {
    // Check authentication
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('admin')) {
      navigate('/login')
      return
    }

    loadDashboard()
    loadMembers(1, '', true)
  }, [navigate])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await DashboardService.getAdminDashboard()
      setDashboard(data)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setError(apiError.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogout = () => {
    AuthService.logout()
    navigate('/login')
  }

  const loadMembers = async (
    page = memberPage,
    search = activeSearch,
    showLoader = false
  ) => {
    try {
      if (showLoader) {
        setMembersLoading(true)
      }
      const response = await adminService.getMembers({
        page,
        pageSize,
        search,
      })
      setMembers(response.data)
      setPagination(response.pagination)
      setMemberPage(response.pagination.page)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load members', apiError.message)
    } finally {
      if (showLoader) {
        setMembersLoading(false)
      }
    }
  }

  const handleMemberSearch = async () => {
    const searchText = memberSearch.trim()
    setActiveSearch(searchText)
    await loadMembers(1, searchText, true)
  }

  const openCreateMemberModal = () => {
    setEditingMemberId(null)
    setMemberForm(DEFAULT_MEMBER_FORM)
    setMemberFormError(null)
    setIsMemberModalOpen(true)
  }

  const openEditMemberModal = (member: MemberRecord) => {
    setEditingMemberId(member.id)
    setMemberForm({
      full_name: member.full_name,
      mobile_number: member.mobile_number,
      joining_date: member.joining_date,
      status: member.status,
      email: member.email || '',
      date_of_birth: member.date_of_birth || '',
      gender: (member.gender as '' | 'male' | 'female' | 'other' | null) || '',
      address: member.address || '',
      emergency_contact: member.emergency_contact || '',
      emergency_phone: member.emergency_phone || '',
      notes: member.notes || '',
    })
    setMemberFormError(null)
    setIsMemberModalOpen(true)
  }

  const closeMemberModal = () => {
    setIsMemberModalOpen(false)
    setEditingMemberId(null)
    setMemberForm(DEFAULT_MEMBER_FORM)
    setMemberFormError(null)
  }

  const updateMemberFormField = (field: keyof MemberFormState, value: string) => {
    setMemberForm((prev) => ({ ...prev, [field]: value }))
  }

  const buildMemberPayload = (form: MemberFormState): MemberPayload => {
    return {
      full_name: form.full_name.trim(),
      mobile_number: form.mobile_number.trim(),
      joining_date: form.joining_date,
      status: form.status,
      email: form.email.trim() || undefined,
      date_of_birth: form.date_of_birth || undefined,
      gender: form.gender || undefined,
      address: form.address.trim() || undefined,
      emergency_contact: form.emergency_contact.trim() || undefined,
      emergency_phone: form.emergency_phone.trim() || undefined,
      notes: form.notes.trim() || undefined,
    }
  }

  const handleSaveMember = async () => {
    if (!memberForm.full_name.trim()) {
      setMemberFormError('Full Name is required')
      return
    }

    if (!memberForm.mobile_number.trim()) {
      setMemberFormError('Mobile Number is required')
      return
    }

    try {
      setIsSubmittingMember(true)
      setMemberFormError(null)

      const payload = buildMemberPayload(memberForm)

      if (editingMemberId) {
        await adminService.updateMember(editingMemberId, payload)
        success('Member updated', 'Member details were saved successfully')
      } else {
        await adminService.createMember(payload)
        success('Member created', 'New member was added successfully')
      }

      closeMemberModal()
      await loadMembers(memberPage, activeSearch, true)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setMemberFormError(apiError.message)
    } finally {
      setIsSubmittingMember(false)
    }
  }

  const handleDeleteMember = async (member: MemberRecord) => {
    const confirmed = window.confirm(`Delete member ${member.full_name}?`)
    if (!confirmed) {
      return
    }

    try {
      await adminService.deleteMember(member.id)
      success('Member deleted', 'Member was removed successfully')

      const targetPage = members.length === 1 && memberPage > 1 ? memberPage - 1 : memberPage
      await loadMembers(targetPage, activeSearch, true)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to delete member', apiError.message)
    }
  }

  const userInfo = AuthService.getUserInfo()
  const userName = userInfo?.name || 'John Doe'

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={loadDashboard}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-accent"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    )
  }

  if (!dashboard) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Premium Header with Logo and Branding */}
      <header className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-24">
            {/* Left Side - Logo and Branding */}
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-4 group cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                src="/src/assets/images/logo/vyon-logo.jpg"
                alt="VYON FIT CLUB"
                className="h-16 w-16 object-contain rounded transition-transform duration-300 group-hover:scale-110"
              />
              <div className="hidden sm:flex flex-col">
                <span className="text-white font-bold text-2xl leading-tight tracking-tighter">
                  VYON
                </span>
                <span className="text-gray-400 text-sm font-light">Premium Fitness Club</span>
              </div>
            </button>

            {/* Right Side - User Info and Logout */}
            <div className="flex items-center gap-6">
              {/* Welcome Message */}
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-white text-sm font-medium">
                  Welcome, {userName}
                </span>
                <span className="text-gray-400 text-xs">Administrator</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-300 font-medium text-sm"
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section - Compact */}
        <div className="pt-8 pb-8 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {userName} 👋
          </h1>
          <p className="text-lg text-gray-600">
            Here's what's happening at VYON Fit Club today.
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Members Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Total Members</span>
              <span className="text-4xl font-bold text-primary mt-2">
                {dashboard.total_members}
              </span>
              <p className="text-gray-500 text-xs mt-2">
                Active: {dashboard.active_members}
              </p>
            </div>
          </Card>

          {/* Monthly Revenue Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Monthly Revenue</span>
              <span className="text-4xl font-bold text-green-600 mt-2">
                ${dashboard.monthly_revenue.toFixed(2)}
              </span>
            </div>
          </Card>

          {/* Expiring Memberships Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Expiring This Month</span>
              <span className="text-4xl font-bold text-yellow-600 mt-2">
                {dashboard.expiring_memberships}
              </span>
            </div>
          </Card>

          {/* Today's Check-ins Card */}
          <Card>
            <div className="flex flex-col">
              <span className="text-gray-600 text-sm font-medium">Today's Check-ins</span>
              <span className="text-4xl font-bold text-blue-600 mt-2">
                {dashboard.todays_checkins}
              </span>
            </div>
          </Card>
        </div>

        {/* Recent Registrations */}
        <Card>
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Registrations</h2>
          </div>

          {dashboard.recent_registrations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">
                      Registration Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {dashboard.recent_registrations.map((registration, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">{registration.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{registration.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {registration.registration_date}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No recent registrations</p>
          )}
        </Card>

        <div className="mt-8 mb-10">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Member Management</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Add, search, edit and delete members.
                </p>
              </div>

              <Button onClick={openCreateMemberModal}>Add Member</Button>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mb-6">
              <Input
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search by name or mobile number"
              />
              <Button onClick={handleMemberSearch}>Search</Button>
            </div>

            {membersLoading ? (
              <p className="text-gray-500 py-8 text-center">Loading members...</p>
            ) : members.length === 0 ? (
              <p className="text-gray-500 py-8 text-center">No members found</p>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableHeaderCell>Name</TableHeaderCell>
                    <TableHeaderCell>Mobile</TableHeaderCell>
                    <TableHeaderCell>Joining Date</TableHeaderCell>
                    <TableHeaderCell>Status</TableHeaderCell>
                    <TableHeaderCell>Email</TableHeaderCell>
                    <TableHeaderCell className="text-right">Actions</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.full_name}</TableCell>
                        <TableCell>{member.mobile_number}</TableCell>
                        <TableCell>{member.joining_date}</TableCell>
                        <TableCell>
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                              member.status === 'active'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {member.status}
                          </span>
                        </TableCell>
                        <TableCell>{member.email || '-'}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button size="sm" variant="secondary" onClick={() => openEditMemberModal(member)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="danger" onClick={() => handleDeleteMember(member)}>
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing page {pagination.page} of {Math.max(pagination.total_pages, 1)} ({pagination.total_items} members)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page <= 1}
                      onClick={() => loadMembers(pagination.page - 1, activeSearch, true)}
                    >
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={pagination.page >= pagination.total_pages || pagination.total_pages === 0}
                      onClick={() => loadMembers(pagination.page + 1, activeSearch, true)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </Card>
        </div>
      </div>

      <Modal
        isOpen={isMemberModalOpen}
        onClose={closeMemberModal}
        title={editingMemberId ? 'Edit Member' : 'Add Member'}
        size="lg"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeMemberModal}>
              Cancel
            </Button>
            <Button onClick={handleSaveMember} isLoading={isSubmittingMember}>
              {editingMemberId ? 'Save Changes' : 'Create Member'}
            </Button>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Full Name *"
            value={memberForm.full_name}
            onChange={(event) => updateMemberFormField('full_name', event.target.value)}
          />
          <Input
            label="Mobile Number *"
            value={memberForm.mobile_number}
            onChange={(event) => updateMemberFormField('mobile_number', event.target.value)}
          />
          <Input
            label="Joining Date"
            type="date"
            value={memberForm.joining_date}
            onChange={(event) => updateMemberFormField('joining_date', event.target.value)}
          />
          <Select
            label="Status"
            value={memberForm.status}
            options={[
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            onChange={(event) => updateMemberFormField('status', event.target.value)}
          />
          <Input
            label="Email"
            type="email"
            value={memberForm.email}
            onChange={(event) => updateMemberFormField('email', event.target.value)}
          />
          <Input
            label="Date of Birth"
            type="date"
            value={memberForm.date_of_birth}
            onChange={(event) => updateMemberFormField('date_of_birth', event.target.value)}
          />
          <Select
            label="Gender"
            value={memberForm.gender}
            options={[
              { value: '', label: 'Select gender' },
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ]}
            onChange={(event) => updateMemberFormField('gender', event.target.value)}
          />
          <Input
            label="Emergency Contact"
            value={memberForm.emergency_contact}
            onChange={(event) => updateMemberFormField('emergency_contact', event.target.value)}
          />
          <Input
            label="Emergency Phone"
            value={memberForm.emergency_phone}
            onChange={(event) => updateMemberFormField('emergency_phone', event.target.value)}
          />
          <Input
            label="Address"
            value={memberForm.address}
            onChange={(event) => updateMemberFormField('address', event.target.value)}
          />
          <Input
            label="Notes"
            className="md:col-span-2"
            value={memberForm.notes}
            onChange={(event) => updateMemberFormField('notes', event.target.value)}
          />
        </div>

        {memberFormError && <p className="text-red-600 text-sm mt-4">{memberFormError}</p>}
      </Modal>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
