'use client';

import { motion } from 'motion/react';

interface EmberCompanionProps {
  mood?: 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export function EmberCompanion({ mood = 'default', size = 'medium' }: EmberCompanionProps) {
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
      rotate: [0, -8, 8, -8, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 3,
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
        style={{ filter: 'drop-shadow(0 4px 12px rgba(249, 115, 22, 0.2))' }}
      >
        {/* Cute Fox - Compact & Attractive */}
        <defs>
          <radialGradient id="emberGlowPro" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f97316" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="emberFurPro" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fb923c" />
          </linearGradient>
          <linearGradient id="emberTailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fecdd3" />
          </linearGradient>
        </defs>

        {/* Soft glow background */}
        <circle cx="100" cy="110" r="75" fill="url(#emberGlowPro)" />

        {/* Body - Compact rounded */}
        <ellipse cx="100" cy="138" rx="25" ry="34" fill="url(#emberFurPro)" stroke="#f97316" strokeWidth="1.5" />

        {/* Belly - Lighter */}
        <ellipse cx="100" cy="140" rx="16" ry="24" fill="#fecdd3" opacity="0.85" />

        {/* Compact arms */}
        <g>
          <ellipse cx="72" cy="130" rx="9" ry="16" fill="url(#emberFurPro)" stroke="#f97316" strokeWidth="1" />
          <ellipse cx="128" cy="130" rx="9" ry="16" fill="url(#emberFurPro)" stroke="#f97316" strokeWidth="1" />
        </g>

        {/* Cute paws */}
        <g>
          <circle cx="68" cy="148" r="5" fill="#92400e" />
          <circle cx="132" cy="148" r="5" fill="#92400e" />
        </g>

        {/* Short compact legs */}
        <g>
          <rect x="88" y="168" width="7" height="12" rx="3.5" fill="url(#emberFurPro)" stroke="#f97316" strokeWidth="1" />
          <rect x="105" y="168" width="7" height="12" rx="3.5" fill="url(#emberFurPro)" stroke="#f97316" strokeWidth="1" />
        </g>

        {/* Cute foot pads */}
        <g>
          <circle cx="91.5" cy="182" r="4" fill="#92400e" />
          <circle cx="108.5" cy="182" r="4" fill="#92400e" />
        </g>

        {/* Cute fluffy tail - Wagging */}
        <motion.g 
          animate={{ rotate: [0, 12, -12, 12, 0] }} 
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1 }}
          style={{ transformOrigin: '130px 125px' }}
        >
          <path d="M 130 125 Q 148 108 152 75" fill="none" stroke="url(#emberTailGrad)" strokeWidth="7" strokeLinecap="round" />
          {/* Tail tip - white accent */}
          <circle cx="152" cy="75" r="4" fill="#fecdd3" />
        </motion.g>

        {/* Big cute head */}
        <circle cx="100" cy="52" r="27" fill="url(#emberFurPro)" stroke="#f97316" strokeWidth="2" />

        {/* Cute triangular ears */}
        <g>
          {/* Left ear */}
          <polygon points="78,24 70,10 81,32" fill="url(#emberFurPro)" stroke="#f97316" strokeWidth="1.2" />
          {/* Left ear inner */}
          <polygon points="77,26 73,17 79,30" fill="#fecdd3" />

          {/* Right ear */}
          <polygon points="122,24 130,10 119,32" fill="url(#emberFurPro)" stroke="#f97316" strokeWidth="1.2" />
          {/* Right ear inner */}
          <polygon points="123,26 127,17 121,30" fill="#fecdd3" />
        </g>

        {/* Cute snout */}
        <ellipse cx="100" cy="62" rx="13" ry="9" fill="#fecdd3" stroke="#f97316" strokeWidth="1.2" />

        {/* Cute nose */}
        <circle cx="100" cy="62" r="3" fill="#1f2937" />

        {/* Big expressive eyes */}
        <g>
          <motion.circle
            cx="88"
            cy="50"
            r="4"
            fill="#1f2937"
            animate={mood === 'happy' || mood === 'celebrating' ? { scaleY: [1, 0.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
          />
          <motion.circle
            cx="112"
            cy="50"
            r="4"
            fill="#1f2937"
            animate={mood === 'happy' || mood === 'celebrating' ? { scaleY: [1, 0.3, 1] } : { scale: 1 }}
            transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 3 }}
          />
          {/* Eye shine */}
          <circle cx="89" cy="48" r="1.2" fill="#ffffff" opacity="0.9" />
          <circle cx="113" cy="48" r="1.2" fill="#ffffff" opacity="0.9" />
        </g>

        {/* Rosy cheeks */}
        <circle cx="72" cy="58" r="4" fill="#f97316" opacity="0.5" />
        <circle cx="128" cy="58" r="4" fill="#f97316" opacity="0.5" />

        {/* Cute expressive mouth */}
        {mood === 'happy' || mood === 'celebrating' ? (
          <g>
            <line x1="100" y1="65" x2="100" y2="69" stroke="#1f2937" strokeWidth="1" strokeLinecap="round" />
            <path d="M 95 67 Q 100 70 105 67" stroke="#1f2937" strokeWidth="1" fill="none" strokeLinecap="round" />
          </g>
        ) : mood === 'thinking' ? (
          <g>
            <circle cx="95" cy="68" r="1" fill="#1f2937" opacity="0.6" />
            <circle cx="105" cy="68" r="1" fill="#1f2937" opacity="0.6" />
          </g>
        ) : (
          <g>
            <line x1="100" y1="65" x2="100" y2="68" stroke="#1f2937" strokeWidth="0.8" strokeLinecap="round" />
            <path d="M 96 68 Q 100 69 104 68" stroke="#1f2937" strokeWidth="0.8" fill="none" strokeLinecap="round" />
          </g>
        )}

        {/* Celebration stars */}
        {mood === 'celebrating' && (
          <>
            <motion.path
              d="M 50 33 L 53 40 L 60 41 L 54 46 L 56 54 L 50 49 L 44 54 L 46 46 L 40 41 L 47 40 Z"
              fill="#f97316"
              animate={{ y: [-10, -25], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.path
              d="M 150 36 L 153 43 L 160 44 L 154 49 L 156 57 L 150 52 L 144 57 L 146 49 L 140 44 L 147 43 Z"
              fill="#f97316"
              animate={{ y: [-10, -25], opacity: [1, 0] }}
              transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
