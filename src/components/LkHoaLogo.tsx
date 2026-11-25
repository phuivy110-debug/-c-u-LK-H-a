import React from 'react';

interface LkHoaLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number | string;
  variant?: 'default' | 'white' | 'orange' | 'tactical';
}

export const LkHoaLogo: React.FC<LkHoaLogoProps> = ({
  className = '',
  iconOnly = false,
  size,
  variant = 'tactical',
}) => {
  const iconColor =
    variant === 'tactical'
      ? '#FACC15'
      : variant === 'white'
      ? '#FFFFFF'
      : variant === 'orange'
      ? '#F97316'
      : '#0F172A';

  const textColor =
    variant === 'tactical' || variant === 'white'
      ? 'text-white'
      : variant === 'orange'
      ? 'text-[#F97316]'
      : 'text-slate-900';

  return (
    <div className={`inline-flex items-center gap-2.5 shrink-0 ${className}`}>
      <svg
        width={size || 36}
        height={size || 36}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <path
          d="M100 10 L180 52 L180 148 L100 190 L20 148 L20 52 Z"
          fill="#14532D"
          stroke={iconColor}
          strokeWidth="14"
          strokeLinejoin="round"
        />
        <path
          d="M45 42 V142 L115 142 L115 120 L69 120 V42 Z"
          fill={iconColor}
        />
        <path
          d="M100 32 V155 H123 V105 L152 148 H178 L138 92 L174 48 H148 L123 80 V32 Z"
          fill={iconColor}
        />
      </svg>

      {!iconOnly && (
        <span className={`font-display font-black text-sm sm:text-base tracking-tight whitespace-nowrap ${textColor}`}>
          ĐỒ CÂU LK HÒA <span className="text-[#FACC15]">- CHÍNH HÃNG</span>
        </span>
      )}
    </div>
  );
};
