import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '', 
  showText = true 
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

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* SVG Logo based on the cross design */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="currentColor"
        >
          {/* Main vertical stroke of the cross */}
          <path
            d="M25 5 C30 3, 35 8, 32 15 L28 25 L30 35 L28 45 L26 55 L24 65 L22 75 L20 85 L18 92 C16 97, 12 98, 10 95 C8 92, 10 88, 12 85 L14 75 L16 65 L18 55 L20 45 L22 35 L20 25 L22 15 C24 8, 25 5, 25 5 Z"
            className="fill-current"
          />
          
          {/* Horizontal stroke of the cross */}
          <path
            d="M8 25 C6 23, 8 20, 12 22 L22 25 L32 28 L42 30 L52 32 L62 34 L72 36 L82 38 L90 40 C94 41, 95 45, 92 47 C89 49, 85 47, 82 45 L72 42 L62 40 L52 38 L42 36 L32 34 L22 32 L12 30 C8 28, 6 27, 8 25 Z"
            className="fill-current"
          />
          
          {/* Small horizontal accent */}
          <path
            d="M20 15 C18 13, 20 10, 24 12 L28 14 L32 16 L36 18 C38 19, 38 22, 36 23 C34 24, 32 22, 30 21 L26 19 L22 17 L20 15 Z"
            className="fill-current"
          />
        </svg>
      </div>
      
      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]} tracking-wider`}>
            HARVESTERS
          </span>
          <span className={`font-semibold text-gray-600 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm'} tracking-wide`}>
            LONDON
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;