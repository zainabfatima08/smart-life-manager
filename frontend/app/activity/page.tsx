'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  History,
  LogIn,
  LogOut,
  Lock,
  Mail,
  Settings,
  Zap,
  AlertCircle,
  Loader,
  Clock
} from 'lucide-react';

interface ActivityRecord {
  id: string;
  activity_type: string;
  description: string;
  device_name: string;
  ip_address: string;
  created_at: string;
}

const activityTypeConfig = {
  login: { icon: LogIn, label: 'Login', color: 'from-green-500 to-emerald-600' },
  logout: { icon: LogOut, label: 'Logout', color: 'from-slate-500 to-slate-600' },
  password_change: { icon: Lock, label: 'Password Changed', color: 'from-orange-500 to-red-600' },
  email_change: { icon: Mail, label: 'Email Changed', color: 'from-blue-500 to-cyan-600' },
  device_login: { icon: Zap, label: 'Device Login', color: 'from-purple-500 to-indigo-600' },
  profile_update: { icon: Settings, label: 'Profile Updated', color: 'from-pink-500 to-rose-600' },
  settings_change: { icon: Settings, label: 'Settings Changed', color: 'from-yellow-500 to-orange-600' }
};

export default function ActivityPage() {
  const [activities, setActivities] = useState<ActivityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch('/api/accounts/account-activities/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch activities');

      const data = await res.json();
      setActivities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activities');
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

  if (error) {
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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-blue-100/30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-indigo-100/30 blur-3xl" />
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <History className="mx-auto mb-4 h-12 w-12 text-blue-600" />
          <h1 className="mb-2 text-4xl font-bold text-slate-900">Activity History</h1>
          <p className="text-slate-600">Your recent account activities</p>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="relative"
        >
          {/* Vertical line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 to-indigo-400" />

          {/* Activities */}
          <div className="space-y-6">
            {activities.length > 0 ? (
              activities.map((activity, index) => {
                const config =
                  activityTypeConfig[activity.activity_type as keyof typeof activityTypeConfig] ||
                  activityTypeConfig.settings_change;

                const Icon = config.icon;
                const date = new Date(activity.created_at);
                const timeAgo = getTimeAgo(date);

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative"
                  >
                    {/* Timeline dot */}
                    <motion.div
                      className={`absolute left-0 top-2 h-16 w-16 rounded-full bg-gradient-to-br ${config.color} shadow-lg flex items-center justify-center text-white`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.05 + 0.1 }}
                    >
                      <Icon className="h-7 w-7" />
                    </motion.div>

                    {/* Content */}
                    <div className="ml-32 rounded-2xl bg-white p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-slate-900">
                            {config.label}
                          </h3>
                          {activity.description && (
                            <p className="text-sm text-slate-600 mt-1">
                              {activity.description}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-slate-500">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm">{timeAgo}</span>
                        </div>
                      </div>

                      {/* Device & IP Info */}
                      <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                        {activity.device_name && (
                          <div>
                            <span className="font-semibold text-slate-700">Device:</span> {activity.device_name}
                          </div>
                        )}
                        {activity.ip_address && (
                          <div>
                            <span className="font-semibold text-slate-700">IP:</span> {activity.ip_address}
                          </div>
                        )}
                      </div>

                      {/* Date & Time */}
                      <p className="text-xs text-slate-400 mt-3">
                        {date.toLocaleDateString()} at {date.toLocaleTimeString()}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-slate-600">No activities recorded yet</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </main>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}
