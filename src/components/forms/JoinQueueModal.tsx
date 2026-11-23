import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, Label, Modal, useToast } from '@/components/ui'
import { callPublicQueue } from '@/lib/actions'

type JoinResponse = {
  ticketNumber: number
  accessToken: string
  peopleAhead: number
  estimatedWaitMinutes: number
  status: 'waiting'
}

export function JoinQueueModal({
  open,
  onClose,
  slug,
}: {
  open: boolean
  onClose: () => void
  slug: string
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
    onClose()
    navigate(`/ticket/${result.data.accessToken}`, { replace: true })
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!submitting) onClose()
      }}
      size="sm"
    >
      <Modal.Header>
        <Modal.Title>Take a ticket</Modal.Title>
        <Modal.Description>We’ll hold your place and update you live.</Modal.Description>
      </Modal.Header>

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="join-name">Name</Label>
            <Input
              id="join-name"
              name="customerName"
              autoComplete="name"
              placeholder="Alex"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              maxLength={80}
              required
              autoFocus
            />
            {fieldError ? <p className="text-sm text-destructive">{fieldError}</p> : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="join-phone">
              Phone <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="join-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={32}
            />
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="ghost" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" loading={submitting}>
            Join queue
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
