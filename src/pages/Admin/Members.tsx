import { useEffect, useMemo, useState } from 'react'
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
import { USER_ROLES } from '../../auth/roles'
import { adminService } from '../../services/adminService'
import {
  ExpiringSubscriptionsApiResponse,
  InvoiceRecord,
  MemberListPagination,
  MemberPayload,
  MemberRecord,
  PlanFamilyRecord,
  SubscriptionDurationUnit,
  SubscriptionRecord,
} from '../../types'
import { formatMembershipPlanName } from '../../utils/format'
import AdminShell from '../../layouts/AdminShell'

const ASSIGNABLE_MEMBERSHIP_LABELS = [
  'VYON BASIC',
  'VYON ADVANCE',
  'VYON PRO - Prime',
  'VYON PRO - Elite',
  'VYON PRO - Master',
] as const

type AssignablePlanEntry = {
  label: (typeof ASSIGNABLE_MEMBERSHIP_LABELS)[number]
  option: PlanFamilyRecord['options'][number]
}

function computeAssignablePlanLabel(family: string, variant: string | null): string {
  if (family.toUpperCase() === 'VYON PRO' && variant) {
    return `VYON PRO - ${variant}`
  }
  return family
}

function computeEndDate(startDate: string, durationValue: number, durationUnit: SubscriptionDurationUnit): string {
  if (!startDate || !Number.isFinite(durationValue) || durationValue <= 0) {
    return ''
  }

  const [yearText, monthText, dayText] = startDate.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  if (!year || !month || !day) {
    return ''
  }

  if (durationUnit === 'months') {
    const monthIndex = month - 1 + durationValue
    const endYear = year + Math.floor(monthIndex / 12)
    const endMonth = (monthIndex % 12) + 1
    const lastDay = new Date(Date.UTC(endYear, endMonth, 0)).getUTCDate()
    const endDay = Math.min(day, lastDay)
    const endDate = new Date(Date.UTC(endYear, endMonth - 1, endDay))
    endDate.setUTCDate(endDate.getUTCDate() - 1)
    return endDate.toISOString().slice(0, 10)
  }

  const endDate = new Date(Date.UTC(year, month - 1, day))
  endDate.setUTCDate(endDate.getUTCDate() + durationValue - 1)
  return endDate.toISOString().slice(0, 10)
}

function addOneDay(isoDate: string): string {
  const [yearText, monthText, dayText] = isoDate.split('-')
  const year = Number(yearText)
  const month = Number(monthText)
  const day = Number(dayText)
  if (!year || !month || !day) {
    return ''
  }
  const next = new Date(Date.UTC(year, month - 1, day))
  next.setUTCDate(next.getUTCDate() + 1)
  return next.toISOString().slice(0, 10)
}

function computeEndDateWithBonus(
  startDate: string,
  durationValue: number,
  durationUnit: SubscriptionDurationUnit,
  bonusValue: number,
  bonusUnit: SubscriptionDurationUnit
): string {
  const paidEnd = computeEndDate(startDate, durationValue, durationUnit)
  if (!paidEnd) {
    return ''
  }
  if (!Number.isFinite(bonusValue) || bonusValue <= 0) {
    return paidEnd
  }
  const bonusStart = addOneDay(paidEnd)
  return computeEndDate(bonusStart, bonusValue, bonusUnit)
}

function formatDisplayDate(value: string | null | undefined): string {
  if (!value) {
    return '-'
  }

  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount)
}

const DEFAULT_MEMBER_FORM = {
  full_name: '',
  mobile_number: '',
  joining_date: new Date().toISOString().slice(0, 10),
  status: 'active' as 'active' | 'inactive',
  email: '',
  date_of_birth: '',
  gender: '' as '' | 'male' | 'female' | 'other',
  address: '',
}

type MemberFormState = typeof DEFAULT_MEMBER_FORM

type MembershipActionType = 'assign' | 'renew' | 'view' | 'pay'

type MembershipDisplayStatus =
  | 'active_paid'
  | 'active_pending_payment'
  | 'inactive_unpaid'
  | 'expired'
  | 'none'

type MembershipListSnapshot = {
  action: MembershipActionType
  membershipStatus: MembershipDisplayStatus
  currentPlanLabel: string | null
  expiryDate: string | null
  focusSubscriptionId: number | null
  activeMemberships: Array<{ subscription_id: number; plan_label: string; end_date: string }>
}

function membershipSnapshotFromMember(member: MemberRecord): MembershipListSnapshot {
  const statusKey = member.membership_status || 'none'
  const membershipStatus: MembershipDisplayStatus =
    statusKey === 'active' ? 'active_paid' : statusKey

  let action: MembershipActionType = 'assign'
  if (membershipStatus === 'active_paid') {
    action = 'view'
  } else if (
    membershipStatus === 'active_pending_payment' ||
    membershipStatus === 'inactive_unpaid'
  ) {
    action = 'pay'
  } else if (membershipStatus === 'expired') {
    action = 'renew'
  }

  return {
    action,
    membershipStatus,
    currentPlanLabel: member.current_plan_label || null,
    expiryDate: member.membership_expiry_date || null,
    focusSubscriptionId: member.focus_subscription_id ?? null,
    activeMemberships: member.active_memberships || [],
  }
}

type SubscriptionModalMode = 'assign' | 'change'

