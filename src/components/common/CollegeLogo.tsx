import React, { useState, useEffect } from 'react';
import { getSchoolSetting, getLocalSettings } from '../../lib/uploadPermanent';

interface CollegeLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showText?: boolean;
  overrideLogoUrl?: string;
  variant?: 'main' | 'white';
}

export const CollegeLogo: React.FC<CollegeLogoProps> = ({
  className = '',
  size = 'md',
  showText = false,
  overrideLogoUrl,
  variant = 'main',
}) => {
  const settingKey = variant === 'white' ? 'school_logo_white' : 'school_logo';
  const FALLBACK_LOGO = 'https://raw.githubusercontent.com/Samueldew/lcns-edu-ng/main/lcns-logo.png.jpg';
  
  const initialLogo = overrideLogoUrl || getLocalSettings()[settingKey] || undefined;
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialLogo || FALLBACK_LOGO);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    if (overrideLogoUrl !== undefined) {
      setLogoUrl(overrideLogoUrl);
      setImgError(false);
      return;
    }
    const loadFromDb = async () => {
      const url = await getSchoolSetting(settingKey);
      if (url) {
        setLogoUrl(url);
        setImgError(false);
      }
    };
    loadFromDb();
  }, [overrideLogoUrl, settingKey]);

  const sizeMap = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-36 h-36 text-xl',
    '2xl': 'w-48 h-48 text-2xl',
  };

  const [sizeClass] = sizeMap[size].split(' ');
  
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClass} shrink-0`}>
        <img
          src={imgError ? FALLBACK_LOGO : logoUrl}
          alt="LCNS Logo"
          onError={() => setImgError(false)}
          className="w-full h-full object-contain rounded-full bg-white p-1 shadow"
        />
      </div>
      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="font-extrabold text-[#0a4d2e] text-[16px] uppercase tracking-tight">
            Labe College of Nursing Sciences
          </span>
          <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
            Catholic Diocese of Gboko, Benue State
          </span>
          <span className="text-[10px] font-semibold text-[#0a4d2e] uppercase">
            Gboko &bull; Learn, Serve & Save
          </span>
        </div>
      )}
    </div>
  );
};
