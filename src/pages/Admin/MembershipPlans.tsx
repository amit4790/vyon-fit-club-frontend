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
import { PlanFamilyRecord } from '../../types'

function money(value: number): string {
  return `INR ${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

export default function AdminMembershipPlans() {
  const navigate = useNavigate()
  const [families, setFamilies] = useState<PlanFamilyRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { toasts, removeToast, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.hasRole('admin')) {
      navigate('/login')
      return
    }

    loadPlans(true)
  }, [navigate])

  const loadPlans = async (showLoader = false) => {
    try {
      if (showLoader) {
        setIsLoading(true)
      }

      const response = await adminService.getPlanCatalog()
      setFamilies(response.data)
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to load membership plans', apiError.message)
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
      title="Membership Plans"
      subtitle="Active catalog and pricing overview"
      userName={userName}
      onLogout={handleLogout}
    >
      <Card className="p-5 mb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-secondary">Plan Catalog</h2>
            <p className="text-sm text-text-secondary mt-1">
              Catalog is synced from backend. This view is read-only in the current phase.
            </p>
          </div>
          <Button size="sm" variant="secondary" onClick={() => loadPlans(true)}>
            Refresh
          </Button>
        </div>
      </Card>

      {isLoading ? (
        <Card className="p-8">
          <p className="text-center text-text-secondary">Loading membership plans...</p>
        </Card>
      ) : families.length === 0 ? (
        <Card className="p-8">
          <p className="text-center text-text-secondary">No active plans found.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {families.map((family) => (
            <Card key={family.family} className="p-5">
              <div className="flex flex-col gap-2 mb-4">
                <h3 className="text-lg font-semibold text-primary">{family.family}</h3>
                <p className="text-sm text-text-secondary">{family.description || 'No description available.'}</p>
                {family.includes.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {family.includes.map((item) => (
                      <span
                        key={`${family.family}-${item}`}
                        className="text-xs rounded-full px-3 py-1 bg-bg-secondary border border-border-light text-text-secondary"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <Table>
                <TableHeader>
                  <TableHeaderCell>Variant</TableHeaderCell>
                  <TableHeaderCell>Duration</TableHeaderCell>
                  <TableHeaderCell>Base Price</TableHeaderCell>
                  <TableHeaderCell>Tax</TableHeaderCell>
                  <TableHeaderCell>Total</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {family.options.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell className="text-sm text-text-secondary">
                        {option.variant || option.duration_label}
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">{option.duration_label}</TableCell>
                      <TableCell className="text-sm text-text-secondary">{money(option.base_price)}</TableCell>
                      <TableCell className="text-sm text-text-secondary">{option.tax_percent}%</TableCell>
                      <TableCell className="text-sm text-text-secondary font-semibold">{money(option.total_price)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AdminShell>
  )
}
