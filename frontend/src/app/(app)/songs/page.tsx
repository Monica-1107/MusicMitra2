"use client";
import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { useAudio } from '@/contexts/audio-context';
import { Input } from '@/components/ui/input';
import { usePlayAndNavigate } from '@/hooks/use-play-and-navigate';

function safeImageUrl(url: string | undefined) {
  if (!url || typeof url !== 'string') return '/musicmitra-logo.svg';
  const lower = url.toLowerCase();
  if (
    (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) &&
    !lower.includes('<html') &&
    !lower.includes('<!doctype')
  ) {
    return url;
  }
  return '/musicmitra-logo.svg';
}

// FallbackImage component for robust image fallback
function FallbackImage({ src, alt, ...props }: { src: string, alt: string, [key: string]: any }) {
  const [imgSrc, setImgSrc] = useState(safeImageUrl(src));
  return (
    <Image
      {...props}
      src={safeImageUrl(imgSrc)}
      alt={alt}
      onError={() => setImgSrc('/musicmitra-logo.svg')}
    />
  );
}

function getHighResImage(imgObj: any) {
  if (!imgObj?.url) return null;
  return imgObj.url.replace(/(50x50|150x150|200x200|250x250)/, '500x500');
}

export default function SongsPage() {
  const [songs, setSongs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchSongs() {
      setLoading(true);
      setError('');
      try {
        const query = search || 'a';
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?query=${encodeURIComponent(query)}&limit=100`);
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to fetch songs');
        }
        const data = await res.json();
        
        // The API returns songs in data.data.songs.results
        const songsData = data.data?.songs?.results || [];
        
        // Filter for Telugu songs only
        const teluguSongs = songsData.filter(
          (song: any) => song.language && song.language.toLowerCase() === 'telugu'
        );
        
        // If no Telugu songs found with the current query, try with 'telugu' as the default
        if (teluguSongs.length === 0 && query !== 'telugu') {
          const defaultRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?query=telugu`);
          if (defaultRes.ok) {
            const defaultData = await defaultRes.json();
            const defaultSongs = defaultData.data?.songs?.results || [];
            setSongs(defaultSongs);
            return;
          }
        }
        
        setSongs(teluguSongs);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchSongs();
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">All Songs</h1>
      <div className="max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search songs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full"
        />
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && songs.length === 0 && <div>No songs found.</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {songs.map((song: any, idx: number) => (
          <SongCard key={song.id || idx} song={song} songs={songs} index={idx} />
        ))}
      </div>
    </div>
  );
}

function SongCard({ song, songs, index }: { song: any; songs: any[]; index: number }) {
  const { playQueue, currentSong, isPlaying } = useAudio();
  const playAndNavigate = usePlayAndNavigate();
  
  const imageUrl = safeImageUrl(
    (song.image && Array.isArray(song.image) && getHighResImage(song.image[0]) && /^https?:\/\//.test(getHighResImage(song.image[0])))
      ? getHighResImage(song.image[0])
      : '/musicmitra-logo.svg'
  );
  const isPlaceholder = imageUrl.includes('placehold.co');
  // Get primary artist names
  const primaryArtists = Array.isArray(song.artists?.primary)
    ? song.artists.primary.map((a: any) => a.name).join(', ')
    : song.primaryArtists || song.singers || '';
  // Get album name
  const albumName = song.album?.name || song.album || '';
  
  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playQueue(songs, index);
    playAndNavigate(song);
  };

  // Encode the queue and index for the link
  const queueParam = encodeURIComponent(JSON.stringify(songs.map(s => s.id)));
  const linkHref = `/songs/${song.id}?queue=${queueParam}&index=${index}`;

  return (
    <div className="border rounded p-2 bg-white shadow flex flex-col items-center hover:shadow-lg transition-shadow relative group">
      <Link href={linkHref}>
        <FallbackImage
          src={imageUrl}
          alt={song.name || 'Song'}
          width={200}
          height={200}
          className="w-full h-auto aspect-square object-cover mb-2"
          unoptimized={isPlaceholder}
        />
      </Link>
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
        <button
          onClick={handlePlayClick}
          className="h-12 w-12 text-white hover:scale-110 transition-transform duration-200"
        >
          {isCurrentlyPlaying ? (
            <div className="h-12 w-12 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlayCircle className="h-12 w-12" />
          )}
        </button>
      </div>
      <div className="font-semibold truncate w-full text-center">{song.name}</div>
      <div className="text-xs text-gray-500 truncate w-full text-center">{primaryArtists}</div>
      <div className="text-xs text-gray-400 w-full text-center">{albumName}</div>
      <div className="text-xs text-gray-400 w-full text-center">{song.language || ''}</div>
    </div>
  );
} 