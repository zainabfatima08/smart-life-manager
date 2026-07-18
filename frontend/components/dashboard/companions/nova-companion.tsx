'use client';

import { motion } from 'motion/react';

interface NovaCompanionProps {
  mood?: 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'default';
  size?: 'small' | 'medium' | 'large';
}

export function NovaCompanion({ mood = 'default', size = 'medium' }: NovaCompanionProps) {
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
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  const celebrateVariants = {
    celebrate: {
      y: [0, -15, -10, -15, 0],
      rotate: [0, -10, 10, -10, 0],
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
        style={{ filter: 'drop-shadow(0 4px 12px rgba(6, 182, 212, 0.2))' }}
      >
        {/* Cute Robot - Compact & Attractive */}
        <defs>
          <radialGradient id="novaGlowPro" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="novaBodyPro" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
          <linearGradient id="novaHeadGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#baf3ff" />
            <stop offset="100%" stopColor="#a5f3fc" />
          </linearGradient>
        </defs>

        {/* Soft glow background */}
        <circle cx="100" cy="110" r="75" fill="url(#novaGlowPro)" />

        {/* Body - Compact rounded */}
        <rect x="78" y="115" width="44" height="55" rx="14" fill="url(#novaBodyPro)" stroke="#22d3ee" strokeWidth="1.5" />

        {/* Chest panel - Glowing */}
        <rect x="86" y="128" width="28" height="28" rx="6" fill="#cffafe" stroke="#06b6d4" strokeWidth="1" opacity="0.9" />

        {/* Cute blinking indicator lights */}
        <g>
          <motion.circle cx="91" cy="137" r="2.5" fill="#0891b2" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, repeat: Infinity }} />
          <motion.circle cx="100" cy="137" r="2.5" fill="#0891b2" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, delay: 0.2, repeat: Infinity }} />
          <motion.circle cx="109" cy="137" r="2.5" fill="#0891b2" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ duration: 1.2, delay: 0.4, repeat: Infinity }} />
        </g>

        {/* Compact arms */}
        <g>
          <rect x="58" y="128" width="20" height="12" rx="6" fill="url(#novaBodyPro)" stroke="#22d3ee" strokeWidth="1" />
          <rect x="122" y="128" width="20" height="12" rx="6" fill="url(#novaBodyPro)" stroke="#22d3ee" strokeWidth="1" />
        </g>

        {/* Hand grippers */}
        <g>
          <circle cx="50" cy="134" r="4" fill="#06b6d4" opacity="0.8" />
          <circle cx="150" cy="134" r="4" fill="#06b6d4" opacity="0.8" />
        </g>

        {/* Compact legs */}
        <g>
          <rect x="87" y="168" width="9" height="14" rx="4.5" fill="url(#novaBodyPro)" stroke="#22d3ee" strokeWidth="1" />
          <rect x="104" y="168" width="9" height="14" rx="4.5" fill="url(#novaBodyPro)" stroke="#22d3ee" strokeWidth="1" />
        </g>

        {/* Cute feet */}
        <g>
          <rect x="84" y="182" width="14" height="7" rx="2.5" fill="#06b6d4" opacity="0.7" />
          <rect x="102" y="182" width="14" height="7" rx="2.5" fill="#06b6d4" opacity="0.7" />
        </g>

        {/* Head - Big cute circle */}
        <circle cx="100" cy="50" r="30" fill="url(#novaHeadGradient)" stroke="#22d3ee" strokeWidth="2" />

        {/* Cute big eyes */}
        <g>
          <motion.circle
            cx="87"
            cy="45"
            r="4.5"
            fill="#0891b2"
            animate={mood === 'thinking' ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <motion.circle
            cx="113"
            cy="45"
            r="4.5"
            fill="#0891b2"
            animate={mood === 'thinking' ? { scale: [1, 1.2, 1] } : { scale: 1 }}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          {/* Pupils with shine */}
          <circle cx="88" cy="44" r="1.8" fill="#083344" />
          <circle cx="114" cy="44" r="1.8" fill="#083344" />
          <circle cx="89" cy="42" r="0.8" fill="#ffffff" opacity="0.7" />
          <circle cx="115" cy="42" r="0.8" fill="#ffffff" opacity="0.7" />
        </g>

        {/* Screen/Mouth display */}
        <rect x="84" y="56" width="32" height="14" rx="3" fill="#cffafe" stroke="#06b6d4" strokeWidth="1" opacity="0.95" />

        {/* Screen content */}
        {mood === 'celebrating' ? (
          <motion.text 
            x="100" y="66" 
            textAnchor="middle" 
            fontSize="11" 
            fill="#0891b2" 
            fontWeight="bold" 
            animate={{ scale: [1, 1.15, 1] }} 
            transition={{ duration: 0.6, repeat: Infinity }}
          >
            ★
          </motion.text>
        ) : mood === 'happy' ? (
          <path d="M 89 59 Q 100 64 111 59" stroke="#0891b2" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        ) : mood === 'thinking' ? (
          <>
            <circle cx="92" cy="59" r="1" fill="#0891b2" opacity="0.6" />
            <circle cx="100" cy="62" r="1" fill="#0891b2" opacity="0.6" />
          </>
        ) : (
          <>
            <line x1="89" y1="59" x2="95" y2="59" stroke="#22d3ee" strokeWidth="0.8" opacity="0.6" />
            <line x1="89" y1="65" x2="111" y2="65" stroke="#22d3ee" strokeWidth="0.8" opacity="0.6" />
          </>
        )}

        {/* Tiny cute antenna */}
        <g>
          <line x1="100" y1="20" x2="100" y2="2" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
          <motion.circle cx="100" cy="-2" r="2" fill="#06b6d4" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.2, repeat: Infinity }} />
        </g>

        {/* Celebration effects */}
        {mood === 'celebrating' && (
          <>
            <motion.path
              d="M 52 35 L 55 42 L 63 43 L 57 48 L 59 56 L 52 51 L 45 56 L 47 48 L 41 43 L 49 42 Z"
              fill="#06b6d4"
              animate={{ y: [-10, -25], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <motion.path
              d="M 148 38 L 151 45 L 159 46 L 153 51 L 155 59 L 148 54 L 141 59 L 143 51 L 137 46 L 145 45 Z"
              fill="#06b6d4"
              animate={{ y: [-10, -25], opacity: [1, 0] }}
              transition={{ duration: 1, delay: 0.2, repeat: Infinity }}
            />
          </>
        )}
      </svg>
    </motion.div>
  );
}
