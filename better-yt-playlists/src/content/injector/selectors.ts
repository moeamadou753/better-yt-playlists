// Ordered by specificity — first match wins
export const SAVE_BUTTON_SELECTORS = [
  'ytd-button-renderer:has([aria-label="Save to playlist"])',
  'ytd-button-renderer:has([aria-label="Save"])',
  'yt-button-view-model:has([aria-label="Save to playlist"])',
  'yt-button-view-model:has([aria-label="Save"])',
]

export const ACTION_ROW_SELECTORS = [
  '#above-the-fold #actions',
  '#above-the-fold ytd-menu-renderer',
  'ytd-watch-metadata #actions',
]

export function findSaveButton(): Element | null {
  for (const selector of SAVE_BUTTON_SELECTORS) {
    const el = document.querySelector(selector)
    if (el) return el
  }
  return null
}

export function findActionRow(): Element | null {
  for (const selector of ACTION_ROW_SELECTORS) {
    const el = document.querySelector(selector)
    if (el) return el
  }
  return null
}

export function findOverflowSaveItem(): Element | null {
  const items = document.querySelectorAll('ytd-menu-service-item-renderer')
  for (const item of items) {
    const label = item.querySelector('yt-formatted-string')
    if (label?.textContent?.trim() === 'Save') return item
  }
  return null
}