'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Mail, KeyRound, LogIn, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // On successful "login", navigate to dashboard
      // In a real app, you would handle actual authentication here
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="font-body">Email Address</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            id="email" 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
            className="pl-10 font-body"
            aria-label="Email Address"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            id="password" 
            type="password" 
            placeholder="••••••••" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
            className="pl-10 font-body"
            aria-label="Password"
          />
        </div>
      </div>
      
      {!isLogin && (
         <div className="space-y-2">
         <Label htmlFor="confirm-password">Confirm Password</Label>
         <div className="relative">
           <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
           <Input 
             id="confirm-password" 
             type="password" 
             placeholder="••••••••" 
             required 
             className="pl-10 font-body"
             aria-label="Confirm Password"
           />
         </div>
       </div>
      )}

      <Button type="submit" className="w-full font-headline" disabled={isLoading}>
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
        ) : (
          isLogin ? <><LogIn className="mr-2 h-5 w-5" /> Login</> : <><UserPlus className="mr-2 h-5 w-5" /> Sign Up</>
        )}
      </Button>
      
      <Separator />
      
      <Button variant="outline" type="button" className="w-full font-headline" onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? "Need an account? Sign Up" : "Already have an account? Login"}
      </Button>
    </form>
  );
}
