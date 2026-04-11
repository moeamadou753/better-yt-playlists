export const VIEW = {
  PLAYLISTS: 'playlists',
  ITEMS: 'items',
} as const

export type View = typeof VIEW[keyof typeof VIEW]