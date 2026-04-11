import { createRoot } from 'react-dom/client'
import { Overlay } from './overlay/Overlay'
import overlayStyles from './overlay/overlay.css?inline'

function mount() {
  const existing = document.getElementById('yt-playlist-ui-root')
  if (existing) return

  const host = document.createElement('div')
  host.id = 'yt-playlist-ui-root'
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = overlayStyles
  shadow.appendChild(style)

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  const overlayRef = { toggle: () => {} }

  createRoot(mountPoint).render(
    <Overlay onRegisterToggle={(fn) => { overlayRef.toggle = fn }} />
  )

  // Keyboard shortcut lives here, not in the component
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault()
      overlayRef.toggle()
    }
  })

  // Toolbar icon click
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_OVERLAY') overlayRef.toggle()
  })
}

mount()