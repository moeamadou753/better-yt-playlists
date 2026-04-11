import { createRoot } from 'react-dom/client'
import { Overlay } from './overlay/Overlay'
import overlayStyles from './overlay/overlay.css?inline'
import { startInjector } from './injector/ButtonInjector'


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

  startInjector()

  // Keyboard shortcut lives here, not in the component
  window.addEventListener('keydown', (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
      e.preventDefault()
      overlayRef.toggle()
    }
  })

  window.addEventListener('yt-playlist-toggle', () => overlayRef.toggle())
}

mount()