import React from 'react';

interface GoldenThunderLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const GoldenThunderLogo: React.FC<GoldenThunderLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  const sizeMap = {
    sm: { box: 'w-7 h-7', icon: 'w-3.5 h-3.5' },
    md: { box: 'w-8 h-8', icon: 'w-4 h-4' },
    lg: { box: 'w-10 h-10', icon: 'w-5 h-5' },
    xl: { box: 'w-12 h-12', icon: 'w-6 h-6' },
  };

  const { box, icon } = sizeMap[size] || sizeMap.md;

  return (
    <div
      className={`relative rounded-xl bg-gradient-to-br from-amber-500/20 via-zinc-900/95 to-zinc-950 border border-amber-500/40 flex items-center justify-center shadow-[0_0_16px_rgba(245,158,11,0.22)] transition-all duration-300 ${box} ${className}`}
    >
      {/* Ambient golden halo */}
      <div className="absolute inset-0 rounded-xl bg-amber-400/10 blur-sm pointer-events-none" />

      {/* Golden Thunderbolt Glyph */}
      <svg
        viewBox="0 0 24 24"
        className={`${icon} relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="goldThunderPrimary" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFF4BD" />
            <stop offset="30%" stopColor="#FBBF24" />
            <stop offset="65%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="goldThunderHighlight" x1="12" y1="2" x2="12" y2="16" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#FDE68A" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Outer subtle stroke outline */}
        <path
          d="M13 2.5L4 13.5H11.5L9.5 22L19.5 10H12.5L14.5 2.5H13Z"
          fill="url(#goldThunderPrimary)"
          stroke="#FDE68A"
          strokeWidth="0.6"
          strokeLinejoin="round"
        />

        {/* Specular crest light highlight */}
        <path
          d="M13 2.5L5.5 12.5H12L10.5 16.5L17.5 10H12.8L14.2 3.2L13 2.5Z"
          fill="url(#goldThunderHighlight)"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};
