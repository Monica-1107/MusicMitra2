"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Disc3, PlayCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAudio } from '@/contexts/audio-context';
import { Input } from '@/components/ui/input';

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

export default function AlbumsPage() {
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchAlbums() {
      setLoading(true);
      setError('');
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/albums?query=${encodeURIComponent(search || 'a')}&limit=100`);
        if (!res.ok) throw new Error('Failed to fetch albums');
        const data = await res.json();
        // Filter for Telugu albums only
        const teluguAlbums = (Array.isArray(data.data?.results) ? data.data.results : []).filter(
          (album: any) => album.language && album.language.toLowerCase() === 'telugu'
        );
        setAlbums(teluguAlbums);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchAlbums();
  }, [search]);

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Disc3 className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Albums</h1>
          <p className="text-muted-foreground font-body">Browse all albums in the collection.</p>
        </div>
      </header>
      <div className="max-w-md mb-4">
        <Input
          type="text"
          placeholder="Search albums..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full"
        />
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-600">{error}</div>}
      {!loading && albums.length === 0 && <div>No albums found.</div>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {albums.map((album: any) => (
          <AlbumCardSimple key={album.id} album={album} />
        ))}
      </div>
    </div>
  );
}

function AlbumCardSimple({ album }: { album: any }) {
  const { playSong } = useAudio();
  
  // Fallback for image and alt
  const imageUrl =
    (album.image && Array.isArray(album.image) && album.image[0]?.url)
      ? album.image[0].url.replace(/(50x50|150x150|200x200|250x250)/, '500x500')
      : '/musicmitra-logo.svg';
  const altText = album.title || album.name || 'Album cover';
  // Get primary artist info if available
  const primaryArtist = Array.isArray(album.artists?.primary) && album.artists.primary.length > 0 ? album.artists.primary[0] : null;
  const isPlaceholder = imageUrl.includes('placehold.co');

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

  return (
    <Link href={`/albums/${album.id}`} className="block">
      <Card className="overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg group">
        <CardContent className="p-0 relative block">
          <FallbackImage
            src={imageUrl}
            alt={altText}
            width={200}
            height={200}
            className="w-full h-auto aspect-square object-cover"
            data-ai-hint={album.dataAiHint}
            unoptimized={isPlaceholder}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              onClick={handlePlayClick}
              className="h-12 w-12 text-white hover:scale-110 transition-transform duration-200"
            >
              <PlayCircle className="h-12 w-12" />
            </button>
          </div>
        </CardContent>
        <CardHeader className="p-3 block">
          <CardTitle className="font-headline text-md truncate text-foreground group-hover:text-primary">{album.title || album.name}</CardTitle>
          {primaryArtist ? (
            <CardDescription className="font-body text-xs truncate text-muted-foreground">
              <Link href={`/artists/${primaryArtist.id}`} className="hover:underline hover:text-primary">{primaryArtist.name}</Link>
            </CardDescription>
          ) : album.primaryArtistName ? (
            <CardDescription className="font-body text-xs truncate text-muted-foreground">{album.primaryArtistName}</CardDescription>
          ) : null}
        </CardHeader>
      </Card>
    </Link>
  );
}
