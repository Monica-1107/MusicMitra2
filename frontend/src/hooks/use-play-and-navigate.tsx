import { useAudio } from '@/contexts/audio-context';
import { useRouter } from 'next/navigation';
import { Song } from '@/contexts/audio-context';

export function usePlayAndNavigate() {
  const { playSong } = useAudio();
  const router = useRouter();

  return (song: Song) => {
    playSong(song);
    router.push(`/songs/${song.id}`);
  };
} 