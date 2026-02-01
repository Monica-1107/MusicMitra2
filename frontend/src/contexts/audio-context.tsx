'use client';

import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

export interface Song {
  id: string;
  name: string;
  primaryArtistName?: string;
  albumName?: string;
  albumArt?: string;
  downloadUrl?: any[];
  duration?: string;
  image?: any[];
  [key: string]: any;
}

interface AudioContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  playSong: (song: Song) => void;
  playQueue: (songs: Song[], startIndex?: number) => void;
  pauseSong: () => void;
  resumeSong: () => void;
  stopSong: () => void;
  playNext: () => void;
  playPrevious: () => void;
  audioUrl: string | null;
  queue: Song[];
  currentIndex: number;
  seekTo: (time: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

function getBestAudioUrl(downloadUrlArr: any[] | undefined): string | null {
  if (!Array.isArray(downloadUrlArr) || downloadUrlArr.length === 0) return null;
  // Prefer 320kbps, then 160kbps, then 96kbps, else last
  const qualities = ['320kbps', '160kbps', '96kbps'];
  for (const q of qualities) {
    const found = downloadUrlArr.find((d: any) => d.quality === q);
    if (found && found.url) return found.url;
  }
  // Fallback: last item
  return downloadUrlArr[downloadUrlArr.length - 1]?.url || null;
}

export function AudioProvider({ children }: { children: React.ReactNode }) {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);
  const [seekTime, setSeekTime] = useState<number | null>(null);

  const playSong = (song: Song) => {
    setQueue([song]);
    setCurrentIndex(0);
    setCurrentSong(song);
    setAudioUrl(getBestAudioUrl(song.downloadUrl));
    setIsPlaying(true);
  };

  const playQueue = (songs: Song[], startIndex: number = 0) => {
    if (!songs || songs.length === 0) return;
    setQueue(songs);
    setCurrentIndex(startIndex);
    setCurrentSong(songs[startIndex]);
    setAudioUrl(getBestAudioUrl(songs[startIndex].downloadUrl));
    setIsPlaying(true);
  };

  const pauseSong = () => {
    setIsPlaying(false);
  };

  const resumeSong = () => {
    if (currentSong) {
      setIsPlaying(true);
    }
  };

  const stopSong = () => {
    setIsPlaying(false);
    setCurrentSong(null);
    setAudioUrl(null);
    setQueue([]);
    setCurrentIndex(-1);
  };

  const playNext = () => {
    if (queue.length > 0 && currentIndex < queue.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setCurrentSong(queue[nextIndex]);
      setAudioUrl(getBestAudioUrl(queue[nextIndex].downloadUrl));
      setIsPlaying(true);
    }
  };

  const playPrevious = () => {
    if (queue.length > 0 && currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setCurrentSong(queue[prevIndex]);
      setAudioUrl(getBestAudioUrl(queue[prevIndex].downloadUrl));
      setIsPlaying(true);
    }
  };

  const seekTo = (time: number) => {
    setSeekTime(time);
  };

  // No direct audio element or playback logic here!

  const value: AudioContextType = {
    currentSong,
    isPlaying,
    playSong,
    playQueue,
    pauseSong,
    resumeSong,
    stopSong,
    playNext,
    playPrevious,
    audioUrl,
    queue,
    currentIndex,
    seekTo,
  };

  return (
    <AudioContext.Provider value={value}>
      {children}
    </AudioContext.Provider>
  );
}

export function useAudio() {
  const context = useContext(AudioContext);
  if (context === undefined) {
    throw new Error('useAudio must be used within an AudioProvider');
  }
  return context;
} 