export default function AdminMembers() {
  const todayIso = new Date().toISOString().slice(0, 10)
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [members, setMembers] = useState<MemberRecord[]>([])
  const [membersLoading, setMembersLoading] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const [activeSearch, setActiveSearch] = useState('')
  const [membershipStatusFilter, setMembershipStatusFilter] = useState('')
  const [sortByExpiry, setSortByExpiry] = useState(false)
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
  const [subscriptionModalMode, setSubscriptionModalMode] = useState<SubscriptionModalMode>('assign')
  const [changingSubscriptionId, setChangingSubscriptionId] = useState<number | null>(null)
  const [isSubmittingMember, setIsSubmittingMember] = useState(false)
  const [isSubmittingSubscription, setIsSubmittingSubscription] = useState(false)
  const [editingMemberId, setEditingMemberId] = useState<number | null>(null)
  const [subscriptionMember, setSubscriptionMember] = useState<MemberRecord | null>(null)
  const [editMemberSubscriptions, setEditMemberSubscriptions] = useState<SubscriptionRecord[]>([])
  const [editMemberSubscriptionsLoading, setEditMemberSubscriptionsLoading] = useState(false)
  const [planCatalog, setPlanCatalog] = useState<PlanFamilyRecord[]>([])
  const [planLoading, setPlanLoading] = useState(false)
  const [selectedPlanId, setSelectedPlanId] = useState<string>('')
  const [subscriptionStartDate, setSubscriptionStartDate] = useState(
    new Date().toISOString().slice(0, 10)
  )
  const [subscriptionDurationValue, setSubscriptionDurationValue] = useState('1')
  const [subscriptionDurationUnit, setSubscriptionDurationUnit] = useState<SubscriptionDurationUnit>('months')
  const [subscriptionBonusValue, setSubscriptionBonusValue] = useState('')
  const [subscriptionBonusUnit, setSubscriptionBonusUnit] = useState<SubscriptionDurationUnit>('months')
  const [subscriptionFormError, setSubscriptionFormError] = useState<string | null>(null)
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<
    ExpiringSubscriptionsApiResponse['data']
  >([])
  const [expiringDays, setExpiringDays] = useState(7)
  const [expiringTotal, setExpiringTotal] = useState(0)
  const [expiringPage, setExpiringPage] = useState(1)
  const [expiringTotalPages, setExpiringTotalPages] = useState(0)
  const [expiringUnavailable, setExpiringUnavailable] = useState(false)
  const [isExportingMembers, setIsExportingMembers] = useState(false)
  const [isExportingExpiring, setIsExportingExpiring] = useState(false)
  const [listMode, setListMode] = useState<'members' | 'expiring'>('members')
  const [expiringLoadedOnce, setExpiringLoadedOnce] = useState(false)
  const [isViewMembershipModalOpen, setIsViewMembershipModalOpen] = useState(false)
  const [viewMembershipLoading, setViewMembershipLoading] = useState(false)
  const [viewMembershipMember, setViewMembershipMember] = useState<MemberRecord | null>(null)
  const [viewMembershipSubscriptions, setViewMembershipSubscriptions] = useState<SubscriptionRecord[]>([])
  const [viewMembershipSubscription, setViewMembershipSubscription] = useState<SubscriptionRecord | null>(null)
  const [viewMembershipInvoice, setViewMembershipInvoice] = useState<InvoiceRecord | null>(null)
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false)
  const [memberForm, setMemberForm] = useState<MemberFormState>(DEFAULT_MEMBER_FORM)
  const [memberFormError, setMemberFormError] = useState<string | null>(null)
  const [activeDeviceSn, setActiveDeviceSn] = useState<string | null>(null)
  const [syncingMemberId, setSyncingMemberId] = useState<number | null>(null)
  const [isResyncModalOpen, setIsResyncModalOpen] = useState(false)
  const [isResyncingDevices, setIsResyncingDevices] = useState(false)
  const [resyncError, setResyncError] = useState<string | null>(null)
  const { toasts, removeToast, success, error: errorToast } = useToast()

  const assignablePlans = useMemo(() => {
    const flattened = planCatalog.flatMap((family) =>
      family.options.map((option) => ({
        option,
        label: computeAssignablePlanLabel(family.family, option.variant),
      }))
    )

    const toKey = (value: string) => value.trim().toLowerCase()
    const byLabel = new Map<string, (typeof flattened)[number]>()
    for (const entry of flattened) {
      const key = toKey(entry.label)
      if (!byLabel.has(key)) {
        byLabel.set(key, entry)
      }
    }

    const ordered: AssignablePlanEntry[] = []
    for (const label of ASSIGNABLE_MEMBERSHIP_LABELS) {
      const matched = byLabel.get(toKey(label))
      if (matched) {
        ordered.push({
          label,
          option: matched.option,
        })
      }
    }

    return ordered
  }, [planCatalog])

  const parsedDurationValue = Number.parseInt(subscriptionDurationValue, 10)
  const parsedBonusValue = Number.parseInt(subscriptionBonusValue, 10)
  const calculatedSubscriptionEndDate = useMemo(
    () =>
      computeEndDateWithBonus(
        subscriptionStartDate,
        parsedDurationValue,
        subscriptionDurationUnit,
        Number.isFinite(parsedBonusValue) ? parsedBonusValue : 0,
        subscriptionBonusUnit
      ),
    [
      subscriptionStartDate,
      parsedDurationValue,
      subscriptionDurationUnit,
      parsedBonusValue,
      subscriptionBonusUnit,
    ]
  )

  const selectedAssignablePlan = useMemo(
    () => assignablePlans.find((entry) => String(entry.option.id) === selectedPlanId) || null,
    [assignablePlans, selectedPlanId]
  )

  const viewMembershipStatus = useMemo<MembershipDisplayStatus>(() => {
    if (!viewMembershipSubscription) {
      return 'none'
    }

    const today = new Date().toISOString().slice(0, 10)
    if (!(viewMembershipSubscription.status === 'active' && viewMembershipSubscription.end_date >= today)) {
      return 'expired'
    }

    const paymentStatus = (viewMembershipSubscription.payment_status || '').trim().toLowerCase()
    if (paymentStatus === 'paid') {
      return 'active_paid'
    }

    if (paymentStatus === 'partial') {
      return 'active_pending_payment'
    }

    return 'inactive_unpaid'
  }, [viewMembershipSubscription])

  const viewMembershipFinalAmount = useMemo(() => {
    if (!viewMembershipSubscription) {
      return 0
    }

    return viewMembershipInvoice?.final_amount_received ?? viewMembershipSubscription.total_amount
  }, [viewMembershipInvoice, viewMembershipSubscription])

  const viewMembershipAmountPaid = useMemo(() => {
    if (!viewMembershipSubscription) {
      return 0
    }

    if (viewMembershipInvoice?.total_paid != null) {
      return viewMembershipInvoice.total_paid
    }

    if (viewMembershipInvoice?.amount_paid_today != null) {
      return viewMembershipInvoice.amount_paid_today
    }

    return viewMembershipSubscription.payment_status === 'paid' ? viewMembershipFinalAmount : 0
  }, [viewMembershipFinalAmount, viewMembershipInvoice, viewMembershipSubscription])

  const viewMembershipOutstandingBalance = useMemo(() => {
    if (!viewMembershipSubscription) {
      return 0
    }

    if (viewMembershipInvoice?.outstanding_balance != null) {
      return viewMembershipInvoice.outstanding_balance
    }

    return Math.max(viewMembershipFinalAmount - viewMembershipAmountPaid, 0)
  }, [viewMembershipAmountPaid, viewMembershipFinalAmount, viewMembershipInvoice, viewMembershipSubscription])

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    const querySearch = searchParams.get('search') || ''
    const pageParam = Number(searchParams.get('page') || '1')

    setMemberSearch(querySearch)
    setActiveSearch(querySearch)
    loadMembers(pageParam, querySearch, true)
    void loadActivePushDevice()
  }, [navigate])

  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      openCreateMemberModal()
      searchParams.delete('action')
      setSearchParams(searchParams, { replace: true })
    }
  }, [searchParams])

  useEffect(() => {
    if (!isSubscriptionModalOpen) {
      return
    }

    if (assignablePlans.length === 0) {
      return
    }

    const selectedExists = assignablePlans.some((entry) => String(entry.option.id) === selectedPlanId)
    if (!selectedExists) {
      setSelectedPlanId(String(assignablePlans[0].option.id))
    }
  }, [assignablePlans, isSubscriptionModalOpen, selectedPlanId])

  const loadMembers = async (
    page = memberPage,
    search = activeSearch,
    showLoader = false,
    statusFilter = membershipStatusFilter,
    sortExpiry = sortByExpiry
  ) => {
    try {
      if (showLoader) {
        setMembersLoading(true)
      }
      const response = await adminService.getMembers({
        page,
        pageSize,
        search,
        membershipStatus: statusFilter || undefined,
        sort: sortExpiry ? 'expiry' : undefined,
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
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setSubscriptionFormError(apiError.message)
    } finally {
      setPlanLoading(false)
    }
  }

  const loadExpiringSubscriptions = async (days: number, page = 1) => {
    try {
      const response = await adminService.getExpiringSubscriptions({
        days,
        page,
        pageSize: 25,
      })
      setExpiringSubscriptions(response.data)
      setExpiringTotal(response.pagination.total_items)
      setExpiringPage(response.pagination.page)
      setExpiringTotalPages(response.pagination.total_pages)
      setExpiringUnavailable(false)
    } catch (err) {
      console.error('Failed to load expiring subscriptions', err)
      setExpiringSubscriptions([])
      setExpiringTotal(0)
      setExpiringPage(1)
      setExpiringTotalPages(0)
      setExpiringUnavailable(true)
    }
  }

  const openExpiringList = async () => {
    setListMode('expiring')
    if (!expiringLoadedOnce) {
      await loadExpiringSubscriptions(expiringDays, 1)
      setExpiringLoadedOnce(true)
    }
  }

  const handleExportExpiringSubscriptions = async () => {
    try {
      setIsExportingExpiring(true)
      const blob = await adminService.exportExpiringSubscriptionsExcel(expiringDays)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `expiring-subscriptions-next-${expiringDays}-days.xlsx`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      success('Export ready', `Expiring members (next ${expiringDays} days) downloaded`)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Export failed', apiError.message)
    } finally {
      setIsExportingExpiring(false)
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

  const handleExportMembers = async () => {
    try {
      setIsExportingMembers(true)
      const blob = await adminService.exportMembersExcel()
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      const today = new Date().toISOString().slice(0, 10)
      anchor.href = url
      anchor.download = `vyon-members-${today}.xlsx`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      success('Export ready', 'Member list downloaded as Excel')
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Export failed', apiError.message)
    } finally {
      setIsExportingMembers(false)
    }
  }

  const openCreateMemberModal = () => {
    setEditingMemberId(null)
    setMemberForm(DEFAULT_MEMBER_FORM)
    setMemberFormError(null)
    setIsMemberModalOpen(true)
  }

  const openAssignSubscriptionModal = async (member: MemberRecord) => {
    setSubscriptionModalMode('assign')
    setChangingSubscriptionId(null)
    setSubscriptionMember(member)
    setSubscriptionFormError(null)
    setSubscriptionStartDate(new Date().toISOString().slice(0, 10))
    setSubscriptionDurationValue('1')
    setSubscriptionDurationUnit('months')
    setSubscriptionBonusValue('')
    setSubscriptionBonusUnit('months')
    setSelectedPlanId('')
    setIsSubscriptionModalOpen(true)
    await loadPlanCatalog()
  }

  const openChangePlanModal = async (member: MemberRecord, subscription: SubscriptionRecord) => {
    setSubscriptionModalMode('change')
    setChangingSubscriptionId(subscription.id)
    setSubscriptionMember(member)
    setSubscriptionFormError(null)
    setSubscriptionStartDate(subscription.start_date || new Date().toISOString().slice(0, 10))
    setSubscriptionDurationValue(
      subscription.duration_value != null ? String(subscription.duration_value) : '1'
    )
    setSubscriptionDurationUnit(
      subscription.duration_unit === 'days' || subscription.duration_unit === 'months'
        ? subscription.duration_unit
        : 'months'
    )
    setSubscriptionBonusValue(
      subscription.bonus_duration_value != null && subscription.bonus_duration_value > 0
        ? String(subscription.bonus_duration_value)
        : ''
    )
    setSubscriptionBonusUnit(
      subscription.bonus_duration_unit === 'days' || subscription.bonus_duration_unit === 'months'
        ? subscription.bonus_duration_unit
        : 'months'
    )
    setSelectedPlanId(String(subscription.plan_id))
    setIsSubscriptionModalOpen(true)
    await loadPlanCatalog()
  }

  const closeViewMembershipModal = () => {
    setIsViewMembershipModalOpen(false)
    setViewMembershipMember(null)
    setViewMembershipSubscriptions([])
    setViewMembershipSubscription(null)
    setViewMembershipInvoice(null)
  }

  const closeAssignSubscriptionModal = () => {
    setIsSubscriptionModalOpen(false)
    setSubscriptionModalMode('assign')
    setChangingSubscriptionId(null)
    setSubscriptionMember(null)
    setSelectedPlanId('')
    setSubscriptionDurationValue('1')
    setSubscriptionDurationUnit('months')
    setSubscriptionBonusValue('')
    setSubscriptionBonusUnit('months')
    setSubscriptionFormError(null)
  }

  const loadEditMemberSubscriptions = async (memberId: number) => {
    try {
      setEditMemberSubscriptionsLoading(true)
      const response = await adminService.getMemberSubscriptions(memberId)
      const today = new Date().toISOString().slice(0, 10)
      const active = (response.data || []).filter(
        (item) => item.status === 'active' && item.end_date >= today
      )
      setEditMemberSubscriptions(active)
    } catch {
      setEditMemberSubscriptions([])
    } finally {
      setEditMemberSubscriptionsLoading(false)
    }
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
    })
    setMemberFormError(null)
    setEditMemberSubscriptions([])
    setIsMemberModalOpen(true)
    void loadEditMemberSubscriptions(member.id)
  }

  const closeMemberModal = () => {
    setIsMemberModalOpen(false)
    setEditingMemberId(null)
    setMemberForm(DEFAULT_MEMBER_FORM)
    setMemberFormError(null)
    setEditMemberSubscriptions([])
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

  const loadActivePushDevice = async () => {
    try {
      const response = await adminService.getPushDevices()
      const activeDevices = (response.devices || []).filter((device) => device.is_active)
      setActiveDeviceSn(activeDevices[0]?.serial_number ?? null)
    } catch {
      setActiveDeviceSn(null)
    }
  }

  const resolveDeviceSnOrToast = () => {
    if (!activeDeviceSn) {
      errorToast('No device registered', 'Connect a PUSH device before syncing members.')
      return null
    }
    return activeDeviceSn
  }

  const isMemberDeviceSynced = (member: MemberRecord) =>
    (member.device_sync_status || '').toLowerCase() === 'synced'

  const deviceSyncBadge = (member: MemberRecord) => {
    const status = (member.device_sync_status || '').toLowerCase()
    if (status === 'synced') {
      return { label: 'Synced', className: 'bg-green-100 text-green-700' }
    }
    if (status === 'pending') {
      return { label: 'Pending', className: 'bg-amber-100 text-amber-800' }
    }
    if (status === 'failed') {
      return { label: 'Failed', className: 'bg-red-100 text-red-700' }
    }
    return { label: 'Not synced', className: 'bg-bg-secondary text-text-secondary' }
  }

  const handleSyncMemberToDevice = async (member: MemberRecord) => {
    const deviceSn = resolveDeviceSnOrToast()
    if (!deviceSn) {
      return
    }

    setSyncingMemberId(member.id)
    try {
      await adminService.syncMemberToDevice(deviceSn, member.id)
      success('Member sync queued', `Waiting for device ${deviceSn} to confirm`)
      setMembers((prev) =>
        prev.map((row) =>
          row.id === member.id
            ? {
                ...row,
                device_sync_status: 'pending',
                last_device_sync_at: null,
              }
            : row
        )
      )
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to sync member', apiError.message)
    } finally {
      setSyncingMemberId(null)
    }
  }

  const handleConfirmResyncDevices = async () => {
    const deviceSn = resolveDeviceSnOrToast()
    if (!deviceSn) {
      return
    }

    setResyncError(null)
    setIsResyncingDevices(true)
    try {
      const response = await adminService.resyncAllMembersToDevice(deviceSn)
      setIsResyncModalOpen(false)
      const membersCount = response.members_synced ?? response.queued_commands
      success(
        'Device re-sync queued',
        `${membersCount} member(s) pending confirmation from ${deviceSn}`
      )
      setMembers((prev) =>
        prev.map((row) => ({
          ...row,
          device_sync_status: 'pending',
          last_device_sync_at: null,
        }))
      )
      await loadMembers(memberPage, activeSearch, false)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setResyncError(apiError.message)
      errorToast('Failed to re-sync devices', apiError.message)
    } finally {
      setIsResyncingDevices(false)
    }
  }

  const handleDeleteMember = async (member: MemberRecord) => {
    const confirmed = window.confirm(
      `Delete member ${member.full_name}? This will permanently remove all their memberships and invoices.`
    )
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

  const openSubscriptionPaymentPage = (member: MemberRecord, subscriptionId: number | null) => {
    if (!subscriptionId) {
      errorToast('Payment route unavailable', 'Unable to find an active subscription for this member.')
      return
    }

    navigate(`/admin/subscriptions/${subscriptionId}/payment`, {
      state: {
        memberName: member.full_name,
      },
    })
  }

  const handleAssignSubscription = async () => {
    if (!subscriptionMember) {
      return
    }

    if (!selectedPlanId) {
      setSubscriptionFormError('Please select a plan')
      return
    }

    if (!Number.isFinite(parsedDurationValue) || parsedDurationValue <= 0) {
      setSubscriptionFormError('Duration value must be greater than zero')
      return
    }

    if (subscriptionDurationUnit !== 'months' && subscriptionDurationUnit !== 'days') {
      setSubscriptionFormError('Duration unit must be Months or Days')
      return
    }

    const hasBonusInput = subscriptionBonusValue.trim() !== ''
    if (hasBonusInput && (!Number.isFinite(parsedBonusValue) || parsedBonusValue < 0)) {
      setSubscriptionFormError('Bonus value must be zero or greater')
      return
    }

    if (
      hasBonusInput &&
      parsedBonusValue > 0 &&
      subscriptionBonusUnit !== 'months' &&
      subscriptionBonusUnit !== 'days'
    ) {
      setSubscriptionFormError('Bonus unit must be Months or Days')
      return
    }

    if (!calculatedSubscriptionEndDate) {
      setSubscriptionFormError('Unable to calculate end date from the selected duration')
      return
    }

    const bonusPayload =
      hasBonusInput && parsedBonusValue > 0
        ? {
            bonus_duration_value: parsedBonusValue,
            bonus_duration_unit: subscriptionBonusUnit,
          }
        : {
            bonus_duration_value: 0,
            bonus_duration_unit: subscriptionBonusUnit,
          }

    try {
      setIsSubmittingSubscription(true)
      setSubscriptionFormError(null)

      if (subscriptionModalMode === 'change') {
        if (!changingSubscriptionId) {
          setSubscriptionFormError('Unable to identify the membership to update')
          return
        }

        const response = await adminService.changeSubscriptionPlan(changingSubscriptionId, {
          plan_id: Number(selectedPlanId),
          start_date: subscriptionStartDate,
          duration_value: parsedDurationValue,
          duration_unit: subscriptionDurationUnit,
          ...bonusPayload,
        })

        success('Membership updated', `Plan updated for ${subscriptionMember.full_name}`)
        closeAssignSubscriptionModal()
        closeViewMembershipModal()
        closeMemberModal()
        await loadMembers(memberPage, activeSearch, false)
        await loadExpiringSubscriptions(expiringDays)

        if ((response.data.payment_status || '').toLowerCase() !== 'paid') {
          navigate(`/admin/subscriptions/${response.data.id}/payment`, {
            state: {
              subscription: response.data,
              memberName: subscriptionMember.full_name,
            },
          })
        }
        return
      }

      const response = await adminService.assignSubscription(subscriptionMember.id, {
        plan_id: Number(selectedPlanId),
        start_date: subscriptionStartDate,
        duration_value: parsedDurationValue,
        duration_unit: subscriptionDurationUnit,
        ...bonusPayload,
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
      closeMemberModal()
      navigate(`/admin/subscriptions/${response.data.id}/payment`, {
        state: {
          subscription: response.data,
          memberName: subscriptionMember.full_name,
        },
      })
      await loadExpiringSubscriptions(expiringDays)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      setSubscriptionFormError(apiError.message)
    } finally {
      setIsSubmittingSubscription(false)
    }
  }

  const handleDownloadInvoice = async () => {
    if (!viewMembershipInvoice) {
      return
    }

    try {
      setIsDownloadingInvoice(true)
      const blob = await adminService.downloadInvoicePdf(viewMembershipInvoice.id)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${viewMembershipInvoice.invoice_number || `invoice-${viewMembershipInvoice.id}`}.pdf`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Unable to download invoice', apiError.message)
    } finally {
      setIsDownloadingInvoice(false)
    }
  }

  const openViewMembershipModal = async (member: MemberRecord) => {
    try {
      setIsViewMembershipModalOpen(true)
      setViewMembershipLoading(true)
      setViewMembershipMember(member)
      setViewMembershipSubscriptions([])
      setViewMembershipSubscription(null)
      setViewMembershipInvoice(null)

      const subscriptionsResponse = await adminService.getMemberSubscriptions(member.id)
      const subscriptions = subscriptionsResponse.data || []

      if (subscriptions.length === 0) {
        setViewMembershipLoading(false)
        return
      }

      const today = new Date().toISOString().slice(0, 10)
      const activeSubscriptions = subscriptions.filter(
        (item) => item.status === 'active' && item.end_date >= today
      )
      const selectedSubscription = activeSubscriptions[0] || subscriptions[0]
      setViewMembershipSubscriptions(activeSubscriptions.length > 0 ? activeSubscriptions : [selectedSubscription])
      setViewMembershipSubscription(selectedSubscription)

      const invoiceResponse = await adminService.getInvoices({
        page: 1,
        pageSize: 20,
        memberId: member.id,
      })
      const linkedInvoice =
        invoiceResponse.data.find((invoice) => invoice.subscription_id === selectedSubscription.id) || null
      setViewMembershipInvoice(linkedInvoice)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load membership details', apiError.message)
      closeViewMembershipModal()
    } finally {
      setViewMembershipLoading(false)
    }
  }

  const selectViewMembershipSubscription = async (subscription: SubscriptionRecord) => {
    if (!viewMembershipMember) {
      return
    }

    setViewMembershipSubscription(subscription)
    try {
      const invoiceResponse = await adminService.getInvoices({
        page: 1,
        pageSize: 20,
        memberId: viewMembershipMember.id,
      })
      const linkedInvoice =
        invoiceResponse.data.find((invoice) => invoice.subscription_id === subscription.id) || null
      setViewMembershipInvoice(linkedInvoice)
    } catch {
      setViewMembershipInvoice(null)
    }
  }

  const membershipStatusBadge = (status: MembershipDisplayStatus) => {
    if (status === 'active_paid') {
      return 'bg-green-100 text-green-700'
    }

    if (status === 'active_pending_payment') {
      return 'bg-amber-100 text-amber-700'
    }

    if (status === 'inactive_unpaid') {
      return 'bg-rose-100 text-rose-700'
    }

    if (status === 'expired') {
      return 'bg-orange-100 text-orange-700'
    }

    return 'bg-gray-100 text-gray-700'
  }

  const membershipStatusLabel = (status: MembershipDisplayStatus) => {
    if (status === 'active_paid') {
      return 'Active'
    }

    if (status === 'active_pending_payment') {
      return 'Active - Pending Payment'
    }

    if (status === 'inactive_unpaid') {
      return 'Inactive (Unpaid)'
    }

    if (status === 'none') {
      return 'No Membership'
    }

    return status.charAt(0).toUpperCase() + status.slice(1)
  }

  const userInfo = AuthService.getUserInfo()
  const userName = userInfo?.name || 'Admin'
  const isSuperAdmin = userInfo?.role === USER_ROLES.SUPER_ADMIN

  return (
    <AdminShell
      title="Members"
      subtitle="Operational member management"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5 lg:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">Member Management</h2>
            <p className="text-sm text-text-secondary mt-1">
              {listMode === 'members'
                ? 'Add, search, edit and delete members.'
                : 'Review memberships expiring soon and export the full list.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {listMode === 'members' && isSuperAdmin && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isResyncingDevices}
                onClick={() => {
                  setResyncError(null)
                  setIsResyncModalOpen(true)
                }}
              >
                Re-sync Devices
              </Button>
            )}
            {listMode === 'members' && isSuperAdmin && (
              <Button size="sm" variant="secondary" onClick={() => navigate('/admin/admins')}>
                Add Admin
              </Button>
            )}
            {listMode === 'members' && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isExportingMembers}
                onClick={() => {
                  void handleExportMembers()
                }}
              >
                {isExportingMembers ? 'Exporting...' : 'Export to Excel'}
              </Button>
            )}
            {listMode === 'members' && (
              <Button size="sm" onClick={openCreateMemberModal}>Add Member</Button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          <Button
            size="sm"
            variant={listMode === 'members' ? 'primary' : 'secondary'}
            onClick={() => setListMode('members')}
          >
            All Members
          </Button>
          <Button
            size="sm"
            variant={listMode === 'expiring' ? 'primary' : 'secondary'}
            onClick={() => void openExpiringList()}
          >
            Expiring
          </Button>
        </div>

        {listMode === 'members' ? (
          <>
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <Input
            value={memberSearch}
            onChange={(event) => setMemberSearch(event.target.value)}
            placeholder="Search by ID, name or mobile number"
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                void handleMemberSearch()
              }
            }}
          />
          <Select
            value={membershipStatusFilter}
            options={[
              { value: '', label: 'All statuses' },
              { value: 'active', label: 'Active' },
              { value: 'active_pending_payment', label: 'Active - Pending Payment' },
              { value: 'inactive_unpaid', label: 'Inactive (Unpaid)' },
              { value: 'expired', label: 'Expired' },
              { value: 'none', label: 'No Membership' },
            ]}
            onChange={(event) => {
              const nextFilter = event.target.value
              setMembershipStatusFilter(nextFilter)
              void loadMembers(1, activeSearch, true, nextFilter, sortByExpiry)
            }}
          />
          <Button
            size="sm"
            variant={sortByExpiry ? 'primary' : 'secondary'}
            onClick={() => {
              const nextSort = !sortByExpiry
              setSortByExpiry(nextSort)
              void loadMembers(1, activeSearch, true, membershipStatusFilter, nextSort)
            }}
          >
            {sortByExpiry ? 'Sorted by Expiry' : 'Sort by Expiry'}
          </Button>
          <Button size="sm" onClick={handleMemberSearch}>Search</Button>
        </div>
        {membersLoading ? (
          <p className="text-gray-500 py-8 text-center">Loading members...</p>
        ) : members.length === 0 ? (
          <p className="text-gray-500 py-8 text-center">No members found</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableHeaderCell>Member</TableHeaderCell>
                <TableHeaderCell>Mobile Number</TableHeaderCell>
                <TableHeaderCell>Membership</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Device</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  (() => {
                    const membership = membershipSnapshotFromMember(member)

                    return (
                  <TableRow
                    key={member.id}
                    onClick={() => navigate(`/admin/members/${member.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="max-w-[14rem] text-sm text-text-secondary">
                      <div className="space-y-0.5">
                        <p className="text-xs text-text-secondary">ID {member.id}</p>
                        <p className="truncate text-text-primary">{member.full_name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{member.mobile_number}</TableCell>
                    <TableCell className="max-w-[16rem] text-sm text-text-secondary">
                      {membership.activeMemberships.length > 0 ? (
                        <div className="space-y-1">
                          {membership.activeMemberships.map((item) => (
                            <div key={item.subscription_id} className="space-y-0.5">
                              <p className="truncate text-text-primary">
                                {formatMembershipPlanName(item.plan_label)}
                              </p>
                              <p className="text-xs text-text-secondary">
                                Expires: {formatDisplayDate(item.end_date)}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : membership.currentPlanLabel ? (
                        <div className="space-y-0.5">
                          <p className="truncate text-text-primary">
                            {formatMembershipPlanName(membership.currentPlanLabel)}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {membership.membershipStatus !== 'expired'
                              ? `Expires: ${formatDisplayDate(membership.expiryDate)}`
                              : `Expired: ${formatDisplayDate(membership.expiryDate)}`}
                          </p>
                        </div>
                      ) : (
                        <span>No Membership</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${membershipStatusBadge(membership.membershipStatus)}`}
                      >
                        {membershipStatusLabel(membership.membershipStatus)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const badge = deviceSyncBadge(member)
                        return (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${badge.className}`}
                          >
                            {badge.label}
                          </span>
                        )
                      })()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={(event) => {
                            event.stopPropagation()
                            openEditMemberModal(member)
                          }}
                        >
                          Edit
                        </Button>
                        {!isMemberDeviceSynced(member) && (
                          <Button
                            size="sm"
                            variant="secondary"
                            disabled={syncingMemberId === member.id}
                            onClick={(event) => {
                              event.stopPropagation()
                              void handleSyncMemberToDevice(member)
                            }}
                          >
                            {syncingMemberId === member.id ? 'Syncing…' : 'Sync'}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            if (membership.action === 'pay') {
                              openSubscriptionPaymentPage(member, membership.focusSubscriptionId)
                              return
                            }

                            if (membership.action === 'view') {
                              openViewMembershipModal(member)
                              return
                            }

                            openAssignSubscriptionModal(member)
                          }}
                        >
                          {membership.action === 'pay'
                            ? 'Record Payment'
                            : membership.action === 'view'
                            ? 'View'
                            : membership.action === 'renew'
                              ? 'Renew'
                              : 'Assign'}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-primary text-text-secondary hover:bg-primary-dark focus:ring-primary"
                          onClick={(event) => {
                            event.stopPropagation()
                            handleDeleteMember(member)
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                    )
                  })()
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
          </>
        ) : (
          <div>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-text-secondary">Expiring Subscriptions</p>
                <p className="text-xs text-text-secondary">
                  {expiringTotal > 0
                    ? `${expiringTotal} active subscription(s) expiring in the selected window.`
                    : 'No active subscriptions expiring in the selected window.'}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
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
                    await loadExpiringSubscriptions(days, 1)
                    setExpiringLoadedOnce(true)
                  }}
                />
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={isExportingExpiring || expiringTotal === 0}
                  onClick={() => void handleExportExpiringSubscriptions()}
                >
                  {isExportingExpiring ? 'Exporting...' : 'Export Expiring'}
                </Button>
              </div>
            </div>
            {expiringSubscriptions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableHeaderCell>Member</TableHeaderCell>
                    <TableHeaderCell>Plan</TableHeaderCell>
                    <TableHeaderCell>Ends</TableHeaderCell>
                    <TableHeaderCell className="text-right">Open</TableHeaderCell>
                  </TableHeader>
                  <TableBody>
                    {expiringSubscriptions.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="text-sm text-text-secondary">
                          <div className="space-y-0.5">
                            <p className="text-xs text-text-secondary">ID {item.member_id}</p>
                            <p className="text-text-primary">{item.member_name || '—'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">
                          {item.plan_label || `${item.plan_family}${item.plan_variant ? ` (${item.plan_variant})` : ''}`}
                        </TableCell>
                        <TableCell className="text-sm text-text-secondary">{item.end_date}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={(event) => {
                              event.stopPropagation()
                              navigate(`/admin/members/${item.member_id}`)
                            }}
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {expiringTotalPages > 1 && (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <p className="text-xs text-text-secondary">
                      Page {expiringPage} of {expiringTotalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={expiringPage <= 1}
                        onClick={() => void loadExpiringSubscriptions(expiringDays, expiringPage - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={expiringPage >= expiringTotalPages}
                        onClick={() => void loadExpiringSubscriptions(expiringDays, expiringPage + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-500 py-8 text-center">
                {expiringUnavailable
                  ? 'Expiring memberships are unavailable right now. Please try again shortly.'
                  : 'No expiring subscriptions in this window.'}
              </p>
            )}
          </div>
        )}
      </Card>

      <Modal
        isOpen={isResyncModalOpen}
        onClose={() => {
          if (!isResyncingDevices) {
            setIsResyncModalOpen(false)
            setResyncError(null)
          }
        }}
        title="Re-sync Devices"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={isResyncingDevices}
              onClick={() => {
                setIsResyncModalOpen(false)
                setResyncError(null)
              }}
            >
              Cancel
            </Button>
            <Button disabled={isResyncingDevices} onClick={() => void handleConfirmResyncDevices()}>
              {isResyncingDevices ? 'Syncing…' : 'Confirm Re-sync'}
            </Button>
          </>
        }
      >
        {isResyncingDevices ? (
          <div className="space-y-2">
            <p className="text-sm text-text-primary font-medium">Syncing members to device…</p>
            <p className="text-sm text-text-secondary">
              Queuing commands for{' '}
              <span className="text-text-primary font-medium">{activeDeviceSn}</span>. Please wait.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              Re-sync all active members to device hardware
              {activeDeviceSn ? (
                <>
                  {' '}
                  <span className="text-text-primary font-medium">{activeDeviceSn}</span>
                </>
              ) : null}
              ?
            </p>
            {resyncError ? (
              <p className="text-sm text-red-400">{resyncError}</p>
            ) : null}
          </div>
        )}
      </Modal>

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
            max={todayIso}
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
            min="1900-01-01"
            max={todayIso}
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
            label="Address"
            value={memberForm.address}
            onChange={(event) => updateMemberFormField('address', event.target.value)}
          />
        </div>

        {editingMemberId && (
          <div className="mt-6 rounded border border-border-light px-4 py-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-text-secondary">Active Memberships</p>
                <p className="text-xs text-text-secondary">
                  Change an existing plan or add another concurrent membership.
                </p>
              </div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  const member = members.find((item) => item.id === editingMemberId)
                  if (!member) {
                    return
                  }
                  void openAssignSubscriptionModal(member)
                }}
              >
                Add Plan
              </Button>
            </div>

            {editMemberSubscriptionsLoading ? (
              <p className="text-sm text-text-secondary">Loading memberships...</p>
            ) : editMemberSubscriptions.length === 0 ? (
              <p className="text-sm text-text-secondary">No active memberships for this member.</p>
            ) : (
              <div className="space-y-2">
                {editMemberSubscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded border border-border-light px-3 py-2"
                  >
                    <div>
                      <p className="text-sm text-text-primary">
                        {formatMembershipPlanName(subscription.plan_label)}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {formatDisplayDate(subscription.start_date)} – {formatDisplayDate(subscription.end_date)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => {
                        const member = members.find((item) => item.id === editingMemberId)
                        if (!member) {
                          return
                        }
                        void openChangePlanModal(member, subscription)
                      }}
                    >
                      Change Plan
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {memberFormError && <p className="text-red-600 text-sm mt-4">{memberFormError}</p>}
      </Modal>

      <Modal
        isOpen={isSubscriptionModalOpen}
        onClose={closeAssignSubscriptionModal}
        title={
          subscriptionMember
            ? subscriptionModalMode === 'change'
              ? `Change Plan for ${subscriptionMember.full_name}`
              : `Assign Plan to ${subscriptionMember.full_name}`
            : subscriptionModalMode === 'change'
              ? 'Change Plan'
              : 'Assign Plan'
        }
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={closeAssignSubscriptionModal}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignSubscription}
              isLoading={isSubmittingSubscription}
              className="whitespace-nowrap"
            >
              {subscriptionModalMode === 'change' ? 'Save Plan Change' : 'Continue to Payment'}
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
              options={assignablePlans.map((entry) => ({
                value: String(entry.option.id),
                label: entry.label,
              }))}
              onChange={(event) => setSelectedPlanId(event.target.value)}
            />

            <div className="rounded border border-border-light px-3 py-3">
              <p className="text-sm font-semibold text-text-secondary mb-3">Duration</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Value"
                  type="number"
                  min="1"
                  step="1"
                  value={subscriptionDurationValue}
                  onChange={(event) => setSubscriptionDurationValue(event.target.value)}
                />
                <Select
                  label="Unit"
                  value={subscriptionDurationUnit}
                  options={[
                    { value: 'months', label: 'Months' },
                    { value: 'days', label: 'Days' },
                  ]}
                  onChange={(event) => setSubscriptionDurationUnit(event.target.value as SubscriptionDurationUnit)}
                />
              </div>
            </div>

            <div className="rounded border border-border-light px-3 py-3">
              <p className="text-sm font-semibold text-text-secondary mb-3">Bonus</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  label="Value"
                  type="number"
                  min="0"
                  step="1"
                  value={subscriptionBonusValue}
                  onChange={(event) => setSubscriptionBonusValue(event.target.value)}
                  placeholder="Optional"
                />
                <Select
                  label="Unit"
                  value={subscriptionBonusUnit}
                  options={[
                    { value: 'months', label: 'Months' },
                    { value: 'days', label: 'Days' },
                  ]}
                  onChange={(event) => setSubscriptionBonusUnit(event.target.value as SubscriptionDurationUnit)}
                />
              </div>
              <p className="mt-2 text-xs text-text-secondary">
                Bonus extends membership at no extra charge. Leave blank for none.
              </p>
            </div>

            <Input
              label="Calculated End Date"
              type="date"
              value={calculatedSubscriptionEndDate}
              readOnly
            />

            {selectedPlanId && (
              <div className="rounded border border-border-light px-3 py-2 text-sm text-text-secondary">
                {selectedAssignablePlan
                  ? `Selected Plan: ${selectedAssignablePlan.label} | Catalogue Price: INR ${selectedAssignablePlan.option.base_price.toLocaleString('en-IN')} (Total with GST: INR ${selectedAssignablePlan.option.total_price.toLocaleString('en-IN')})`
                  : 'Select a plan to view pricing details.'}
              </div>
            )}
          </div>
        )}

        {subscriptionFormError && (
          <p className="text-red-600 text-sm mt-4">{subscriptionFormError}</p>
        )}
      </Modal>

      <Modal
        isOpen={isViewMembershipModalOpen}
        onClose={closeViewMembershipModal}
        title="Membership Details"
        size="lg"
        footer={
          <div className="flex flex-wrap justify-end gap-3">
            {viewMembershipInvoice && (
              <Button
                variant="secondary"
                onClick={handleDownloadInvoice}
                isLoading={isDownloadingInvoice}
                disabled={isDownloadingInvoice}
              >
                Download Invoice
              </Button>
            )}
            {viewMembershipMember && (
              <Button
                variant="secondary"
                onClick={() => {
                  const member = viewMembershipMember
                  closeViewMembershipModal()
                  void openAssignSubscriptionModal(member)
                }}
              >
                Add Plan
              </Button>
            )}
            {viewMembershipSubscription && viewMembershipMember && viewMembershipStatus !== 'expired' && (
              <Button
                variant="secondary"
                onClick={() => {
                  const member = viewMembershipMember
                  const subscription = viewMembershipSubscription
                  closeViewMembershipModal()
                  void openChangePlanModal(member, subscription)
                }}
              >
                Change Plan
              </Button>
            )}
            {viewMembershipSubscription && viewMembershipOutstandingBalance > 0 && (
              <Button
                onClick={() => {
                  if (!viewMembershipSubscription || !viewMembershipMember) {
                    return
                  }

                  closeViewMembershipModal()
                  navigate(`/admin/subscriptions/${viewMembershipSubscription.id}/payment`, {
                    state: {
                      subscription: viewMembershipSubscription,
                      memberName: viewMembershipMember.full_name,
                    },
                  })
                }}
              >
                Record Payment
              </Button>
            )}
            {viewMembershipSubscription && viewMembershipStatus === 'expired' && viewMembershipMember && (
              <Button
                variant="secondary"
                onClick={() => {
                  const member = viewMembershipMember
                  closeViewMembershipModal()
                  openAssignSubscriptionModal(member)
                }}
              >
                Renew Membership
              </Button>
            )}
            <Button variant="secondary" onClick={closeViewMembershipModal}>
              Close
            </Button>
          </div>
        }
      >
        {viewMembershipLoading ? (
          <p className="text-sm text-text-secondary">Loading membership details...</p>
        ) : !viewMembershipSubscription ? (
          <p className="text-sm text-text-secondary">No membership found for this member.</p>
        ) : (
          <div className="space-y-4">
            {viewMembershipSubscriptions.length > 1 && (
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wide text-text-secondary">Active Memberships</p>
                <div className="flex flex-wrap gap-2">
                  {viewMembershipSubscriptions.map((subscription) => {
                    const isSelected = viewMembershipSubscription?.id === subscription.id
                    return (
                      <button
                        key={subscription.id}
                        type="button"
                        onClick={() => void selectViewMembershipSubscription(subscription)}
                        className={`rounded border px-3 py-2 text-left text-sm transition ${
                          isSelected
                            ? 'border-primary bg-primary/10 text-text-primary'
                            : 'border-border-light text-text-secondary hover:border-primary/40'
                        }`}
                      >
                        <span className="block font-medium">
                          {formatMembershipPlanName(subscription.plan_label)}
                        </span>
                        <span className="block text-xs">
                          Expires {formatDisplayDate(subscription.end_date)}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="rounded-lg border border-border-light bg-bg-secondary/20 p-4">
              <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Member ID</p>
                  <p className="mt-1 text-text-primary">{viewMembershipMember?.id ?? '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Member Name</p>
                  <p className="mt-1 text-text-primary">{viewMembershipMember?.full_name || '-'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Membership Plan</p>
                  <p className="mt-1 text-text-primary">{formatMembershipPlanName(viewMembershipSubscription.plan_label)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Membership Duration</p>
                  <p className="mt-1 text-text-primary">{viewMembershipSubscription.duration_label}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Membership Start Date</p>
                  <p className="mt-1 text-text-primary">{formatDisplayDate(viewMembershipSubscription.start_date)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Membership Expiry Date</p>
                  <p className="mt-1 text-text-primary">{formatDisplayDate(viewMembershipSubscription.end_date)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Final Amount Payable</p>
                  <p className="mt-1 text-text-primary">{formatCurrency(viewMembershipFinalAmount)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Amount Paid</p>
                  <p className="mt-1 text-text-primary">{formatCurrency(viewMembershipAmountPaid)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Outstanding Balance</p>
                  <p className="mt-1 text-text-primary">{formatCurrency(viewMembershipOutstandingBalance)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Payment Status</p>
                  <p className="mt-1 text-text-primary">{(viewMembershipInvoice?.status || viewMembershipSubscription.payment_status).replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-text-secondary">Membership Status</p>
                  <p className="mt-1 text-text-primary">{membershipStatusLabel(viewMembershipStatus)}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}

