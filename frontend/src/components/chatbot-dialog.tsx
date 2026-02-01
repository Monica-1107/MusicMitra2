
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { moodBasedRecommendations, MoodBasedRecommendationsOutput } from '@/ai/flows/mood-based-recommendations';
import { Bot, Loader2, Send, Music2, ThumbsUp, Mic, MicOff } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { useToast } from '@/hooks/use-toast';

export function ChatbotDialog() {
  const [mood, setMood] = useState('');
  const [recommendations, setRecommendations] = useState<MoodBasedRecommendationsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    // Clean up speech recognition on component unmount
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support speech recognition.",
        variant: "destructive",
      });
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US'; // Default language
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast({ title: "Listening...", description: "Speak your mood." });
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const speechResult = event.results[0][0].transcript;
      setMood(speechResult);
    };

    recognition.onspeechend = () => {
      recognition.stop();
      setIsListening(false);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      let errorMessage = "An error occurred during speech recognition.";
      if (event.error === 'no-speech') {
        errorMessage = "No speech was detected. Please try again.";
      } else if (event.error === 'audio-capture') {
        errorMessage = "Audio capture failed. Ensure microphone access.";
      } else if (event.error === 'not-allowed') {
        errorMessage = "Microphone access denied. Please allow microphone access in your browser settings.";
      }
      toast({
        title: "Voice Input Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsListening(false);
    };
    
    recognition.onend = () => {
        setIsListening(false);
        if (recognitionRef.current === recognition) { // Ensure it's the current instance
          recognitionRef.current = null;
        }
    };

    try {
      recognition.start();
    } catch (e) {
      toast({
        title: "Could not start listening",
        description: "Please ensure microphone permissions are granted and try again.",
        variant: "destructive",
      });
      setIsListening(false);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) return;

    setIsLoading(true);
    setRecommendations(null);
    try {
      const result = await moodBasedRecommendations({ mood });
      setRecommendations(result);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast({
        title: "Error",
        description: "Could not fetch recommendations. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          size="lg"
          className="fixed bottom-24 right-6 md:bottom-8 md:right-8 rounded-full shadow-xl p-4 h-16 w-16 font-headline"
          aria-label="Open Mood Chatbot"
        >
          <Bot className="h-8 w-8" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg bg-card rounded-xl shadow-2xl">
        <DialogHeader>
          <div className="flex items-center space-x-3 mb-2">
            <Image 
              src="https://placehold.co/80x80.png?text=Mitra" 
              alt="MusicMitra Chatbot Avatar" 
              width={50} 
              height={50} 
              className="rounded-full border-2 border-primary"
              data-ai-hint="avatar cartoon"
            />
            <div>
              <DialogTitle className="font-headline text-2xl text-primary">MusicMitra AI</DialogTitle>
              <DialogDescription className="font-body text-muted-foreground">
                How are you feeling today? Let me find some Telugu songs for your mood!
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div>
            <Label htmlFor="mood" className="font-body text-sm font-medium">Your Current Mood</Label>
            <div className="flex items-center space-x-2 mt-1">
              <Input
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="e.g., Happy, Relaxed, Energetic"
                className="font-body flex-1"
                disabled={isLoading || isListening}
              />
              <Button 
                type="button" 
                size="icon" 
                variant={isListening ? "destructive" : "outline"}
                onClick={handleToggleListening} 
                disabled={isLoading}
                aria-label={isListening ? "Stop listening" : "Start listening"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button type="submit" size="icon" disabled={isLoading || !mood.trim() || isListening} aria-label="Get recommendations">
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </Button>
            </div>
          </div>
        </form>

        {recommendations && (
          <ScrollArea className="mt-4 max-h-[300px] p-1 rounded-md border bg-background/50">
            <div className="p-4 space-y-4">
              <div>
                <h4 className="font-headline text-lg text-foreground flex items-center">
                  <ThumbsUp className="h-5 w-5 mr-2 text-primary" />
                  Here's what I found for you:
                </h4>
                <p className="font-body text-sm text-muted-foreground mt-1">{recommendations.reasoning}</p>
              </div>
              <ul className="space-y-2">
                {recommendations.songs.map((song, index) => (
                  <li key={index} className="p-3 bg-card rounded-md shadow-sm flex items-center space-x-3 hover:bg-secondary/50 transition-colors">
                    <Music2 className="h-5 w-5 text-primary" />
                    <span className="font-body text-foreground">{song}</span>
                  </li>
                ))}
              </ul>
            </div>
          </ScrollArea>
        )}
        {isLoading && !recommendations && !isListening && (
          <div className="flex flex-col items-center justify-center h-40">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
            <p className="font-body text-muted-foreground">Finding the perfect tunes for you...</p>
          </div>
        )}
        {isListening && (
             <div className="flex flex-col items-center justify-center h-40">
                <Mic className="h-10 w-10 text-primary mb-3 animate-pulse" />
                <p className="font-body text-muted-foreground">Listening...</p>
             </div>
        )}
        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={() => setIsOpen(false)} className="font-headline">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

    