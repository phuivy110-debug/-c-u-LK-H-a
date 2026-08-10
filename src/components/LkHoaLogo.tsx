import React from 'react';

interface LkHoaLogoProps {
  className?: string;
  iconOnly?: boolean;
  size?: number | string;
  variant?: 'default' | 'white' | 'orange';
}

export const LkHoaLogo: React.FC<LkHoaLogoProps> = ({
  className = '',
  iconOnly = false,
  size,
  variant = 'default',
}) => {
  // Hexagon + LK emblem vector
  const iconColor =
    variant === 'white' ? '#FFFFFF' : variant === 'orange' ? '#EE4D2D' : '#1E293B';

  const textColor =
    variant === 'white' ? 'text-white' : variant === 'orange' ? 'text-[#EE4D2D]' : 'text-slate-900';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* Hexagon LK Monogram Symbol */}
      <svg
        width={size || 38}
        height={size || 38}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 transition-transform duration-200 group-hover:scale-105"
      >
        {/* Outer Hexagon frame */}
        <path
          d="M100 10 L180 52 L180 148 L100 190 L20 148 L20 52 Z"
          fill="none"
          stroke={iconColor}
          strokeWidth="16"
          strokeLinejoin="round"
        />

        {/* Inner Hexagon border line */}
        <path
          d="M100 24 L168 60 L168 140 L100 176 L32 140 L32 60 Z"
          fill="none"
          stroke={iconColor}
          strokeWidth="6"
          strokeLinejoin="round"
        />

        {/* Stylized L letter path */}
        <path
          d="M45 42 V142 L115 142 L115 120 L69 120 V42 Z"
          fill={iconColor}
        />

        {/* Stylized K letter path */}
        <path
          d="M100 32 V155 H123 V105 L152 148 H178 L138 92 L174 48 H148 L123 80 V32 Z"
          fill={iconColor}
        />
      </svg>

      {/* Brand Text "L.k. Hòa" */}
      {!iconOnly && (
        <div className="flex flex-col justify-center leading-none">
          <span className={`font-black text-lg sm:text-xl tracking-tight font-serif ${textColor}`}>
            L.k. Hòa
          </span>
          <span className="text-[10px] sm:text-[11px] font-bold tracking-wider text-[#EE4D2D] uppercase mt-0.5">
            Đồ Câu Chính Hãng
          </span>
        </div>
      )}
    </div>
  );
};
