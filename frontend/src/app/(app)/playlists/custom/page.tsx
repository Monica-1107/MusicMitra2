'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ListMusic, Search, Loader2, X, Music, Check, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAudio } from '@/contexts/audio-context';
import { toast } from 'sonner';
import Image from 'next/image';

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

interface Song {
  id: string;
  name: string;
  artist?: string;
  primaryArtistName?: string;
  albumName?: string;
  albumArt?: string;
  downloadUrl?: any[];
  image?: any[];
  url?: string;
  [key: string]: any;
}

type Playlist = {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  createdAt: string;
};

export default function CustomPlaylistsPage() {
  const router = useRouter();
  const { playSong, playQueue } = useAudio();
  
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingSongs, setIsAddingSongs] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<{
    songs: any[];
    albums: any[];
    artists: any[];
    playlists: any[];
  }>({ songs: [], albums: [], artists: [], playlists: [] });
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
  });
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  
  // Debounce search input
  const debouncedSearch = useDebounce(searchQuery, 500);

  // Fetch user's custom playlists
  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setIsLoading(true);
        // TODO: Replace with actual API call
        const mockPlaylists: Playlist[] = [
          {
            id: '1',
            name: 'My Favorites',
            description: 'All my favorite tracks',
            songs: [],
            createdAt: new Date().toISOString(),
          },
        ];
        setPlaylists(mockPlaylists);
      } catch (error) {
        console.error('Error fetching playlists:', error);
        toast.error('Failed to load playlists');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  // Function to search for songs using the API
  const searchSongs = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults({ songs: [], albums: [], artists: [], playlists: [] });
      return;
    }

    try {
      setIsSearching(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/search/songs?query=${encodeURIComponent(query)}&limit=50`
      );
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch search results');
      }
      
      const data = await response.json();
      
      // Filter for Telugu songs only (case-insensitive)
      const songs = (Array.isArray(data.data?.results) ? data.data.results : [])
        .filter((song: any) => {
          const language = (song.language || '').toLowerCase();
          return language.includes('telugu');
        })
        .map((song: any) => ({
          id: song.id,
          name: song.name || song.title || 'Unknown Track',
          artist: song.primaryArtists || song.artist || 'Unknown Artist',
          image: song.image || song.thumbnail,
          url: song.downloadUrl || song.media_url,
          downloadUrl: song.downloadUrl || song.media_url,
          duration: song.duration,
          language: song.language || 'Unknown'
        }));
        
      console.log('Filtered search results:', songs);
      
      setSearchResults(prev => ({
        ...prev,
        songs
      }));
    } catch (error) {
      console.error('Error searching songs:', error);
      toast.error('Failed to search songs');
    } finally {
      setIsSearching(false);
    }
  }, []);

  const handleCreatePlaylist = async () => {
    if (!newPlaylist.name.trim()) {
      toast.error('Playlist name is required');
      return;
    }

    try {
      // In a real app, this would be an API call to create a playlist
      const newPlaylistItem: Playlist = {
        id: Date.now().toString(),
        name: newPlaylist.name,
        description: newPlaylist.description,
        songs: [],
        createdAt: new Date().toISOString(),
      };

      setPlaylists(prev => [newPlaylistItem, ...prev]);
      
      toast.success('Playlist created successfully');
      
      setNewPlaylist({ name: '', description: '' });
      setIsCreating(false);
    } catch (error) {
      console.error('Error creating playlist:', error);
      toast.error('Failed to create playlist');
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this playlist? This action cannot be undone.')) {
      try {
        // In a real app, this would be an API call to delete the playlist
        setPlaylists(prev => prev.filter(playlist => playlist.id !== id));
        
        toast.success('Playlist deleted successfully');
      } catch (error) {
        console.error('Error deleting playlist:', error);
        toast.error('Failed to delete playlist');
      }
    }
  };

  // Effect to trigger search when debounced search query changes
  useEffect(() => {
    if (debouncedSearch && isAddingSongs) {
      searchSongs(debouncedSearch);
    }
  }, [debouncedSearch, isAddingSongs, searchSongs]);

  const handleAddSongs = async (playlist: Playlist) => {
    setSelectedPlaylist(playlist);
    setIsAddingSongs(true);
    setSearchQuery('');
    setSearchResults({ songs: [], albums: [], artists: [], playlists: [] });
  };

  const handleAddSelectedSongs = () => {
    if (!selectedPlaylist || selectedSongs.length === 0) return;
    
    const songsToAdd = searchResults.songs.filter(song => selectedSongs.includes(song.id));
    
    setPlaylists(prev =>
      prev.map(playlist =>
        playlist.id === selectedPlaylist.id
          ? {
              ...playlist,
              songs: [...playlist.songs, ...songsToAdd],
            }
          : playlist
      )
    );
    
    setSelectedSongs([]);
    setIsAddingSongs(false);
    setSelectedPlaylist(null);
    setSearchQuery('');
    setSearchResults({ songs: [], albums: [], artists: [], playlists: [] });
    
    toast.success(`${songsToAdd.length} song(s) added to playlist`);
  };

  const handleRemoveSong = (playlistId: string, songId: string) => {
    setPlaylists(prev =>
      prev.map(playlist =>
        playlist.id === playlistId
          ? {
              ...playlist,
              songs: playlist.songs.filter(song => song.id !== songId),
            }
          : playlist
      )
    );
    
    toast.success('Song removed from playlist');
  };

  const handleSearchSongs = (e: React.FormEvent) => {
    e.preventDefault();
    searchSongs(searchQuery);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Custom Playlists</h1>
          <p className="text-muted-foreground">Create and manage your personal playlists</p>
        </div>
        
        <Dialog open={isCreating} onOpenChange={setIsCreating}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Playlist
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Playlist</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Playlist Name</label>
                <Input
                  placeholder="My Awesome Playlist"
                  value={newPlaylist.name}
                  onChange={(e) =>
                    setNewPlaylist({ ...newPlaylist, name: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Input
                  placeholder="What's this playlist about?"
                  value={newPlaylist.description}
                  onChange={(e) =>
                    setNewPlaylist({ ...newPlaylist, description: e.target.value })
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePlaylist}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
          <ListMusic className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No playlists yet</h3>
          <p className="text-muted-foreground text-sm mb-4">
            Create your first playlist to get started
          </p>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Playlist
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {playlists.map((playlist) => (
            <Card key={playlist.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{playlist.name}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleAddSongs(playlist)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDeletePlaylist(playlist.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        if (playlist.songs.length > 0) {
                          const formattedSongs = playlist.songs.map(song => ({
                            ...song,
                            primaryArtistName: song.artist || 'Unknown Artist',
                            albumArt: song.image?.[0]?.url,
                            downloadUrl: Array.isArray(song.downloadUrl) 
                              ? song.downloadUrl 
                              : song.url 
                                ? [{ url: song.url, quality: '320kbps' }] 
                                : []
                          }));
                          playQueue(formattedSongs, 0);
                        }
                      }}
                      disabled={playlist.songs.length === 0}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Play Playlist
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                {playlist.songs.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="divide-y">
                      {playlist.songs.map((song) => (
                        <div
                          key={song.id}
                          className="flex items-center justify-between p-3 hover:bg-muted/50"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{song.name}</p>
                            {song.artist && (
                              <p className="text-sm text-muted-foreground truncate">
                                {song.artist}
                              </p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => {
                                const songToPlay = {
                                  ...song,
                                  primaryArtistName: song.artist || 'Unknown Artist',
                                  albumArt: song.image?.[0]?.url,
                                  downloadUrl: Array.isArray(song.downloadUrl) 
                                    ? song.downloadUrl 
                                    : song.url 
                                      ? [{ url: song.url, quality: '320kbps' }] 
                                      : []
                                };
                                playSong(songToPlay);
                              }}
                            >
                              <Music className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() =>
                                handleRemoveSong(playlist.id, song.id)
                              }
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center">
                    <Music className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No songs in this playlist yet
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleAddSongs(playlist)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Songs
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Songs Dialog */}
      <Dialog open={isAddingSongs} onOpenChange={setIsAddingSongs}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>
              Add Songs to {selectedPlaylist?.name || 'Playlist'}
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSearchSongs} className="flex gap-2 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search for songs..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          
          <ScrollArea className="flex-1 pr-4 -mr-4">
            {searchResults.songs.length > 0 ? (
              <div className="space-y-2">
                {searchResults.songs.map((song) => (
                  <div
                    key={song.id}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      selectedSongs.includes(song.id)
                        ? 'bg-primary/10'
                        : 'hover:bg-muted/50'
                    }`}
                    onClick={() => {
                      setSelectedSongs((prev) =>
                        prev.includes(song.id)
                          ? prev.filter((id) => id !== song.id)
                          : [...prev, song.id]
                      );
                    }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{song.name}</p>
                      {song.artist && (
                        <p className="text-sm text-muted-foreground truncate">
                          {song.artist}
                        </p>
                      )}
                    </div>
                    {selectedSongs.includes(song.id) ? (
                      <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="h-3 w-3 text-primary-foreground" />
                      </div>
                    ) : (
                      <div className="h-5 w-5 rounded-full border border-muted-foreground/30" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Search className="h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">
                  {isSearching 
                    ? 'Searching...' 
                    : searchQuery
                      ? 'No songs found. Try a different search term.'
                      : 'Search for songs to add to your playlist'}
                </p>
              </div>
            )}
          </ScrollArea>
          
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedSongs([]);
                setIsAddingSongs(false);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddSelectedSongs}
              disabled={selectedSongs.length === 0}
            >
              Add {selectedSongs.length > 0 ? `(${selectedSongs.length}) ` : ''}
              Songs
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
