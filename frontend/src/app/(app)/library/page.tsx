'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, ListMusic, Heart, Disc, Mic2, Search, Filter, PlayCircle, Clock } from 'lucide-react';
import { getAllSongs, type Song as LikedSong } from '@/lib/mock-data'; // Use Song as LikedSong
import { useEffect, useState } from 'react';
import { useAudio } from '@/contexts/audio-context';
import { usePlayAndNavigate } from '@/hooks/use-play-and-navigate';

const userPlaylists = [
  { id: 1, name: 'Morning Vibes', songCount: 15, image: 'https://placehold.co/300x300.png?text=Playlist1', dataAiHint: 'abstract texture' },
  { id: 2, name: 'Telugu Road Trip', songCount: 25, image: 'https://placehold.co/300x300.png?text=Playlist2', dataAiHint: 'landscape road' },
  { id: 3, name: 'Workout Beats', songCount: 20, image: 'https://placehold.co/300x300.png?text=Playlist3', dataAiHint: 'gym fitness' },
  { id: 4, name: 'Relax & Unwind', songCount: 12, image: 'https://placehold.co/300x300.png?text=Playlist4', dataAiHint: 'nature serene' },
];

const likedSongs: LikedSong[] = getAllSongs().slice(3, 10); // Example liked songs

const libraryTabs = [
  { id: 'playlists', name: 'My Playlists', icon: ListMusic },
  { id: 'liked', name: 'Liked Songs', icon: Heart },
  { id: 'albums', name: 'Albums', icon: Disc },
  { id: 'artists', name: 'Artists', icon: Mic2 },
];

// FallbackImage component for robust image fallback
function FallbackImage({ src, alt, ...props }: { src: string, alt: string, [key: string]: any }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc('https://placehold.co/300x300.png?text=No+Image')}
    />
  );
}

export default function LibraryPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Library</h1>
          <p className="text-muted-foreground font-body">Your personal music collection.</p>
        </div>
      </section>
      {/* You can add liked songs, albums, artists, etc. here in the future */}
    </div>
  );
}

function LikedSongItem({ song }: { song: LikedSong }) {
  const { playSong, currentSong, isPlaying } = useAudio();
  const playAndNavigate = usePlayAndNavigate();
  
  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
  
  const handlePlayClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playAndNavigate(song);
  };

  return (
    <li className="flex items-center p-2 hover:bg-secondary/30 rounded-lg transition-colors group">
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary mr-3"
        onClick={handlePlayClick}
      >
        {isCurrentlyPlaying ? (
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        ) : (
          <PlayCircle className="h-4 w-4" />
        )}
      </Button>
      <div className="flex-1 min-w-0">
        <Link href={`/songs/${song.id}`} className="font-headline text-sm text-foreground hover:text-primary truncate font-semibold">
          {song.title}
        </Link>
        <p className="font-body text-xs text-muted-foreground truncate">
          {song.primaryArtistName}
        </p>
      </div>
      {song.duration && (
        <span className="text-xs font-mono text-muted-foreground">
          <Clock className="inline h-3 w-3 mr-1" />{song.duration}
        </span>
      )}
    </li>
  );
}

function PlaylistCard({ playlist }: { playlist: any }) {
  const { playSong } = useAudio();
  const playAndNavigate = usePlayAndNavigate();
  
  const imageUrl =
    (playlist.image && Array.isArray(playlist.image) && playlist.image[0]?.url)
      ? playlist.image[0].url.replace(/(50x50|150x150|200x200|250x250)/, '500x500')
      : '/musicmitra-logo.svg';
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
          playAndNavigate(data.data.songs[0]);
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
            data-ai-hint={playlist.dataAiHint}
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
      </Card>
    </Link>
  );
}
