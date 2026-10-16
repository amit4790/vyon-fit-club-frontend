import { useEffect, useMemo, useState } from 'react'
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
import {
  AttendancePersonType,
  AttendancePunchDetailRow,
  DailyAttendanceRow,
  MonthlyAttendanceRow,
} from '../../types'

type AttendanceView = 'daily' | 'monthly'

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/** Gym business timezone — keep FE display locked to IST with the backend. */
const GYM_TIME_ZONE = 'Asia/Kolkata'

function formatPunchTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: GYM_TIME_ZONE,
  })
}

function formatPunchDateTime(value: string | null): string {
  if (!value) {
    return '—'
  }
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: GYM_TIME_ZONE,
  })
}

function matchesSearch(
  row: { person_id: number; person_name: string; phone_number?: string | null; pin?: number },
  query: string
): boolean {
  const q = query.trim().toLowerCase()
  if (!q) {
    return true
  }
  if (row.person_name.toLowerCase().includes(q)) {
    return true
  }
  if (row.phone_number && row.phone_number.includes(q)) {
    return true
  }
  if (row.pin !== undefined && String(row.pin).includes(q)) {
    return true
  }
  if (String(row.person_id) === q || `id${row.person_id}` === q || `#${row.person_id}` === q) {
    return true
  }
  return false
}

