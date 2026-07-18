'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Palette,
  Bell,
  Settings,
  Lock,
  Eye,
  Accessibility,
  Menu,
  AlertCircle,
  Loader,
  Check
} from 'lucide-react';

type SettingTab = 'appearance' | 'notifications' | 'companion' | 'security' | 'privacy' | 'accessibility';

interface Settings {
  theme: 'light' | 'dark' | 'system';
  accent_color: string;
  animations_enabled: boolean;
  dashboard_layout: string;
  email_notifications: boolean;
  browser_notifications: boolean;
  habit_reminders: boolean;
  goal_reminders: boolean;
  reading_reminders: boolean;
  budget_alerts: boolean;
  selected_companion: string;
  companion_speech_bubbles: boolean;
  companion_sound_effects: boolean;
  font_size: string;
  reduced_motion: boolean;
  high_contrast: boolean;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingTab>('appearance');
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('access_token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch('/api/accounts/profile-detail/', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to fetch settings');

      const data = await res.json();
      setSettings({
        theme: data.theme,
        accent_color: data.accent_color,
        animations_enabled: data.animations_enabled,
        dashboard_layout: data.dashboard_layout,
        email_notifications: data.email_notifications,
        browser_notifications: data.browser_notifications,
        habit_reminders: data.habit_reminders,
        goal_reminders: data.goal_reminders,
        reading_reminders: data.reading_reminders,
        budget_alerts: data.budget_alerts,
        selected_companion: data.selected_companion,
        companion_speech_bubbles: data.companion_speech_bubbles,
        companion_sound_effects: data.companion_sound_effects,
        font_size: data.font_size,
        reduced_motion: data.reduced_motion,
        high_contrast: data.high_contrast
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) return;

      const res = await fetch('/api/accounts/profile-detail/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!res.ok) throw new Error('Failed to save settings');

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    }
  };

  const updateSetting = (key: keyof Settings, value: any) => {
    if (settings) {
      setSettings({ ...settings, [key]: value });
    }
  };

