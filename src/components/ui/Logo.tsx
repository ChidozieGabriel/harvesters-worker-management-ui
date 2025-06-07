import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'white';
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true,
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
    xl: 'text-2xl'
  };

  const textColorClasses = variant === 'white' 
    ? 'text-white' 
    : 'text-harvesters-900';

  const logoColorClasses = variant === 'white'
    ? 'text-white'
    : 'text-harvesters-700';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* SVG Logo based on the Harvesters cross design */}
      <div className={`${sizeClasses[size]} relative ${logoColorClasses}`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="currentColor"
        >
          {/* Main vertical stroke of the cross - more stylized */}
          <path
            d="M20 8 C25 5, 32 10, 28 18 L25 28 L27 38 L25 48 L23 58 L21 68 L19 78 L17 88 L15 95 C13 99, 8 100, 6 96 C4 92, 7 87, 10 84 L12 74 L14 64 L16 54 L18 44 L20 34 L18 24 L20 14 C22 10, 20 8, 20 8 Z"
            className="fill-current"
            style={{ transformOrigin: 'center', transform: 'rotate(-8deg)' }}
          />
          
          {/* Horizontal stroke of the cross - curved and stylized */}
          <path
            d="M5 28 C3 25, 6 22, 11 24 L21 27 L31 29 L41 31 L51 33 L61 35 L71 37 L81 39 L88 41 C92 42, 93 46, 90 48 C87 50, 83 48, 80 46 L70 43 L60 41 L50 39 L40 37 L30 35 L20 33 L10 31 C6 29, 4 30, 5 28 Z"
            className="fill-current"
            style={{ transformOrigin: 'center', transform: 'rotate(-5deg)' }}
          />
          
          {/* Small horizontal accent - more organic */}
          <path
            d="M18 18 C16 15, 19 12, 23 14 L27 16 L31 18 L35 20 C37 21, 37 24, 35 25 C33 26, 31 24, 29 23 L25 21 L21 19 L18 18 Z"
            className="fill-current"
            style={{ transformOrigin: 'center', transform: 'rotate(-10deg)' }}
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textColorClasses} ${textSizeClasses[size]} tracking-wider`}>
            HARVESTERS
          </span>
          <span className={`font-medium ${variant === 'white' ? 'text-gray-200' : 'text-harvesters-600'} ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm'} tracking-wide`}>
            LONDON CAMPUS
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;