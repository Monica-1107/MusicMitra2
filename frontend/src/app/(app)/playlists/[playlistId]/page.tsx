'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ListMusic, ChevronLeft, PlayCircle, User, CalendarDays, Clock, Music, Heart, PlusCircle } from 'lucide-react';
import { useAudio } from '@/contexts/audio-context';
import { usePlayAndNavigate } from '@/hooks/use-play-and-navigate';

async function getPlaylist(playlistId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists?id=${playlistId}`, { cache: 'no-store' });
  if (!res.ok) return null;
  return res.json();
}

export default function PlaylistPage({ params }: { params: { playlistId: string } }) {
  const [playlist, setPlaylist] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPlaylist() {
      setLoading(true);
      setError('');
      try {
        const response = await getPlaylist(params.playlistId);
        console.log('Playlist ID:', params.playlistId);
        console.log('Playlist API response:', response);

        if (!response || !response.success || !response.data) {
          setError('Playlist not found');
          setPlaylist(null);
        } else {
          setPlaylist(response.data);
        }
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setPlaylist(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPlaylist();
  }, [params.playlistId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !playlist) return (
    <div className="p-8 text-center text-red-600">
      <h1>Playlist not found</h1>
      <p>{error || `No playlist found for ID: ${params.playlistId}`}</p>
    </div>
  );

  const songs = Array.isArray(playlist.songs) ? playlist.songs : [];
  
  // Get playlist image
  const imageUrl = (playlist.image && Array.isArray(playlist.image) && playlist.image[0]?.url)
    ? playlist.image[0].url.replace(/(50x50|150x150|200x200|250x250)/, '500x500')
    : '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('musicmitra-logo.svg');

  return (
    <div className="container mx-auto py-8 px-4 space-y-12">
      <Link href="/playlists" className="flex items-center text-muted-foreground hover:text-primary transition-colors font-body mb-6">
        <ChevronLeft className="mr-2 h-5 w-5" /> Back to Playlists
      </Link>

      <section aria-labelledby="playlist-info" className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
        <Image
          src={imageUrl}
          alt={playlist.name || 'Playlist'}
          width={250}
          height={250}
          className="rounded-lg shadow-xl object-cover aspect-square border-4 border-secondary/30"
          priority
          unoptimized={isPlaceholder}
        />
        <div className="text-center md:text-left flex-1">
          <p className="text-sm font-body text-primary uppercase tracking-wider">Playlist</p>
          <h1 id="playlist-info" className="text-4xl lg:text-5xl font-bold font-headline text-foreground mt-1 mb-2">{playlist.name}</h1>
          
          {playlist.description && (
            <p className="text-lg text-muted-foreground font-body mb-3">{playlist.description}</p>
          )}
          
          <div className="flex items-center justify-center md:justify-start text-muted-foreground font-body space-x-4 mb-3 text-sm">
            {playlist.year && (
              <span className="flex items-center">
                <CalendarDays className="mr-1.5 h-4 w-4" /> {playlist.year}
              </span>
            )}
            <span className="flex items-center">
              <Music className="mr-1.5 h-4 w-4" /> {songs.length} songs
            </span>
            {playlist.language && (
              <span className="flex items-center">
                <User className="mr-1.5 h-4 w-4" /> {playlist.language}
              </span>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4">
            <PlayPlaylistButton songs={songs} />
            <Button variant="outline" className="font-headline text-base px-6 py-3">
              <Heart className="mr-2 h-5 w-5" /> Like
            </Button>
            <Button variant="outline" className="font-headline text-base px-6 py-3">
              <PlusCircle className="mr-2 h-5 w-5" /> Add to Library
            </Button>
          </div>
        </div>
      </section>

      {songs.length > 0 && (
        <section aria-labelledby="playlist-tracks">
          <h2 id="playlist-tracks" className="text-2xl font-semibold font-headline text-foreground mb-6 flex items-center">
            <ListMusic className="mr-3 h-6 w-6 text-primary" /> Tracks
          </h2>
          <Card className="shadow-lg rounded-xl">
            <CardContent className="p-0">
              <ul className="divide-y divide-border">
                {songs.map((song: any, index: number) => (
                  <SongListItem key={song.id} song={song} index={index} imageUrl={imageUrl} songs={songs} playlistId={params.playlistId} />
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

function PlayPlaylistButton({ songs }: { songs: any[] }) {
  const { playQueue } = useAudio();
  
  if (!songs || songs.length === 0) return null;

  return (
    <Button 
      onClick={() => playQueue(songs, 0)}
      className="w-full md:w-auto px-6 py-2.5 text-base font-medium"
      size="lg"
    >
      <PlayCircle className="mr-2 h-5 w-5" /> Play All Songs
    </Button>
  );
}

function SongListItem({ song, index, imageUrl, songs, playlistId }: { song: any; index: number; imageUrl: string; songs: any[]; playlistId: string }) {
  const { playQueue, currentSong, isPlaying, queue } = useAudio();
  const playAndNavigate = usePlayAndNavigate();
  const songImage = imageUrl;
  const songIsPlaceholder = songImage.includes('musicmitra-logo.svg');
  const songPrimaryArtists = Array.isArray(song.artists?.primary)
    ? song.artists.primary.map((a: any) => a.name).join(', ')
    : '';
  const isCurrentlyPlaying = currentSong?.id === song.id && isPlaying;
  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    playQueue(songs, index);
  };

  return (
    <li className="flex items-center p-3 hover:bg-secondary/30 rounded-lg transition-colors group">
      <div className="flex items-center space-x-4 flex-1 min-w-0">
        <span className="text-sm font-body text-muted-foreground w-6 text-center">{index + 1}</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hover:text-primary"
          onClick={handlePlayClick}
        >
          {isCurrentlyPlaying ? (
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : (
            <PlayCircle className="h-6 w-6" />
          )}
        </Button>
        <Image src={songImage} alt={song.name || 'Song'} width={40} height={40} className="rounded-md" unoptimized={songIsPlaceholder} />
        <div className="flex-1 min-w-0">
          <Link href={`/songs/${song.id}?playlistId=${playlistId}`} className="font-headline text-md text-foreground hover:text-primary truncate font-semibold">
            {song.name}
          </Link>
          <p className="font-body text-xs text-muted-foreground truncate">
            {songPrimaryArtists}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-3">
        {song.duration && <span className="text-xs font-mono text-muted-foreground hidden sm:inline-block"><Clock className="inline h-3 w-3 mr-1" />{song.duration}</span>}
      </div>
    </li>
  );
} 