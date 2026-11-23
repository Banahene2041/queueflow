import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label, useToast } from '@/components/ui'
import { callPublicQueue } from '@/lib/actions'

type JoinResponse = {
  ticketNumber: number
  accessToken: string
  peopleAhead: number
  estimatedWaitMinutes: number
  status: 'waiting'
}

export function JoinQueueForm({
  slug,
  disabled,
  disabledReason,
}: {
  slug: string
  disabled?: boolean
  disabledReason?: string
}) {
  const navigate = useNavigate()
  const { success, error } = useToast()
  const [customerName, setCustomerName] = useState('')
  const [phone, setPhone] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [fieldError, setFieldError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const name = customerName.trim()
    if (!name) {
      setFieldError('Enter your name')
      return
    }
    setFieldError(null)
    setSubmitting(true)

    const result = await callPublicQueue<JoinResponse>(
      `/api/queue/businesses/${encodeURIComponent(slug)}/join`,
      {
        method: 'POST',
        body: JSON.stringify({ customerName: name, phone: phone.trim() }),
      },
    )

    setSubmitting(false)

    if (!result.success) {
      error('Couldn’t join', result.error)
      return
    }

    success(`Ticket #${result.data.ticketNumber}`)
    navigate(`/ticket/${result.data.accessToken}`, { replace: true })
  }

  if (disabled) {
    return (
      <div className="rounded-md border border-border bg-muted/40 px-4 py-6 text-center text-sm text-muted-foreground">
        {disabledReason ?? 'Not accepting guests right now.'}
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="customerName">Name</Label>
        <Input
          id="customerName"
          name="customerName"
          autoComplete="name"
          placeholder="Alex"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          maxLength={80}
          required
        />
        {fieldError && <p className="text-sm text-destructive">{fieldError}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          Phone <span className="font-normal text-muted-foreground">(optional)</span>
        </Label>
        <Input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          maxLength={32}
        />
      </div>

      <Button type="submit" className="w-full" size="lg" loading={submitting}>
        Take a ticket
      </Button>
    </form>
  )
}
