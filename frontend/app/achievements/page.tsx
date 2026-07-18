'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Trophy,
  Star,
  Zap,
  Target,
  BookOpen,
  PiggyBank,
  AlertCircle,
  Loader,
  Filter
} from 'lucide-react';

interface Achievement {
  id: string;
  badge_name: string;
  description: string;
  icon_name: string;
  achievement_type: string;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

type AchievementCategory = 'all' | 'habit' | 'mood' | 'sleep' | 'focus' | 'reading' | 'expense' | 'journal' | 'goal';

const categories: Array<{ id: AchievementCategory; label: string; icon: any }> = [
  { id: 'all', label: 'All Achievements', icon: Trophy },
  { id: 'habit', label: 'Habits', icon: Target },
  { id: 'focus', label: 'Focus', icon: Zap },
  { id: 'reading', label: 'Reading', icon: BookOpen },
  { id: 'expense', label: 'Spending', icon: PiggyBank }
];

const achievementDefinitions: Array<Achievement & { rarity: 'common' | 'rare' | 'epic' | 'legendary' }> = [
  {
    id: '1',
    badge_name: 'First Step',
    description: 'Complete your first habit',
    icon_name: '👣',
    achievement_type: 'habit',
    is_unlocked: false,
    unlocked_at: null,
    rarity: 'common'
  },
  {
    id: '2',
    badge_name: 'On Fire',
    description: 'Maintain a 7-day habit streak',
    icon_name: '🔥',
    achievement_type: 'habit',
    is_unlocked: false,
    unlocked_at: null,
    rarity: 'rare'
  },
  {
    id: '3',
    badge_name: 'Unstoppable',
    description: 'Reach a 30-day habit streak',
    icon_name: '💪',
    achievement_type: 'habit',
    is_unlocked: false,
    unlocked_at: null,
    rarity: 'epic'
  },
  {
    id: '4',
    badge_name: 'Bookworm',
    description: 'Read 5 books',
    icon_name: '📚',
    achievement_type: 'reading',
    is_unlocked: false,
    unlocked_at: null,
    rarity: 'rare'
  },
  {
    id: '5',
    badge_name: 'Reading Master',
    description: 'Read 25 books',
    icon_name: '📖',
    achievement_type: 'reading',
    is_unlocked: false,
    unlocked_at: null,
    rarity: 'legendary'
  },
  {
    id: '6',
    badge_name: 'Focused Mind',
    description: 'Complete 10 focus sessions',
    icon_name: '🎯',
    achievement_type: 'focus',
    is_unlocked: false,
    unlocked_at: null,
    rarity: 'common'
  },
  {
    id: '7',
    badge_name: 'Productive Day',
    description: 'Complete 50 focus hours',
    icon_name: '⚡',
    achievement_type: 'focus',
    is_unlocked: false,
    unlocked_at: null,
    rarity: 'epic'
  },
  {
    id: '8',
    badge_name: 'Saver',
    description: 'Save Rs 10,000 in a month',
    icon_name: '💰',
    achievement_type: 'expense',
    is_unlocked: false,
    unlocked_at: null,
    rarity: 'rare'
  }
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(achievementDefinitions);
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch('/api/accounts/achievements/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch achievements');

      const data = await res.json();
      setAchievements(data);
    } catch (err) {
      // Use default achievements if API fails
      console.log('Using default achievements');
    } finally {
      setLoading(false);
    }
  };

  const filteredAchievements =
    selectedCategory === 'all'
      ? achievements
      : achievements.filter((a) => a.achievement_type === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.is_unlocked).length;
  const totalCount = achievements.length;
  const completionPercent = Math.round((unlockedCount / totalCount) * 100);

  const rarityColors = {
    common: 'from-slate-400 to-slate-600',
    rare: 'from-blue-400 to-indigo-600',
    epic: 'from-purple-400 to-pink-600',
    legendary: 'from-yellow-400 to-orange-600'
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
          <Trophy className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Achievements</h1>
          <p className="text-slate-600">Unlock badges and celebrate your progress</p>
        </motion.div>

        {/* Completion Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8 rounded-2xl bg-white p-8 shadow-lg border border-slate-200"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-slate-600 mb-2">Achievement Progress</p>
              <p className="text-3xl font-bold text-slate-900">
                {unlockedCount} / {totalCount}
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                {completionPercent}%
              </p>
            </div>
          </div>
          <div className="h-4 w-full rounded-full bg-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercent}%` }}
              transition={{ duration: 1 }}
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
            />
          </div>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <p className="text-sm font-semibold text-slate-900">Filter</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center gap-2 rounded-full px-4 py-2 transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-900 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {category.label}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Achievements Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {filteredAchievements.map((achievement, index) => {
            const rarity = achievementDefinitions.find(
              (a) => a.badge_name === achievement.badge_name
            )?.rarity || 'common';

            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`relative rounded-2xl p-6 border transition-all overflow-hidden ${
                  achievement.is_unlocked
                    ? `border-transparent bg-gradient-to-br ${rarityColors[rarity]} text-white shadow-lg`
                    : 'border-slate-200 bg-white text-slate-900 shadow-md'
                }`}
              >
                {/* Background decoration for unlocked */}
                {achievement.is_unlocked && (
                  <div className="absolute top-0 right-0 h-20 w-20 opacity-10">
                    <Star className="h-full w-full" />
                  </div>
                )}

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="mb-4 text-5xl">{achievement.icon_name}</div>

                  {/* Content */}
                  <h3 className="mb-2 text-lg font-bold">{achievement.badge_name}</h3>
                  <p
                    className={`mb-4 text-sm ${
                      achievement.is_unlocked ? 'opacity-90' : 'text-slate-600'
                    }`}
                  >
                    {achievement.description}
                  </p>

                  {/* Status */}
                  {achievement.is_unlocked && achievement.unlocked_at && (
                    <p className="text-xs opacity-75">
                      Unlocked {new Date(achievement.unlocked_at).toLocaleDateString()}
                    </p>
                  )}

                  {!achievement.is_unlocked && (
                    <p className="text-xs font-medium">Locked</p>
                  )}

                  {/* Rarity Badge */}
                  <div className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-semibold">
                    {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {filteredAchievements.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <p className="text-slate-600">No achievements in this category yet</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
