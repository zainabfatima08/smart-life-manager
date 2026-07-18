'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Cloud, CloudRain, Sun, Moon, Sunrise } from 'lucide-react';

interface HeroProps {
  userName?: string;
  dailyProgress?: number;
}

const quotes = [
  'The only way to do great work is to love what you do.',
  'Every day is a chance to improve.',
  'Small progress is still progress.',
  'You are doing great. Keep going.',
  'Today is full of possibilities.',
  'Believe in yourself and all that you are.',
  'Your time is limited, spend it wisely.',
  'The future depends on what you do today.',
];

function getTimeGreeting() {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return { greeting: 'Good Morning', icon: Sunrise, color: 'text-amber-500', bgColor: 'bg-amber-100' };
  } else if (hour >= 12 && hour < 17) {
    return { greeting: 'Good Afternoon', icon: Sun, color: 'text-yellow-500', bgColor: 'bg-yellow-100' };
  } else if (hour >= 17 && hour < 21) {
    return { greeting: 'Good Evening', icon: Cloud, color: 'text-orange-500', bgColor: 'bg-orange-100' };
  } else {
    return { greeting: 'Good Night', icon: Moon, color: 'text-indigo-500', bgColor: 'bg-indigo-100' };
  }
}

export function HeroSection({ userName = 'User', dailyProgress = 0 }: HeroProps) {
  const [quote, setQuote] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [timeGreeting, setTimeGreeting] = useState(getTimeGreeting());
  const [displayName, setDisplayName] = useState(userName);

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    setDateStr(today.toLocaleDateString('en-US', options));
    setTimeGreeting(getTimeGreeting());

    // Get actual user name from localStorage or props
    const storedName = localStorage.getItem('userName');
    if (storedName && storedName !== 'User') {
      setDisplayName(storedName);
    } else {
      setDisplayName(userName);
    }
  }, [userName]);

  const GreetingIcon = timeGreeting.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-blue-50 via-slate-50 to-indigo-50 px-6 sm:px-10 py-12 sm:py-16 shadow-lg border border-slate-200/50 backdrop-blur-sm"
    >
      {/* Animated background elements */}
      <div className="absolute -right-32 -top-32 h-64 w-64 rounded-full bg-blue-100/30 blur-3xl" />
      <div className="absolute -left-32 bottom-0 h-64 w-64 rounded-full bg-indigo-100/20 blur-3xl" />

      <div className="relative">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6 flex items-center gap-2"
        >
          <GreetingIcon className={`h-5 w-5 ${timeGreeting.color}`} />
          <p className={`text-sm font-semibold ${timeGreeting.color}`}>{timeGreeting.greeting}</p>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="mb-3 text-3xl sm:text-5xl font-bold text-slate-900 break-words"
        >
          Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{displayName}</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mb-8 text-slate-600"
        >
          {dateStr}
        </motion.p>

        {/* Quote Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mb-8 rounded-2xl bg-white/60 px-6 py-4 backdrop-blur-sm border border-slate-200"
        >
          <p className="italic text-slate-700 text-lg">"{quote}"</p>
        </motion.div>

        {/* Daily Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="flex items-center gap-6"
        >
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-slate-700">Today's Progress</p>
              <p className="text-sm font-semibold text-blue-600">{Math.round(dailyProgress)}%</p>
            </div>
            <div className="h-2.5 w-full rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${dailyProgress}%` }}
                transition={{ duration: 1.5, delay: 0.8 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg shadow-blue-500/30"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
