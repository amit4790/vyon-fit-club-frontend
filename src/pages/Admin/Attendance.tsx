import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { ApiErrorHandler } from '../../api/errors'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import { Input, Select } from '../../components/Input'
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
import { DailyAttendanceRow, MonthlyAttendanceRow } from '../../types'

type AttendanceView = 'daily' | 'monthly'

function todayIsoDate(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function formatPunchTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }
  // Gym device / business timezone (IST). Avoid browser-local drift if admin travels.
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata',
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
    timeZone: 'Asia/Kolkata',
  })
}

export default function AdminAttendance() {
  const navigate = useNavigate()
  const [view, setView] = useState<AttendanceView>('daily')
  const [selectedDay, setSelectedDay] = useState(todayIsoDate())
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [dailyRows, setDailyRows] = useState<DailyAttendanceRow[]>([])
  const [monthlyRows, setMonthlyRows] = useState<MonthlyAttendanceRow[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
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

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
      return
    }

    void loadData(true)
  }, [navigate, view, selectedDay, selectedYear, selectedMonth])

  const loadData = async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }

      if (view === 'daily') {
        const response = await adminService.getDailyAttendance(selectedDay)
        setDailyRows(response.data || [])
      } else {
        const response = await adminService.getMonthlyAttendance(selectedYear, selectedMonth)
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

  const handleExportCsv = async () => {
    try {
      setIsExporting(true)
      const blob = await adminService.exportMonthlyAttendanceCsv(selectedYear, selectedMonth)
      const url = window.URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `trainer-attendance-${selectedYear}-${String(selectedMonth).padStart(2, '0')}.csv`
      document.body.appendChild(anchor)
      anchor.click()
      anchor.remove()
      window.URL.revokeObjectURL(url)
      success('Export ready', 'Trainer attendance CSV downloaded')
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
      subtitle="Trainer check-ins from biometric punches"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5 mb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">Trainer Attendance</h2>
            <p className="text-sm text-text-secondary mt-1">
              First check-in time per day from biometric punches.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <Select
              label="View"
              value={view}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'monthly', label: 'Monthly' },
              ]}
              onChange={(event) => setView(event.target.value as AttendanceView)}
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
                <Button size="sm" variant="secondary" isLoading={isExporting} onClick={() => void handleExportCsv()}>
                  Export CSV
                </Button>
              </>
            )}

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
          {dailyRows.length === 0 ? (
            <p className="text-center text-text-secondary py-8">No trainer check-ins for this day.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableHeaderCell>Trainer</TableHeaderCell>
                <TableHeaderCell>Specialization</TableHeaderCell>
                <TableHeaderCell>Device PIN</TableHeaderCell>
                <TableHeaderCell>Check-in</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {dailyRows.map((row) => (
                  <TableRow key={`${row.person_id}-${row.punched_at}`}>
                    <TableCell className="text-sm text-text-secondary">{row.person_name}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{row.specialization || '—'}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{row.pin}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{formatPunchTime(row.punched_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      ) : (
        <Card className="p-5">
          {monthlyRows.length === 0 ? (
            <p className="text-center text-text-secondary py-8">No trainer attendance for this month.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableHeaderCell>Trainer</TableHeaderCell>
                <TableHeaderCell>Specialization</TableHeaderCell>
                <TableHeaderCell>Days Present</TableHeaderCell>
                <TableHeaderCell>Last Check-in</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {monthlyRows.map((row) => (
                  <TableRow key={row.person_id}>
                    <TableCell className="text-sm text-text-secondary">{row.person_name}</TableCell>
                    <TableCell className="text-sm text-text-secondary">{row.specialization || '—'}</TableCell>
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

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
