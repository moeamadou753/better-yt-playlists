import React, { useState, useEffect } from 'react'
import './overlay.css'

export function Overlay() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Toggle with Cmd+Shift+F / Ctrl+Shift+F
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault()
        setVisible(v => !v)
      }
      if (e.key === 'Escape') setVisible(false)
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!visible) return null

  return (
    <div className="overlay-backdrop" onClick={() => setVisible(false)}>
      <div className="overlay-panel" onClick={e => e.stopPropagation()}>
        <p>🎵 Playlist UI coming soon</p>
      </div>
    </div>
  )
}