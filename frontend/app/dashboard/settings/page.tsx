'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bell, Lock, Shield, Palette, Globe, Volume2, Eye, Moon, Sun,
  Save, LogOut, Trash2, Download, Upload, Check, AlertCircle, Settings, X, Copy, CheckCircle
} from 'lucide-react';

type Theme = 'light' | 'dark' | 'system';
type NotificationSetting = 'all' | 'important' | 'none';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('account');
  const [theme, setTheme] = useState<Theme>('light');
  const [notifications, setNotifications] = useState<NotificationSetting>('all');
  const [autoSync, setAutoSync] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [privacy, setPrivacy] = useState('private');
  const [saved, setSaved] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [showTwoFAModal, setShowTwoFAModal] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [twoFAStep, setTwoFAStep] = useState<'setup' | 'verify' | 'backup'>('setup');

  useEffect(() => {
    setMounted(true);
    const savedTheme = localStorage.getItem('theme') as Theme || 'light';
    const savedNotifs = localStorage.getItem('notifications') as NotificationSetting || 'all';
    const is2FAEnabled = localStorage.getItem('twofa_enabled') === 'true';
    setTheme(savedTheme);
    setNotifications(savedNotifs);
    setTwoFAEnabled(is2FAEnabled);
    applyTheme(savedTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    const html = document.documentElement;
    const body = document.body;

    // Clear all inline styles first
    html.style.cssText = '';
    body.style.cssText = '';
    html.className = '';

    if (newTheme === 'dark') {
      html.classList.add('dark', 'scroll-smooth');
      html.style.backgroundColor = '#0f172a';
      html.style.color = '#ffffff';
      body.style.backgroundColor = '#0f172a';
      body.style.color = '#ffffff';
      body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else if (newTheme === 'light') {
      html.classList.add('scroll-smooth');
      html.style.backgroundColor = '#ffffff';
      html.style.color = '#000000';
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#000000';
      body.style.transition = 'background-color 0.3s ease, color 0.3s ease';
    } else {
      // System preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark', 'scroll-smooth');
        html.style.backgroundColor = '#0f172a';
        html.style.color = '#ffffff';
        body.style.backgroundColor = '#0f172a';
        body.style.color = '#ffffff';
      } else {
        html.classList.add('scroll-smooth');
        html.style.backgroundColor = '#ffffff';
        html.style.color = '#000000';
        body.style.backgroundColor = '#ffffff';
        body.style.color = '#000000';
      }
    }
  };

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const handleSave = () => {
    localStorage.setItem('theme', theme);
    localStorage.setItem('notifications', notifications);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const generateQRCode = () => {
    // Generate a simple secret key (in production, use proper 2FA library)
    const randomSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setSecret(randomSecret);
    // In production, generate actual QR code using a library like qrcode.react
    setQrCode(`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23fff' width='200' height='200'/%3E%3Ctext x='50' y='100' font-size='14'%3E${randomSecret}%3C/text%3E%3C/svg%3E`);
    setTwoFAStep('verify');
  };

  const handleTwoFASetup = () => {
    if (twoFAEnabled) {
      // Disable 2FA
      setTwoFAEnabled(false);
      localStorage.setItem('twofa_enabled', 'false');
      setShowTwoFAModal(false);
    } else {
      // Enable 2FA - show setup process
      setShowTwoFAModal(true);
      setTwoFAStep('setup');
      setVerificationCode('');
    }
  };

  const handleVerify2FA = () => {
    if (verificationCode.length === 6) {
      // In production, verify with backend
      const codes = Array.from({ length: 10 }, () => Math.random().toString(36).substring(2, 10).toUpperCase());
      setBackupCodes(codes);
      setTwoFAStep('backup');
    }
  };

  const handleConfirm2FA = () => {
    setTwoFAEnabled(true);
    localStorage.setItem('twofa_enabled', 'true');
    localStorage.setItem('twofa_secret', secret || '');
    setShowTwoFAModal(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDeleteAccount = async () => {
    if (confirm('Are you sure? This action cannot be undone.')) {
      setDeleting(true);
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/';
      }, 1000);
    }
  };

  const handleExportData = () => {
    const data = {
      settings: {
        theme,
        notifications,
        autoSync,
        emailNotifs,
        pushNotifs,
        privacy
      },
      exportedAt: new Date().toISOString()
    };
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)));
    element.setAttribute('download', `lifeos-backup-${Date.now()}.json`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const tabs = [
    { id: 'account', label: 'Account', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy & Security', icon: Shield },
    { id: 'data', label: 'Data & Storage', icon: Download },
  ];

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
            <Settings className="w-8 h-8 text-blue-600" />
            Settings
          </h1>
          <p className="mt-2 text-slate-600">Customize your Life OS experience</p>
        </motion.div>

        {/* Success Message */}
        {saved && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-green-700"
          >
            <Check className="w-5 h-5" />
            <span className="font-medium">Settings saved successfully!</span>
          </motion.div>
        )}

        <div className="grid grid-cols-12 gap-6">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-12 lg:col-span-3"
          >
            <div className="rounded-xl bg-slate-50 border border-slate-200 overflow-hidden">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-4 text-left font-medium transition ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white border-l-4 border-blue-600'
                        : 'text-slate-700 hover:bg-white border-l-4 border-transparent'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-12 lg:col-span-9"
          >
            <div className="rounded-xl bg-white border border-slate-200 p-8">
              {/* Account Settings */}
              {activeTab === 'account' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Account Settings</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        defaultValue={localStorage.getItem('userEmail') || 'user@example.com'}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Display Name</label>
                      <input
                        type="text"
                        defaultValue={localStorage.getItem('userName') || 'User'}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2">Change Password</label>
                      <input
                        type="password"
                        placeholder="Current password"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                      />
                      <input
                        type="password"
                        placeholder="New password"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                      />
                      <input
                        type="password"
                        placeholder="Confirm new password"
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>

                    <div className="pt-4 flex gap-3">
                      <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        Save Changes
                      </button>
                      <button className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>

                    <div className="pt-6 border-t border-slate-200">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={deleting}
                        className="px-6 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition flex items-center gap-2"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deleting ? 'Deleting...' : 'Delete Account'}
                      </button>
                      <p className="mt-2 text-xs text-slate-500">This action cannot be undone</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {activeTab === 'notifications' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Notification Preferences</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Bell className="w-5 h-5 text-blue-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Email Notifications</p>
                            <p className="text-sm text-slate-600">Receive updates via email</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={emailNotifs}
                          onChange={(e) => setEmailNotifs(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600"
                        />
                      </label>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Volume2 className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Push Notifications</p>
                            <p className="text-sm text-slate-600">Receive browser notifications</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={pushNotifs}
                          onChange={(e) => setPushNotifs(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300 text-blue-600"
                        />
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Notification Level</label>
                      <div className="space-y-2">
                        {['all', 'important', 'none'].map((level) => (
                          <label key={level} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                            <input
                              type="radio"
                              name="notificationLevel"
                              value={level}
                              checked={notifications === level as NotificationSetting}
                              onChange={(e) => setNotifications(e.target.value as NotificationSetting)}
                              className="w-4 h-4 text-blue-600"
                            />
                            <span className="font-medium text-slate-700 capitalize">{level === 'all' ? 'All notifications' : level === 'important' ? 'Important only' : 'No notifications'}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Appearance</h2>
                  
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Theme</label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { id: 'light' as Theme, label: 'Light', icon: Sun, color: 'bg-yellow-100' },
                        { id: 'dark' as Theme, label: 'Dark', icon: Moon, color: 'bg-slate-800' },
                        { id: 'system' as Theme, label: 'System', icon: Globe, color: 'bg-gradient-to-r from-yellow-100 to-slate-800' },
                      ].map((t) => {
                        const Icon = t.icon;
                        return (
                          <motion.button
                            key={t.id}
                            onClick={() => handleThemeChange(t.id)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className={`p-4 rounded-lg border-2 transition ${
                              theme === t.id
                                ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-600'
                                : 'border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-full h-12 rounded-md mb-2 ${t.color} flex items-center justify-center`}>
                              <Icon className="w-6 h-6 text-slate-600" />
                            </div>
                            <p className="font-semibold text-slate-900">{t.label}</p>
                            {theme === t.id && <Check className="w-5 h-5 text-blue-600 mt-2" />}
                          </motion.button>
                        );
                      })}
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      Current theme: <span className="font-semibold capitalize">{theme}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <label className="flex items-center justify-between cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Eye className="w-5 h-5 text-purple-600" />
                        <div>
                          <p className="font-semibold text-slate-900">Reduce Motion</p>
                          <p className="text-sm text-slate-600">Minimize animations and transitions</p>
                        </div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-slate-300" />
                    </label>
                  </div>

                  <button
                    onClick={handleSave}
                    className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save Appearance Settings
                  </button>
                </div>
              )}

              {/* Privacy & Security */}
              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Privacy & Security</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">Profile Visibility</label>
                      <select
                        value={privacy}
                        onChange={(e) => setPrivacy(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="private">Private (Only me)</option>
                        <option value="friends">Friends Only</option>
                        <option value="public">Public</option>
                      </select>
                    </div>

                    {/* 2FA Section */}
                    <div className={`p-4 rounded-lg border-2 transition ${twoFAEnabled ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Lock className="w-5 h-5 text-red-600" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-slate-900">Two-Factor Authentication</p>
                              {twoFAEnabled && <CheckCircle className="w-4 h-4 text-green-600" />}
                            </div>
                            <p className="text-sm text-slate-600">
                              {twoFAEnabled ? 'Enabled - Your account is protected' : 'Add an extra layer of security'}
                            </p>
                          </div>
                        </div>
                        <motion.button
                          onClick={handleTwoFASetup}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`px-4 py-2 rounded-lg font-semibold transition ${
                            twoFAEnabled
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          {twoFAEnabled ? 'Disable 2FA' : 'Enable 2FA'}
                        </motion.button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Shield className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-semibold text-slate-900">Data Sharing</p>
                            <p className="text-sm text-slate-600">Help improve Life OS by sharing anonymous data</p>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          checked={dataSharing}
                          onChange={(e) => setDataSharing(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* 2FA Setup Modal */}
              {showTwoFAModal && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
                  onClick={() => setShowTwoFAModal(false)}
                >
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
                  >
                    {/* Setup Step */}
                    {twoFAStep === 'setup' && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-slate-900">Enable 2-Factor Authentication</h3>
                          <motion.button
                            onClick={() => setShowTwoFAModal(false)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className="w-5 h-5 text-slate-500" />
                          </motion.button>
                        </div>
                        <p className="text-sm text-slate-600">Scan this QR code with your authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.)</p>
                        <div className="bg-slate-100 p-4 rounded-lg flex justify-center">
                          <div className="w-40 h-40 bg-white border-2 border-slate-300 rounded flex items-center justify-center">
                            <Lock className="w-12 h-12 text-slate-300" />
                          </div>
                        </div>
                        <div className="bg-slate-50 p-3 rounded border border-slate-200">
                          <p className="text-xs text-slate-600 mb-1">Secret Key (save this if you can't scan):</p>
                          <p className="font-mono text-sm text-slate-900 break-all">{secret}</p>
                        </div>
                        <motion.button
                          onClick={generateQRCode}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
                        >
                          Continue to Verification
                        </motion.button>
                      </div>
                    )}

                    {/* Verification Step */}
                    {twoFAStep === 'verify' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Verify Code</h3>
                        <p className="text-sm text-slate-600">Enter the 6-digit code from your authenticator app</p>
                        <input
                          type="text"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          placeholder="000000"
                          maxLength={6}
                          className="w-full px-4 py-3 text-center text-2xl tracking-widest border-2 border-slate-300 rounded-lg focus:border-blue-600 outline-none"
                        />
                        <motion.button
                          onClick={handleVerify2FA}
                          disabled={verificationCode.length !== 6}
                          whileHover={verificationCode.length === 6 ? { scale: 1.02 } : {}}
                          whileTap={verificationCode.length === 6 ? { scale: 0.98 } : {}}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Verify & Continue
                        </motion.button>
                      </div>
                    )}

                    {/* Backup Codes Step */}
                    {twoFAStep === 'backup' && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-slate-900">Save Backup Codes</h3>
                        <p className="text-sm text-slate-600">Save these codes in a safe place. You can use them to regain access if you lose your authenticator.</p>
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-2">
                            {backupCodes.map((code, idx) => (
                              <code key={idx} className="text-sm font-mono bg-white p-2 rounded border border-slate-300">
                                {code}
                              </code>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => {
                              navigator.clipboard.writeText(backupCodes.join('\n'));
                              alert('Codes copied to clipboard');
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 flex items-center justify-center gap-2"
                          >
                            <Copy className="w-4 h-4" />
                            Copy Codes
                          </motion.button>
                          <motion.button
                            onClick={handleConfirm2FA}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 flex items-center justify-center gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Done
                          </motion.button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              )}

              {/* Data & Storage */}
              {activeTab === 'data' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-slate-900">Data & Storage</h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
                      <p className="text-sm text-blue-800 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        You are using approximately 2.4 MB of storage
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900 mb-3">Data Management</h3>
                      <div className="space-y-2">
                        <button
                          onClick={handleExportData}
                          className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2"
                        >
                          <Download className="w-4 h-4" />
                          Export Your Data
                        </button>
                        <button className="w-full px-4 py-3 rounded-lg border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition flex items-center justify-center gap-2">
                          <Upload className="w-4 h-4" />
                          Import Backup
                        </button>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-slate-50 border border-slate-200">
                      <label className="flex items-center justify-between cursor-pointer">
                        <div>
                          <p className="font-semibold text-slate-900">Auto-sync with cloud</p>
                          <p className="text-sm text-slate-600">Automatically backup your data</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoSync}
                          onChange={(e) => setAutoSync(e.target.checked)}
                          className="w-5 h-5 rounded border-slate-300"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
