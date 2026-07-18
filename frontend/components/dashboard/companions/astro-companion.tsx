'use client';

import { motion } from 'motion/react';
import { useState } from 'react';

interface AstroCompanionProps {
  mood?: 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export function AstroCompanion({ mood = 'default', size = 'medium' }: AstroCompanionProps) {
  const sizeMap = {
    small: { container: 'h-16 w-16', scale: 0.4 },
    medium: { container: 'h-20 w-20', scale: 0.5 },
    large: { container: 'h-32 w-32', scale: 0.7 },
  };

  const sizeClass = sizeMap[size].container;

  const floatingVariants = {
    float: {
      y: [0, -8, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const celebrateVariants = {
    celebrate: {
      y: [0, -15, -10, -15, 0],
      rotate: [0, 5, -5, 5, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 4,
      },
    },
  };

  return (
    <motion.div
      variants={floatingVariants}
      animate={mood === 'celebrating' ? 'celebrate' : 'float'}
      className={`flex items-center justify-center overflow-hidden ${sizeClass}`}
    >
      <svg
        viewBox="0 0 200 220"
        className="h-full w-full"
        style={{ filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.2))' }}
      >
        {/* Cute Astronaut - Improved & Compact */}
        <defs>
          <radialGradient id="astroGlowPro" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#818cf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="astroSuitPro" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#c7d2fe" />
          </linearGradient>
          <linearGradient id="helmetShine" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#cffafe" opacity="0.6" />
            <stop offset="100%" stopColor="#a5f3fc" opacity="0.2" />
          </linearGradient>
        </defs>

        {/* Soft glow background */}
        <circle cx="100" cy="110" r="75" fill="url(#astroGlowPro)" />

        {/* Body - Compact suit */}
        <ellipse cx="100" cy="140" rx="28" ry="35" fill="url(#astroSuitPro)" stroke="#a5b4fc" strokeWidth="1.5" />

        {/* Suit panel - Chest details */}
        <rect x="85" y="125" width="30" height="25" rx="8" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="1" opacity="0.85" />

        {/* Arms - Compact */}
        <g>
          <ellipse cx="62" cy="130" rx="10" ry="20" fill="url(#astroSuitPro)" stroke="#a5b4fc" strokeWidth="1" />
          <ellipse cx="138" cy="130" rx="10" ry="20" fill="url(#astroSuitPro)" stroke="#a5b4fc" strokeWidth="1" />
        </g>

        {/* Gloves - Yellow */}
        <g>
          <circle cx="56" cy="152" r="7" fill="#fbbf24" />
          <circle cx="144" cy="152" r="7" fill="#fbbf24" />
        </g>

        {/* Legs - Compact */}
        <g>
          <rect x="88" y="170" width="10" height="18" rx="5" fill="url(#astroSuitPro)" stroke="#a5b4fc" strokeWidth="1" />
          <rect x="102" y="170" width="10" height="18" rx="5" fill="url(#astroSuitPro)" stroke="#a5b4fc" strokeWidth="1" />
        </g>

        {/* Boots - Red */}
        <g>
          <circle cx="93" cy="192" r="6" fill="#ef4444" />
          <circle cx="107" cy="192" r="6" fill="#ef4444" />
        </g>

        {/* Helmet - Beautiful transparent with shine */}
        <circle cx="100" cy="55" r="36" fill="#bfdbfe" stroke="#7dd3fc" strokeWidth="2" opacity="0.92" />

        {/* Helmet shine effect */}
        <ellipse cx="78" cy="32" rx="14" ry="18" fill="url(#helmetShine)" opacity="0.5" />

        {/* Face inside helmet */}
        <g>
          {/* Head */}
          <circle cx="100" cy="58" r="22" fill="#fecdd3" />

          {/* Big expressive eyes */}
          <g>
            <motion.g
              animate={mood === 'happy' || mood === 'celebrating' ? { scaleY: [1, 0.3, 1] } : {}}
              transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
            >
              {/* Eye whites */}
              <ellipse cx="84" cy="52" rx="5" ry="6" fill="#ffffff" />
              <ellipse cx="116" cy="52" rx="5" ry="6" fill="#ffffff" />
              {/* Pupils */}
              <circle cx="85" cy="53" r="3.5" fill="#1f2937" />
              <circle cx="117" cy="53" r="3.5" fill="#1f2937" />
              {/* Eye shine */}
              <circle cx="86" cy="51" r="1.5" fill="#ffffff" />
              <circle cx="118" cy="51" r="1.5" fill="#ffffff" />
            </motion.g>
          </g>

          {/* Expressive eyebrows */}
          {mood === 'happy' || mood === 'celebrating' ? (
            <g>
              <path d="M 78 47 Q 84 44 90 46" stroke="#8b5cf6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 110 46 Q 116 44 122 47" stroke="#8b5cf6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          ) : (
            <g>
              <path d="M 78 48 Q 84 47 90 48" stroke="#8b5cf6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              <path d="M 110 48 Q 116 47 122 48" stroke="#8b5cf6" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            </g>
          )}

          {/* Rosy cheeks - Cute */}
          <circle cx="68" cy="62" r="5" fill="#f472b6" opacity="0.6" />
          <circle cx="132" cy="62" r="5" fill="#f472b6" opacity="0.6" />

          {/* Cute expressive mouth */}
          {mood === 'happy' || mood === 'celebrating' ? (
            <g>
              <path d="M 88 70 Q 100 77 112 70" stroke="#f97316" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 90 70 Q 100 74 110 70" fill="#fbbf24" opacity="0.4" />
            </g>
          ) : mood === 'thinking' ? (
            <g>
              <circle cx="100" cy="72" r="2" fill="#f97316" />
              <circle cx="90" cy="75" r="1.5" fill="#f97316" opacity="0.5" />
              <circle cx="110" cy="75" r="1.5" fill="#f97316" opacity="0.5" />
            </g>
          ) : (
            <path d="M 88 72 Q 100 75 112 72" stroke="#f97316" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          )}
        </g>

        {/* Antenna with glow */}
        <g>
          <line x1="100" y1="18" x2="100" y2="-5" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
          <motion.circle 
            cx="100" cy="-8" r="2.5" fill="#818cf8" 
            animate={{ scale: [1, 1.3, 1] }} 
            transition={{ duration: 1.5, repeat: Infinity }} 
          />
        </g>

        {/* Celebration stars */}
        {mood === 'celebrating' && (
          <>
            <motion.path
              d="M 40 28 L 42 33 L 48 33 L 43 37 L 45 42 L 40 38 L 35 42 L 37 37 L 32 33 L 38 33 Z"
              fill="#fbbf24"
              animate={{ y: [-10, -25], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.path
              d="M 160 32 L 162 37 L 168 37 L 163 41 L 165 46 L 160 42 L 155 46 L 157 41 L 152 37 L 158 37 Z"
              fill="#fbbf24"
              animate={{ y: [-10, -25], opacity: [1, 0] }}
              transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
