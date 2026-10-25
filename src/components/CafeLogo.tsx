import React from 'react';

interface CafeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'receipt';
  showText?: boolean;
  monochrome?: boolean;
  businessName?: string;
}

export const CafeLogo: React.FC<CafeLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  monochrome = false,
  businessName = 'CafeFlow',
}) => {
  const pixelSize = size === 'sm' ? 36 : size === 'md' ? 44 : size === 'lg' ? 64 : 48;

  const primaryColor = monochrome ? '#000000' : '#8E1B1B'; // Deep chilli red
  const accentColor = monochrome ? '#000000' : '#F5A623';  // Saffron gold
  const bgColor = monochrome ? '#FFFFFF' : '#FFF6E5';      // Warm cream

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Circular Emblem with Steaming Cup and Crossed Fork & Spoon */}
      <svg
        width={pixelSize}
        height={pixelSize}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
      >
        {/* Outer Circular Badge */}
        <circle cx="50" cy="50" r="48" fill={bgColor} stroke={primaryColor} strokeWidth="3" />
        <circle cx="50" cy="50" r="44" stroke={accentColor} strokeWidth="1.2" strokeDasharray="3 2" />

        {/* Animated / Ornate Steam Wisps */}
        <path
          d="M42 22C44 26 40 28 42 32"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-80"
        />
        <path
          d="M50 18C52 23 48 26 50 31"
          stroke={accentColor}
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M58 22C60 26 56 28 58 32"
          stroke={primaryColor}
          strokeWidth="2"
          strokeLinecap="round"
          className="opacity-80"
        />

        {/* Coffee Cup Body */}
        <path
          d="M32 36C32 34.5 33.5 34 35 34H65C66.5 34 68 34.5 68 36V50C68 58 60 62 50 62C40 62 32 58 32 50V36Z"
          fill={primaryColor}
        />
        {/* Coffee Cup Rim */}
        <ellipse cx="50" cy="35" rx="17" ry="2.5" fill={accentColor} />

        {/* Cup Handle */}
        <path
          d="M66 40C72 40 76 43 76 47C76 52 70 54 66 54"
          stroke={primaryColor}
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Saucer */}
        <ellipse cx="50" cy="64" rx="22" ry="3" fill={accentColor} />

        {/* Crossed Spoon & Fork Beneath Cup */}
        {/* Spoon (bottom-left to top-right diagonal) */}
        <g stroke={primaryColor} strokeWidth="2.2" strokeLinecap="round">
          <line x1="28" y1="84" x2="68" y2="70" />
          <ellipse cx="71" cy="69" rx="4" ry="2.5" fill={primaryColor} transform="rotate(25 71 69)" />
        </g>
        {/* Fork (bottom-right to top-left diagonal) */}
        <g stroke={primaryColor} strokeWidth="2.2" strokeLinecap="round">
          <line x1="72" y1="84" x2="32" y2="70" />
          <path d="M28 68L33 71M27 71L32 74M29 65L34 68" strokeWidth="1.8" />
        </g>

        {/* Center decorative seed / star */}
        <circle cx="50" cy="77" r="2" fill={accentColor} />
      </svg>

      {/* Business Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-display font-bold tracking-tight whitespace-nowrap leading-none ${
              monochrome ? 'text-black' : 'text-[#8E1B1B] dark:text-[#F5A623]'
            } ${size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-3xl' : 'text-xl'}`}
          >
            {businessName}
          </span>
          <span
            className={`font-handwriting text-[12px] sm:text-[13px] tracking-wide leading-tight ${
              monochrome ? 'text-stone-700' : 'text-[#C27C3E] dark:text-stone-300'
            }`}
          >
            Artisan Kitchen &middot; Freshly Brewed
          </span>
        </div>
      )}
    </div>
  );
};
