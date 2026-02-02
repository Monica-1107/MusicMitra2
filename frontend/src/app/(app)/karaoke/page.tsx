// src/app/(app)/karaoke/page.tsx
'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import LyricsDisplay from '@/components/LyricsDisplay';
import { LyricsResponse } from '@/types';
import { generateLyrics } from '@/services/geminiService';

export default function KaraokePage() {
  const [files, setFiles] = useState<{ original: File; instrumental: File } | null>(null);
  const [lyricsData, setLyricsData] = useState<LyricsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (selectedFiles: { original: File; instrumental: File }) => {
  setFiles(selectedFiles);
  setIsLoading(true);
  setError(null);
  
  try {
    console.log('Starting lyrics generation for file:', selectedFiles.original.name);
    console.log('File size:', selectedFiles.original.size);
    console.log('File type:', selectedFiles.original.type);
    
    const lyricsResponse = await generateLyrics(selectedFiles.original);
    
    console.log('Raw API Response:', lyricsResponse); // Debug log
    
    if (!lyricsResponse || !lyricsResponse.lyrics) {
      console.error('No lyrics in response:', lyricsResponse);
      setError('No lyrics were generated. Please try with a different audio file.');
      return;
    }
    
    console.log('Number of lyric lines:', lyricsResponse.lyrics.length);
    
    const processedLyrics: LyricsResponse = {
      metadata: {
        title: lyricsResponse.metadata?.title || 'Unknown Title',
        artist: lyricsResponse.metadata?.artist || 'Unknown Artist',
        album: lyricsResponse.metadata?.album || '',
        isTelugu: lyricsResponse.metadata?.isTelugu ?? true, // Default to true since we're defaulting language to 'te'
        duration: lyricsResponse.metadata?.duration || 0,
        language: lyricsResponse.metadata?.language || 'te' // Default to Telugu
      },
      lyrics: (lyricsResponse.lyrics || []).map((line: any, index: number) => {
        console.log(`Processing line ${index}:`, line);
        return {
          telugu: line.telugu || line.text || '', // Fallback to text if telugu not available
          transliteration: line.transliteration || '',
          translation: line.translation || '',
          timestamp: line.timestamp || '00:00'
        };
      })
    };
    
    console.log('Processed Lyrics:', processedLyrics); // Debug log
    console.log('First lyric line:', processedLyrics.lyrics[0]);
    
    setLyricsData(processedLyrics);
    
  } catch (error) {
    console.error('Error processing song:', error);
    setError('Failed to process the song. Please try again.');
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Karaoke Player</h1>
        
        {!files ? (
          <FileUpload onFilesSelected={handleFilesSelected}
          isLoading={isLoading} />
        ) : (
          <LyricsDisplay 
            data={lyricsData} 
            originalFile={files.original}
            instrumentalFile={files.instrumental}
            onBack={() => {
              setFiles(null);
              setLyricsData(null);
            }}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}