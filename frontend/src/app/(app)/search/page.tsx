'use client';
import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlayCircle } from 'lucide-react';
import { useAudio } from '@/contexts/audio-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { usePlayAndNavigate } from '@/hooks/use-play-and-navigate';
import { Input } from '@/components/ui/input';
import { Search as SearchIcon } from 'lucide-react';

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

function getHighResImage(imgObj: any) {
  if (!imgObj) return null;

  // Handle array of image objects (from search API)
  if (Array.isArray(imgObj)) {
    if (imgObj.length === 0) return null;
    // If the first element is an object with a url
    if (imgObj[0]?.url) {
      return imgObj[0].url.replace(/(50x50|150x150|200x200|250x250)/, '500x500');
    }
    // If the first element is a string
    if (typeof imgObj[0] === 'string') {
      return imgObj[0].replace(/(50x50|150x150|200x200|250x250)/, '500x500');
    }
    return null;
  }

  // Handle object with url property (including {id, name, url})
  if (typeof imgObj === 'object' && imgObj.url) {
    return imgObj.url.replace(/(50x50|150x150|200x200|250x250)/, '500x500');
  }

  // Handle direct url string (fallback)
  if (typeof imgObj === 'string') {
    return imgObj.replace(/(50x50|150x150|200x200|250x250)/, '500x500');
  }

  return null;
}

