import { createRoot } from 'react-dom/client'
import { findOverflowSaveItem, findSaveButton } from './selectors'
import { AddToPlaylist } from './AddToPlaylist'
import { getCurrentVideoId } from '../../lib/youtube'
import injectorStyles from './injector.css?inline'

let cleanup: (() => void) | null = null

let overflowCleanup: (() => void) | null = null

function injectOverflow() {
  const saveItem = findOverflowSaveItem()
  if (!saveItem || saveItem.getAttribute('data-yt-injected')) return

  saveItem.setAttribute('data-yt-injected', 'true')

  const handler = (e: Event) => {
    e.stopImmediatePropagation()
    e.preventDefault()

    // Close the overflow menu
    document.querySelector<HTMLElement>('ytd-popup-container')?.click()

    // Trigger the main overlay toggle with playlist view
    window.dispatchEvent(new CustomEvent('yt-playlist-toggle'))
  }

  saveItem.addEventListener('click', handler, true)

  overflowCleanup = () => {
    saveItem.removeEventListener('click', handler, true)
    saveItem.removeAttribute('data-yt-injected')
    overflowCleanup = null
  }
}

function inject() {
  const videoId = getCurrentVideoId()
  if (!videoId) return
  if (document.getElementById('yt-playlist-injected')) return

  const saveButton = findSaveButton()
  if (!saveButton) return

  // Only inject if the button is actually visible
  const rect = (saveButton as HTMLElement).getBoundingClientRect()
  if (rect.width === 0) return

  const nativeBtn = saveButton as HTMLElement
  nativeBtn.style.display = 'none'

  const host = document.createElement('div')
  host.id = 'yt-playlist-injected'
  host.style.display = 'inline-block'
  saveButton.parentElement?.insertBefore(host, saveButton)

  const shadow = host.attachShadow({ mode: 'open' })
  const style = document.createElement('style')
  style.textContent = injectorStyles
  shadow.appendChild(style)

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  const root = createRoot(mountPoint)
  root.render(<AddToPlaylist videoId={videoId} />)

  cleanup = () => {
    root.unmount()
    host.remove()
    nativeBtn.style.display = ''
  }
}

function eject() {
  cleanup?.()
  cleanup = null
  document.getElementById('yt-playlist-injected')?.remove()
}

export function startInjector() {
  // YouTube is a SPA — watch for navigation and DOM changes
  let lastUrl = location.href

  const observer = new MutationObserver(() => {
    // Handle SPA navigation
    if (location.href !== lastUrl) {
      lastUrl = location.href
      eject()
      overflowCleanup?.()
    }

    // Try to inject on watch pages
    if (location.pathname === '/watch') {
      inject()
      injectOverflow()
    }
  })

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })

  // Also try immediately in case DOM is already ready
  if (location.pathname === '/watch') inject()

  return () => observer.disconnect()
}