import { useCallback, useEffect, useState } from 'react'
import { callAction } from '@/lib/actions'
import type { Business, MembershipRole } from '@/types/queue'

export type MyBusiness = Business & { id: string }

export type MyMembership = {
  id: string
  teamId: string
  userId: string
  role: MembershipRole
  status: 'active' | 'inactive'
}

type MyBusinessResponse = {
  business: MyBusiness | null
  membership: MyMembership | null
}

export function useMyBusiness() {
  const [business, setBusiness] = useState<MyBusiness | null>(null)
  const [membership, setMembership] = useState<MyMembership | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    const result = await callAction<MyBusinessResponse>('getMyBusiness')
    if (!result.success) {
      setError(result.error)
      setBusiness(null)
      setMembership(null)
      setLoading(false)
      return
    }
    setBusiness(result.data.business)
    setMembership(result.data.membership)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    void refresh()
  }, [refresh])

  return { business, membership, loading, error, refresh }
}