// Debounce hook for search
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [search, setSearch] = useState(searchParams?.get('query') || '');
  const [isSearching, setIsSearching] = useState(false);
  const query = searchParams?.get('query') || '';
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Debounce search input
  const debouncedSearch = useDebounce(search, 500);

  // Update local search state if query param changes (for navigation)
  useEffect(() => {
    setSearch(query);
  }, [query]);

  // Auto-search when debounced value changes
  useEffect(() => {
    if (debouncedSearch.trim() && debouncedSearch !== query) {
      router.push(`/search?query=${encodeURIComponent(debouncedSearch.trim())}`);
    }
  }, [debouncedSearch, router, query]);

  // Fetch search results
  const fetchSearchResults = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults(null);
      setError('');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);
    setIsSearching(true);

    try {
      const searchStrategies = generateSearchStrategies(searchQuery, 3); // Limit to 3 strategies for performance

      if (searchStrategies.length === 0) {
        setResults({ songs: { results: [] }, albums: { results: [] }, playlists: { results: [] }, artists: { results: [] }, topQuery: { results: [] } });
        setIsSearching(false);
        setLoading(false);
        return;
      }

      let allResults: any = {
        songs: { results: [] as any[] },
        albums: { results: [] as any[] },
        playlists: { results: [] as any[] },
        artists: { results: [] as any[] },
        topQuery: { results: [] as any[] }
      };

      // --- Hybrid Search Approach ---
      const searchPromises = searchStrategies.flatMap(strategy => [
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search?query=${encodeURIComponent(strategy)}&limit=15`).then(res => res.ok ? res.json() : null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/songs?query=${encodeURIComponent(strategy)}&limit=15`).then(res => res.ok ? res.json() : null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/albums?query=${encodeURIComponent(strategy)}&limit=15`).then(res => res.ok ? res.json() : null),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/playlists?query=${encodeURIComponent(strategy)}&limit=15`).then(res => res.ok ? res.json() : null),
      ]);

      const searchResults = await Promise.all(searchPromises);

      for (const result of searchResults) {
        if (result && result.success) {
          const d = result.data;
          // From /api/search (global)
          if (d.songs?.results) allResults.songs.results.push(...d.songs.results);
          if (d.albums?.results) allResults.albums.results.push(...d.albums.results);
          if (d.playlists?.results) allResults.playlists.results.push(...d.playlists.results);
          if (d.artists?.results) allResults.artists.results.push(...d.artists.results);
          if (d.topQuery?.results) allResults.topQuery.results.push(...d.topQuery.results);
          
          // From specific endpoints like /api/search/songs
          if (d.results && Array.isArray(d.results)) {
            const firstItemType = d.results[0]?.type;
            if (firstItemType === 'song') allResults.songs.results.push(...d.results);
            if (firstItemType === 'album') allResults.albums.results.push(...d.results);
            if (firstItemType === 'playlist') allResults.playlists.results.push(...d.results);
          }
        }
      }

      // Filter for Telugu content and remove duplicates
      const removeDuplicatesAndFilter = (arr: any[]) => {
        const seen = new Set();
        const filtered = arr.filter(item => item && item.language && item.language.toLowerCase() === 'telugu');
        return filtered.filter(item => {
          if (!item.id) return false;
          const duplicate = seen.has(item.id);
          seen.add(item.id);
          return !duplicate;
        });
      };
      
      const removeDuplicates = (arr: any[]) => {
        const seen = new Set();
        return arr.filter(item => {
          if (!item || !item.id) return false;
          const duplicate = seen.has(item.id);
          seen.add(item.id);
          return !duplicate;
        });
      };

      allResults.songs.results = removeDuplicatesAndFilter(allResults.songs.results);
      allResults.albums.results = removeDuplicatesAndFilter(allResults.albums.results);
      allResults.playlists.results = removeDuplicatesAndFilter(allResults.playlists.results);
      allResults.topQuery.results = removeDuplicatesAndFilter(allResults.topQuery.results);

      // --- Enhanced Artist Search ---
      // 1. Collect all unique artists from artist search results
      let uniqueArtists = removeDuplicates(allResults.artists.results);
      // 2. Collect all unique artists from Telugu songs and albums
      const artistMap: { [id: string]: any } = {};
      // From songs
      for (const song of allResults.songs.results) {
        if (song.artists?.primary && Array.isArray(song.artists.primary)) {
          for (const artist of song.artists.primary) {
            if (artist.id) artistMap[artist.id] = artist;
          }
        } else if (song.primaryArtists) {
          // fallback: comma-separated string
          song.primaryArtists.split(',').map((name: string) => name.trim()).forEach((name: string) => {
            if (name) artistMap[name] = { id: name, name };
          });
        }
      }
      // From albums
      for (const album of allResults.albums.results) {
        if (album.artists?.primary && Array.isArray(album.artists.primary)) {
          for (const artist of album.artists.primary) {
            if (artist.id) artistMap[artist.id] = artist;
          }
        } else if (album.primaryArtistName) {
          artistMap[album.primaryArtistName] = { id: album.primaryArtistName, name: album.primaryArtistName };
        }
      }
      // Merge with uniqueArtists
      for (const id in artistMap) {
        if (!uniqueArtists.some((a: any) => a.id === id)) {
          uniqueArtists.push(artistMap[id]);
        }
      }
      // 3. For each unique artist, check if they have at least one Telugu song or album
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
      allResults.artists.results = removeDuplicates(teluguArtists as any[]);
      // --- End Enhanced Artist Search ---

      setResults(allResults);
      // Add to search history
      if (searchQuery.trim()) {
        setSearchHistory(prev => {
          const newHistory = [searchQuery.trim(), ...prev.filter(item => item !== searchQuery.trim())];
          return newHistory.slice(0, 10); // Keep only last 10 searches
        });
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setLoading(false);
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    fetchSearchResults(query);
  }, [query, fetchSearchResults]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      router.push(`/search?query=${encodeURIComponent(search.trim())}`);
    }
  };

  const handleSearchSuggestion = (suggestion: string) => {
    setSearch(suggestion);
    router.push(`/search?query=${encodeURIComponent(suggestion)}`);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="relative mb-8 max-w-xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search Telugu songs, artists, albums..."
            className="pl-10 w-full font-body"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {isSearching && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
            </div>
          )}
        </form>

        {/* Search Suggestions */}
        {search.trim() && !isSearching && searchHistory.length > 0 && (
          <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-md shadow-lg z-10 mt-1">
            <div className="p-2">
              <div className="text-xs text-muted-foreground mb-2 px-2">Recent searches:</div>
              {searchHistory
                .filter(item => item.toLowerCase().includes(search.toLowerCase()))
                .slice(0, 5)
                .map((item, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearchSuggestion(item)}
                    className="w-full text-left px-2 py-1 hover:bg-accent rounded text-sm"
                  >
                    {item}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>
      
      {loading && <div className="p-8 text-center">Searching for Telugu content...</div>}
      {error && <div className="p-8 text-center text-red-600">Error: {error}</div>}
      {!loading && !error && !results && <div className="p-8 text-center">Enter a search term to find Telugu music</div>}
      
      {results && (
        <>
          <h1 className="text-3xl font-bold mb-6">Search Results for "{query}"</h1>
          
          {/* Top Results */}
          {results.topQuery.results.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Top Telugu Results</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.topQuery.results.map((song: any, idx: number) => (
                  <SongCard key={song.id || idx} song={song} />
                ))}
              </div>
            </section>
          )}

          {/* Songs */}
          {results.songs.results.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Telugu Songs ({results.songs.results.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.songs.results.map((song: any, idx: number) => (
                  <SongCard key={song.id || idx} song={song} />
                ))}
              </div>
            </section>
          )}

          {/* Albums */}
          {results.albums.results.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Telugu Albums ({results.albums.results.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.albums.results.map((album: any, idx: number) => (
                  <AlbumCard key={album.id || idx} album={album} />
                ))}
              </div>
            </section>
          )}

          {/* Artists */}
          {results.artists.results.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Telugu Artists ({results.artists.results.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.artists.results.map((artist: any, idx: number) => (
                  <ArtistCard key={artist.id || idx} artist={artist} />
                ))}
              </div>
            </section>
          )}

          {/* Playlists */}
          {results.playlists.results.length > 0 && (
            <section className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Telugu Playlists ({results.playlists.results.length})</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {results.playlists.results.map((playlist: any, idx: number) => (
                  <PlaylistCard key={playlist.id || idx} playlist={playlist} />
                ))}
              </div>
            </section>
          )}

          {/* No Results */}
          {results.songs.results.length === 0 && 
           results.albums.results.length === 0 && 
           results.artists.results.length === 0 && 
           results.playlists.results.length === 0 && 
           results.topQuery.results.length === 0 && (
            <div className="text-center text-gray-500 mt-8">
              <p>No Telugu content found for "{query}"</p>
              <p className="text-sm mt-2">Try searching for different Telugu music terms</p>
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Popular Telugu search terms:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {['telugu songs', 'telugu hits', 'telugu latest', 'telugu old', 'telugu devotional'].map((term) => (
                    <button
                      key={term}
                      onClick={() => handleSearchSuggestion(term)}
                      className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm hover:bg-primary/20"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SongCard({ song }: { song: any }) {
  const { playSong } = useAudio();
  const playAndNavigate = usePlayAndNavigate();
  
  const imageUrl = getHighResImage(song.image) || '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('musicmitra-logo.svg');

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/songs/${song.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          playAndNavigate(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching song details:', error);
    }
  };

  const primaryArtistsText =
    song.artists?.primary && Array.isArray(song.artists.primary)
      ? song.artists.primary.map((a: any) => a.name).join(', ')
      : song.primaryArtists || song.singers || '';

  const albumText =
    song.album && typeof song.album === 'object'
      ? song.album.name
      : song.album || '';

  return (
    <div className="border rounded p-2 bg-white shadow hover:shadow-lg transition-shadow relative group">
      <Link href={`/songs/${song.id}`}>
        <Image
          src={imageUrl}
          alt={song.title || song.name || 'cover'}
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
          <PlayCircle className="h-12 w-12" />
        </button>
      </div>
      <div className="font-semibold truncate">{song.title || song.name}</div>
      <div className="text-xs text-gray-500 truncate">{primaryArtistsText}</div>
      <div className="text-xs text-gray-400">{albumText}</div>
    </div>
  );
}

function AlbumCard({ album }: { album: any }) {
  const { playSong } = useAudio();
  
  const imageUrl = getHighResImage(album.image) || '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('musicmitra-logo.svg');

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Fetch the album details to get the first song
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums?id=${album.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.songs && Array.isArray(data.data.songs) && data.data.songs.length > 0) {
          playSong(data.data.songs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching album details for playback:', error);
    }
  };
  
  const primaryArtistsText =
    album.artists?.primary && Array.isArray(album.artists.primary)
      ? album.artists.primary.map((a: any) => a.name).join(', ')
      : (typeof album.artist === 'object' && album.artist !== null ? album.artist.name : album.artist) || '';

  return (
    <div className="border rounded p-2 bg-white shadow hover:shadow-lg transition-shadow relative group">
      <Link href={`/albums/${album.id}`}>
        <Image
          src={imageUrl}
          alt={album.title || album.name || 'cover'}
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
          <PlayCircle className="h-12 w-12" />
        </button>
      </div>
      <div className="font-semibold truncate">{album.title || album.name}</div>
      <div className="text-xs text-gray-500 truncate">{primaryArtistsText}</div>
      <div className="text-xs text-gray-400">{album.year || ''}</div>
    </div>
  );
}

function ArtistCard({ artist }: { artist: any }) {
  const imageUrl = getHighResImage(artist.image) || '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('musicmitra-logo.svg');

  return (
    <Link href={`/artists/${artist.id}`} className="border rounded p-2 bg-white shadow hover:shadow-lg transition-shadow block">
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

function PlaylistCard({ playlist }: { playlist: any }) {
  const { playSong } = useAudio();
  
  const imageUrl = getHighResImage(playlist.image) || '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('musicmitra-logo.svg');

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Fetch the playlist details to get the first song
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists?id=${playlist.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data?.songs && Array.isArray(data.data.songs) && data.data.songs.length > 0) {
          playSong(data.data.songs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching playlist details for playback:', error);
    }
  };

  return (
    <div className="border rounded p-2 bg-white shadow hover:shadow-lg transition-shadow relative group">
      <Link href={`/playlists/${playlist.id}`}>
        <Image
          src={imageUrl}
          alt={playlist.title || playlist.name || 'cover'}
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
          <PlayCircle className="h-12 w-12" />
        </button>
      </div>
      <div className="font-semibold truncate">{playlist.title || playlist.name}</div>
      <div className="text-xs text-gray-500 truncate">{
        typeof playlist.language === 'object' && playlist.language !== null
          ? playlist.language.name || ''
          : playlist.language || ''
      }</div>
      <div className="text-xs text-gray-400">{playlist.description || ''}</div>
    </div>
  );
}
