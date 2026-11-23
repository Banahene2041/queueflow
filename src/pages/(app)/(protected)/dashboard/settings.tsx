import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useR2Files } from 'deepspace'
import {
  Button,
  Input,
  Label,
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

export default function DashboardSettingsPage() {
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
    let cancelled = false
    async function load() {
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
      }
      setLoading(false)
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [error])

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
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Shop profile and public queue link. Account sign-out is on{' '}
          <Link to="/settings" className="underline-offset-4 hover:underline">
            /settings
          </Link>
          .
        </p>
      </header>

      {loading ? (
        <div className="space-y-3">
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-10 animate-pulse rounded-md bg-muted" />
          <div className="h-24 animate-pulse rounded-md bg-muted" />
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5 rounded-lg border border-border bg-card p-5">
          <Field label="Business name" htmlFor="name">
            <Input
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (!businessId) setSlug(normalizeSlug(e.target.value))
              }}
              placeholder="Northside Cuts"
              required
            />
          </Field>

          <Field label="Public slug" htmlFor="slug">
            <Input
              id="slug"
              value={slug}
              onChange={(e) => setSlug(normalizeSlug(e.target.value))}
              disabled={Boolean(businessId)}
              placeholder="northside-cuts"
            />
          </Field>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Walk-ins welcome"
            />
          </Field>

          <Field label="Address" htmlFor="address">
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="12 Main St"
            />
          </Field>

          <Field label="Average service minutes" htmlFor="avg">
            <Input
              id="avg"
              type="number"
              min={5}
              max={180}
              value={averageServiceMinutes}
              onChange={(e) => setAverageServiceMinutes(Number(e.target.value) || 30)}
            />
          </Field>

          <div className="flex items-center justify-between gap-4 border-y border-border py-3">
            <div>
              <p className="text-sm font-medium">Accepting walk-ins</p>
              <p className="text-xs text-muted-foreground">Turns the public join form on or off.</p>
            </div>
            <Switch checked={isOpen} onCheckedChange={setIsOpen} />
          </div>

          {businessId && (
            <div className="space-y-2">
              <Label htmlFor="logo">Logo</Label>
              {logoKey ? (
                <img
                  src={getUrl(logoKey)}
                  alt=""
                  className="mb-2 h-14 w-14 rounded-md border border-border object-cover"
                />
              ) : null}
              <Input
                id="logo"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                disabled={isUploading}
                onChange={(e) => void onLogoChange(e.target.files?.[0])}
              />
              <p className="text-xs text-muted-foreground">PNG, JPEG, or WebP · max 2 MB · public</p>
            </div>
          )}

          {slug && (
            <p className="text-sm text-muted-foreground">
              Guest link:{' '}
              <Link
                to={`/queue/${slug}`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                /queue/{slug}
              </Link>
            </p>
          )}

          <Button type="submit" loading={saving || isUploading}>
            {businessId ? 'Save settings' : 'Create shop'}
          </Button>
        </form>
      )}
    </div>
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
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}
