import { useEffect, useState, type FormEvent } from 'react'
import { useR2Files } from 'deepspace'
import {
  Button,
  Input,
  Label,
  Modal,
  Switch,
  Textarea,
  useToast,
} from '@/components/ui'
import { callAction } from '@/lib/actions'
import { normalizeSlug } from '@/lib/queue'
import type { Business } from '@/types/queue'

type MyBusinessResponse = {
  business: (Business & { id: string }) | null
}

const MAX_LOGO_BYTES = 2 * 1024 * 1024
const LOGO_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])

export function BusinessSettingsModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean
  onClose: () => void
  onSaved?: (slug: string) => void
}) {
  const { success, error } = useToast()
  const { upload, getUrl, isUploading } = useR2Files({ scope: 'app' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [businessId, setBusinessId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [averageServiceMinutes, setAverageServiceMinutes] = useState(30)
  const [isOpen, setIsOpen] = useState(true)
  const [logoKey, setLogoKey] = useState('')

  useEffect(() => {
    if (!open) return
    let cancelled = false
    async function load() {
      setLoading(true)
      const result = await callAction<MyBusinessResponse>('getMyBusiness')
      if (cancelled) return
      if (!result.success) {
        error('Could not load business', result.error)
        setLoading(false)
        return
      }
      if (result.data.business) {
        const b = result.data.business
        setBusinessId(b.id)
        setName(b.name)
        setSlug(b.slug)
        setDescription(b.description)
        setAddress(b.address)
        setAverageServiceMinutes(b.averageServiceMinutes)
        setIsOpen(b.isOpen)
        setLogoKey(b.logoKey)
      } else {
        setBusinessId(null)
        setName('')
        setSlug('')
        setDescription('')
        setAddress('')
        setAverageServiceMinutes(30)
        setIsOpen(true)
        setLogoKey('')
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [open, error])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim()) {
      error('Name required', 'Enter a business name')
      return
    }
    setSaving(true)
    const result = await callAction<{ businessId: string; slug: string; created: boolean }>(
      'ensureBusiness',
      {
        name: name.trim(),
        slug: slug.trim() || normalizeSlug(name),
        description,
        address,
        averageServiceMinutes,
        isOpen,
      },
    )
    setSaving(false)
    if (!result.success) {
      error('Could not save business', result.error)
      return
    }
    setBusinessId(result.data.businessId)
    setSlug(result.data.slug)
    if (logoKey) {
      await callAction('updateBusinessSettings', {
        businessId: result.data.businessId,
        logoKey,
      })
    }
    success(
      result.data.created ? 'Shop created' : 'Settings saved',
      `Public queue: /queue/${result.data.slug}`,
    )
    onSaved?.(result.data.slug)
    onClose()
  }

  async function onLogoChange(file: File | undefined) {
    if (!file || !businessId) return
    if (!LOGO_TYPES.has(file.type)) {
      error('Invalid file', 'Use PNG, JPEG, or WebP')
      return
    }
    if (file.size > MAX_LOGO_BYTES) {
      error('File too large', 'Keep logos under 2 MB')
      return
    }
    const uploaded = await upload(file, `logos/${businessId}/${file.name}`)
    if (!uploaded.success || !uploaded.key) {
      error('Upload failed', uploaded.error ?? 'Unknown error')
      return
    }
    const updated = await callAction('updateBusinessSettings', {
      businessId,
      logoKey: uploaded.key,
    })
    if (!updated.success) {
      error('Could not save logo', updated.error)
      return
    }
    setLogoKey(uploaded.key)
    success('Logo uploaded')
  }

  return (
    <Modal open={open} onClose={onClose} size="md">
      <Modal.Header>
        <Modal.Title>{businessId ? 'Shop settings' : 'Create your shop'}</Modal.Title>
        <Modal.Description>
          Profile and public queue link for walk-ins.
        </Modal.Description>
      </Modal.Header>

      <form onSubmit={onSubmit} className="flex min-h-0 flex-1 flex-col">
        <Modal.Body className="space-y-4">
          {loading ? (
            <div className="space-y-3">
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-10 animate-pulse rounded-md bg-muted" />
              <div className="h-20 animate-pulse rounded-md bg-muted" />
            </div>
          ) : (
            <>
              <Field label="Business name" htmlFor="biz-name">
                <Input
                  id="biz-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    if (!businessId) setSlug(normalizeSlug(e.target.value))
                  }}
                  placeholder="Northside Cuts"
                  required
                  autoFocus
                />
              </Field>

              <Field label="Public slug" htmlFor="biz-slug">
                <Input
                  id="biz-slug"
                  value={slug}
                  onChange={(e) => setSlug(normalizeSlug(e.target.value))}
                  disabled={Boolean(businessId)}
                  placeholder="northside-cuts"
                />
              </Field>

              <Field label="Description" htmlFor="biz-description">
                <Textarea
                  id="biz-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Walk-ins welcome"
                />
              </Field>

              <Field label="Address" htmlFor="biz-address">
                <Input
                  id="biz-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="12 Main St"
                />
              </Field>

              <Field label="Average service minutes" htmlFor="biz-avg">
                <Input
                  id="biz-avg"
                  type="number"
                  min={5}
                  max={180}
                  value={averageServiceMinutes}
                  onChange={(e) => setAverageServiceMinutes(Number(e.target.value) || 30)}
                />
              </Field>

              <div className="flex items-center justify-between gap-4 rounded-md border border-border px-3 py-2.5">
                <div>
                  <p className="text-sm font-medium">Accepting walk-ins</p>
                  <p className="text-xs text-muted-foreground">Turns the public join form on or off.</p>
                </div>
                <Switch checked={isOpen} onCheckedChange={setIsOpen} />
              </div>

              {businessId ? (
                <div className="space-y-2">
                  <Label htmlFor="biz-logo">Logo</Label>
                  {logoKey ? (
                    <img
                      src={getUrl(logoKey)}
                      alt=""
                      className="mb-1 size-12 rounded-md border border-border object-cover"
                    />
                  ) : null}
                  <Input
                    id="biz-logo"
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    disabled={isUploading}
                    onChange={(e) => void onLogoChange(e.target.files?.[0])}
                  />
                  <p className="text-xs text-muted-foreground">PNG, JPEG, or WebP · max 2 MB</p>
                </div>
              ) : null}
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button type="button" variant="ghost" onClick={onClose} disabled={saving || isUploading}>
            Cancel
          </Button>
          <Button type="submit" loading={saving || isUploading} disabled={loading}>
            {businessId ? 'Save' : 'Create shop'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
