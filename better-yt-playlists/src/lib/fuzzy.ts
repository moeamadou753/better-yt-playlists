import Fuse from 'fuse.js'
import type { YTPlaylist, YTPlaylistItem } from './youtube'

export function fuzzySearchPlaylists(playlists: YTPlaylist[], query: string) {
  if (!query.trim()) return playlists
  const fuse = new Fuse(playlists, {
    keys: ['title', 'description'],
    threshold: 0.35,
    includeScore: true,
  })
  return fuse.search(query).map(r => r.item)
}

export function fuzzySearchItems(items: YTPlaylistItem[], query: string) {
  if (!query.trim()) return items
  const fuse = new Fuse(items, {
    keys: ['title', 'description'],
    threshold: 0.35,
    includeScore: true,
  })
  return fuse.search(query).map(r => r.item)
}