  const tabs: Array<{ id: SettingTab; label: string; icon: any }> = [
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'companion', label: 'Companion', icon: Settings },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'privacy', label: 'Privacy', icon: Eye },
    { id: 'accessibility', label: 'Accessibility', icon: Accessibility }
  ];

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="flex items-center justify-center py-20">
          <Loader className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </main>
    );
  }

  if (error || !settings) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6">
        <div className="mx-auto max-w-4xl">
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

      <div className="mx-auto max-w-7xl px-6 py-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900">Settings</h1>
          <p className="mt-2 text-slate-600">Customize your experience</p>
        </motion.div>

        {/* Saved Notification */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 flex items-center gap-3 rounded-lg bg-green-50 px-4 py-3 border border-green-200"
            >
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Settings saved successfully</span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 md:grid-cols-5">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-2"
          >
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-3 rounded-lg px-4 py-3 text-left transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-100 text-blue-900 border-l-4 border-blue-600'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{tab.label}</span>
                </motion.button>
              );
            })}
          </motion.div>

          {/* Content */}
          <div className="md:col-span-4">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl bg-white p-8 shadow-lg border border-slate-200"
            >
              {/* Appearance Settings */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Appearance</h2>

                  {/* Theme */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-4">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['light', 'dark', 'system'].map((theme) => (
                        <motion.button
                          key={theme}
                          onClick={() => updateSetting('theme', theme as any)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`rounded-lg px-4 py-3 font-medium transition-all ${
                            settings.theme === theme
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {theme.charAt(0).toUpperCase() + theme.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-4">
                      Accent Color
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {['blue', 'indigo', 'purple', 'pink', 'green'].map((color) => (
                        <motion.button
                          key={color}
                          onClick={() => updateSetting('accent_color', color)}
                          whileHover={{ scale: 1.1 }}
                          className={`h-10 w-full rounded-lg transition-all ${
                            settings.accent_color === color
                              ? 'ring-2 ring-offset-2 ring-slate-900'
                              : ''
                          }`}
                          style={{
                            backgroundColor: {
                              blue: '#3b82f6',
                              indigo: '#6366f1',
                              purple: '#a855f7',
                              pink: '#ec4899',
                              green: '#10b981'
                            }[color]
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Dashboard Layout */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-4">
                      Dashboard Layout
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {['grid', 'compact'].map((layout) => (
                        <motion.button
                          key={layout}
                          onClick={() => updateSetting('dashboard_layout', layout)}
                          className={`rounded-lg px-4 py-3 font-medium transition-all ${
                            settings.dashboard_layout === layout
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {layout.charAt(0).toUpperCase() + layout.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Animations */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-900">
                      Enable Animations
                    </label>
                    <motion.button
                      onClick={() => updateSetting('animations_enabled', !settings.animations_enabled)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        settings.animations_enabled ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.animations_enabled ? 20 : 2 }}
                        className="h-5 w-5 rounded-full bg-white"
                      />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Notifications Settings */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Notifications</h2>

                  {[
                    { key: 'email_notifications' as const, label: 'Email Notifications' },
                    { key: 'browser_notifications' as const, label: 'Browser Notifications' },
                    { key: 'habit_reminders' as const, label: 'Habit Reminders' },
                    { key: 'goal_reminders' as const, label: 'Goal Reminders' },
                    { key: 'reading_reminders' as const, label: 'Reading Reminders' },
                    { key: 'budget_alerts' as const, label: 'Budget Alerts' }
                  ].map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-900">{label}</label>
                      <motion.button
                        onClick={() => updateSetting(key, !settings[key])}
                        className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                          settings[key] ? 'bg-blue-600' : 'bg-slate-300'
                        }`}
                      >
                        <motion.div
                          animate={{ x: settings[key] ? 20 : 2 }}
                          className="h-5 w-5 rounded-full bg-white"
                        />
                      </motion.button>
                    </div>
                  ))}
                </div>
              )}

              {/* Companion Settings */}
              {activeTab === 'companion' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Companion Settings</h2>

                  {/* Companion Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-4">
                      Select Companion
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['astro', 'nova', 'ember'].map((companion) => (
                        <motion.button
                          key={companion}
                          onClick={() => updateSetting('selected_companion', companion)}
                          className={`rounded-lg px-4 py-3 font-medium transition-all ${
                            settings.selected_companion === companion
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {companion.charAt(0).toUpperCase() + companion.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Speech Bubbles */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-900">
                      Show Speech Bubbles
                    </label>
                    <motion.button
                      onClick={() => updateSetting('companion_speech_bubbles', !settings.companion_speech_bubbles)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        settings.companion_speech_bubbles ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.companion_speech_bubbles ? 20 : 2 }}
                        className="h-5 w-5 rounded-full bg-white"
                      />
                    </motion.button>
                  </div>

                  {/* Sound Effects */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-900">
                      Sound Effects
                    </label>
                    <motion.button
                      onClick={() => updateSetting('companion_sound_effects', !settings.companion_sound_effects)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        settings.companion_sound_effects ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.companion_sound_effects ? 20 : 2 }}
                        className="h-5 w-5 rounded-full bg-white"
                      />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Security Settings */}
              {activeTab === 'security' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Security</h2>
                  <div className="rounded-lg bg-slate-100 p-4">
                    <p className="text-sm text-slate-600">Security settings coming soon. Change password and enable 2FA here.</p>
                  </div>
                </div>
              )}

              {/* Privacy Settings */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Privacy</h2>
                  <div className="rounded-lg bg-slate-100 p-4">
                    <p className="text-sm text-slate-600">Privacy settings coming soon. Export data and manage profile visibility here.</p>
                  </div>
                </div>
              )}

              {/* Accessibility Settings */}
              {activeTab === 'accessibility' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Accessibility</h2>

                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-4">
                      Font Size
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {['small', 'normal', 'large'].map((size) => (
                        <motion.button
                          key={size}
                          onClick={() => updateSetting('font_size', size)}
                          className={`rounded-lg px-4 py-3 font-medium transition-all ${
                            settings.font_size === size
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                          }`}
                        >
                          {size.charAt(0).toUpperCase() + size.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Reduced Motion */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-900">
                      Reduce Motion
                    </label>
                    <motion.button
                      onClick={() => updateSetting('reduced_motion', !settings.reduced_motion)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        settings.reduced_motion ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.reduced_motion ? 20 : 2 }}
                        className="h-5 w-5 rounded-full bg-white"
                      />
                    </motion.button>
                  </div>

                  {/* High Contrast */}
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold text-slate-900">
                      High Contrast Mode
                    </label>
                    <motion.button
                      onClick={() => updateSetting('high_contrast', !settings.high_contrast)}
                      className={`relative inline-flex h-6 w-11 rounded-full transition-colors ${
                        settings.high_contrast ? 'bg-blue-600' : 'bg-slate-300'
                      }`}
                    >
                      <motion.div
                        animate={{ x: settings.high_contrast ? 20 : 2 }}
                        className="h-5 w-5 rounded-full bg-white"
                      />
                    </motion.button>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <motion.button
                onClick={saveSettings}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 w-full rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 font-semibold text-white hover:from-blue-700 hover:to-indigo-700"
              >
                Save Settings
              </motion.button>
            </motion.div>
          </div>
        </div>
      </div>
    </main>
  );
}
