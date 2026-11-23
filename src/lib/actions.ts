import { getAuthToken } from 'deepspace'

export type ActionResponse<T> =
  | { success: true; data: T; error?: undefined }
  | { success: false; data?: undefined; error: string }

/**
 * Call an authenticated server action. Requires a signed-in session with a
 * Bearer token (cookie-only sessions cannot invoke actions).
 */
export async function callAction<T = unknown>(
  name: string,
  params: Record<string, unknown> = {},
): Promise<ActionResponse<T>> {
  const token = await getAuthToken()
  if (!token) {
    return { success: false, error: 'Unauthorized' }
  }

  const res = await fetch(`/api/actions/${encodeURIComponent(name)}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(params),
  })

  const body = (await res.json().catch(() => null)) as ActionResponse<T> | null
  if (!body || typeof body !== 'object') {
    return { success: false, error: `Action failed (${res.status})` }
  }
  if (!res.ok && body.success !== false) {
    return { success: false, error: body.error ?? `Action failed (${res.status})` }
  }
  return body
}

/** Public (unauthenticated) queue API helper. */
export async function callPublicQueue<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<ActionResponse<T>> {
  const res = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  const body = (await res.json().catch(() => null)) as ActionResponse<T> | null
  if (!body || typeof body !== 'object') {
    return { success: false, error: `Request failed (${res.status})` }
  }
  if (!res.ok && body.success !== false) {
    return { success: false, error: body.error ?? `Request failed (${res.status})` }
  }
  return body
}
