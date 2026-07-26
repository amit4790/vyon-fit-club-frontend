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
import { formatCurrency, formatPlanDurationSuffix } from '../../utils/format'

function money(value: number): string {
  return formatCurrency(value)
}

export default function AdminMembershipPlans() {
    const getFamilyOrder = (name: string): number => {
      const normalized = name.toUpperCase()
      if (normalized.includes('BASIC')) return 1
      if (normalized.includes('ADVANCE')) return 2
      if (normalized.includes('PRO')) return 3
      return 99
    }

    const rewriteFeatures = (familyName: string, features: string[]): string[] => {
      const normalized = familyName.toUpperCase()
      if (normalized.includes('BASIC')) {
        return [
          'Gym access during standard hours',
          'Cardio and strength zones',
          '1 onboarding session',
          'Locker support',
        ]
      }
      if (normalized.includes('ADVANCE')) {
        return [
          'All Basic plan features +',
          'Group class access',
          'Monthly body composition tracking',
          'Nutrition guidance',
        ]
      }
      if (normalized.includes('PRO')) {
        return [
          'All Advance plan features +',
          '1:1 personal training sessions',
          'Customized diet plan',
          'Green Tea / Black Coffee',
          'Passive Stretching',
          'Foot Reflexology',
        ]
      }
      return features
    }

  const navigate = useNavigate()
  const [families, setFamilies] = useState<PlanFamilyRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [priceEdits, setPriceEdits] = useState<Record<number, string>>({})
  const [savingPlanId, setSavingPlanId] = useState<number | null>(null)
  const { toasts, removeToast, error: errorToast } = useToast()

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
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

  const setPlanEditValue = (planId: number, value: string) => {
    setPriceEdits((prev) => ({ ...prev, [planId]: value }))
  }

  const getPlanEditValue = (planId: number, currentPrice: number): string => {
    return priceEdits[planId] ?? String(currentPrice)
  }

  const handleSavePrice = async (planId: number, currentTaxPercent: number) => {
    const rawValue = (priceEdits[planId] ?? '').trim()
    const nextPrice = Number(rawValue)

    if (!rawValue || !Number.isFinite(nextPrice) || nextPrice <= 0) {
      errorToast('Invalid price', 'Please enter a valid base price greater than zero.')
      return
    }

    try {
      setSavingPlanId(planId)
      await adminService.updatePlanPrice(planId, {
        base_price: nextPrice,
        tax_percent: currentTaxPercent,
      })
      await loadPlans()
    } catch (err: any) {
      const apiError = ApiErrorHandler.parse(err)
      errorToast('Failed to update price', apiError.message)
    } finally {
      setSavingPlanId(null)
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
              Update base prices directly. Tax and total are recalculated automatically.
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
          {[...families].sort((a, b) => getFamilyOrder(a.family) - getFamilyOrder(b.family)).map((family) => (
            <Card key={family.family} className="p-5">
              <div className="flex flex-col gap-2 mb-4">
                <h3 className="text-xl font-bold tracking-wide text-[#C92A4B]">{family.family}</h3>
                <p className="text-sm text-text-secondary">{family.description || 'No description available.'}</p>
                {family.includes.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {rewriteFeatures(family.family, family.includes).map((item) => (
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
                  <TableHeaderCell className="text-right">Action</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {family.options.map((option) => (
                    <TableRow key={option.id}>
                      <TableCell className="text-sm text-text-secondary">
                        {option.variant || option.duration_label}
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">{formatPlanDurationSuffix(option.duration_label)}</TableCell>
                      <TableCell className="text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                          <span>INR</span>
                          <input
                            type="number"
                            min="1"
                            step="0.01"
                            value={getPlanEditValue(option.id, option.base_price)}
                            onChange={(event) => setPlanEditValue(option.id, event.target.value)}
                            className="w-32 h-9 px-3 rounded-md bg-bg-secondary border border-border-light text-text-primary"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-text-secondary">{option.tax_percent}%</TableCell>
                      <TableCell className="text-sm text-text-secondary font-semibold">{money(option.total_price)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          onClick={() => handleSavePrice(option.id, option.tax_percent)}
                          isLoading={savingPlanId === option.id}
                        >
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          ))}
        </div>
      )}

      <ToastContainer toasts={toasts} onClose={removeToast} />
    </AdminShell>
  )
}
