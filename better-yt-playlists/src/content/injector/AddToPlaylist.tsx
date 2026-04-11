import { useState, useRef, useEffect } from 'react'
import { getAuthToken } from '../../lib/auth'
import { fetchAllPlaylists, addVideoToPlaylist } from '../../lib/youtube'
import { fuzzySearchPlaylists } from '../../lib/fuzzy'
import type { YTPlaylist } from '../../lib/youtube'

interface AddToPlaylistProps {
  videoId: string
}

type Status = 'idle' | 'loading' | 'success' | 'error'

export function AddToPlaylist({ videoId }: AddToPlaylistProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [playlists, setPlaylists] = useState<YTPlaylist[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Close on escape, block YouTube hotkeys while open
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setOpen(false); return }
      if (e.metaKey || e.ctrlKey) return
      e.stopImmediatePropagation()
    }
    window.addEventListener('keydown', handler, true)
    return () => window.removeEventListener('keydown', handler, true)
  }, [open])

  // Focus input when opened
  useEffect(() => {
    if (open) requestAnimationFrame(() => inputRef.current?.focus())
  }, [open])

  async function handleOpen() {
    setOpen(o => !o)
    if (playlists.length > 0) return
    setStatus('loading')
    try {
      const token = await getAuthToken()
      setPlaylists(await fetchAllPlaylists(token))
      setStatus('idle')
    } catch (e: any) {
      setStatus('error')
      setErrorMsg(e.message ?? 'Failed to load playlists')
    }
  }

  async function handleAdd(playlist: YTPlaylist) {
    setStatus('loading')
    try {
      const token = await getAuthToken()
      await addVideoToPlaylist(playlist.id, videoId, token)
      setStatus('success')
      setSuccessMsg(`Added to "${playlist.title}"`)
      setTimeout(() => {
        setOpen(false)
        setStatus('idle')
        setSuccessMsg('')
      }, 1500)
    } catch (e: any) {
      setStatus('error')
      setErrorMsg(e.message ?? 'Failed to add to playlist')
    }
  }

  const filtered = fuzzySearchPlaylists(playlists, query)

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      <button className="yt-playlist-btn" onClick={handleOpen}>
        <svg height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3 18h13v-2H3v2zm0-5h10v-2H3v2zm0-7v2h13V6H3zm18 9h-2v-3h-3v-2h3V7h2v3h3v2h-3v3z"/>
        </svg>
        Save
      </button>

      {open && (
        <div className="yt-playlist-dropdown">
          <div className="yt-playlist-dropdown-search">
            <input
              ref={inputRef}
              placeholder="Search playlists..."
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>

          <div className="yt-playlist-dropdown-list">
            {status === 'loading' && (
              <p className="yt-playlist-dropdown-hint">Loading...</p>
            )}
            {status === 'success' && (
              <p className="yt-playlist-dropdown-success">✓ {successMsg}</p>
            )}
            {status === 'error' && (
              <p className="yt-playlist-dropdown-error">{errorMsg}</p>
            )}
            {status === 'idle' && filtered.length === 0 && (
              <p className="yt-playlist-dropdown-hint">No playlists found</p>
            )}
            {status === 'idle' && filtered.map(pl => (
              <div
                key={pl.id}
                className="yt-playlist-dropdown-item"
                onClick={() => handleAdd(pl)}
              >
                {pl.thumbnail && <img src={pl.thumbnail} />}
                <div>
                  <div className="yt-playlist-dropdown-item-title">{pl.title}</div>
                  <div className="yt-playlist-dropdown-item-count">{pl.itemCount} videos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}