'use client';

import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { AstroCompanion } from './companions/astro-companion';
import { NovaCompanion } from './companions/nova-companion';
import { EmberCompanion } from './companions/ember-companion';
import { AiChat } from './ai-chat';
import { ChevronDown, MessageCircle, Settings, X, Volume2, VolumeX } from 'lucide-react';
import { AiPersonality } from '@/lib/ai-companion';

interface CompanionWidgetProps {
  lifeScore?: number;
  habitsCompleted?: number;
  activeGoals?: number;
}

type CompanionType = 'astro' | 'nova' | 'ember';
type CompanionMood = 'happy' | 'thinking' | 'celebrating' | 'encouraging' | 'default';

const companionMessages = {
  default: [
    'Welcome back! Ready to make today productive?',
    'How can I help you today?',
    'You\'re doing great. Keep going!',
    'Let\'s make today count.',
  ],
  happy: [
    'You\'re crushing it today!',
    'Great progress so far!',
    'I\'m impressed by your consistency.',
  ],
  celebrating: [
    'Awesome work! You deserve a break.',
    'That\'s incredible! Keep this momentum!',
    'Celebrating with you! 🎉',
  ],
  encouraging: [
    'You\'re closer than you think.',
    'Keep pushing, you\'ve got this!',
    'Every step forward counts.',
  ],
  thinking: [
    'Let me analyze your progress...',
    'Processing your data...',
    'Thinking about your goals...',
  ],
};

export function CompanionWidget({ lifeScore = 50, habitsCompleted = 0, activeGoals = 0 }: CompanionWidgetProps) {
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionType>('astro');
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMood, setCurrentMood] = useState<CompanionMood>('default');
  const [currentMessage, setCurrentMessage] = useState(companionMessages.default[0]);
  const [showMessage, setShowMessage] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [chatOpen, setChatOpen] = useState(false);

  // Determine mood based on activity
  useEffect(() => {
    let mood: CompanionMood = 'default';
    let messages = companionMessages.default;

    if (habitsCompleted > 0) {
      mood = 'happy';
      messages = companionMessages.happy;
    }

    if (lifeScore > 80 && habitsCompleted > 5) {
      mood = 'celebrating';
      messages = companionMessages.celebrating;
    }

    if (activeGoals > 3) {
      mood = 'encouraging';
      messages = companionMessages.encouraging;
    }

    setCurrentMood(mood);
    setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
  }, [lifeScore, habitsCompleted, activeGoals]);

  // Show message periodically
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessage(true);
      const hideTimer = setTimeout(() => {
        setShowMessage(false);
      }, 5000);
      return () => clearTimeout(hideTimer);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const renderCompanion = () => {
    switch (selectedCompanion) {
      case 'astro':
        return <AstroCompanion mood={currentMood} size={isExpanded ? 'large' : 'medium'} />;
      case 'nova':
        return <NovaCompanion mood={currentMood} size={isExpanded ? 'large' : 'medium'} />;
      case 'ember':
        return <EmberCompanion mood={currentMood} size={isExpanded ? 'large' : 'medium'} />;
      default:
        return <AstroCompanion mood={currentMood} size={isExpanded ? 'large' : 'medium'} />;
    }
  };

  return (
    <>
      <motion.div
        style={{
          position: 'fixed',
          right: position.x,
          bottom: position.y,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-50"
      >
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="mb-2 w-64 space-y-2.5 rounded-xl bg-white p-3 shadow-lg border border-slate-200/80 backdrop-blur-sm"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 capitalize">
                  {selectedCompanion}
                </h3>
                <p className="text-xs text-slate-500">AI companion</p>
              </div>
              <button
                onClick={() => setIsExpanded(false)}
                className="rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
              >
                <X className="h-3.5 w-3.5 text-slate-400" />
              </button>
            </div>

            {/* Companion Selection */}
            <div className="flex gap-1.5">
              {(['astro', 'nova', 'ember'] as const).map((companion) => (
                <motion.button
                  key={companion}
                  onClick={() => setSelectedCompanion(companion)}
                  className={`flex-1 rounded-lg px-2 py-1 text-xs font-medium transition-all ${
                    selectedCompanion === companion
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {companion.charAt(0).toUpperCase() + companion.slice(1)}
                </motion.button>
              ))}
            </div>

            {/* Message */}
            <AnimatePresence>
              {showMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="rounded-lg bg-blue-50 px-2.5 py-2 border border-blue-200"
                >
                  <p className="text-xs text-blue-900">"{currentMessage}"</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats - Compact */}
            <div className="grid grid-cols-3 gap-1.5">
              <div className="rounded-lg bg-slate-100 p-2 text-center border border-slate-200">
                <p className="text-sm font-bold text-slate-900">{lifeScore}</p>
                <p className="text-xs text-slate-600">Score</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2 text-center border border-slate-200">
                <p className="text-sm font-bold text-slate-900">{habitsCompleted}</p>
                <p className="text-xs text-slate-600">Habits</p>
              </div>
              <div className="rounded-lg bg-slate-100 p-2 text-center border border-slate-200">
                <p className="text-sm font-bold text-slate-900">{activeGoals}</p>
                <p className="text-xs text-slate-600">Goals</p>
              </div>
            </div>

            {/* Controls - Compact */}
            <div className="flex gap-1.5">
              <motion.button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-slate-100 px-2 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors border border-slate-200"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {soundEnabled ? (
                  <Volume2 className="h-3 w-3" />
                ) : (
                  <VolumeX className="h-3 w-3" />
                )}
                <span className="hidden sm:inline">Sound</span>
              </motion.button>
              <motion.button
                onClick={() => setChatOpen(true)}
                className="flex-1 flex items-center justify-center gap-1 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-2 py-1.5 text-xs font-medium text-white hover:from-blue-700 hover:to-indigo-700 transition-all border border-blue-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <MessageCircle className="h-3 w-3" />
                <span className="hidden sm:inline">Chat</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion Widget */}
      <motion.div
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        className="group relative"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
      >
        {/* Companion */}
        <motion.div
          className="h-20 w-20 rounded-2xl bg-white p-1 shadow-lg border-2 border-slate-200 cursor-grab active:cursor-grabbing flex items-center justify-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {renderCompanion()}
        </motion.div>

        {/* Action buttons */}
        <div className="absolute bottom-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(true);
            }}
            className="rounded-full bg-indigo-600 p-1.5 text-white hover:bg-indigo-700 shadow-lg"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title="Expand"
          >
            <ChevronDown className="h-3 w-3" />
          </motion.button>
        </div>
      </motion.div>
    </motion.div>

    {/* AI Chat Modal */}
    <AiChat
      isOpen={chatOpen}
      onClose={() => setChatOpen(false)}
      initialPersonality={selectedCompanion as AiPersonality}
      onPersonalityChange={(personality) => {
        setSelectedCompanion(personality as CompanionType);
      }}
    />
    </>
  );
}
