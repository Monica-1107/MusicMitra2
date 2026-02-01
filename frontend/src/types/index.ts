export interface AudioFile {
  url: string;
  name: string;
  type: string;
  size: number;
}

export interface KaraokeState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  activeView: 'original' | 'instrumental';
  isRecording: boolean;
  recordedBlob: Blob | null;
}

export interface LyricLine {
  telugu: string;
  transliteration: string; // English pronunciation
  translation: string; // Semantic meaning
  timestamp: string; // Start time format "MM:SS"
}

export interface SongMetadata {
  title: string;
  artist: string;
  album?: string;
  isTelugu: boolean;
  duration?: number;
  language?: string;
  message?: string; // For errors or context
}

export interface LyricsResponse {
  metadata: SongMetadata;
  lyrics: LyricLine[];
}

export enum AppState {
  IDLE = 'IDLE',
  ANALYZING = 'ANALYZING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}