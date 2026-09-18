import React from 'react';

interface DrumAppIconProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | number;
  className?: string;
  rounded?: 'rounded-lg' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full';
}

export const DrumAppIcon: React.FC<DrumAppIconProps> = ({
  size = 'md',
  className = '',
  rounded = 'rounded-2xl',
}) => {
  const sizeMap = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
    '2xl': 'h-28 w-28',
  };

  const dimClass = typeof size === 'number' ? `h-[${size}px] w-[${size}px]` : sizeMap[size];
  const customStyle = typeof size === 'number' ? { width: size, height: size } : undefined;

  return (
    <div
      style={customStyle}
      className={`relative inline-flex items-center justify-center overflow-hidden bg-amber-500 shadow-md ${rounded} ${dimClass} ${className}`}
    >
      <svg
        viewBox="0 0 512 512"
        className="h-full w-full p-[14%] drop-shadow-sm select-none"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g fill="none" stroke="#000000" strokeWidth="36" strokeLinecap="round" strokeLinejoin="round">
          {/* Drumsticks */}
          <path d="M 125 90 L 246 220" />
          <path d="M 387 90 L 266 220" />
          
          {/* Drum shell */}
          <path d="M 96 230 V 345 C 96 395 416 395 416 345 V 230" fill="#F59E0B" strokeWidth="36" />
          
          {/* Vertical Tension Rods */}
          <line x1="150" y1="250" x2="150" y2="368" strokeWidth="32" />
          <line x1="203" y1="258" x2="203" y2="378" strokeWidth="32" />
          <line x1="256" y1="260" x2="256" y2="380" strokeWidth="32" />
          <line x1="309" y1="258" x2="309" y2="378" strokeWidth="32" />
          <line x1="362" y1="250" x2="362" y2="368" strokeWidth="32" />
          
          {/* Top Drum Head (Rim Ellipse) */}
          <ellipse cx="256" cy="230" rx="160" ry="52" fill="#F59E0B" strokeWidth="36" />
        </g>
      </svg>
    </div>
  );
};
