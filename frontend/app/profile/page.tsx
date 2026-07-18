'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Calendar, 
  Edit2, 
  Camera,
  AlertCircle,
  Loader
} from 'lucide-react';

interface UserProfile {
  user_id: string;
  display_name: string;
  username: string;
  bio: string;
  avatar_url: string;
  banner_url: string;
  email: string;
  country: string;
  timezone: string;
  preferred_language: string;
  created_at: string;
  profile_completion_percent: number;
}

interface ProfileStats {
  life_score: number;
  current_habit_streak: number;
  total_habits_completed: number;
  focus_hours: number;
  books_read: number;
  journal_entries: number;
  goals_completed: number;
  monthly_savings: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      // Fetch profile
      const profileRes = await fetch('/api/accounts/profile-detail/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!profileRes.ok) throw new Error('Failed to fetch profile');
      const profileData = await profileRes.json();
      setProfile(profileData);
      setFormData(profileData);

      // Fetch statistics
      const statsRes = await fetch('/api/accounts/profile-statistics/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (statsRes.ok) {
        const statsData = await statsRes.json();
        setStats(statsData);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch('/api/accounts/profile-detail/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to update profile');
      
      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center py-20"
          >
            <Loader className="h-8 w-8 animate-spin text-blue-600" />
          </motion.div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center"
          >
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-600" />
            <p className="text-lg text-red-900">{error}</p>
          </motion.div>
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

      <div className="mx-auto max-w-4xl px-6 py-8 relative z-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          {/* Banner */}
          <div className="relative mb-20">
            <div
              className="h-48 rounded-3xl bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg"
              style={{
                backgroundImage: profile.banner_url ? `url(${profile.banner_url})` : undefined,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />

            {/* Avatar */}
            <motion.div
              initial={{ scale: 0.8, y: 40 }}
              animate={{ scale: 1, y: 0 }}
              className="absolute -bottom-12 left-8"
            >
              <div className="relative">
                <div className="h-32 w-32 rounded-3xl border-4 border-white bg-slate-200 shadow-lg flex items-center justify-center overflow-hidden">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.display_name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-16 w-16 text-slate-400" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 rounded-full bg-blue-600 p-3 text-white hover:bg-blue-700 shadow-lg">
                    <Camera className="h-5 w-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>

          {/* Profile Info Header */}
          <div className="ml-40 mb-6">
            <div className="flex items-start justify-between">
              <div>
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.display_name || ''}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    className="mb-2 block text-3xl font-bold text-slate-900 border-b-2 border-blue-500 outline-none"
                  />
                ) : (
                  <h1 className="mb-2 text-3xl font-bold text-slate-900">
                    {profile.display_name}
                  </h1>
                )}

                <div className="flex flex-wrap items-center gap-4 text-slate-600">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username || ''}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="@username"
                      className="border-b border-slate-300 outline-none"
                    />
                  ) : (
                    <span className="text-sm">@{profile.username}</span>
                  )}

                  <span className="text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <motion.button
                onClick={() => {
                  if (isEditing) {
                    handleSaveProfile();
                  } else {
                    setIsEditing(true);
                  }
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-white hover:from-blue-700 hover:to-indigo-700"
              >
                <Edit2 className="h-4 w-4" />
                {isEditing ? 'Save' : 'Edit'}
              </motion.button>
            </div>
          </div>

          {/* Profile Completion */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">Profile Completion</h3>
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-600">
                {profile.profile_completion_percent}% Complete
              </span>
              <span className="text-sm text-slate-500">Almost there!</span>
            </div>
            <div className="h-3 w-full rounded-full bg-slate-200">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${profile.profile_completion_percent}%` }}
                transition={{ duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              />
            </div>
          </div>

          {/* Bio Section */}
          <div className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-slate-200">
            <h3 className="mb-4 text-lg font-semibold text-slate-900">About</h3>
            {isEditing ? (
              <textarea
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-blue-500"
                rows={4}
              />
            ) : (
              <p className="text-slate-600">
                {profile.bio || 'No bio yet. Tell us about yourself!'}
              </p>
            )}
          </div>
        </motion.div>

        {/* Statistics Grid */}
        {stats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-12"
          >
            <h2 className="mb-6 text-2xl font-bold text-slate-900">Your Statistics</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {[
                { label: 'Life Score', value: stats.life_score, suffix: '' },
                { label: 'Current Streak', value: stats.current_habit_streak, suffix: ' days' },
                { label: 'Habits Completed', value: stats.total_habits_completed, suffix: '' },
                { label: 'Focus Hours', value: Math.round(stats.focus_hours), suffix: ' h' },
                { label: 'Books Read', value: stats.books_read, suffix: '' },
                { label: 'Journal Entries', value: stats.journal_entries, suffix: '' },
                { label: 'Goals Completed', value: stats.goals_completed, suffix: '' },
                { label: 'Monthly Savings', value: `Rs ${Math.round(stats.monthly_savings)}`, suffix: '' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-2xl bg-white p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
                >
                  <p className="text-sm text-slate-600 mb-2">{stat.label}</p>
                  <p className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                    {typeof stat.value === 'number' ? stat.value : stat.value}{stat.suffix}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Profile Details */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200"
        >
          <h2 className="mb-8 text-2xl font-bold text-slate-900">Profile Details</h2>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <Mail className="h-4 w-4" />
                Email Address
              </label>
              <p className="text-slate-900">{profile.email}</p>
            </div>

            {/* Country */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <MapPin className="h-4 w-4" />
                Country
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.country || ''}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-slate-900">{profile.country || 'Not specified'}</p>
              )}
            </div>

            {/* Timezone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-600 mb-2">
                <Globe className="h-4 w-4" />
                Timezone
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.timezone || ''}
                  onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-slate-900">{profile.timezone}</p>
              )}
            </div>

            {/* Language */}
            <div>
              <label className="text-sm font-semibold text-slate-600 mb-2 block">
                Preferred Language
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.preferred_language || ''}
                  onChange={(e) => setFormData({ ...formData, preferred_language: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2 outline-none focus:border-blue-500"
                />
              ) : (
                <p className="text-slate-900">{profile.preferred_language}</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
