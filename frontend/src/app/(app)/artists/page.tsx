'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
// import { PlayCircle } from 'lucide-react';
import { useAudio } from '@/contexts/audio-context';

function generateSearchStrategies(query: string, limit: number = 5): string[] {
  const words = query.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];

  const strategies = new Set<string>();
  for (let i = 0; i < words.length; i++) {
    for (let j = i; j < words.length; j++) {
      strategies.add(words.slice(i, j + 1).join(' '));
    }
  }

  return Array.from(strategies)
    .sort((a, b) => b.length - a.length)
    .slice(0, limit);
}

// FallbackImage component for robust image fallback
function FallbackImage({ src, alt, ...props }: { src: string, alt: string, [key: string]: any }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc('/musicmitra-logo.svg')}
    />
  );
}

function getHighResImage(imgObj: any) {
  if (!imgObj?.url) return null;
  return imgObj.url.replace(/(50x50|150x150|200x200|250x250)/, '500x500');
}

export default function ArtistsPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);

  const fetchArtists = useCallback(async (searchQuery: string) => {
    if (searchQuery) {
      setInitialLoading(false);
      setLoading(true);
    } else {
      setInitialLoading(true);
    }
    setError('');

    try {
      const query = searchQuery.trim() || 'a';
      const searchStrategies = generateSearchStrategies(query);
      
      const searchPromises = searchStrategies.map(strategy =>
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/artists?query=${encodeURIComponent(strategy)}&limit=30`)
          .then(res => res.ok ? res.json() : null)
      );
      
      const searchResults = await Promise.all(searchPromises);
      let allArtists: any[] = [];

      for (const result of searchResults) {
        if (result && result.success && Array.isArray(result.data?.results)) {
          allArtists.push(...result.data.results);
        }
      }

      const removeDuplicates = (arr: any[]) => {
        const seen = new Set();
        return arr.filter(item => {
          if (!item || !item.id) return false;
          const duplicate = seen.has(item.id);
          seen.add(item.id);
          return !duplicate;
        });
      };
      
      const uniqueArtists = removeDuplicates(allArtists);

      // For each artist, fetch their songs and albums and check for Telugu
      const artistPromises = uniqueArtists.map(async (artist: any) => {
        let hasTelugu = false;
        try {
          const [songsRes, albumsRes] = await Promise.all([
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artists/${artist.id}/songs`),
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artists/${artist.id}/albums`),
          ]);

          if (songsRes.ok) {
            const songsData = await songsRes.json();
            if (Array.isArray(songsData.data?.songs) && songsData.data.songs.some((s: any) => s.language?.toLowerCase() === 'telugu')) {
              hasTelugu = true;
            }
          }
          if (!hasTelugu && albumsRes.ok) {
            const albumsData = await albumsRes.json();
            if (Array.isArray(albumsData.data?.albums) && albumsData.data.albums.some((a: any) => a.language?.toLowerCase() === 'telugu')) {
              hasTelugu = true;
            }
          }
        } catch {}
        return hasTelugu ? artist : null;
      });

      const teluguArtists = (await Promise.all(artistPromises)).filter(Boolean);
      setResults(removeDuplicates(teluguArtists as any[]));

    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchArtists('');
  }, [fetchArtists]);

  // Handle search form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchArtists(query);
  };

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Telugu Artists</h1>
      <form onSubmit={handleSearch} className="mb-6 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search for Telugu artists..."
          className="flex-1 border rounded px-3 py-2"
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Search</button>
      </form>
      {(loading || initialLoading) && <div>Loading Telugu artists...</div>}
      {error && <div className="text-red-600">{error}</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {results.map((artist, idx) => (
          <ArtistCard key={artist.id || artist.name || idx} artist={artist} />
        ))}
      </div>
      {!loading && !initialLoading && results.length === 0 && <div className="text-center text-gray-500 mt-8">No Telugu artists found.</div>}
    </div>
  );
}

function ArtistCard({ artist }: { artist: any }) {
  // const { playSong, currentSong, isPlaying } = useAudio();
  // const [playing, setPlaying] = useState(false);

  const imageUrl =
    (artist.image && Array.isArray(artist.image) && getHighResImage(artist.image[0]) && /^https?:\/\//.test(getHighResImage(artist.image[0])))
      ? getHighResImage(artist.image[0])
      : '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('placehold.co');

  return (
    <Link href={`/artists/${artist.id}`} className="border rounded p-2 bg-white shadow hover:shadow-lg transition-shadow relative group block">
      <Image
        src={imageUrl}
        alt={artist.title || artist.name || 'cover'}
        width={200}
        height={200}
        className="w-full h-auto aspect-square object-cover mb-2"
        unoptimized={isPlaceholder}
      />
      <div className="font-semibold truncate">{artist.title || artist.name}</div>
      <div className="text-xs text-gray-500 truncate">Telugu</div>
      <div className="text-xs text-gray-400">{artist.description || ''}</div>
    </Link>
  );
}
