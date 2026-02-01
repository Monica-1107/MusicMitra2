import type { SVGProps } from 'react';

export function MusicMitraLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100" // Using a 100x100 viewBox for consistency
      fill="currentColor" // Default fill, can be overridden by classNames or specific attributes
      aria-label="MusicMitra Logo"
      role="img"
      {...props}
    >
      {/* Music Symbol (representing "Music") - First M - Beamed eighth notes */}
      <g className="text-primary">
        {/* Left Note */}
        <circle cx="20" cy="70" r="7" fill="currentColor"/> {/* Left note head */}
        <rect x="18" y="38" width="4" height="32" fill="currentColor"/> {/* Left stem */}
        
        {/* Right Note */}
        <circle cx="38" cy="70" r="7" fill="currentColor"/> {/* Right note head */}
        <rect x="36" y="38" width="4" height="32" fill="currentColor"/> {/* Right stem */}
        
        {/* Beam connecting the stems */}
        <rect x="18" y="34" width="22" height="5" fill="currentColor"/>
      </g>

      {/* Friends Symbol (representing "Mitra" - shaking hands to form an M) - Second M */}
      <g className="text-accent" transform="translate(5 0)">
        {/* Left Figure part of M */}
        <circle cx="60" cy="30" r="5.5" fill="currentColor"/> {/* Head 1 */}
        <line x1="60" y1="35.5" x2="60" y2="65" stroke="currentColor" strokeWidth="5"/> {/* Body 1 (Left vertical of M) */}
        <line x1="60" y1="48" x2="72.5" y2="58" stroke="currentColor" strokeWidth="5"/> {/* Arm 1 (Left diagonal of V) */}

        {/* Right Figure part of M */}
        <circle cx="85" cy="30" r="5.5" fill="currentColor"/> {/* Head 2 */}
        <line x1="85" y1="35.5" x2="85" y2="65" stroke="currentColor" strokeWidth="5"/> {/* Body 2 (Right vertical of M) */}
        <line x1="85" y1="48" x2="72.5" y2="58" stroke="currentColor" strokeWidth="5"/> {/* Arm 2 (Right diagonal of V) */}

        {/* Handshake point */}
        <circle cx="72.5" cy="59" r="4.5" className="text-secondary" fill="currentColor" /> {/* Handshake circle */}
      </g>

      {/* Text "MusicMitra" below the graphical elements */}
      <text
        x="50"
        y="92" // Positioned towards the bottom
        fontFamily="Belleza, Alegreya, serif" // Using theme fonts
        fontSize="12" // Font size for the text relative to viewBox
        textAnchor="middle" // Horizontally centers the text
        className="text-foreground font-headline" // Applies foreground color and headline font style
        fill="currentColor" // Ensures the className color is applied
      >
        MusicMitra
      </text>
    </svg>
  );
}
