import React, { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { LyricsResponse } from '../types';
import { Play, Pause, Mic, Mic2, Volume2, Music2, VolumeX, Save, Loader2, Sparkles, BookOpen } from 'lucide-react';

interface LyricLine {
  telugu: string;
  transliteration: string;
  translation: string;
  timestamp: string;
  seconds?: number;
}

interface SongMetadata {
  title: string;
  artist: string;
  [key: string]: any;
}

interface LyricsDisplayProps {
  data: LyricsResponse | null;
  originalFile: File | null;
  instrumentalFile: File | null;
  onBack?: () => void;
  isLoading?: boolean;
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({ 
  data, 
  originalFile, 
  instrumentalFile,
  onBack,
  isLoading = false
}) => {
  console.log('LyricsDisplay received data:', data);
  console.log('LyricsDisplay received originalFile:', originalFile);
  console.log('LyricsDisplay received instrumentalFile:', instrumentalFile);
  
  // Destructure with fallbacks
  const { metadata = { title: 'Unknown', artist: 'Unknown' }, lyrics = [] } = data || {};
  
  console.log('Destructured metadata:', metadata);
  console.log('Destructured lyrics count:', lyrics.length);
  console.log('First lyric line:', lyrics[0]);

  // State declarations
  const [isLoadingState, setIsLoadingState] = useState<boolean>(isLoading);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [originalAudioUrl, setOriginalAudioUrl] = useState<string | null>(null);
  const [instrumentalUrl, setInstrumentalUrl] = useState<string | null>(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState<string | null>(null);
  const [isAudioReady, setIsAudioReady] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'original' | 'instrumental'>('original');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showSuccess, setShowSuccess] = useState<boolean>(false);

  // Refs
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const destinationNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const activeLineRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);

  // Initialize audio context and URLs
  useEffect(() => {
    console.log('Initializing audio...');
    
    // Initialize audio context
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        console.log('Creating new AudioContext');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        console.log('AudioContext created:', audioContextRef.current.state);
      } catch (error) {
        console.error('Failed to create AudioContext:', error);
      }
    }

    // Create object URLs for audio files
    let originalUrl: string | null = null;
    let instrumentalUrlValue: string | null = null;

    if (originalFile) {
      console.log('Creating URL for original file');
      originalUrl = URL.createObjectURL(originalFile);
      console.log('Original file URL created');
      setOriginalAudioUrl(originalUrl);
    }
    
    if (instrumentalFile) {
      console.log('Creating URL for instrumental file');
      instrumentalUrlValue = URL.createObjectURL(instrumentalFile);
      console.log('Instrumental file URL created');
      setInstrumentalUrl(instrumentalUrlValue);
    }
    
    // Set initial active URL based on view mode and available files
    if (viewMode === 'original' && originalFile) {
      console.log('Setting active URL to original');
      setActiveAudioUrl(originalUrl);
    } else if (instrumentalFile) {
      console.log('Setting active URL to instrumental');
      setActiveAudioUrl(instrumentalUrlValue);
    } else if (originalFile) {
      // Fallback to original if instrumental is not available
      console.log('Falling back to original audio');
      setActiveAudioUrl(originalUrl);
    }
    
    console.log('Audio initialization complete');
    setIsLoadingState(false);
    
    // Cleanup function
    return () => {
      console.log('Cleaning up audio URLs');
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (instrumentalUrlValue) URL.revokeObjectURL(instrumentalUrlValue);
    };
  }, [originalFile, instrumentalFile, viewMode]);

  // Handle audio source and events
  useEffect(() => {
    console.log('Setting up audio source and events');
    const audio = audioRef.current;
    
    if (!audio) {
      console.error('Audio element not found');
      return;
    }
    
    if (!activeAudioUrl) {
      console.error('No active audio URL');
      return;
    }
    
    console.log('Active audio URL:', activeAudioUrl);
    console.log('Audio element state:', {
      readyState: audio.readyState,
      paused: audio.paused,
      currentSrc: audio.currentSrc,
      error: audio.error
    });
    
    let isMounted = true;
    
    const handleCanPlay = () => {
      if (isMounted) {
        console.log('Audio can play');
        console.log('Audio element duration:', audio.duration);
        setIsAudioReady(true);
        setDuration(audio.duration);
        
        // Try to play if in karaoke mode
        if (viewMode === 'instrumental' && !isPlaying) {
          console.log('Attempting to auto-play instrumental track');
          audio.play()
            .then(() => {
              console.log('Autoplay succeeded');
              setIsPlaying(true);
            })
            .catch(error => {
              console.error('Autoplay failed:', error);
              // Show user-friendly message
              if (error.name === 'NotAllowedError') {
                alert('Please click the play button to start playback');
              }
            });
        }
      }
    };

    const handleTimeUpdate = () => {
      if (isMounted) {
        setCurrentTime(audio.currentTime);
      }
    };

    const handleEnded = () => {
      if (isMounted) {
        setIsPlaying(false);
        setCurrentTime(0);
        if (isRecording) {
          handleStopRecording();
        }
      }
    };

    audio.src = activeAudioUrl;
    audio.load();
    
    // For autoplay to work, we need to wait for user interaction
    const handleFirstInteraction = async () => {
      try {
        await audio.play();
        audio.pause();
        audio.currentTime = 0;
      } catch (error) {
        console.log('Audio preload interaction:', error);
      }
      document.removeEventListener('click', handleFirstInteraction);
    };
    
    document.addEventListener('click', handleFirstInteraction);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      isMounted = false;
      document.removeEventListener('click', handleFirstInteraction);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [activeAudioUrl, isRecording]);

  // Handle play/pause
  const handlePlayPause = useCallback(async () => {
    console.log('Play/pause clicked');
    const audio = audioRef.current;
    if (!audio) {
      console.error('Audio element not found');
      return;
    }

    try {
      console.log('Current audio state:', {
        paused: audio.paused,
        readyState: audio.readyState,
        currentTime: audio.currentTime,
        duration: audio.duration,
        error: audio.error
      });

      if (isPlaying) {
        console.log('Pausing audio');
        await audio.pause();
        setIsPlaying(false);
      } else {
        console.log('Attempting to play audio');
        // Ensure audio context is in resumed state
        if (audioContextRef.current?.state === 'suspended') {
          console.log('Resuming audio context');
          await audioContextRef.current.resume();
        }
        
        // If at the end, restart from beginning
        if (audio.currentTime >= audio.duration - 0.5) {
          audio.currentTime = 0;
        }
        
        await audio.play();
        console.log('Playback started successfully');
        setIsPlaying(true);
      }
    } catch (error) {
      console.error('Error during playback:', error);
      if ((error as Error).name === 'NotAllowedError') {
        alert('Please click anywhere on the page first, then try playing again');
      } else {
        alert('Failed to play audio: ' + (error as Error).message);
      }
    }
  }, [isPlaying]);

  // Switch between original and instrumental modes
  const switchMode = useCallback((mode: 'original' | 'instrumental') => {
    const wasPlaying = isPlaying;
    const currentTime = audioRef.current ? audioRef.current.currentTime : 0;
    
    // Update the active URL based on the mode
    if (mode === 'original') {
      setActiveAudioUrl(originalAudioUrl);
    } else if (mode === 'instrumental') {
      setActiveAudioUrl(instrumentalUrl);
    }
    
    setViewMode(mode);

    // Maintain playback state smoothly
    if (audioRef.current) {
      // We need a tiny delay because changing src resets the audio element
      setTimeout(() => { 
        if (audioRef.current) {
          audioRef.current.currentTime = currentTime;
          if (wasPlaying) {
            audioRef.current.play().catch(error => {
              console.error('Error resuming playback:', error);
            });
          }
        }
      }, 50);
    }
  }, [isPlaying, originalAudioUrl, instrumentalUrl]);

  // Toggle recording state - defined at the top level
  const toggleRecording = useCallback(async () => {
    if (!isRecording) {
      try {
        // Ensure audio context is ready
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        const devices = await navigator.mediaDevices.enumerateDevices();
console.log('Available media devices:', devices);

// Optional: log only microphones
const mics = devices.filter(d => d.kind === 'audioinput');
console.log('Audio input devices:', mics);

if (mics.length === 0) {
  alert('No microphone detected. Please connect a microphone and try again.');
  return;
}
        // Get microphone stream
        const micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        recordingStreamRef.current = micStream;

        // Create a destination node for mixed audio
        const destination = audioContextRef.current.createMediaStreamDestination();
        destinationNodeRef.current = destination;

        // Create source node for the instrumental music
        if (audioRef.current && !sourceNodeRef.current) {
          sourceNodeRef.current = audioContextRef.current.createMediaElementSource(audioRef.current);
        }

        // Create source node for the microphone
        const micSource = audioContextRef.current.createMediaStreamSource(micStream);
        mediaStreamSourceRef.current = micSource;

        // Connect both sources to the destination
        if (sourceNodeRef.current) {
          sourceNodeRef.current.connect(audioContextRef.current.destination);
          sourceNodeRef.current.connect(destination);
        }
        micSource.connect(destination);

        // Create media recorder with the mixed stream
        const recorder = new MediaRecorder(destination.stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setRecordedBlob(blob);

          // Clean up audio nodes
          if (mediaStreamSourceRef.current) {
            mediaStreamSourceRef.current.disconnect();
            mediaStreamSourceRef.current = null;
          }

          if (destinationNodeRef.current) {
            destinationNodeRef.current.disconnect();
            destinationNodeRef.current = null;
          }
        };

        // Start recording
        recorder.start(100);
        mediaRecorderRef.current = recorder;

        // Start playback if not already playing
        if (audioRef.current && audioRef.current.paused) {
          audioRef.current.play();
          setIsPlaying(true);
        }

        // Ensure we're in instrumental mode
        if (viewMode !== 'instrumental') {
          switchMode('instrumental');
        }

        setIsRecording(true);

      } catch (error) {
        console.error('Error starting recording:', error);
        alert('Could not start recording. Please check your microphone permissions.');

        // Clean up on error
        if (recordingStreamRef.current) {
          recordingStreamRef.current.getTracks().forEach(track => track.stop());
          recordingStreamRef.current = null;
        }

        if (mediaRecorderRef.current) {
          if (mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
          }
          mediaRecorderRef.current = null;
        }
      }
    } else {
      // Stop recording
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }

      // Stop microphone tracks
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach(track => track.stop());
        recordingStreamRef.current = null;
      }

      setIsRecording(false);
    }
  }, [isRecording, viewMode, originalAudioUrl, instrumentalUrl, switchMode]);

  // --- Timestamp Logic ---
  const parseTimestamp = (timeStr: string): number => {
    if (!timeStr) return 0;
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseFloat(parts[1]);
    } else if (parts.length === 3) {
      // Handle MM:SS:ms format if needed
      return (parseInt(parts[0]) * 60) + parseInt(parts[1]) + (parseFloat(parts[2]) / 1000);
    }
    return 0;
  };

  const lyricsWithSeconds = useMemo<LyricLine[]>(() => {
    return (lyrics as LyricLine[]).map((line: LyricLine) => ({
      ...line,
      seconds: parseTimestamp(line.timestamp)
    }));
  }, [lyrics]);

  const activeIndex = useMemo<number>(() => {
    let index = -1;
    for (let i = 0; i < lyricsWithSeconds.length; i++) {
      const lineSeconds = lyricsWithSeconds[i].seconds || 0;
      if (currentTime >= lineSeconds) {
        index = i;
      } else {
        break;
      }
    }
    return index;
  }, [currentTime, lyricsWithSeconds]);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeIndex]);

  const handleStartKaraoke = async () => {
    try {
      console.log('Starting karaoke...');
      
      // Ensure we have an audio URL
      if (!instrumentalUrl && !originalAudioUrl) {
        console.error('No audio files available');
        alert('No audio files available for playback');
        return;
      }

      // Ensure audio context is in resumed state
      if (audioContextRef.current?.state === 'suspended') {
        await audioContextRef.current.resume();
      }
      
      // Switch to instrumental mode if available, otherwise use original
      if (instrumentalUrl) {
        console.log('Switching to instrumental track');
        setViewMode('instrumental');
        setActiveAudioUrl(instrumentalUrl);
      } else if (originalAudioUrl) {
        console.log('Using original track (no instrumental available)');
        setViewMode('original');
        setActiveAudioUrl(originalAudioUrl);
      }
      
      // Small delay to ensure state updates before playing
      await new Promise(resolve => setTimeout(resolve, 200));
      
      if (audioRef.current) {
        console.log('Playing audio...');
        audioRef.current.currentTime = 0;
        
        try {
          const playPromise = audioRef.current.play();
          
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log('Playback started successfully');
                setIsPlaying(true);
              })
              .catch(error => {
                console.error('Playback failed:', error);
                // Show a more helpful error message
                if (error.name === 'NotAllowedError') {
                  alert('Please click anywhere on the page first to enable audio playback');
                } else {
                  alert('Could not start playback: ' + error.message);
                }
              });
          }
        } catch (error) {
          console.error('Error during playback:', error);
          alert('Error: ' + (error as Error).message);
        }
      }
    } catch (error) {
      console.error('Error starting karaoke:', error);
      alert('Failed to start karaoke: ' + (error as Error).message);
    }
  };

  const handleStopKaraoke = () => {
    if (isRecording) {
      handleStopRecording();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (recordingStreamRef.current) {
      recordingStreamRef.current.getTracks().forEach(track => track.stop());
      recordingStreamRef.current = null;
    }
    setIsRecording(false);
    setIsProcessing(true);

    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
    }, 2000);
  };

  const handleDownloadRecording = () => {
    if (!recordedBlob || !metadata) return;
    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recording-${metadata.title?.replace(/\s+/g, '-').toLowerCase() || 'karaoke'}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoadingState) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!originalFile && !instrumentalFile) {
    return (
      <div className="p-4 text-center">
        <p className="text-red-500 mb-4">No audio files provided.</p>
        {onBack && (
          <button 
            onClick={onBack}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Go Back and Upload Files
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto pb-24">
      <audio
        ref={audioRef}
        src={activeAudioUrl || ''}
        onTimeUpdate={() => audioRef.current && setCurrentTime(audioRef.current.currentTime)}
        onLoadedMetadata={() => audioRef.current && setDuration(audioRef.current.duration)}
        onEnded={() => {
          setIsPlaying(false);
          if (isRecording) {
            handleStopRecording();
          }
        }}
      />

      {/* Main Controls */}
      <div className="bg-slate-900/90 backdrop-blur-md border border-slate-700 rounded-3xl p-6 mb-8 shadow-2xl sticky top-20 z-30">
        {onBack && (
          <button 
            onClick={onBack}
            className="mb-4 flex items-center text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Upload
          </button>
        )}
        
        {/* Song Info */}
        <div className="flex flex-col items-center text-center mb-6">
          <h2 className="text-2xl font-bold text-white tracking-tight">{metadata.title}</h2>
          <p className="text-slate-400 font-medium">{metadata.artist}</p>
        </div>

        {/* Main Controls Row */}
        <div className="flex flex-col items-center gap-4">
          {/* Playback Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayPause}
              disabled={!isAudioReady}
              className={`p-3 rounded-full ${
                isPlaying ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
              } text-white transition-colors disabled:opacity-50`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </button>

            <button
              onClick={handleStartKaraoke}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-600 hover:from-orange-600 hover:to-pink-700 text-white font-bold rounded-full flex items-center gap-2 shadow-lg hover:shadow-orange-500/30 transition-all"
            >
              <Music2 size={20} />
              Start Karaoke
            </button>
          </div>

          {/* Recording Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleRecording}
              disabled={!isAudioReady}
              className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${
                isRecording
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <Mic2 size={20} />
              {isRecording ? 'Stop Recording' : 'Record Karaoke'}
            </button>

            {recordedBlob && (
              <button
                onClick={handleDownloadRecording}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-full hover:bg-green-700 font-bold"
              >
                <Save size={20} />
                Save Recording
              </button>
            )}
          </div>
        </div>

        {/* Status Message */}
        {!isPlaying && !isRecording && (
          <p className="text-slate-400 text-sm text-center mt-4">
            Click the play button to start listening, or Start Karaoke to begin recording
          </p>
        )}

        {/* Progress Bar */}
        <div className="flex items-center gap-4 mt-6">
          <span className="text-xs font-mono text-slate-400 w-12 text-right">
            {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60).toString().padStart(2, '0')}
          </span>
          <div className="relative flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-primary to-orange-500 rounded-full"
              style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
            />
            <input
              type="range"
              min="0"
              max={duration || 100}
              step="0.01"
              value={currentTime}
              onChange={(e) => {
                const newTime = parseFloat(e.target.value);
                setCurrentTime(newTime);
                if (audioRef.current) {
                  audioRef.current.currentTime = newTime;
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-xs font-mono text-slate-400 w-12">
            {Math.floor(duration / 60)}:{Math.floor(duration % 60).toString().padStart(2, '0')}
          </span>
        </div>
      </div>

      {/* Lyrics Display */}
      <div ref={lyricsContainerRef} className="space-y-6 relative px-4">
        {lyricsWithSeconds.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">No lyrics available. Please upload an audio file to generate lyrics.</p>
          </div>
        ) : (
          lyricsWithSeconds.map((line, index) => {
            const isActive = index === activeIndex;
            return (
              <div 
                key={index}
                ref={isActive ? activeLineRef : null}
                onClick={() => {
                  if(audioRef.current) {
                    audioRef.current.currentTime = line.seconds || 0;
                    if(!isPlaying) {
                      audioRef.current.play().catch(error => {
                        console.error('Error playing audio:', error);
                      });
                      setIsPlaying(true);
                    }
                  }
                }}
                className={`group relative p-6 rounded-2xl transition-all duration-500 cursor-pointer border
                  ${isActive 
                    ? 'bg-slate-800/80 border-primary/50 shadow-[0_0_30px_-5px_rgba(255,87,34,0.3)] scale-[1.02] z-10' 
                    : 'bg-transparent border-transparent hover:bg-slate-900/50 hover:border-slate-800 opacity-60 hover:opacity-100'
                  }
                `}
              >
                <div className={`absolute left-4 top-6 text-xs font-mono ${isActive ? 'text-primary' : 'text-slate-600'}`}>
                  {line.timestamp}
                </div>
                <div className="pl-12">
                  <h3 className={`font-telugu text-2xl md:text-3xl leading-relaxed mb-3 transition-colors ${isActive ? 'text-white font-medium' : 'text-slate-300'}`}>
                    {line.telugu}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <div className="flex items-start gap-2">
                      <Mic size={14} className={`mt-1 ${isActive ? 'text-primary/70' : 'text-slate-600'}`} />
                      <p className={`text-lg italic ${isActive ? 'text-slate-300' : 'text-slate-500'}`}>
                        {line.transliteration}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <BookOpen size={14} className={`mt-1 ${isActive ? 'text-blue-400/70' : 'text-slate-600'}`} />
                      <p className={`text-sm md:text-base ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                        {line.translation}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    
    </div>
  );
};

export default LyricsDisplay;