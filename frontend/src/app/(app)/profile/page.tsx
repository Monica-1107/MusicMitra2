
'use client';

import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UploadCloud, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { toast } = useToast();
  const [fullName, setFullName] = useState('User Mitra');
  const [email, setEmail] = useState('user@musicmitra.com');
  const [bio, setBio] = useState('Passionate Telugu music enthusiast. Love discovering new artists and classic melodies.');
  const [avatarPreview, setAvatarPreview] = useState<string | null>('https://placehold.co/128x128.png');

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simulate API call
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved.",
    });
  };

  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">My Profile</h1>
        <p className="text-muted-foreground font-body">Manage your personal information and preferences.</p>
      </header>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="font-headline text-xl">Personal Information</CardTitle>
            <CardDescription className="font-body">Update your public profile details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-6">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-primary/50 shadow-md">
                  <AvatarImage src={avatarPreview || undefined} alt={fullName} data-ai-hint="person portrait" />
                  <AvatarFallback className="text-4xl font-headline bg-primary text-primary-foreground">
                    {getInitials(fullName)}
                  </AvatarFallback>
                </Avatar>
                <Label
                  htmlFor="avatar-upload"
                  className="absolute bottom-1 right-1 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-colors hover:bg-primary/80"
                  aria-label="Upload new profile picture"
                >
                  <UploadCloud className="h-5 w-5" />
                  <Input 
                    id="avatar-upload" 
                    type="file" 
                    className="sr-only" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                </Label>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <h2 className="text-2xl font-headline text-foreground">{fullName}</h2>
                <p className="text-muted-foreground font-body">{email}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-body">Full Name</Label>
              <Input 
                id="fullName" 
                type="text" 
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)} 
                className="font-body" 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Email Address</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="font-body" 
                disabled // Or add logic for email change verification
              />
               <p className="text-xs text-muted-foreground font-body">Email address cannot be changed here. Contact support for assistance.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="font-body">Short Bio</Label>
              <Textarea 
                id="bio" 
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                placeholder="Tell us a little about yourself..." 
                className="font-body min-h-[100px]" 
              />
            </div>
            
            <div className="flex justify-end pt-4">
              <Button type="submit" className="font-headline">
                <Save className="mr-2 h-5 w-5" /> Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
