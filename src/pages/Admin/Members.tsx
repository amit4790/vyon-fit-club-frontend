import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
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
import { adminService } from '../../services/adminService'
import {
  ExpiringSubscriptionsApiResponse,
  MemberListPagination,
  MemberPayload,
  MemberRecord,
  PlanFamilyRecord,
} from '../../types'
import AdminShell from '../../layouts/AdminShell'

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

export default function AdminMembers() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
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
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false)
  const [isSubmittingMember, setIsSubmittingMember] = useState(false)
  const [isSubmittingSubscription, setIsSubmittingSubscription] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [subscriptionMember, setSubscriptionMember] = useState<MemberRecord | null>(null)
  const [planCatalog, setPlanCatalog] = useState<PlanFamilyRecord[]>([])
  const [planLoading, setPlanLoading] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [subscriptionFormError, setSubscriptionFormError] = useState<string | null>(null)
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<
    ExpiringSubscriptionsApiResponse['data']
  >([])
  const [expiringDays, setExpiringDays] = useState(7)
  const [expiringTotal, setExpiringTotal] = useState(0)
  const [memberForm, setMemberForm] = useState<MemberFormState>(DEFAULT_MEMBER_FORM)
  const [memberFormError, setMemberFormError] = useState<string | null>(null)
  const { toasts, removeToast, success, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('admin')) {
      navigate('/login')
      return
    }

    const querySearch = searchParams.get('search') || ''
    const pageParam = Number(searchParams.get('page') || '1')

    setMemberSearch(querySearch)
    setActiveSearch(querySearch)
    loadMembers(pageParam, querySearch, true)
    loadExpiringSubscriptions(expiringDays)
  }, [navigate])

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openCreateMemberModal()
      searchParams.delete('action')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams])

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

  const handleLogout = () => {
    AuthService.logout()
    navigate('/')
  }

  const loadPlanCatalog = async () => {
    try {
      setPlanLoading(true)
      const response = await adminService.getPlanCatalog()
      setPlanCatalog(response.data)
      if (response.data.length > 0 && response.data[0].options.length > 0) {
        setSelectedPlanId(String(response.data[0].options[0].id))
      }
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setSubscriptionFormError(apiError.message)
    } finally {
      setPlanLoading(false)
    }
  }

  const loadExpiringSubscriptions = async (days: number) => {
    try {
      const response = await adminService.getExpiringSubscriptions({
        days,
        page: 1,
        pageSize: 5,
      })
      setExpiringSubscriptions(response.data)
      setExpiringTotal(response.pagination.total_items)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load expiring subscriptions', apiError.message)
    }
  }

  const handleMemberSearch = async () => {
    const searchText = memberSearch.trim()
    setActiveSearch(searchText)

    const nextParams = new URLSearchParams(searchParams)
    if (searchText) {
      nextParams.set('search', searchText)
    } else {
      nextParams.delete('search')
    }
    nextParams.set('page', '1')
    setSearchParams(nextParams)

    await loadMembers(1, searchText, true)
  }

  const openCreateMemberModal = () => {
    setEditingMemberId(null)
    setMemberForm(DEFAULT_MEMBER_FORM)
    setMemberFormError(null)
    setIsMemberModalOpen(true)
  }

  const openAssignSubscriptionModal = async (member: MemberRecord) => {
    setSubscriptionMember(member)
    setSubscriptionFormError(null)
    setSubscriptionStartDate(new Date().toISOString().slice(0, 10))
    setSelectedPlanId('')
    setIsSubscriptionModalOpen(true)
    await loadPlanCatalog()
  }

  const closeAssignSubscriptionModal = () => {
    setIsSubscriptionModalOpen(false)
    setSubscriptionMember(null)
    setSelectedPlanId('')
    setSubscriptionFormError(null)
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

  const handlePageChange = async (nextPage: number) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', String(nextPage))
    setSearchParams(params)
    await loadMembers(nextPage, activeSearch, true)
  }

  const handleAssignSubscription = async () => {
    if (!subscriptionMember) {
      return
    }

    if (!selectedPlanId) {
      setSubscriptionFormError('Please select a plan')
      return
    }

    try {
      setIsSubmittingSubscription(true)
      setSubscriptionFormError(null)

      const response = await adminService.assignSubscription(subscriptionMember.id, {
        plan_id: Number(selectedPlanId),
        start_date: subscriptionStartDate,
      })

      const sentCount = (response.notifications || []).filter((item) => item.status === 'sent').length
      const skippedCount = (response.notifications || []).filter((item) => item.status === 'skipped').length

      const notificationText =
        response.notifications && response.notifications.length > 0
          ? ` | Notifications: ${sentCount} sent${skippedCount > 0 ? `, ${skippedCount} skipped` : ''}`
          : ''

      success(
        'Subscription assigned',
        `Plan assigned to ${subscriptionMember.full_name}${notificationText}`
      )
      closeAssignSubscriptionModal()
      await loadExpiringSubscriptions(expiringDays)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setSubscriptionFormError(apiError.message)
    } finally {
      setIsSubmittingSubscription(false)
    }
  }

  const userInfo = AuthService.getUserInfo()
  const userName = userInfo?.name || 'Admin'

  return (
    <AdminShell
      title="Members"
      subtitle="Operational member management"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">Member Management</h2>
            <p className="text-sm text-text-secondary mt-1">
              Add, search, edit and delete members.
            </p>
          </div>

          <Button size="sm" onClick={openCreateMemberModal}>Add Member</Button>
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <Input
            value={memberSearch}
            onChange={(event) => setMemberSearch(event.target.value)}
            placeholder="Search by name or mobile number"
          />
          <Button size="sm" onClick={handleMemberSearch}>Search</Button>
        </div>

        <div className="mb-4 p-3 rounded-lg border border-border-light bg-bg-secondary/20">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-text-secondary">Expiring Subscriptions</p>
              <p className="text-xs text-text-secondary">
                {expiringTotal} active subscription(s) expiring in the selected window.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={String(expiringDays)}
                options={[
                  { value: '7', label: 'Next 7 days' },
                  { value: '15', label: 'Next 15 days' },
                  { value: '30', label: 'Next 30 days' },
                ]}
                onChange={async (event) => {
                  const days = Number(event.target.value)
                  setExpiringDays(days)
                  await loadExpiringSubscriptions(days)
                }}
              />
            </div>
          </div>
          {expiringSubscriptions.length > 0 && (
            <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {expiringSubscriptions.map((item) => (
                <div key={item.id} className="text-xs text-text-secondary rounded border border-border-light px-3 py-2">
                  Member #{item.member_id} | {item.plan_family} {item.plan_variant ? `(${item.plan_variant})` : ''} | Ends {item.end_date}
                </div>
              ))}
            </div>
          )}
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
                    <TableCell className="text-sm text-text-secondary">{member.full_name}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{member.mobile_number}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{member.joining_date}</TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                          member.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{member.email || '-'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button size="sm" variant="secondary" onClick={() => openEditMemberModal(member)}>
                          Edit
                        </Button>
                        <Button size="sm" variant="secondary" onClick={() => openAssignSubscriptionModal(member)}>
                          Assign Plan
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary text-text-secondary hover:bg-primary-dark focus:ring-primary"
                          onClick={() => handleDeleteMember(member)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-text-secondary">
                Showing page {pagination.page} of {Math.max(pagination.total_pages, 1)} ({pagination.total_items} members)
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pagination.page >= pagination.total_pages || pagination.total_pages === 0}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>

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

      <Modal
        isOpen={isSubscriptionModalOpen}
        onClose={closeAssignSubscriptionModal}
        title={subscriptionMember ? `Assign Plan to ${subscriptionMember.full_name}` : 'Assign Plan'}
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeAssignSubscriptionModal}>
              Cancel
            </Button>
            <Button onClick={handleAssignSubscription} isLoading={isSubmittingSubscription}>
              Assign Subscription
            </Button>
          </div>
        }
      >
        {planLoading ? (
          <p className="text-sm text-text-secondary">Loading plans...</p>
        ) : (
          <div className="space-y-4">
            <Input
              label="Start Date"
              type="date"
              value={subscriptionStartDate}
              onChange={(event) => setSubscriptionStartDate(event.target.value)}
            />

            <Select
              label="Membership Plan"
              value={selectedPlanId}
              options={planCatalog.flatMap((family) =>
                family.options.map((option) => ({
                  value: String(option.id),
                  label: `${family.family} - ${option.variant || option.duration_label} (INR ${option.base_price})`,
                }))
              )}
              onChange={(event) => setSelectedPlanId(event.target.value)}
            />

            {selectedPlanId && (
              <div className="rounded border border-border-light px-3 py-2 text-sm text-text-secondary">
                {(() => {
                  const selected = planCatalog
                    .flatMap((family) => family.options.map((option) => ({ option, family })))
                    .find((entry) => String(entry.option.id) === selectedPlanId)

                  if (!selected) {
                    return 'Select a plan to view pricing details.'
                  }

                  return `Base INR ${selected.option.base_price.toLocaleString('en-IN')} + GST ${selected.option.tax_percent}% = INR ${selected.option.total_price.toLocaleString('en-IN')}`
                })()}
              </div>
            )}
          </div>
        )}

        {subscriptionFormError && (
          <p className="text-red-600 text-sm mt-4">{subscriptionFormError}</p>
        )}
      </Modal>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}

