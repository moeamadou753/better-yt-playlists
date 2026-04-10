import React from 'react'
import { createRoot } from 'react-dom/client'
import { Overlay } from './overlay/Overlay'

function mount() {
  // Shadow host — invisible wrapper div
  const host = document.createElement('div')
  host.id = 'yt-playlist-ui-root'
  document.body.appendChild(host)

  // Shadow DOM isolates your styles from YouTube's
  const shadow = host.attachShadow({ mode: 'open' })

  const mountPoint = document.createElement('div')
  shadow.appendChild(mountPoint)

  createRoot(mountPoint).render(<Overlay />)
}

// Only mount once
if (!document.getElementById('yt-playlist-ui-root')) {
  mount()
}