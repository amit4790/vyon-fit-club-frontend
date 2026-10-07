import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthService } from '../../api/api'
import { Button } from '../../components/Button'
import { Card } from '../../components/Card'
import AdminShell from '../../layouts/AdminShell'
import { adminService } from '../../services/adminService'
import { WebsiteEnquiryRecord, WebsiteEnquiryStatus } from '../../types'

type EnquiryFilter = WebsiteEnquiryStatus | 'all'

const FILTERS: { id: EnquiryFilter; label: string }[] = [
  { id: 'new', label: 'New' },
  { id: 'contacted', label: 'Contacted' },
  { id: 'closed', label: 'Closed' },
  { id: 'all', label: 'All' },
]

function intentLabel(intent: string): string {
  if (intent === 'personal_training') return 'Personal training'
  if (intent === 'membership') return 'Membership'
  return intent
}

function formatEnquiryTime(value: string): string {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function publishEnquiryCount(newCount: number) {
  window.dispatchEvent(new CustomEvent('vyon:enquiries-changed', { detail: { newCount } }))
}

export default function AdminEnquiries() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<EnquiryFilter>('new')
  const [rows, setRows] = useState<WebsiteEnquiryRecord[]>([])
  const [newCount, setNewCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!AuthService.isAuthenticated() || !AuthService.canAccessAdmin()) {
      navigate('/login')
    }
  }, [navigate])

  const loadRows = async (nextFilter: EnquiryFilter, showLoader = false) => {
    try {
      if (showLoader) setIsLoading(true)
      setError(null)
      const response = await adminService.getWebsiteEnquiries(nextFilter)
      setRows(response.data)
      setNewCount(response.new_count)
      publishEnquiryCount(response.new_count)
    } catch (err: any) {
      setError(err?.message || 'Unable to load enquiries right now.')
    } finally {
      if (showLoader) setIsLoading(false)
    }
  }

  useEffect(() => {
    loadRows(filter, true)
  }, [filter])

  const handleLogout = () => {
    AuthService.logout()
    navigate('/')
  }

  const userName = AuthService.getUserInfo()?.name || 'Admin'

  return (
    <AdminShell
      title="Website enquiries"
      subtitle={newCount === 1 ? '1 new enquiry waiting for a call' : `${newCount} new enquiries waiting for a call`}
      userName={userName}
      onLogout={handleLogout}
    >
      <div className="flex flex-wrap gap-2 mb-5">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setFilter(item.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border ${
              filter === item.id
                ? 'bg-primary text-text-secondary border-primary'
                : 'bg-bg-card text-text-secondary border-border-light hover:text-text-primary'
            }`}
          >
            {item.label}
            {item.id === 'new' && newCount > 0 ? ` (${newCount})` : ''}
          </button>
        ))}
      </div>

      {isLoading ? (
        <p className="text-sm text-text-secondary">Loading enquiries...</p>
      ) : error ? (
        <Card className="p-5">
          <p className="text-red-600 mb-3">{error}</p>
          <Button size="sm" onClick={() => loadRows(filter, true)}>
            Try again
          </Button>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="p-6">
          <p className="text-text-secondary">
            {filter === 'new' ? 'No new enquiries.' : 'No enquiries in this view.'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {rows.map((enquiry) => (
            <EnquiryCard
              key={`${enquiry.id}-${enquiry.status}-${enquiry.notes ?? ''}`}
              enquiry={enquiry}
              onSaved={() => loadRows(filter)}
            />
          ))}
        </div>
      )}
    </AdminShell>
  )
}

function EnquiryCard({
  enquiry,
  onSaved,
}: {
  enquiry: WebsiteEnquiryRecord
  onSaved: () => Promise<void>
}) {
  const [status, setStatus] = useState<WebsiteEnquiryStatus>(enquiry.status)
  const [notes, setNotes] = useState(enquiry.notes ?? '')
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const save = async () => {
    setIsSaving(true)
    setSaveError(null)
    try {
      await adminService.updateWebsiteEnquiry(enquiry.id, {
        status,
        notes,
      })
      await onSaved()
    } catch (err: any) {
      setSaveError(err?.message || 'Unable to save this enquiry.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="p-5">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0">
          <p className="text-lg font-semibold text-text-primary">{enquiry.full_name}</p>
          <a href={`tel:${enquiry.phone_number}`} className="text-primary font-medium">
            {enquiry.phone_number}
          </a>
          {enquiry.email ? <p className="text-sm text-text-secondary mt-1">{enquiry.email}</p> : null}
          <p className="text-sm text-text-secondary mt-2">
            {intentLabel(enquiry.intent)}
            {enquiry.plan_interest ? ` · ${enquiry.plan_interest}` : ''}
          </p>
          <p className="text-xs text-text-secondary mt-1">{formatEnquiryTime(enquiry.created_at)}</p>
        </div>

        <div className="w-full lg:w-80 space-y-3">
          <label className="block text-xs uppercase tracking-wide text-text-secondary">
            Status
            <select
              value={status}
              onChange={(event) => setStatus(event.target.value as WebsiteEnquiryStatus)}
              className="mt-1 w-full rounded-lg border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-primary"
            >
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="closed">Closed</option>
            </select>
          </label>
          <label className="block text-xs uppercase tracking-wide text-text-secondary">
            Note
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="What did you tell them?"
              className="mt-1 w-full rounded-lg border border-border-light bg-bg-secondary px-3 py-2 text-sm text-text-primary"
            />
          </label>
          {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
          <Button size="sm" onClick={save} isLoading={isSaving} disabled={isSaving}>
            Save
          </Button>
        </div>
      </div>
    </Card>
  )
}
