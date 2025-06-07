import React from 'react';
import logo from '../../logo.svg';

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
        <img src={logo} alt="Logo" />
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-bold ${textColorClasses} ${textSizeClasses[size]} tracking-wider`}>
            HARVESTERS
          </span>
          <span className={`font-medium ${variant === 'white' ? 'text-gray-200' : 'text-harvesters-600'} ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-xs' : 'text-sm'} tracking-wide`}>
            LONDON
          </span>
        </div>
      )}
    </div>
  );
};

export default Logo;