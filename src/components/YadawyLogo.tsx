import React from 'react';
import logoImg from '../assets/logo/1.png';
import wordmarkImg from '../assets/logo/2.png';

export interface YadawyLogoProps {
  /**
   * Layout variant:
   * - 'horizontal': Emblem alongside text (ideal for Navbar and headers)
   * - 'vertical': Stacked emblem on top of text (identical to the uploaded brand image)
   * - 'mark': Just the iconic Egyptian Hand & Terracotta Pottery symbol
   * - 'compact': Smaller footprint for mobile headers
   */
  variant?: 'horizontal' | 'vertical' | 'mark' | 'compact';
  /**
   * Theme mode:
   * - 'light': Dark green & terracotta on light/cream backgrounds (default)
   * - 'dark': Light cream & terracotta on dark backgrounds (e.g. in Footer)
   */
  theme?: 'light' | 'dark';
  /**
   * Size multiplier or height indicator
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Show or hide the tagline ("سوق الحرف والفنون المصرية")
   */
  showTagline?: boolean;
  /**
   * Optional custom CSS class
   */
  className?: string;
  /**
   * Custom subtitle override (defaults to "سوق الحرف والفنون المصرية")
   */
  subtitle?: string;
}

/**
 * Official YADAWY Brand Emblem – renders the real logo image (1.png)
 */
export const YadawyEmblem: React.FC<{
  size?: number;
  isDark?: boolean;
  className?: string;
}> = ({ size = 48, isDark = false, className = '' }) => {
  return (
    <img
      src={logoImg}
      alt="شعار يدوي"
      width={size}
      height={size}
      className={`shrink-0 object-contain transition-transform ${isDark ? 'brightness-110' : ''} ${className}`}
    />
  );
};

/**
 * Complete Official Brand Identity Component for YADAWY (يدوي)
 */
export const YadawyLogo: React.FC<YadawyLogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  showTagline = true,
  className = '',
  subtitle = 'سوق الحرف والفنون المصرية'
}) => {
  const isDark = theme === 'dark';

  // Desktop Emblem Sizes (kept fixed and unchanged for laptop & desktop)
  const desktopEmblemSizes = {
    sm: 34,
    md: 44,
    lg: 58,
    xl: 84
  };

  // Responsive sizing classes: slightly smaller on mobile screens (<sm), fixed on desktop/laptop (sm:)
  const responsiveEmblemClasses = {
    sm: 'w-6 h-[27px] sm:w-[34px] sm:h-[38.25px]',
    md: 'w-7 h-[31.5px] sm:w-[44px] sm:h-[49.5px]',
    lg: 'w-10 h-[45px] sm:w-[58px] sm:h-[65.25px]',
    xl: 'w-14 h-[63px] sm:w-[84px] sm:h-[94.5px]'
  };

  const responsiveTextClasses = {
    sm: 'text-base sm:text-lg',
    md: 'text-xl sm:text-3xl',
    lg: 'text-2xl sm:text-4xl',
    xl: 'text-3xl sm:text-5xl'
  };

  const currentEmblemSize = desktopEmblemSizes[size] || 44;
  const currentEmblemClass = responsiveEmblemClasses[size] || responsiveEmblemClasses.md;
  const currentTextClass = responsiveTextClasses[size] || responsiveTextClasses.md;

  // Colors
  const textColor = isDark ? 'text-[#F6F4ED]' : 'text-[#1E3F32]';
  const subtitleColor = isDark ? 'text-[#A3B8B0]' : 'text-[#5C6F67]';

  // 1. Mark Only Variant
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <YadawyEmblem size={currentEmblemSize} isDark={isDark} className={currentEmblemClass} />
      </div>
    );
  }

  // 2. Vertical / Full Stacked Variant
  if (variant === 'vertical') {
    return (
      <div className={`flex flex-col items-center text-center ${className}`}>
        {/* Emblem on top */}
        <div className="mb-2 sm:mb-2.5 transform hover:scale-105 transition-transform">
          <YadawyEmblem 
            size={currentEmblemSize * 1.3} 
            isDark={isDark} 
            className="w-12 h-12 sm:w-[57px] sm:h-[57px]"
          />
        </div>

        {/* Wordmark image */}
        <img
          src={wordmarkImg}
          alt="يدوي"
          className={`h-8 sm:h-10 w-auto object-contain ${isDark ? 'brightness-200 invert' : ''}`}
        />

        {/* Subtitle / Tagline */}
        {showTagline && (
          <p className={`text-xs sm:text-sm font-medium mt-1.5 ${subtitleColor}`}>
            {subtitle}
          </p>
        )}
      </div>
    );
  }

  // 3. Compact Variant (for Mobile Nav)
  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-1.5 sm:gap-2 ${className}`}>
        <YadawyEmblem size={32} isDark={isDark} className="w-7 h-7 sm:w-8 sm:h-8" />
        <div className="flex flex-col">
          <img
            src={wordmarkImg}
            alt="يدوي"
            className={`h-5 sm:h-6 w-auto object-contain ${isDark ? 'brightness-200 invert' : ''}`}
          />
          {showTagline && (
            <span className={`text-[10px] ${subtitleColor} truncate max-w-[140px]`}>
              {subtitle}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. Default Horizontal Variant (for Main Navbar & Standard Headers)
  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 group ${className}`}>
      {/* Visual Emblem Symbol */}
      <div className="transform group-hover:scale-105 transition-transform shrink-0">
        <YadawyEmblem size={currentEmblemSize} isDark={isDark} className={currentEmblemClass} />
      </div>

      {/* Wordmark + Tagline */}
      <div className="flex flex-col justify-center">
        {/* Real wordmark image (2.png) */}
        <img
          src={wordmarkImg}
          alt="يدوي"
          className={`h-6 sm:h-8 w-auto object-contain ${isDark ? 'brightness-200 invert' : ''}`}
        />

        {/* Subtitle */}
        {showTagline && (
          <span className={`text-[11px] sm:text-xs ${subtitleColor} font-medium mt-0.5 hidden sm:inline-block leading-tight`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

