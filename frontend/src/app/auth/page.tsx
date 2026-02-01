import { AuthForm } from '@/components/auth-form';
import { Logo } from '@/components/logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4 sm:p-6 md:p-8">
      <div className="absolute inset-0 z-0 opacity-10">
        {/* Placeholder for subtle cultural pattern, e.g. using CSS background image or SVG */}
      </div>
      <Card className="w-full max-w-md shadow-2xl z-10 rounded-xl">
        <CardHeader className="text-center">
          <Logo size="lg" className="mb-2 mx-auto" />
          <CardTitle className="font-headline text-2xl text-primary">Welcome to MusicMitra</CardTitle>
          <CardDescription className="font-body text-muted-foreground">Your friendly Telugu music companion</CardDescription>
        </CardHeader>
        <CardContent>
          <AuthForm />
        </CardContent>
      </Card>
      <footer className="mt-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} MusicMitra. All rights reserved.</p>
        <p className="font-headline">Discover the Soul of Telugu Music</p>
      </footer>
    </main>
  );
}
