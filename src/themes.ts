/**
 * Theme catalog.
 *
 * Color values live in styles.css / themes.css — this file is metadata only.
 */

export const THEMES = [
  {
    id: 'queueflow',
    label: 'QueueFlow',
    description: 'Light navy/blue product theme for salon queue management.',
  },
  {
    id: 'slate',
    label: 'Slate',
    description: 'Scaffold dark placeholder. Prefer queueflow.',
  },
  {
    id: 'paper',
    label: 'Paper',
    description: 'Scaffold light example. Prefer queueflow.',
  },
] as const

export type ThemeId = (typeof THEMES)[number]['id']

/** Read the currently active theme id from <html data-theme>. */
export function getActiveTheme(): ThemeId {
  if (typeof document === 'undefined') return 'queueflow'
  const id = document.documentElement.getAttribute('data-theme') as ThemeId | null
  return id ?? 'queueflow'
}

/** Look up a theme entry by id, or fall back to the first theme. */
export function getTheme(id: string) {
  return THEMES.find((t) => t.id === id) ?? THEMES[0]
}
