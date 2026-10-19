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
  const FALLBACK_LOGO = '/lcns-logo.png.jpg'; // Your GitHub uploaded file
  
  const initialLogo = overrideLogoUrl || getLocalSettings()[settingKey] || undefined;
  const [logoUrl, setLogoUrl] = useState<string | undefined>(initialLogo);
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
      } else if (!logoUrl) {
        // Fallback to GitHub logo if DB has nothing
        setLogoUrl(FALLBACK_LOGO);
      }
    };
    loadFromDb();
    const handleSettingsUpdate = (e: any) => {
      if (!e.detail || e.detail.key === settingKey) loadFromDb();
    };
    window.addEventListener('lcns_school_settings_update', handleSettingsUpdate);
    window.addEventListener('lcns_storage_update', handleSettingsUpdate);
    return () => {
      window.removeEventListener('lcns_school_settings_update', handleSettingsUpdate);
      window.removeEventListener('lcns_storage_update', handleSettingsUpdate);
    };
  }, [overrideLogoUrl, settingKey]);

  const sizeMap = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-36 h-36 text-xl',
    '2xl': 'w-48 h-48 text-2xl',
  };

  const [sizeClass, textClass] = sizeMap[size].split(' ');
  
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div className={`relative ${sizeClass} shrink-0 transition-transform duration-300 hover:scale-105 drop-shadow-sm`}>
        {logoUrl && !imgError ? (
          <img
            src={logoUrl}
            alt="Labe College of Nursing Sciences Emblem"
            onError={() => {
              // If Supabase logo fails, use GitHub logo
              if (logoUrl !== FALLBACK_LOGO) {
                setLogoUrl(FALLBACK_LOGO);
              } else {
                setImgError(true);
              }
            }}
            className="w-full h-full object-contain rounded-full bg-white"
          />
        ) : (
          <img
            src={FALLBACK_LOGO}
            alt="LCNS"
            className="w-full h-full object-contain rounded-full bg-white p-1"
            onError={() => setImgError(true)}
          />
        )}
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className="font-extrabold text-[#0a4d2e] tracking-tight leading-tight text-lg uppercase">
            Labe College of Nursing Sciences
          </span>
          <span className="text-xs font-semibold text-[#0a4d2e] tracking-wider uppercase">
            Gboko, Benue State • Learn, Serve & Save
          </span>
        </div>
      )}
    </div>
  );
};
