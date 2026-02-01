"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ListMusic, PlayCircle, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAudio } from '@/contexts/audio-context';
import dynamic from 'next/dynamic';

// Dynamically import the CustomPlaylistsPage component with no SSR
const CustomPlaylistsPage = dynamic(
  () => import('./custom/page').then(mod => mod.default),
  { ssr: false }
);

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

export default function PlaylistsPage() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchPlaylists() {
      setLoading(true);
      setError('');
      try {
        const query = searchQuery.trim() || 'a'; // Default to 'a' for broad results
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/playlists?query=${encodeURIComponent(query)}&limit=30`);
        if (!res.ok) throw new Error('Failed to fetch playlists');
        const data = await res.json();
        // Filter for Telugu playlists only
        const teluguPlaylists = (Array.isArray(data.data?.results) ? data.data.results : []).filter(
          (playlist: any) => playlist.language && playlist.language.toLowerCase() === 'telugu'
        );
        setPlaylists(teluguPlaylists);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylists();
  }, [searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The useEffect will handle the search when searchQuery changes
  };

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <ListMusic className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Playlists</h1>
          <p className="text-muted-foreground font-body">Discover amazing playlists curated for you.</p>
        </div>
      </header>

      <Tabs defaultValue="featured" className="space-y-4">
        <TabsList>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="custom">Your Playlists</TabsTrigger>
        </TabsList>
        <TabsContent value="featured" className="focus-visible:outline-none">
          <div className="space-y-4">
            <h1 className="text-3xl font-bold font-headline text-foreground">Playlists</h1>
            <p className="text-muted-foreground font-body">Discover amazing playlists curated for you.</p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search playlists..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 font-body"
              />
            </div>
            <Button type="submit" className="font-headline">
              Search
            </Button>
          </form>

          {loading && <div>Loading...</div>}
          {error && <div className="text-red-600">{error}</div>}
          {!loading && playlists.length === 0 && <div>No playlists found.</div>}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {playlists.map((playlist: any) => (
              <PlaylistCard key={playlist.id} playlist={playlist} />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="custom" className="focus-visible:outline-none" forceMount>
          <CustomPlaylistsPage />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function PlaylistCard({ playlist }: { playlist: any }) {
  const { playSong } = useAudio();
  
  const imageUrl =
    (playlist.image && Array.isArray(playlist.image) && playlist.image[0]?.url)
      ? playlist.image[0].url.replace(/(50x50|150x150|200x200|250x250)/, '500x500')
      : '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('placehold.co');

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
    <Link href={`/playlists/${playlist.id}`} className="block">
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg group">
        <CardContent className="p-0 relative">
          <FallbackImage
            src={imageUrl}
            alt={playlist.name || playlist.title || 'Playlist'}
            width={300}
            height={300}
            className="w-full h-auto aspect-square object-cover"
            unoptimized={isPlaceholder}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 flex flex-col justify-end">
            <h3 className="font-headline text-xl text-white truncate">{playlist.name || playlist.title}</h3>
            <p className="font-body text-sm text-gray-300">{playlist.songCount || ''} songs</p>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="default" 
              size="icon" 
              className="h-10 w-10 rounded-full bg-primary/80 hover:bg-primary text-primary-foreground shadow-lg"
              onClick={handlePlayClick}
            >
              <PlayCircle className="h-6 w-6" />
            </Button>
          </div>
        </CardContent>
        <CardHeader className="p-3">
          <CardTitle className="font-headline text-md truncate text-foreground group-hover:text-primary">
            {playlist.name || playlist.title}
          </CardTitle>
          <CardDescription className="font-body text-xs truncate text-muted-foreground">
            {playlist.language || ''} • {playlist.songCount || 0} songs
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
} 