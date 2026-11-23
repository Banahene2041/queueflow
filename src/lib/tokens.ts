/** High-entropy customer ticket capability token (URL-safe). Never log the result. */
export function mintAccessToken(bytes = 32): string {
  const buf = new Uint8Array(bytes)
  crypto.getRandomValues(buf)
  return base64Url(buf)
}

export async function hashAccessToken(token: string): Promise<string> {
  const data = new TextEncoder().encode(token)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return base64Url(new Uint8Array(digest))
}

function base64Url(bytes: Uint8Array): string {
  let binary = ''
  for (const b of bytes) binary += String.fromCharCode(b)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}
