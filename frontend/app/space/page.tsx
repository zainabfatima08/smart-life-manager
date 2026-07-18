'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader, AlertCircle, Sparkles, Trophy, BookOpen, Target, PiggyBank } from 'lucide-react';

interface UserStats {
  life_score: number;
  current_habit_streak: number;
  goals_completed: number;
  books_read: number;
  monthly_savings: number;
}

export default function SpacePage() {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch('/api/accounts/profile-statistics/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch stats');

      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load space');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </main>
    );
  }

  if (error || !stats) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-8"
          >
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <p className="text-center text-lg text-red-900">{error}</p>
          </motion.div>
        </div>
      </main>
    );
  }

  // Calculate room upgrades based on life score
  const roomLevel = Math.floor(stats.life_score / 500) + 1;
  const bookshelfItems = Math.min(Math.floor(stats.books_read / 2), 8);
  const trophyItems = Math.min(stats.goals_completed, 5);
  const hasStreakBanner = stats.current_habit_streak >= 7;
  const savingsMeter = Math.min(Math.floor(stats.monthly_savings / 5000), 5);

  const roomUpgrades = {
    1: { wall: 'from-slate-100 to-slate-200', floor: 'from-amber-100 to-yellow-100', name: 'Starter Room' },
    2: { wall: 'from-blue-100 to-indigo-100', floor: 'from-amber-50 to-yellow-50', name: 'Cozy Room' },
    3: { wall: 'from-purple-100 to-pink-100', floor: 'from-emerald-50 to-teal-50', name: 'Premium Room' },
    4: { wall: 'from-yellow-100 to-orange-100', floor: 'from-rose-50 to-pink-50', name: 'Luxurious Room' },
    5: { wall: 'from-emerald-100 to-cyan-100', floor: 'from-indigo-50 to-purple-50', name: 'Magnificent Room' }
  };

  const currentRoomLevel = Math.min(roomLevel, 5);
  const roomStyle = roomUpgrades[currentRoomLevel as keyof typeof roomUpgrades];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-6xl px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <Sparkles className="mx-auto mb-4 h-12 w-12 text-purple-600" />
          <h1 className="mb-2 text-4xl font-bold text-slate-900">My Life Room</h1>
          <p className="text-slate-600">Your personalized space that evolves with your progress</p>
        </motion.div>

        {/* Room Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4"
        >
          {[
            { icon: Trophy, label: 'Room Level', value: currentRoomLevel, suffix: '' },
            { icon: Target, label: 'Life Score', value: stats.life_score, suffix: '' },
            { icon: BookOpen, label: 'Books Read', value: stats.books_read, suffix: '' },
            { icon: PiggyBank, label: 'Savings', value: `₹${Math.round(stats.monthly_savings / 1000)}`, suffix: 'k' }
          ].map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="rounded-xl bg-white p-4 shadow-lg border border-slate-200 text-center"
              >
                <Icon className="mx-auto mb-2 h-6 w-6 text-blue-600" />
                <p className="text-sm text-slate-600 mb-1">{stat.label}</p>
                <p className="text-xl font-bold text-slate-900">
                  {stat.value}{stat.suffix}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* The Room */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8 rounded-3xl shadow-2xl overflow-hidden border border-slate-300"
        >
          {/* Room Background */}
          <div className={`relative bg-gradient-to-b ${roomStyle.wall} min-h-96 p-8`}>
            {/* Floor */}
            <div className={`absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t ${roomStyle.floor}`} />

            {/* Room Content */}
            <div className="relative z-10 flex flex-col h-96">
              {/* Ceiling Decoration */}
              <div className="mb-8 flex justify-around">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 3, delay: i * 0.3, repeat: Infinity }}
                    className="text-4xl"
                  >
                    ✨
                  </motion.div>
                ))}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 flex items-center justify-between px-8">
                {/* Left Side - Bookshelf */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-sm font-semibold text-slate-700 mb-3">Bookshelf</p>
                  <div className="flex gap-2">
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ rotateZ: [0, 2, -2, 0] }}
                        transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                        className={`w-6 h-12 rounded transition-all ${
                          i < bookshelfItems
                            ? 'bg-gradient-to-b from-orange-400 to-red-500 shadow-lg'
                            : 'bg-slate-300 opacity-20'
                        }`}
                      />
                    ))}
                  </div>
                </motion.div>

                {/* Center - Companion */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-6xl"
                >
                  🤖
                </motion.div>

                {/* Right Side - Trophies */}
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="flex flex-col items-center"
                >
                  <p className="text-sm font-semibold text-slate-700 mb-3">Trophies</p>
                  <div className="flex gap-2">
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        animate={{ y: [0, -8, 0] }}
                        transition={{ duration: 2, delay: i * 0.1, repeat: Infinity }}
                        className={`text-3xl transition-all ${
                          i < trophyItems ? 'opacity-100' : 'opacity-20'
                        }`}
                      >
                        🏆
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Floor Items */}
              <div className="flex justify-around items-end h-24">
                {/* Streak Banner */}
                <motion.div
                  animate={{ rotate: [0, 2, -2, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className={`text-center px-4 py-2 rounded-lg font-bold text-white ${
                    hasStreakBanner
                      ? 'bg-gradient-to-r from-red-500 to-orange-500'
                      : 'opacity-0 pointer-events-none'
                  }`}
                >
                  🔥 {stats.current_habit_streak}-Day Streak!
                </motion.div>

                {/* Savings Meter */}
                <div className="flex flex-col items-center">
                  <p className="text-xs font-semibold text-slate-700 mb-1">Savings</p>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-3 h-8 rounded transition-all ${
                          i < savingsMeter
                            ? 'bg-gradient-to-t from-green-500 to-emerald-400 shadow-md'
                            : 'bg-slate-300 opacity-20'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200"
        >
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Room: {roomStyle.name}</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-slate-600 mb-2">Progress to Next Level</p>
              <div className="relative h-3 w-full rounded-full bg-slate-200 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((stats.life_score % 500) / 500) * 100}%` }}
                  transition={{ duration: 1 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                />
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {stats.life_score % 500} / 500 XP to level {currentRoomLevel + 1}
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-semibold text-slate-900">Room Features:</p>
              <ul className="text-xs text-slate-600 space-y-1">
                <li>📚 Bookshelf fills with every book you read</li>
                <li>🏆 Trophies appear as you complete goals</li>
                <li>🔥 Streak banner appears at 7+ days</li>
                <li>💰 Savings meter grows with every rupee saved</li>
                <li>⭐ Room upgrades at every 500 XP milestone</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
