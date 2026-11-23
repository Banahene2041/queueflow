import { useState, type FormEvent } from 'react'
import {
  Button,
  Input,
  Label,
  Modal,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@/components/ui'
import { callAction } from '@/lib/actions'
import type { MembershipRole } from '@/types/queue'

export function InviteStaffModal({
  open,
  onClose,
  businessId,
}: {
  open: boolean
  onClose: () => void
  businessId: string
}) {
  const { success, error } = useToast()
  const [targetUserId, setTargetUserId] = useState('')
  const [role, setRole] = useState<MembershipRole>('staff')
  const [busy, setBusy] = useState(false)

  async function onInvite(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    const result = await callAction('inviteStaff', {
      businessId,
      targetUserId: targetUserId.trim(),
      role,
    })
    setBusy(false)
    if (!result.success) {
      error('Couldn’t add staff', result.error)
      return
    }
    success('Staff updated')
    setTargetUserId('')
    setRole('staff')
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!busy) onClose()
      }}
      size="sm"
    >
      <Modal.Header>
        <Modal.Title>Add staff</Modal.Title>
        <Modal.Description>
          Paste a DeepSpace user id for someone who has already signed into this app.
        </Modal.Description>
      </Modal.Header>

      <form onSubmit={onInvite} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="invite-uid">User id</Label>
            <Input
              id="invite-uid"
              value={targetUserId}
              onChange={(e) => setTargetUserId(e.target.value)}
              placeholder="user_…"
              required
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Select value={role} onValueChange={(v) => setRole(v as MembershipRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="ghost" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" loading={busy}>
            Add to team
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