export default function AdminAttendance() {
  const navigate = useNavigate()
  const [personType, setPersonType] = useState<AttendancePersonType>('trainer')
  const [view, setView] = useState<AttendanceView>('daily')
  const [search, setSearch] = useState('')
  const [selectedDay, setSelectedDay] = useState(todayIsoDate())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [dailyRows, setDailyRows] = useState<DailyAttendanceRow[]>([])
  const [monthlyRows, setMonthlyRows] = useState<MonthlyAttendanceRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailTitle, setDetailTitle] = useState('')
  const [detailPunches, setDetailPunches] = useState<AttendancePunchDetailRow[]>([])
  const { toasts, removeToast, success, error: errorToast } = useToast()

  const monthOptions = useMemo(
    () =>
      Array.from({ length: 12 }, (_, index) => ({
        value: String(index + 1),
        label: new Date(2000, index, 1).toLocaleString([], { month: 'long' }),
      })),
    []
  )

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear()
    return [currentYear, currentYear - 1].map((year) => ({
      value: String(year),
      label: String(year),
    }))
  }, [])

  const filteredDailyRows = useMemo(
    () => dailyRows.filter((row) => matchesSearch(row, search)),
    [dailyRows, search]
  )

  const filteredMonthlyRows = useMemo(
    () => monthlyRows.filter((row) => matchesSearch(row, search)),
    [monthlyRows, search]
  )

  const personLabel = personType === 'trainer' ? 'Trainer' : 'Member'
  const personLabelPlural = personType === 'trainer' ? 'trainers' : 'members'

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    void loadData(true)
  }, [navigate, view, selectedDay, selectedYear, selectedMonth, personType])

  const loadData = async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }

      if (view === 'daily') {
        const response = await adminService.getDailyAttendance(selectedDay, personType)
        setDailyRows(response.data || [])
      } else {
        const response = await adminService.getMonthlyAttendance(selectedYear, selectedMonth, personType)
        setMonthlyRows(response.data || [])
      }
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load attendance', apiError.message)
    } finally {
      if (showLoader) {
        setIsLoading(false)
      }
    }
  }

  const openDayDetail = async (row: DailyAttendanceRow) => {
    try {
      setDetailOpen(true)
      setDetailLoading(true)
      setDetailTitle(row.person_name)
      setDetailPunches([])
      const response = await adminService.getDailyAttendanceDetail(selectedDay, personType, row.person_id)
      setDetailTitle(response.person_name)
      setDetailPunches(response.data || [])
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load check-ins', apiError.message)
      setDetailOpen(false)
    } finally {
      setDetailLoading(false)
    }
  }

  const handleExportCsv = async () => {
    try {
      setIsExporting(true)
      const blob =
        view === 'daily'
          ? await adminService.exportDailyAttendanceCsv(selectedDay, personType)
          : await adminService.exportMonthlyAttendanceCsv(selectedYear, selectedMonth, personType)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download =
        view === 'daily'
          ? `${personType}-attendance-${selectedDay}.csv`
          : `${personType}-attendance-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      success(
        'Export ready',
        view === 'daily'
          ? `Daily ${personLabelPlural} attendance CSV downloaded`
          : `Monthly ${personLabelPlural} attendance CSV downloaded`
      )
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Export failed', apiError.message)
    } finally {
      setIsExporting(false)
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
      subtitle="Trainer and member check-ins from biometric punches"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5 mb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">{personLabel} attendance</h2>
            <p className="text-sm text-text-secondary mt-1">
              First check-in per day on the list. Click a row to see every punch that day.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <Select
              label="People"
              value={personType}
              options={[
                { value: 'trainer', label: 'Trainers' },
                { value: 'member', label: 'Members' },
              ]}
              onChange={(event) => {
                setPersonType(event.target.value as AttendancePersonType)
                setSearch('')
              }}
            />

            <Select
              label="View"
              value={view}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              onChange={(event) => setView(event.target.value as AttendanceView)}
            />

            <Input
              label="Search"
              placeholder="Name, phone, PIN, or ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {view === 'daily' ? (
              <Input
                label="Date"
                type="date"
                value={selectedDay}
                onChange={(event) => setSelectedDay(event.target.value)}
              />
            ) : (
              <>
                <Select
                  label="Month"
                  value={String(selectedMonth)}
                  options={monthOptions}
                  onChange={(event) => setSelectedMonth(Number(event.target.value))}
                />
                <Select
                  label="Year"
                  value={String(selectedYear)}
                  options={yearOptions}
                  onChange={(event) => setSelectedYear(Number(event.target.value))}
                />
              </>
            )}

            <Button size="sm" variant="secondary" isLoading={isExporting} onClick={() => void handleExportCsv()}>
              Export CSV
            </Button>

            <Button size="sm" variant="secondary" onClick={() => void loadData(true)}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-8">
          <p className="text-center text-text-secondary">Loading attendance...</p>
        </Card>
      ) : view === 'daily' ? (
        <Card className="p-5">
          {filteredDailyRows.length === 0 ? (
            <p className="text-center text-text-secondary py-8">
              {dailyRows.length === 0
                ? `No ${personLabelPlural} check-ins for this day.`
                : 'No matches for your search.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableHeaderCell>{personLabel}</TableHeaderCell>
                {personType === 'trainer' ? (
                  <TableHeaderCell>Specialization</TableHeaderCell>
                ) : (
                  <TableHeaderCell>Mobile</TableHeaderCell>
                )}
                <TableHeaderCell>Device PIN</TableHeaderCell>
                <TableHeaderCell>First check-in</TableHeaderCell>
                {personType === 'trainer' && <TableHeaderCell>Late</TableHeaderCell>}
              </TableHeader>
              <TableBody>
                {filteredDailyRows.map((row) => (
                  <TableRow
                    key={`${row.person_id}-${row.punched_at}`}
                    className="cursor-pointer hover:bg-bg-secondary/60"
                    onClick={() => void openDayDetail(row)}
                  >
                    <TableCell className="text-sm text-text-secondary">{row.person_name}</TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      {personType === 'trainer' ? row.specialization || '—' : row.phone_number || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{row.pin}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{formatPunchTime(row.punched_at)}</TableCell>
                    {personType === 'trainer' && (
                      <TableCell className="text-sm text-text-secondary">
                        {row.is_late ? 'Yes' : 'No'}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      ) : (
        <Card className="p-5">
          {filteredMonthlyRows.length === 0 ? (
            <p className="text-center text-text-secondary py-8">
              {monthlyRows.length === 0
                ? `No ${personLabelPlural} attendance for this month.`
                : 'No matches for your search.'}
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableHeaderCell>{personLabel}</TableHeaderCell>
                {personType === 'trainer' ? (
                  <TableHeaderCell>Specialization</TableHeaderCell>
                ) : (
                  <TableHeaderCell>Mobile</TableHeaderCell>
                )}
                <TableHeaderCell>Days present</TableHeaderCell>
                <TableHeaderCell>Last check-in</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {filteredMonthlyRows.map((row) => (
                  <TableRow key={row.person_id}>
                    <TableCell className="text-sm text-text-secondary">{row.person_name}</TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      {personType === 'trainer' ? row.specialization || '—' : row.phone_number || '—'}
                    </TableCell>
                    <TableCell className="text-sm text-text-secondary">{row.days_present}</TableCell>
                    <TableCell className="text-sm text-text-secondary">
                      {formatPunchDateTime(row.last_check_in)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      )}

      <Modal
        isOpen={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={detailTitle ? `${detailTitle} — ${selectedDay}` : 'Check-ins'}
        size="md"
      >
        {detailLoading ? (
          <p className="text-sm text-text-secondary py-4">Loading punches...</p>
        ) : detailPunches.length === 0 ? (
          <p className="text-sm text-text-secondary py-4">No punches recorded.</p>
        ) : (
          <ul className="divide-y divide-border-light max-h-80 overflow-y-auto">
            {detailPunches.map((punch, index) => (
              <li key={`${punch.punched_at}-${index}`} className="py-3 flex justify-between gap-4 text-sm">
                <span className="text-text-secondary">{formatPunchTime(punch.punched_at)}</span>
                <span className="text-text-secondary">PIN {punch.pin}</span>
                {personType === 'trainer' && (
                  <span className="text-text-secondary">{punch.is_late ? 'Late' : 'On time'}</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </Modal>

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
