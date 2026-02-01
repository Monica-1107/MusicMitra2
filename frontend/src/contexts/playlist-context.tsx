// frontend/src/contexts/playlist-context.tsx
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Song {
  id: string;
  name: string;
  artist: string;
  image?: any;
  url?: string;
  downloadUrl?: any;
  duration?: number;
  language?: string;
}

interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  createdAt: string;
}

interface PlaylistContextType {
  playlists: Playlist[];
  createPlaylist: (name: string, description?: string) => void;
  addSongToPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

export function PlaylistProvider({ children }: { children: ReactNode }) {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  // Load playlists from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('customPlaylists');
    if (saved) {
      setPlaylists(JSON.parse(saved));
    }
  }, []);

  // Save playlists to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('customPlaylists', JSON.stringify(playlists));
  }, [playlists]);

  const createPlaylist = (name: string, description: string = '') => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      name,
      description,
      songs: [],
      createdAt: new Date().toISOString(),
    };
    setPlaylists(prev => [...prev, newPlaylist]);
    return newPlaylist;
  };

  const addSongToPlaylist = (playlistId: string, song: Song) => {
    setPlaylists(prev => 
      prev.map(playlist => 
        playlist.id === playlistId 
          ? { 
              ...playlist, 
              songs: playlist.songs.some(s => s.id === song.id) 
                ? playlist.songs 
                : [...playlist.songs, song] 
            }
          : playlist
      )
    );
  };

  const removeSongFromPlaylist = (playlistId: string, songId: string) => {
    setPlaylists(prev => 
      prev.map(playlist => 
        playlist.id === playlistId
          ? { 
              ...playlist, 
              songs: playlist.songs.filter(song => song.id !== songId) 
            }
          : playlist
      )
    );
  };

  const deletePlaylist = (playlistId: string) => {
    setPlaylists(prev => prev.filter(playlist => playlist.id !== playlistId));
  };

  return (
    <PlaylistContext.Provider 
      value={{ 
        playlists, 
        createPlaylist, 
        addSongToPlaylist, 
        removeSongFromPlaylist,
        deletePlaylist
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
}

export function usePlaylists() {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
}