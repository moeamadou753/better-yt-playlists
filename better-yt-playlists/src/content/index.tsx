import { createRoot } from 'react-dom/client'
import { Overlay } from './overlay/Overlay'
import overlayStyles from './overlay/overlay.css?inline'

function mount() {

  const existing = document.getElementById('yt-playlist-ui-root')
  if (existing) {
    return
  }

  const host = document.createElement('div')
  host.id = 'yt-playlist-ui-root'
  document.body.appendChild(host)

  const shadow = host.attachShadow({ mode: 'open' })

  const style = document.createElement('style')
  style.textContent = overlayStyles
  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)
  shadow.appendChild(style)

  createRoot(mountPoint).render(<Overlay />)
}

mount()