"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { PlayCircle, Star, Users, Music, ListMusic, ArrowRight } from "lucide-react";
import { ChatbotDialog } from "@/components/chatbot-dialog";
import { useAudio } from "@/contexts/audio-context";
import { usePlayAndNavigate } from '@/hooks/use-play-and-navigate';

function getHighResImage(imgArr: any[] | undefined) {
  if (!Array.isArray(imgArr) || !imgArr[0]?.url) return "https://placehold.co/200x200?text=No+Image";
  return imgArr[0].url.replace(/(50x50|150x150|200x200|250x250)/, "500x500");
}

export default function DashboardPage() {
  const [trendingSongs, setTrendingSongs] = useState<any[]>([]);
  const [newReleases, setNewReleases] = useState<any[]>([]);
  const [topArtists, setTopArtists] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError("");
      try {
        const [songsRes, albumsRes, artistsRes, playlistsRes] = await Promise.all([
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/songs?query=a&limit=50`),
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/albums?query=a&limit=50`),
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/artists?query=a&limit=20`),
  fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/search/playlists?query=a&limit=50`),
]);

        // Process songs
        if (songsRes.ok) {
          const songsData = await songsRes.json();
          let songs = Array.isArray(songsData.data?.results) ? songsData.data.results : [];
          const today = new Date().getTime();

songs = songs
  .filter((song: any) => song.language?.toLowerCase() === "telugu")
  .filter((song: any) => {
    if (song.releaseDate) return new Date(song.releaseDate).getTime() <= today;
    if (song.year) return Number(song.year) <= new Date().getFullYear();
    return false;
  })
  .sort((a: any, b: any) => {
    const aTime = a.releaseDate ? new Date(a.releaseDate).getTime() : a.year ? new Date(`${a.year}-01-01`).getTime() : 0;
    const bTime = b.releaseDate ? new Date(b.releaseDate).getTime() : b.year ? new Date(`${b.year}-01-01`).getTime() : 0;
    return bTime - aTime;
  });

setTrendingSongs(songs.slice(0, 10));

        }

        // Process albums
        if (albumsRes.ok) {
          const albumsData = await albumsRes.json();
          let albums = Array.isArray(albumsData.data?.results) ? albumsData.data.results : [];
          albums = albums.filter((album: any) => album.language && album.language.toLowerCase() === 'telugu');
          albums.sort((a: any, b: any) => (parseInt(b.year) || 0) - (parseInt(a.year) || 0));
          setNewReleases(albums.slice(0, 10));
        }

        // Process playlists
        if (playlistsRes.ok) {
          const playlistsData = await playlistsRes.json();
          let playlists = Array.isArray(playlistsData.data?.results) ? playlistsData.data.results : [];
          playlists = playlists.filter((playlist: any) => playlist.language && playlist.language.toLowerCase() === 'telugu');
          setPlaylists(playlists.slice(0, 5));
        }
        
        // Process artists (this depends on the initial artist list, so it's a second step)
        if (artistsRes.ok) {
          const artistsData = await artistsRes.json();
          let artists = Array.isArray(artistsData.data?.results) ? artistsData.data.results : [];
          
          const artistPromises = artists.map(async (artist: any) => {
            try {
              const songsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artists/${artist.id}/songs`);
              if (songsRes.ok) {
                const songsData = await songsRes.json();
                const songs = Array.isArray(songsData.data?.songs) ? songsData.data.songs : [];
                if (songs.some((song: any) => song.language?.toLowerCase() === 'telugu')) {
                  return artist;
                }
              }
            } catch {}
            return null;
          });
          
          const teluguArtists = (await Promise.all(artistPromises)).filter(Boolean);
          setTopArtists(teluguArtists.slice(0, 10));
        }

      } catch (err: any) {
        setError("Failed to load dashboard data.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading Telugu music...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 text-lg">{error}</p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center gap-4">
        <Music className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">Welcome to MusicMitra</h1>
          <p className="text-muted-foreground font-body">Discover the best Telugu music</p>
        </div>
      </header>

      {/* Trending Songs */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-headline">Trending Telugu Songs</h2>
          <Link href="/songs">
            <Button variant="ghost" className="font-headline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {trendingSongs.map((song, idx) => (
              <SongCard key={song.id || idx} song={song} songs={trendingSongs} index={idx} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* New Releases */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-headline">Latest Telugu Albums</h2>
          <Link href="/albums">
            <Button variant="ghost" className="font-headline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {newReleases.map((album, idx) => (
              <AlbumCard key={album.id || idx} album={album} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Top Artists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-headline">Popular Telugu Artists</h2>
          <Link href="/artists">
            <Button variant="ghost" className="font-headline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <ScrollArea>
          <div className="flex space-x-4 pb-4">
            {topArtists.map((artist, idx) => (
              <ArtistCard key={artist.id || idx} artist={artist} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Featured Playlists */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold font-headline">Featured Telugu Playlists</h2>
          <Link href="/playlists">
            <Button variant="ghost" className="font-headline">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playlists.map((playlist, idx) => (
            <PlaylistCard key={playlist.id || idx} playlist={playlist} />
          ))}
        </div>
      </section>

      <ChatbotDialog />
    </div>
  );
}

function SongCard({ song, songs, index }: { song: any; songs: any[]; index: number }) {
  const { playSong, currentSong, isPlaying } = useAudio();
  const playAndNavigate = usePlayAndNavigate();
  const [playing, setPlaying] = useState(false);

  const imageUrl = getHighResImage(song.image) || '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('musicmitra-logo.svg');

  // Check if this song is currently playing
  const isCurrentlyPlaying = currentSong?.id === song?.id && isPlaying;

  const handlePlayClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPlaying(true);
    try {
      // Fetch the full song details
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/songs/${song.id}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          playAndNavigate(data.data[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching song details:', error);
    } finally {
      setPlaying(false);
    }
  };

  return (
    <Card className="w-48 flex-shrink-0 group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={song.title || song.name || 'Song cover'}
            width={160}
            height={160}
            className="w-full h-40 object-cover rounded-md mb-3"
            unoptimized={isPlaceholder}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-md">
            <button
              onClick={handlePlayClick}
              className="h-12 w-12 text-white hover:scale-110 transition-transform duration-200"
              disabled={playing}
            >
              {playing ? (
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-white border-t-transparent"></div>
              ) : (
                <PlayCircle className="h-12 w-12" />
              )}
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold truncate text-sm">{song.title || song.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{song.artist || song.primaryArtists}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AlbumCard({ album }: { album: any }) {
  const { playSong } = useAudio();
  const playAndNavigate = usePlayAndNavigate();
  
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
          playAndNavigate(data.data.songs[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching album details for playback:', error);
    }
  };

  return (
    <Card className="w-48 flex-shrink-0 group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={album.title || album.name || 'Album cover'}
            width={160}
            height={160}
            className="w-full h-40 object-cover rounded-md mb-3"
            unoptimized={isPlaceholder}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-md">
            <button
              onClick={handlePlayClick}
              className="h-12 w-12 text-white hover:scale-110 transition-transform duration-200"
            >
              <PlayCircle className="h-12 w-12" />
            </button>
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold truncate text-sm">{album.title || album.name}</h3>
          <p className="text-xs text-muted-foreground truncate">{album.artist || album.music}</p>
          {album.year && <p className="text-xs text-muted-foreground">{album.year}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

function ArtistCard({ artist }: { artist: any }) {
  const imageUrl = getHighResImage(artist.image) || '/musicmitra-logo.svg';
  const isPlaceholder = imageUrl.includes('musicmitra-logo.svg');

  return (
    <Link href={`/artists/${artist.id}`} className="w-48 flex-shrink-0 group hover:shadow-lg transition-shadow block">
      <div className="p-4">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={artist.title || artist.name || 'Artist'}
            width={160}
            height={160}
            className="w-full h-40 object-cover rounded-full mb-3"
            unoptimized={isPlaceholder}
          />
        </div>
        <div className="space-y-1 text-center">
          <h3 className="font-semibold truncate text-sm">{artist.title || artist.name}</h3>
        </div>
      </div>
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
    <Card className="group hover:shadow-lg transition-shadow overflow-hidden">
      <CardContent className="p-0">
        <div className="relative">
          <Image
            src={imageUrl}
            alt={playlist.title || playlist.name || 'Playlist cover'}
            width={300}
            height={300}
            className="w-full h-64 object-cover"
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
        </div>
        <div className="p-4 space-y-2">
          <h3 className="font-semibold text-lg truncate">{playlist.title || playlist.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2">{playlist.description}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <ListMusic className="h-4 w-4" />
            <span>{playlist.songCount || 'Unknown'} songs</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
