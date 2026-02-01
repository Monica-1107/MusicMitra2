
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Palette, Bell, UserCog, Lock, Trash2, Languages, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from 'next-themes';

export default function SettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  // Ensure component is mounted before using theme from useTheme to avoid hydration mismatch
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);


  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

  const handleSaveChanges = (section: string) => {
    toast({
      title: `${section} Settings Saved`,
      description: `Your ${section.toLowerCase()} preferences have been updated.`,
    });
  };
  
  const handleDeleteAccount = () => {
    toast({
      title: "Account Deletion Requested",
      description: "Your account deletion process has been initiated. This is a simulated action.",
      variant: "destructive",
    });
  };

  if (!mounted) {
    // Or a loading spinner, or null to render nothing until mounted
    return null; 
  }

  return (
    <div className="space-y-8 max-w-3xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold font-headline text-foreground">Application Settings</h1>
        <p className="text-muted-foreground font-body">Customize your MusicMitra experience.</p>
      </header>

      {/* Appearance Settings */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Palette className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl">Appearance</CardTitle>
              <CardDescription className="font-body">Customize the look and feel of the app.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="font-body">Theme</Label>
            <RadioGroup 
              value={theme} 
              onValueChange={setTheme} 
              className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="font-body">Light</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="font-body">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="system" id="theme-system" />
                <Label htmlFor="theme-system" className="font-body">System Default</Label>
              </div>
            </RadioGroup>
          </div>
          {/* Save button for appearance might not be needed if theme changes apply instantly */}
          {/* 
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleSaveChanges("Appearance")} className="font-headline">Save Appearance</Button>
          </div>
          */}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl">Notifications</CardTitle>
              <CardDescription className="font-body">Manage how you receive notifications.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-secondary/10">
            <Label htmlFor="email-notifications" className="font-body flex-1 cursor-pointer">Email Notifications</Label>
            <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
          </div>
          <div className="flex items-center justify-between space-x-2 p-2 rounded-md hover:bg-secondary/10">
            <Label htmlFor="push-notifications" className="font-body flex-1 cursor-pointer">Push Notifications (Mobile App)</Label>
            <Switch id="push-notifications" checked={pushNotifications} onCheckedChange={setPushNotifications} disabled />
             <p className="text-xs text-muted-foreground font-body basis-full text-right pt-1">Push notifications are currently unavailable.</p>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleSaveChanges("Notification")} className="font-headline">Save Notifications</Button>
          </div>
        </CardContent>
      </Card>

      {/* Language & Region Settings */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Languages className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl">Language & Region</CardTitle>
              <CardDescription className="font-body">Set your preferred language and regional settings.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language" className="font-body">Display Language</Label>
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger id="language" className="w-full sm:w-[200px] font-body">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en" className="font-body">English (US)</SelectItem>
                <SelectItem value="te" className="font-body">తెలుగు (Telugu)</SelectItem>
                <SelectItem value="hi" className="font-body" disabled>हिन्दी (Hindi) - Coming Soon</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="space-y-2">
            <Label htmlFor="timezone" className="font-body">Timezone</Label>
            <Input id="timezone" value="Asia/Kolkata (IST) - Auto-detected" className="font-body" disabled />
             <p className="text-xs text-muted-foreground font-body">Timezone is automatically detected.</p>
          </div>
          <div className="flex justify-end pt-2">
            <Button onClick={() => handleSaveChanges("Language & Region")} className="font-headline">Save Region Settings</Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Settings */}
      <Card className="shadow-lg rounded-xl">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <UserCog className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="font-headline text-xl">Account Management</CardTitle>
              <CardDescription className="font-body">Manage your account settings and security.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full justify-start font-body">
            <Lock className="mr-2 h-5 w-5" /> Change Password
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="w-full justify-start font-body">
                <Trash2 className="mr-2 h-5 w-5" /> Delete Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle className="font-headline">Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription className="font-body">
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="font-headline">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="font-headline bg-destructive hover:bg-destructive/90 text-destructive-foreground">
                  Yes, Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  );
}
