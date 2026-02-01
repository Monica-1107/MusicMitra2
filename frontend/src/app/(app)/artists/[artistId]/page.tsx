'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, Music, Disc3, PlayCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAudio } from '@/contexts/audio-context';
import { usePlayAndNavigate } from '@/hooks/use-play-and-navigate';

const PNG_PLACEHOLDER = '/musicmitra-logo.svg';

function getHighResImage(imgArr: any[] | undefined) {
  if (!Array.isArray(imgArr) || !imgArr[0]?.url) return '/musicmitra-logo.svg';
  return imgArr[0].url.replace(/(50x50|150x150|200x200|250x250)/, '500x500');
}

// FallbackImage component for robust image fallback
function FallbackImage({ src, alt, ...props }: { src: string, alt: string, [key: string]: any }) {
  const [imgSrc, setImgSrc] = useState(src);
  return (
    <Image
      {...props}
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(PNG_PLACEHOLDER)}
    />
  );
}

export default function ArtistDetailPage({ params }: { params: { artistId: string } }) {
  const [artist, setArtist] = useState<any | null>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { playSong, currentSong, isPlaying } = useAudio();
  const [playingAll, setPlayingAll] = useState(false);
  const playAndNavigate = usePlayAndNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError('');
      try {
        // Artist details
        const artistRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artists/${params.artistId}`);
        const artistData = await artistRes.json();
        if (!artistData.success || !artistData.data) throw new Error('Artist not found');
        setArtist(artistData.data);

        // Artist's songs (filter for Telugu only)
        const songsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artists/${params.artistId}/songs`);
        const songsData = await songsRes.json();
        const teluguSongs = Array.isArray(songsData.data?.songs) ? songsData.data.songs.filter(
          (song: any) => song.language && song.language.toLowerCase() === 'telugu'
        ) : [];
        setSongs(teluguSongs);

        // Artist's albums (filter for Telugu only)
        const albumsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/artists/${params.artistId}/albums`);
        const albumsData = await albumsRes.json();
        const teluguAlbums = Array.isArray(albumsData.data?.albums) ? albumsData.data.albums.filter(
          (album: any) => album.language && album.language.toLowerCase() === 'telugu'
        ) : [];
        setAlbums(teluguAlbums);
      } catch (err: any) {
        setError(err.message || 'Unknown error');
        setArtist(null);
        setSongs([]);
        setAlbums([]);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.artistId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !artist) return (
    <div className="p-8 text-center text-red-600">
      <h1>Artist not found</h1>
      <p>{error || `No artist found for ID: ${params.artistId}`}</p>
    </div>
  );

  let imageUrl = getHighResImage(artist.image);
  if (!imageUrl || imageUrl.includes('musicmitra-logo.svg')) imageUrl = PNG_PLACEHOLDER;
  const isPlaceholder = imageUrl.includes('musicmitra-logo.svg');

  // Helper to check if a song is currently playing
  function isSongPlaying(song: any) {
    if (!currentSong || !isPlaying) return false;
    if (currentSong.id === song.id) return true;
    if (currentSong.name === song.name && currentSong.album?.name === song.album?.name) return true;
    return false;
  }

  // Play all top songs (starts with the first song)
  const handlePlayAll = () => {
    if (songs.length > 0) {
      setPlayingAll(true);
      playSong(songs[0]);
      setTimeout(() => setPlayingAll(false), 1000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-4">
      <div className="flex flex-col items-center mb-6">
        <FallbackImage
          src={imageUrl}
          alt={artist.name || 'Artist'}
          width={200}
          height={200}
          className="rounded-full mb-4"
          unoptimized={isPlaceholder}
        />
        <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
        <div className="text-md text-gray-500 mb-2">{artist.type || ''}</div>
        <div className="text-sm text-gray-400 mb-2 text-center">{artist.description || ''}</div>
      </div>
      {songs.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold">Top Songs</h2>
            <Button onClick={handlePlayAll} className="flex items-center gap-2 font-headline">
              {playingAll ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <PlayCircle className="h-5 w-5" />
              )}
              Play All
            </Button>
          </div>
          <ul className="space-y-2">
            {songs.slice(0, 10).map((song: any) => {
              let songImage = getHighResImage(song.image);
              if (!songImage || songImage.includes('musicmitra-logo.svg')) songImage = PNG_PLACEHOLDER;
              const songIsPlaceholder = songImage.includes('musicmitra-logo.svg');
              const albumName = song.album?.name || song.album || '';
              const playing = isSongPlaying(song);
              return (
                <li key={song.id} className="border rounded p-2 flex flex-col sm:flex-row sm:items-center gap-2 group relative">
                  <Link href={`/songs/${song.id}`} className="flex items-center gap-2 flex-1 min-w-0">
                    <FallbackImage
                      src={songImage}
                      alt={song.name || 'Song'}
                      width={40}
                      height={40}
                      className="rounded"
                      unoptimized={songIsPlaceholder}
                    />
                    <span className="font-semibold truncate">{song.name}</span>
                  </Link>
                  {song.album?.id ? (
                    <Link href={`/albums/${song.album.id}`} className="text-xs text-blue-600 hover:underline truncate">{albumName}</Link>
                  ) : (
                    <span className="text-xs text-gray-500 truncate">{albumName}</span>
                  )}
                  <span className="text-xs text-gray-400">{song.language || ''}</span>
                  <button
                    onClick={() => playAndNavigate(song)}
                    className="ml-2 h-9 w-9 flex items-center justify-center rounded-full bg-primary/80 hover:bg-primary text-white shadow-lg"
                  >
                    {playing ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <PlayCircle className="h-5 w-5" />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {albums.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-2">Top Albums</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {albums.slice(0, 9).map((album: any, idx: number) => {
              let albumImage = getHighResImage(album.image);
              if (!albumImage || albumImage.includes('musicmitra-logo.svg')) albumImage = PNG_PLACEHOLDER;
              const albumIsPlaceholder = albumImage.includes('musicmitra-logo.svg');
              return (
                <div key={album.id || idx} className="border rounded p-2 bg-white shadow flex flex-col items-center hover:shadow-lg transition-shadow relative group">
                  <Link href={`/albums/${album.id}`} className="w-full flex flex-col items-center">
                    <FallbackImage
                      src={albumImage}
                      alt={album.name || 'Album'}
                      width={120}
                      height={120}
                      className="w-full h-auto aspect-square object-cover mb-2 rounded"
                      unoptimized={albumIsPlaceholder}
                    />
                    <div className="font-semibold truncate w-full text-center">{album.name}</div>
                    <div className="text-xs text-gray-500 truncate w-full text-center">{album.year || ''}</div>
                    <div className="text-xs text-gray-400 w-full text-center">{album.language || ''}</div>
                  </Link>
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // Fetch album details to get the first song
                      try {
                        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/albums?id=${album.id}`);
                        if (res.ok) {
                          const data = await res.json();
                          if (data.success && data.data?.songs && Array.isArray(data.data.songs) && data.data.songs.length > 0) {
                            playSong(data.data.songs[0]);
                          }
                        }
                      } catch (error) {
                        // Optionally show error
                      }
                    }}
                    className="absolute top-2 right-2 h-9 w-9 flex items-center justify-center rounded-full bg-primary/80 hover:bg-primary text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <PlayCircle className="h-5 w-5" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
