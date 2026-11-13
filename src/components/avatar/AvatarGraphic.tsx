/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { isValidProfilePhotoDataUrl } from '../../utils/imageProcessor';

interface AvatarGraphicProps {
  avatarId: string;
  photoUrl?: string;
  alt?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

const SIZE_CLASSES = {
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
  '2xl': 'w-28 h-28',
};

export const AvatarGraphic: React.FC<AvatarGraphicProps> = ({
  avatarId,
  photoUrl,
  alt,
  className = '',
  size = 'md',
}) => {
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const [hasPhotoError, setHasPhotoError] = useState(false);

  useEffect(() => {
    setHasPhotoError(false);
  }, [photoUrl]);

  if (photoUrl && isValidProfilePhotoDataUrl(photoUrl) && !hasPhotoError) {
    return (
      <div
        className={`overflow-hidden shrink-0 flex items-center justify-center bg-[var(--app-surface)] border border-[var(--app-border)] ${sizeClass} ${className} !rounded-full`}
      >
        <img
          src={photoUrl}
          alt={alt || 'Fotografia de perfil'}
          className="w-full h-full object-cover object-center select-none"
          onError={() => setHasPhotoError(true)}
          draggable={false}
        />
      </div>
    );
  }

  // 1. MASCULINO — CRIANÇAS: Rapaz com hoodie vermelho (OFICIAL SANGUEA)
  if (avatarId === 'child-boy-hoodie' || avatarId === 'avatar-1') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="hoodieGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f43f5e" />
              <stop offset="50%" stopColor="#e11d48" />
              <stop offset="100%" stopColor="#991b1b" />
            </linearGradient>
            <linearGradient id="skinBoy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#784528" />
              <stop offset="100%" stopColor="#542e17" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#fff1f2" />
          <path d="M22,88 Q20,38 50,30 Q80,38 78,88 Z" fill="url(#hoodieGrad)" />
          <ellipse cx="50" cy="55" rx="26" ry="25" fill="#881337" opacity="0.6" />
          <rect x="44" y="65" width="12" height="12" fill="url(#skinBoy)" rx="3" />
          <ellipse cx="50" cy="52" rx="20" ry="21" fill="url(#skinBoy)" />
          <path d="M30,46 Q50,28 70,46 Q74,34 50,32 Q26,34 30,46 Z" fill="#1c1917" />
          <ellipse cx="30" cy="54" rx="3.5" ry="5" fill="url(#skinBoy)" />
          <ellipse cx="70" cy="54" rx="3.5" ry="5" fill="url(#skinBoy)" />
          <ellipse cx="43" cy="51" rx="2.5" ry="3.5" fill="#ffffff" />
          <ellipse cx="57" cy="51" rx="2.5" ry="3.5" fill="#ffffff" />
          <circle cx="43" cy="51.5" r="1.8" fill="#1c1917" />
          <circle cx="57" cy="51.5" r="1.8" fill="#1c1917" />
          <circle cx="44" cy="50.5" r="0.7" fill="#ffffff" />
          <circle cx="58" cy="50.5" r="0.7" fill="#ffffff" />
          <path d="M39,45 Q44,43 47,45" stroke="#292524" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M53,45 Q56,43 61,45" stroke="#292524" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M48,58 Q50,60 52,58" stroke="#3b1d0c" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          <path d="M44,63 Q50,69 56,63" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M44,63 Q50,69 56,63" stroke="#881337" strokeWidth="1.2" strokeLinecap="round" fill="none" />
          <path d="M18,92 L82,92 L76,74 Q50,70 24,74 Z" fill="url(#hoodieGrad)" />
          <path d="M50,72 L50,92" stroke="#be123c" strokeWidth="2" />
        </svg>
      </div>
    );
  }

  // 2. MASCULINO — CRIANÇAS: Rapaz com Boné Rubi (Placeholder Validação)
  if (avatarId === 'child-boy-cap') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[var(--app-bg)] border border-[var(--app-border)] ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinCapBoy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#784528" />
              <stop offset="100%" stopColor="#542e17" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#f5f5f4" />
          {/* T-shirt */}
          <path d="M20,85 Q50,72 80,85 L84,100 L16,100 Z" fill="#991b1b" />
          {/* Head & Neck */}
          <rect x="44" y="62" width="12" height="14" fill="url(#skinCapBoy)" rx="3" />
          <ellipse cx="50" cy="52" rx="20" ry="20" fill="url(#skinCapBoy)" />
          {/* Cap backwards / forward */}
          <path d="M28,42 Q50,22 72,42 L78,44 Q50,38 22,44 Z" fill="#e11d48" />
          <ellipse cx="50" cy="36" rx="22" ry="12" fill="#be123c" />
          {/* Eyes & Smile */}
          <circle cx="43" cy="52" r="2" fill="#1c1917" />
          <circle cx="57" cy="52" r="2" fill="#1c1917" />
          <path d="M45,63 Q50,68 55,63" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          {/* Prototype Badge Tag */}
          <rect x="25" y="88" width="50" height="10" rx="3" fill="#3b0764" opacity="0.8" />
          <text x="50" y="95" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">EM ESTUDO</text>
        </svg>
      </div>
    );
  }

  // 3. MASCULINO — ADOLESCENTES: Jovem com Hoodie Desportivo
  if (avatarId === 'teen-boy-hoodie') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[var(--app-bg)] border border-[var(--app-border)] ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinTeenBoy" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6f3f22" />
              <stop offset="100%" stopColor="#4e2b15" />
            </linearGradient>
            <linearGradient id="jacketTeen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#be123c" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#f5f5f4" />
          <path d="M15,86 Q50,68 85,86 L88,100 L12,100 Z" fill="url(#jacketTeen)" />
          <path d="M38,82 L50,100 L62,82" fill="#ffffff" />
          <rect x="43" y="62" width="14" height="15" fill="url(#skinTeenBoy)" rx="2" />
          <path d="M31,44 Q31,68 50,71 Q69,68 69,44 Q69,32 50,32 Q31,32 31,44 Z" fill="url(#skinTeenBoy)" />
          <path d="M29,42 Q50,22 71,42 Q68,26 50,24 Q32,26 29,42 Z" fill="#1c1917" />
          <ellipse cx="42" cy="48" rx="2.6" ry="3.2" fill="#ffffff" />
          <ellipse cx="58" cy="48" rx="2.6" ry="3.2" fill="#ffffff" />
          <circle cx="42" cy="48.5" r="1.9" fill="#1c1917" />
          <circle cx="58" cy="48.5" r="1.9" fill="#1c1917" />
          <path d="M38,42 Q43,40 47,43" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M53,43 Q57,40 62,42" stroke="#1c1917" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <path d="M45,61 Q50,65 55,61" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 4. MASCULINO — ADOLESCENTES: Jovem Casual (Placeholder)
  if (avatarId === 'teen-boy-urban') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[var(--app-bg)] border border-[var(--app-border)] ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinTeen2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6f3f22" />
              <stop offset="100%" stopColor="#4e2b15" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#fafaf9" />
          <path d="M16,86 Q50,70 84,86 L88,100 L12,100 Z" fill="#1e293b" />
          <rect x="43" y="62" width="14" height="15" fill="url(#skinTeen2)" rx="2" />
          <ellipse cx="50" cy="50" rx="19" ry="21" fill="url(#skinTeen2)" />
          <path d="M30,40 Q50,22 70,40 Q65,24 50,22 Q35,24 30,40 Z" fill="#1c1917" />
          <circle cx="43" cy="49" r="2" fill="#1c1917" />
          <circle cx="57" cy="49" r="2" fill="#1c1917" />
          <path d="M45,62 Q50,66 55,62" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
          <rect x="25" y="88" width="50" height="10" rx="3" fill="#3b0764" opacity="0.8" />
          <text x="50" y="95" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">EM ESTUDO</text>
        </svg>
      </div>
    );
  }

  // 5. MASCULINO — ADULTOS: Homem Adulto Clássico
  if (avatarId === 'adult-man' || avatarId === 'avatar-4') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[var(--app-bg)] border border-[var(--app-border)] ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinMan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6a3b1e" />
              <stop offset="100%" stopColor="#462411" />
            </linearGradient>
            <linearGradient id="shirtMan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#f5f5f4" />
          <path d="M12,86 Q50,70 88,86 L90,100 L10,100 Z" fill="url(#shirtMan)" />
          <path d="M42,82 L50,96 L58,82" fill="#be123c" />
          <rect x="42" y="60" width="16" height="18" fill="url(#skinMan)" rx="2" />
          <path d="M30,42 Q30,68 50,72 Q70,68 70,42 Q70,30 50,30 Q30,30 30,42 Z" fill="url(#skinMan)" />
          <path d="M28,40 Q50,22 72,40 Q70,25 50,24 Q30,25 28,40 Z" fill="#1c1917" />
          <path d="M36,58 Q50,72 64,58 Q64,68 50,72 Q36,68 36,58 Z" fill="#1c1917" opacity="0.8" />
          <circle cx="42" cy="46.5" r="1.8" fill="#1c1917" />
          <circle cx="58" cy="46.5" r="1.8" fill="#1c1917" />
          <path d="M46,60 Q50,64 54,60" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 6. MASCULINO — ADULTOS: Homem Polo (Placeholder)
  if (avatarId === 'adult-man-polo') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-[var(--app-bg)] border border-[var(--app-border)] ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinMan2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6a3b1e" />
              <stop offset="100%" stopColor="#462411" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#fafaf9" />
          <path d="M12,86 Q50,70 88,86 L90,100 L10,100 Z" fill="#881337" />
          <rect x="42" y="60" width="16" height="18" fill="url(#skinMan2)" rx="2" />
          <path d="M30,42 Q30,68 50,72 Q70,68 70,42 Q70,30 50,30 Q30,30 30,42 Z" fill="url(#skinMan2)" />
          <path d="M28,40 Q50,22 72,40 Q70,25 50,24 Q30,25 28,40 Z" fill="#1c1917" />
          <circle cx="42" cy="46" r="2" fill="#1c1917" />
          <circle cx="58" cy="46" r="2" fill="#1c1917" />
          <path d="M46,60 Q50,64 54,60" stroke="#ffffff" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <rect x="25" y="88" width="50" height="10" rx="3" fill="#3b0764" opacity="0.8" />
          <text x="50" y="95" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">EM ESTUDO</text>
        </svg>
      </div>
    );
  }

  // 7. FEMININO — CRIANÇAS: Menina com Trancinhas
  if (avatarId === 'child-girl-braids' || avatarId === 'avatar-2') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinGirl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#844d2d" />
              <stop offset="100%" stopColor="#5a3118" />
            </linearGradient>
            <linearGradient id="shirtGirl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fb7185" />
              <stop offset="100%" stopColor="#be123c" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#fff5f5" />
          <path d="M22,50 Q16,72 26,88" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M78,50 Q84,72 74,88" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M24,84 Q50,72 76,84 L80,100 L20,100 Z" fill="url(#shirtGirl)" />
          <rect x="44" y="65" width="12" height="12" fill="url(#skinGirl)" rx="3" />
          <ellipse cx="50" cy="50" rx="20" ry="21" fill="url(#skinGirl)" />
          <circle cx="30" cy="32" r="13" fill="#1c1917" />
          <circle cx="70" cy="32" r="13" fill="#1c1917" />
          <circle cx="34" cy="40" r="4" fill="#e11d48" />
          <circle cx="66" cy="40" r="4" fill="#e11d48" />
          <circle cx="42" cy="49.5" r="2" fill="#1c1917" />
          <circle cx="58" cy="49.5" r="2" fill="#1c1917" />
          <path d="M43,60 Q50,68 57,60" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 8. FEMININO — CRIANÇAS: Menina com Puffs Afro (Placeholder)
  if (avatarId === 'child-girl-puffs') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinGirl2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#844d2d" />
              <stop offset="100%" stopColor="#5a3118" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#fff5f5" />
          <path d="M24,84 Q50,72 76,84 L80,100 L20,100 Z" fill="#e11d48" />
          <rect x="44" y="65" width="12" height="12" fill="url(#skinGirl2)" rx="3" />
          <ellipse cx="50" cy="50" rx="19" ry="20" fill="url(#skinGirl2)" />
          <circle cx="30" cy="32" r="14" fill="#1c1917" />
          <circle cx="70" cy="32" r="14" fill="#1c1917" />
          <circle cx="43" cy="50" r="2" fill="#1c1917" />
          <circle cx="57" cy="50" r="2" fill="#1c1917" />
          <path d="M45,61 Q50,66 55,61" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <rect x="25" y="88" width="50" height="10" rx="3" fill="#3b0764" opacity="0.8" />
          <text x="50" y="95" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">EM ESTUDO</text>
        </svg>
      </div>
    );
  }

  // 9. FEMININO — ADOLESCENTES: Jovem com Bandó Rubi
  if (avatarId === 'teen-girl-style' || avatarId === 'avatar-3') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinTeenGirl" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c4627" />
              <stop offset="100%" stopColor="#562e16" />
            </linearGradient>
            <linearGradient id="topTeen" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#e11d48" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#fff1f2" />
          <path d="M22,46 Q16,72 24,94" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M78,46 Q84,72 76,94" stroke="#1c1917" strokeWidth="5" strokeLinecap="round" fill="none" />
          <path d="M20,84 Q50,72 80,84 L84,100 L16,100 Z" fill="url(#topTeen)" />
          <rect x="44" y="62" width="12" height="15" fill="url(#skinTeenGirl)" rx="3" />
          <ellipse cx="50" cy="49" rx="19" ry="21" fill="url(#skinTeenGirl)" />
          <ellipse cx="50" cy="34" rx="24" ry="14" fill="#1c1917" />
          <circle cx="50" cy="24" r="10" fill="#1c1917" />
          <path d="M28,36 Q50,30 72,36" stroke="#e11d48" strokeWidth="3.5" fill="none" />
          <circle cx="43" cy="48.5" r="1.8" fill="#1c1917" />
          <circle cx="57" cy="48.5" r="1.8" fill="#1c1917" />
          <path d="M44,59 Q50,66 56,59" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 10. FEMININO — ADOLESCENTES: Jovem com Box Braids (Placeholder)
  if (avatarId === 'teen-girl-braids') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinTeenGirl2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7c4627" />
              <stop offset="100%" stopColor="#562e16" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#fff1f2" />
          <path d="M20,44 Q14,70 20,95" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M80,44 Q86,70 80,95" stroke="#1c1917" strokeWidth="4" strokeLinecap="round" fill="none" />
          <path d="M20,84 Q50,72 80,84 L84,100 L16,100 Z" fill="#9f1239" />
          <rect x="44" y="62" width="12" height="15" fill="url(#skinTeenGirl2)" rx="3" />
          <ellipse cx="50" cy="49" rx="19" ry="21" fill="url(#skinTeenGirl2)" />
          <path d="M30,36 Q50,22 70,36 Z" fill="#1c1917" />
          <circle cx="43" cy="48" r="2" fill="#1c1917" />
          <circle cx="57" cy="48" r="2" fill="#1c1917" />
          <path d="M44,59 Q50,65 56,59" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <rect x="25" y="88" width="50" height="10" rx="3" fill="#3b0764" opacity="0.8" />
          <text x="50" y="95" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">EM ESTUDO</text>
        </svg>
      </div>
    );
  }

  // 11. FEMININO — ADULTOS: Mulher com Turbante
  if (avatarId === 'adult-woman') {
    return (
      <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 ${sizeClass} ${className}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <defs>
            <linearGradient id="skinWoman" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7a4425" />
              <stop offset="100%" stopColor="#522b14" />
            </linearGradient>
            <linearGradient id="turbanGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#be123c" />
              <stop offset="50%" stopColor="#991b1b" />
              <stop offset="100%" stopColor="#881337" />
            </linearGradient>
          </defs>
          <rect width="100" height="100" fill="#fff1f2" />
          <path d="M16,86 Q50,72 84,86 L86,100 L14,100 Z" fill="#4c0519" />
          <rect x="44" y="60" width="12" height="16" fill="url(#skinWoman)" rx="2" />
          <ellipse cx="50" cy="48" rx="19" ry="21" fill="url(#skinWoman)" />
          <path d="M26,38 Q50,14 74,38 Q82,24 64,16 Q50,10 36,16 Q18,24 26,38 Z" fill="url(#turbanGrad)" />
          <circle cx="50" cy="18" r="8" fill="#e11d48" />
          <circle cx="28" cy="51" r="3" fill="#fbbf24" />
          <circle cx="72" cy="51" r="3" fill="#fbbf24" />
          <circle cx="43" cy="47.5" r="1.8" fill="#1c1917" />
          <circle cx="57" cy="47.5" r="1.8" fill="#1c1917" />
          <path d="M44,58 Q50,65 56,58" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    );
  }

  // 12. FEMININO — ADULTOS: Mulher Penteado Elegante (Placeholder)
  return (
    <div className={`rounded-2xl overflow-hidden shrink-0 flex items-center justify-center bg-rose-500/10 border border-rose-500/20 ${sizeClass} ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="skinWoman2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7a4425" />
            <stop offset="100%" stopColor="#522b14" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" fill="#fff1f2" />
        <path d="M16,86 Q50,72 84,86 L86,100 L14,100 Z" fill="#1e1b4b" />
        <rect x="44" y="60" width="12" height="16" fill="url(#skinWoman2)" rx="2" />
        <ellipse cx="50" cy="48" rx="19" ry="21" fill="url(#skinWoman2)" />
        <path d="M26,42 Q50,18 74,42 Q70,22 50,20 Q30,22 26,42 Z" fill="#1c1917" />
        <circle cx="43" cy="47" r="2" fill="#1c1917" />
        <circle cx="57" cy="47" r="2" fill="#1c1917" />
        <path d="M44,58 Q50,64 56,58" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
        <rect x="25" y="88" width="50" height="10" rx="3" fill="#3b0764" opacity="0.8" />
        <text x="50" y="95" textAnchor="middle" fill="#ffffff" fontSize="6" fontWeight="bold">EM ESTUDO</text>
      </svg>
    </div>
  );
};
