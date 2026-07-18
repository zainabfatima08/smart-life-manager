'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Bell, Save, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { notificationService, NotificationPreference } from '@/lib/notifications';

export function NotificationSettings() {
  const [preferences, setPreferences] = useState<NotificationPreference | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await notificationService.getPreferences();
        setPreferences(prefs);
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load notification settings' });
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  // Handle toggle
  const handleToggle = (key: keyof NotificationPreference) => {
    if (!preferences) return;
    setPreferences({
      ...preferences,
      [key]: !preferences[key],
    });
  };

  // Save preferences
  const handleSave = async () => {
    if (!preferences) return;

    setSaving(true);
    try {
      await notificationService.updatePreferences(preferences);
      setMessage({ type: 'success', text: 'Notification settings saved!' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save notification settings' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  if (!preferences) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        Failed to load notification preferences
      </div>
    );
  }

  const sections = [
    {
      title: 'Reminder Notifications',
      description: 'Get reminders to maintain your habits and goals',
      items: [
        { key: 'habit_reminders' as const, label: 'Habit Reminders', description: 'Remind me to complete habits' },
        { key: 'goal_reminders' as const, label: 'Goal Reminders', description: 'Check in on my goals' },
        { key: 'mood_reminders' as const, label: 'Mood Check-in', description: 'Log my mood regularly' },
        { key: 'sleep_reminders' as const, label: 'Sleep Reminders', description: 'Track sleep patterns' },
        { key: 'focus_reminders' as const, label: 'Focus Sessions', description: 'Start focus sessions' },
        { key: 'reading_reminders' as const, label: 'Reading Reminders', description: 'Continue reading' },
        { key: 'expense_reminders' as const, label: 'Expense Logging', description: 'Log daily expenses' },
        { key: 'study_reminders' as const, label: 'Study Reminders', description: 'Study session reminders' },
      ],
    },
    {
      title: 'Summary & Reports',
      description: 'Get insights and summaries about your life',
      items: [
        { key: 'ai_motivation_messages' as const, label: 'AI Motivation', description: 'Personalized motivation from AI' },
        { key: 'weekly_reports' as const, label: 'Weekly Reports', description: 'Summary of your week' },
        { key: 'monthly_replay' as const, label: 'Monthly Replay', description: 'Monthly life highlights' },
      ],
    },
    {
      title: 'Delivery Preferences',
      description: 'Choose how you want to receive notifications',
      items: [
        { key: 'browser_notifications' as const, label: 'Browser Notifications', description: 'In-app bell notifications' },
        { key: 'email_notifications' as const, label: 'Email Notifications', description: 'Receive notifications via email' },
      ],
    },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-slate-900">Notification Settings</h1>
        </div>
        <p className="text-slate-600">Customize how and when you receive notifications</p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className={`mb-6 flex items-center gap-3 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </motion.div>
      )}

      {/* Settings Sections */}
      <div className="space-y-6">
        {sections.map((section, sectionIdx) => (
          <motion.div
            key={sectionIdx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIdx * 0.1 }}
            className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm"
          >
            {/* Section Header */}
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">{section.title}</h2>
              <p className="text-sm text-slate-600 mt-1">{section.description}</p>
            </div>

            {/* Settings Items */}
            <div className="divide-y divide-slate-200">
              {section.items.map((item, itemIdx) => (
                <div
                  key={itemIdx}
                  className="flex items-center justify-between p-4 hover:bg-slate-50 transition"
                >
                  <div className="flex-1">
                    <label className="block font-medium text-slate-900 cursor-pointer">
                      {item.label}
                    </label>
                    <p className="text-sm text-slate-600 mt-0.5">{item.description}</p>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    onClick={() => handleToggle(item.key)}
                    className={`ml-4 flex-shrink-0 relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      preferences[item.key]
                        ? 'bg-indigo-600'
                        : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={preferences[item.key]}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        preferences[item.key] ? 'translate-x-5' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Save Button */}
      <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        onClick={handleSave}
        disabled={saving}
        className="mt-8 w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
      >
        {saving ? (
          <>
            <Loader className="w-5 h-5 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="w-5 h-5" />
            Save Settings
          </>
        )}
      </motion.button>
    </div>
  );
}
