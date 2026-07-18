'use client';

import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Lightbulb, X } from 'lucide-react';

export function AICompanion() {
  const [isHovering, setIsHovering] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [mouseX, setMouseX] = useState(0);
  const [mouseY, setMouseY] = useState(0);
  const [cursorX, setCursorX] = useState(0);
  const [cursorY, setCursorY] = useState(0);

  const tips = [
    'Pro tip: Review your Life Score every Sunday for maximum impact.',
    'Your mood and sleep quality are closely connected. Check the patterns!',
    'The best time to add habits is during your morning routine.',
    'Focus blocks work best when scheduled after breaks.',
    'Weekly goals are more achievable than monthly goals.',
  ];

  const [currentTip, setCurrentTip] = useState(tips[0]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorX(e.clientX);
      setCursorY(e.clientY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Calculate distance and apply subtle parallax
  useEffect(() => {
    const companionX = window.innerWidth - 100;
    const companionY = window.innerHeight - 100;

    const distX = (cursorX - companionX) * 0.1;
    const distY = (cursorY - companionY) * 0.1;

    setMouseX(distX);
    setMouseY(distY);
  }, [cursorX, cursorY]);

  const changeTip = () => {
    const randomIndex = Math.floor(Math.random() * tips.length);
    setCurrentTip(tips[randomIndex]);
  };

  return (
    <>
      {/* Floating Companion */}
      <motion.div
        style={{
          x: mouseX,
          y: mouseY,
        }}
        className="fixed bottom-6 right-6 z-40"
      >
        <motion.div
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          animate={{
            scale: isHovering ? 1.1 : 1,
            rotate: isHovering ? 5 : 0,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
          className="relative"
        >
          {/* Glow effect */}
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
            }}
            className="absolute -inset-3 rounded-full bg-gradient-to-r from-blue-400/30 to-cyan-400/30 blur-lg"
          />

          {/* Main bubble */}
          <motion.button
            onClick={() => {
              setShowTip(!showTip);
              if (!showTip) changeTip();
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:shadow-xl hover:shadow-blue-500/40 transition"
          >
            {/* Eyes animation */}
            <div className="flex gap-2">
              <motion.div
                animate={{
                  scale: isHovering ? 1.2 : 1,
                }}
                className="h-1.5 w-1.5 rounded-full bg-white"
              />
              <motion.div
                animate={{
                  scale: isHovering ? 1.2 : 1,
                }}
                className="h-1.5 w-1.5 rounded-full bg-white"
              />
            </div>

            {/* Blink animation */}
            <motion.div
              animate={{
                scaleY: [1, 1, 1, 0.1, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                repeatDelay: 2,
              }}
              className="absolute inset-0 rounded-full bg-blue-600 opacity-0"
            />

            {/* Wave hand on hover */}
            {isHovering && (
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.6, repeat: Infinity }}
                className="absolute -top-2 -right-1 text-lg"
              >
                👋
              </motion.div>
            )}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Tip popup */}
      {showTip && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-28 right-6 z-40 w-72 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 p-4 shadow-xl shadow-blue-500/20 backdrop-blur"
        >
          {/* Close button */}
          <button
            onClick={() => setShowTip(false)}
            className="absolute top-3 right-3 p-1 hover:bg-blue-100 rounded-full transition"
          >
            <X size={16} className="text-slate-600" />
          </button>

          {/* Content */}
          <div className="flex gap-3">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="mt-1 flex-shrink-0"
            >
              <Lightbulb size={20} className="text-amber-500" />
            </motion.div>
            <div>
              <p className="text-sm font-bold text-slate-900 mb-3">{currentTip}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={changeTip}
                className="text-xs font-bold text-blue-600 hover:text-blue-700 transition"
              >
                Show another tip →
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </>
  );
}
