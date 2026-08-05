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

type MemberMembershipSnapshot = {
  action: MembershipActionType
  membershipStatus: MembershipDisplayStatus
  currentPlanLabel: string | null
  expiryDate: string | null
  subscription: SubscriptionRecord | null
  activeSubscriptions: SubscriptionRecord[]
}

type SubscriptionModalMode = 'assign' | 'change'

function deriveInvoiceAmounts(invoice: InvoiceRecord, fallbackFinalAmount: number) {
  const finalAmount = Number(invoice.final_amount_received ?? fallbackFinalAmount ?? 0)
  const totalPaid = invoice.total_paid != null
    ? Number(invoice.total_paid)
    : invoice.amount_paid_today != null
      ? Number(invoice.amount_paid_today)
      : 0
  const outstandingBalance = invoice.outstanding_balance != null
    ? Number(invoice.outstanding_balance)
    : Math.max(finalAmount - totalPaid, 0)

  return {
    finalAmount,
    totalPaid,
    outstandingBalance,
  }
}

export default function AdminMembers() {
  const todayIso = new Date().toISOString().slice(0, 10)
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
  const [subscriptionFormError, setSubscriptionFormError] = useState<string | null>(null)
  const [expiringSubscriptions, setExpiringSubscriptions] = useState<
    ExpiringSubscriptionsApiResponse['data']
  >([])
  const [expiringDays, setExpiringDays] = useState(7)
  const [expiringTotal, setExpiringTotal] = useState(0)
  const [expiringUnavailable, setExpiringUnavailable] = useState(false)
  const [membershipSnapshotMap, setMembershipSnapshotMap] = useState<Record<number, MemberMembershipSnapshot>>({})
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
  const calculatedSubscriptionEndDate = useMemo(
    () => computeEndDate(subscriptionStartDate, parsedDurationValue, subscriptionDurationUnit),
    [subscriptionStartDate, parsedDurationValue, subscriptionDurationUnit]
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
    loadExpiringSubscriptions(expiringDays)
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
      await loadMembershipSnapshots(response.data)
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

  const loadMembershipSnapshots = async (targetMembers: MemberRecord[]) => {
    const today = new Date().toISOString().slice(0, 10)

    const snapshots = await Promise.all(
      targetMembers.map(async (member) => {
        try {
          const response = await adminService.getMemberSubscriptions(member.id)
          const subscriptions = response.data || []

          const activeSubscriptions = subscriptions.filter(
            (item) => item.status === 'active' && item.end_date >= today
          )
          const latestSubscription = subscriptions[0]
          const primarySubscription = activeSubscriptions[0] || null

          let snapshot: MemberMembershipSnapshot

          if (primarySubscription) {
            let invoicesForMember: InvoiceRecord[] = []
            try {
              const invoicesResponse = await adminService.getInvoices({
                page: 1,
                pageSize: 50,
                memberId: member.id,
              })
              invoicesForMember = invoicesResponse.data
            } catch {
              invoicesForMember = []
            }

            const resolvePaymentStatus = (subscription: SubscriptionRecord) => {
              const paymentStatus = (subscription.payment_status || '').trim().toLowerCase()
              if (paymentStatus === 'paid' || paymentStatus === 'partial') {
                return paymentStatus
              }

              const linkedInvoice = invoicesForMember
                .filter((invoice) => invoice.subscription_id === subscription.id)
                .sort((a, b) => new Date(b.issued_at).getTime() - new Date(a.issued_at).getTime())[0]

              if (!linkedInvoice) {
                return paymentStatus || 'pending'
              }

              const derived = deriveInvoiceAmounts(linkedInvoice, subscription.total_amount)
              if (derived.outstandingBalance <= 0 || linkedInvoice.status === 'paid') {
                return 'paid'
              }
              if (derived.totalPaid > 0) {
                return 'partial'
              }
              return 'pending'
            }

            const unpaidSubscription =
              activeSubscriptions.find((item) => {
                const status = resolvePaymentStatus(item)
                return status !== 'paid'
              }) || null

            const focusSubscription = unpaidSubscription || primarySubscription
            const effectivePaymentStatus = resolvePaymentStatus(focusSubscription)

            let membershipStatus: MembershipDisplayStatus = 'inactive_unpaid'
            let action: MembershipActionType = 'pay'

            if (effectivePaymentStatus === 'paid') {
              membershipStatus = 'active_paid'
              action = 'view'
            } else if (effectivePaymentStatus === 'partial') {
              membershipStatus = 'active_pending_payment'
              action = 'pay'
            }

            const planLabels = activeSubscriptions
              .map((item) => formatMembershipPlanName(item.plan_label))
              .filter(Boolean)

            snapshot = {
              action,
              membershipStatus,
              currentPlanLabel: planLabels.join(' · '),
              expiryDate: focusSubscription.end_date,
              subscription: focusSubscription,
              activeSubscriptions,
            }
          } else if (latestSubscription) {
            snapshot = {
              action: 'renew',
              membershipStatus: 'expired',
              currentPlanLabel: formatMembershipPlanName(latestSubscription.plan_label),
              expiryDate: latestSubscription.end_date,
              subscription: latestSubscription,
              activeSubscriptions: [],
            }
          } else {
            snapshot = {
              action: 'assign',
              membershipStatus: 'none',
              currentPlanLabel: null,
              expiryDate: null,
              subscription: null,
              activeSubscriptions: [],
            }
          }

          return [member.id, snapshot] as const
        } catch {
          return [
            member.id,
            {
              action: 'assign',
              membershipStatus: 'none',
              currentPlanLabel: null,
              expiryDate: null,
              subscription: null,
              activeSubscriptions: [],
            },
          ] as const
        }
      })
    )

    setMembershipSnapshotMap(Object.fromEntries(snapshots))
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

  const loadExpiringSubscriptions = async (days: number) => {
    try {
      const response = await adminService.getExpiringSubscriptions({
        days,
        page: 1,
        pageSize: 5,
      })
      setExpiringSubscriptions(response.data)
      setExpiringTotal(response.pagination.total_items)
      setExpiringUnavailable(false)
    } catch (err) {
      console.error('Failed to load expiring subscriptions', err)
      setExpiringSubscriptions([])
      setExpiringTotal(0)
      setExpiringUnavailable(true)
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
    setSubscriptionModalMode('assign')
    setChangingSubscriptionId(null)
    setSubscriptionMember(member)
    setSubscriptionFormError(null)
    setSubscriptionStartDate(new Date().toISOString().slice(0, 10))
    setSubscriptionDurationValue('1')
    setSubscriptionDurationUnit('months')
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
    setSubscriptionDurationValue('1')
    setSubscriptionDurationUnit('months')
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

  const handleSyncMemberToDevice = async (member: MemberRecord) => {
    const deviceSn = resolveDeviceSnOrToast()
    if (!deviceSn) {
      return
    }

    setSyncingMemberId(member.id)
    try {
      await adminService.syncMemberToDevice(deviceSn, member.id)
      success('Member sync queued', `Queued for device ${deviceSn}`)
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

    setIsResyncingDevices(true)
    try {
      const response = await adminService.resyncAllMembersToDevice(deviceSn)
      setIsResyncModalOpen(false)
      const membersCount = response.members_synced ?? response.queued_commands
      success(
        'Device re-sync queued',
        `${membersCount} member command(s) queued for ${deviceSn}`
      )
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
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

  const openSubscriptionPaymentPage = (member: MemberRecord, subscription: SubscriptionRecord | null) => {
    if (!subscription) {
      errorToast('Payment route unavailable', 'Unable to find an active subscription for this member.')
      return
    }

    navigate(`/admin/subscriptions/${subscription.id}/payment`, {
      state: {
        subscription,
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

    if (!calculatedSubscriptionEndDate) {
      setSubscriptionFormError('Unable to calculate end date from the selected duration')
      return
    }

    if (subscriptionStartDate > todayIso) {
      setSubscriptionFormError('Start Date cannot be in the future')
      return
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
              Add, search, edit and delete members.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSuperAdmin && (
              <Button
                size="sm"
                variant="secondary"
                disabled={isResyncingDevices}
                onClick={() => setIsResyncModalOpen(true)}
              >
                Re-sync Devices
              </Button>
            )}
            {isSuperAdmin && (
              <Button size="sm" variant="secondary" onClick={() => navigate('/admin/admins')}>
                Add Admin
              </Button>
            )}
            <Button size="sm" onClick={openCreateMemberModal}>Add Member</Button>
          </div>
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
          {expiringUnavailable && (
            <p className="mt-3 text-xs text-text-secondary">
              Expiring memberships are unavailable right now. Please try again shortly.
            </p>
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
                <TableHeaderCell>Member Name</TableHeaderCell>
                <TableHeaderCell>Mobile Number</TableHeaderCell>
                <TableHeaderCell>Membership</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell className="text-right">Actions</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  (() => {
                    const membership = membershipSnapshotMap[member.id] || {
                      action: 'assign' as MembershipActionType,
                      membershipStatus: 'none' as const,
                      currentPlanLabel: null,
                      expiryDate: null,
                      subscription: null,
                      activeSubscriptions: [],
                    }

                    return (
                  <TableRow
                    key={member.id}
                    onClick={() => navigate(`/admin/members/${member.id}`)}
                    className="cursor-pointer"
                  >
                    <TableCell className="max-w-[12rem] truncate text-sm text-text-secondary">{member.full_name}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{member.mobile_number}</TableCell>
                    <TableCell className="max-w-[16rem] text-sm text-text-secondary">
                      {membership.activeSubscriptions.length > 0 ? (
                        <div className="space-y-1">
                          {membership.activeSubscriptions.map((item) => (
                            <div key={item.id} className="space-y-0.5">
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
                          <p className="truncate text-text-primary">{membership.currentPlanLabel}</p>
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
                        <Button
                          size="sm"
                          onClick={(event) => {
                            event.stopPropagation()
                            if (membership.action === 'pay') {
                              openSubscriptionPaymentPage(member, membership.subscription)
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
      </Card>

      <Modal
        isOpen={isResyncModalOpen}
        onClose={() => {
          if (!isResyncingDevices) {
            setIsResyncModalOpen(false)
          }
        }}
        title="Re-sync Devices"
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              disabled={isResyncingDevices}
              onClick={() => setIsResyncModalOpen(false)}
            >
              Cancel
            </Button>
            <Button disabled={isResyncingDevices} onClick={() => void handleConfirmResyncDevices()}>
              {isResyncingDevices ? 'Queuing…' : 'Confirm Re-sync'}
            </Button>
          </>
        }
      >
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
              max={todayIso}
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

