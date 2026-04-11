export interface YTPlaylist {
  id: string
  title: string
  description: string
  itemCount: number
  thumbnail: string
}

export interface YTPlaylistItem {
  id: string
  title: string
  description: string
  videoId: string
  thumbnail: string
  position: number
}

async function ytFetch(endpoint: string, token: string): Promise<any> {
  const res = await fetch(`https://www.googleapis.com/youtube/v3/${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error(`YouTube API error: ${res.status}`)
  return res.json()
}

export async function fetchAllPlaylists(token: string): Promise<YTPlaylist[]> {
  const playlists: YTPlaylist[] = []
  let pageToken = ''

  do {
    const params = new URLSearchParams({
      part: 'snippet,contentDetails',
      mine: 'true',
      maxResults: '50',
      ...(pageToken && { pageToken }),
    })

    const data = await ytFetch(`playlists?${params}`, token)

    for (const item of data.items ?? []) {
      playlists.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        itemCount: item.contentDetails.itemCount,
        thumbnail: item.snippet.thumbnails?.default?.url ?? '',
      })
    }

    pageToken = data.nextPageToken ?? ''
  } while (pageToken)

  return playlists
}

export async function fetchPlaylistItems(
  playlistId: string,
  token: string
): Promise<YTPlaylistItem[]> {
  const items: YTPlaylistItem[] = []
  let pageToken = ''

  do {
    const params = new URLSearchParams({
      part: 'snippet',
      playlistId,
      maxResults: '50',
      ...(pageToken && { pageToken }),
    })

    const data = await ytFetch(`playlistItems?${params}`, token)

    for (const item of data.items ?? []) {
      items.push({
        id: item.id,
        title: item.snippet.title,
        description: item.snippet.description,
        videoId: item.snippet.resourceId.videoId,
        thumbnail: item.snippet.thumbnails?.default?.url ?? '',
        position: item.snippet.position,
      })
    }

    pageToken = data.nextPageToken ?? ''
  } while (pageToken)

  return items
}