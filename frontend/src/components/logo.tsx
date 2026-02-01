import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { MusicMitraLogo as MusicMitraSvg } from './music-mitra-logo';

interface LogoProps extends HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md', ...props }: LogoProps) {
  const sizeClasses = {
    sm: 'h-12 w-auto', // Approx 48px height, suitable for header
    md: 'h-20 w-auto', // Approx 80px height, default
    lg: 'h-28 w-auto', // Approx 112px height, suitable for auth page
  };

  return (
    <div className={cn(sizeClasses[size], className)} {...props}>
      <MusicMitraSvg className="w-full h-full" />
    </div>
  );
}
