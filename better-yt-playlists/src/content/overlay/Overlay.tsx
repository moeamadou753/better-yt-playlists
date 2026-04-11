import React, { useState, useRef, useEffect } from "react";
import { getAuthToken } from "../../lib/auth";
import { fetchAllPlaylists, fetchPlaylistItems } from "../../lib/youtube";
import { fuzzySearchPlaylists, fuzzySearchItems } from "../../lib/fuzzy";
import type { YTPlaylist, YTPlaylistItem } from "../../lib/youtube";
import { VIEW, type View } from "./constants";
import "./overlay.css";

interface OverlayProps {
  onRegisterToggle: (fn: () => void) => void;
}

export function Overlay({ onRegisterToggle }: OverlayProps) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [view, setView] = useState<View>(VIEW.PLAYLISTS);
  const [playlists, setPlaylists] = useState<YTPlaylist[]>([]);
  const [items, setItems] = useState<YTPlaylistItem[]>([]);
  const [activePlaylist, setActivePlaylist] = useState<YTPlaylist | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  onRegisterToggle(() => {
    if (!visible) handleOpen();
    else setVisible(false);
  });

  // Reclaim focus whenever YouTube tries to steal it
  useEffect(() => {
    if (!visible) return;

    const reclaimFocus = () => {
      // Only reclaim if focus left our shadow DOM entirely
      requestAnimationFrame(() => {
        if (
          document.activeElement?.id === "yt-playlist-ui-root" ||
          !document.activeElement ||
          document.activeElement === document.body
        ) {
          inputRef.current?.focus();
        }
      });
    };

    window.addEventListener("focusout", reclaimFocus);

    const suppressHotkeys = (e: KeyboardEvent) => {
      // Let through: our toggle shortcut
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "f")
        return;
      // Let through: modifier-only combos (cmd+c, cmd+v, cmd+a etc)
      if (e.metaKey || e.ctrlKey) return;
      // Let through: non-printable navigation keys the overlay uses
      const allowed = [
        "Escape",
        "Tab",
        "ArrowUp",
        "ArrowDown",
        "Enter",
        "Backspace",
        "Delete",
      ];
      if (allowed.includes(e.key)) return;
      // Block everything else — single letter keys, numbers, punctuation etc
      // that would otherwise trigger YouTube hotkeys (f, k, j, l, m, t, etc)
      e.stopImmediatePropagation();
    };
    
    window.addEventListener("keydown", suppressHotkeys, true);

    return () => {
      window.removeEventListener("focusout", reclaimFocus);
      window.removeEventListener("keydown", suppressHotkeys, true);
    };
  }, [visible]);

  // Focus input when overlay becomes visible
  useEffect(() => {
    if (visible) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [visible]);

  async function handleOpen() {
    setVisible(true);
    if (playlists.length > 0) return;
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      setPlaylists(await fetchAllPlaylists(token));
    } catch (e: any) {
      setError(e.message ?? "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  }

  async function handleOpenPlaylist(playlist: YTPlaylist) {
    setActivePlaylist(playlist);
    setView(VIEW.ITEMS);
    setQuery("");
    setLoading(true);
    setError(null);
    try {
      const token = await getAuthToken();
      setItems(await fetchPlaylistItems(playlist.id, token));
    } catch (e: any) {
      setError(e.message ?? "Failed to load items");
    } finally {
      setLoading(false);
    }
  }

  function handleBack() {
    setView(VIEW.PLAYLISTS);
    setQuery("");
  }

  function handleBackdropKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      view === VIEW.ITEMS ? handleBack() : setVisible(false);
    }
  }

  if (!visible) return null;

  const filteredPlaylists = fuzzySearchPlaylists(playlists, query);
  const filteredItems = fuzzySearchItems(items, query);

  return (
    <div
      className="overlay-backdrop"
      onClick={() => setVisible(false)}
      onKeyDown={handleBackdropKeyDown}
    >
      <div className="overlay-panel" onClick={(e) => e.stopPropagation()}>
        <div className="overlay-header">
          {view === VIEW.ITEMS ? (
            <button className="overlay-back" onClick={handleBack}>
              ← Back
            </button>
          ) : (
            <div />
          )}
          <span className="overlay-title">
            {view === VIEW.PLAYLISTS
              ? "🎵 Your Playlists"
              : activePlaylist?.title}
          </span>
          <button className="overlay-close" onClick={() => setVisible(false)}>
            ✕
          </button>
        </div>

        <div className="overlay-search-wrap">
          <input
            ref={inputRef}
            className="overlay-search"
            placeholder={
              view === VIEW.PLAYLISTS
                ? "Search playlists..."
                : "Search videos..."
            }
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="overlay-body">
          {loading && <p className="overlay-hint">Loading...</p>}
          {error && <p className="overlay-hint overlay-hint--error">{error}</p>}

          {!loading &&
            !error &&
            view === VIEW.PLAYLISTS &&
            (filteredPlaylists.length === 0 ? (
              <p className="overlay-hint">No playlists found</p>
            ) : (
              filteredPlaylists.map((pl) => (
                <div
                  key={pl.id}
                  className="overlay-row"
                  onClick={() => handleOpenPlaylist(pl)}
                >
                  {pl.thumbnail && (
                    <img src={pl.thumbnail} className="overlay-thumb" />
                  )}
                  <div className="overlay-row-text">
                    <div className="overlay-row-title">{pl.title}</div>
                    <div className="overlay-row-meta">
                      {pl.itemCount} videos
                    </div>
                  </div>
                </div>
              ))
            ))}

          {!loading &&
            !error &&
            view === VIEW.ITEMS &&
            (filteredItems.length === 0 ? (
              <p className="overlay-hint">No videos found</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="overlay-row"
                  onClick={() =>
                    window.open(
                      `https://youtube.com/watch?v=${item.videoId}`,
                      "_self",
                    )
                  }
                >
                  {item.thumbnail && (
                    <img src={item.thumbnail} className="overlay-thumb" />
                  )}
                  <div className="overlay-row-text">
                    <div className="overlay-row-title">{item.title}</div>
                    <div className="overlay-row-meta">#{item.position + 1}</div>
                  </div>
                </div>
              ))
            ))}
        </div>
      </div>
    </div>
  );
}
