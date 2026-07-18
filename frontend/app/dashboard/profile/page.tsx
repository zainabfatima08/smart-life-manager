'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import {
  User, Mail, MapPin, Briefcase, Award, TrendingUp,
  Share2, Edit, Upload, Check, X, Calendar as CalendarIcon, Download,
  Zap, BookOpen, Target, Camera, Loader, AlertCircle
} from 'lucide-react';
import { profileAPI } from '@/lib/profile';

interface UserProfile {
  name: string;
  email: string;
  bio: string;
  location: string;
  joinDate: string;
  occupationTitle: string;
  avatar: string;
  profileImage?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  unlockedAt: string;
}

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: 'User',
    email: 'user@example.com',
    bio: 'Building a better life, one habit at a time.',
    location: 'Pakistan',
    joinDate: '2024-01-15',
    occupationTitle: 'Life Enthusiast',
    avatar: 'U',
    profileImage: null,
  });
  const [mounted, setMounted] = useState(false);

  const [formData, setFormData] = useState(profile);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage after mount
    const savedName = localStorage.getItem('userName') || 'User';
    const savedEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const savedJoinDate = localStorage.getItem('userJoinDate') || new Date().toISOString().split('T')[0];
    const savedProfile: UserProfile = {
      name: savedName,
      email: savedEmail,
      bio: 'Building a better life, one habit at a time.',
      location: 'Pakistan',
      joinDate: savedJoinDate,
      occupationTitle: 'Life Enthusiast',
      avatar: savedName.charAt(0).toUpperCase(),
      profileImage: localStorage.getItem('profileImage') || null,
    };
    setProfile(savedProfile);
    setFormData(savedProfile);
  }, []);
  const [stats] = useState({
    totalHabits: 12,
    habitsCompleted: 8,
    streak: 7,
    achievements: 5,
    joinedMonths: 6,
  });

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!mounted) return null;

  const handleShareProfile = async () => {
    try {
      setExportError(null);
      // Generate a shareable link
      const result = await profileAPI.generateShareLink();
      const baseUrl = window.location.origin;
      const fullShareUrl = `${baseUrl}/public-profile/${profile.name}`;
      
      setShareLink(fullShareUrl);
      setShowShareModal(true);
      
      // Copy to clipboard
      navigator.clipboard.writeText(fullShareUrl).catch(() => {
        // Silently fail if clipboard API not available
      });
    } catch (error) {
      setExportError('Failed to generate share link');
    }
  };

  const handleDownloadReport = async (format: 'json' | 'csv' | 'pdf') => {
    try {
      setIsExporting(true);
      setExportError(null);
      
      const blob = await profileAPI.exportProfile(format);
      const filename = `life_os_report_${new Date().toISOString().split('T')[0]}.${format}`;
      
      profileAPI.downloadFile(blob, filename);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to download report. Please try again.';
      
      // Provide helpful guidance for PDF errors
      if (format === 'pdf' && errorMsg.includes('reportlab')) {
        setExportError('PDF export is currently unavailable. Try JSON or CSV format instead.');
      } else {
        setExportError(errorMsg);
      }
    } finally {
      setIsExporting(false);
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink).then(() => {
        alert('Link copied to clipboard!');
      }).catch(() => {
        // Fallback: show link in modal
      });
    }
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: '7-Day Streak',
      description: 'Completed habits 7 days in a row',
      icon: <Zap className="w-6 h-6" />,
      unlockedAt: '2024-07-01',
    },
    {
      id: '2',
      title: 'Mood Master',
      description: 'Logged mood for 30 consecutive days',
      icon: <Target className="w-6 h-6" />,
      unlockedAt: '2024-06-15',
    },
    {
      id: '3',
      title: 'Focus Champion',
      description: 'Completed 50 focus sessions',
      icon: <BookOpen className="w-6 h-6" />,
      unlockedAt: '2024-05-20',
    },
    {
      id: '4',
      title: 'Journal Warrior',
      description: 'Written 100 journal entries',
      icon: <BookOpen className="w-6 h-6" />,
      unlockedAt: '2024-04-10',
    },
    {
      id: '5',
      title: 'Early Bird',
      description: 'Completed morning habits 10 times',
      icon: <Zap className="w-6 h-6" />,
      unlockedAt: '2024-03-05',
    },
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setPreviewImage(imageData);
        setFormData(prev => ({ ...prev, profileImage: imageData }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    setProfile(formData);
    if (previewImage) {
      localStorage.setItem('profileImage', previewImage);
    }
    localStorage.setItem('userName', formData.name);
    localStorage.setItem('userEmail', formData.email);
    setIsEditing(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto max-w-4xl px-6 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="relative rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 p-8 text-white">
            <div className="flex items-end gap-6">
              {/* Avatar/Profile Picture */}
              <div className="relative">
                {previewImage || profile.profileImage ? (
                  <img
                    src={previewImage || profile.profileImage}
                    alt="Profile"
                    className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center border-4 border-white shadow-lg">
                    <span className="text-4xl font-bold text-blue-600">{profile.avatar}</span>
                  </div>
                )}
                {isEditing && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-0 right-0 bg-white rounded-full p-2 text-blue-600 shadow-lg hover:bg-slate-100 transition"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>

              <div className="flex-1 pb-2">
                <h1 className="text-3xl font-bold">{profile.name}</h1>
                <p className="mt-1 text-blue-100">{profile.occupationTitle}</p>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold transition flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                {isEditing ? 'Cancel' : 'Edit'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Edit Mode */}
        {isEditing && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 rounded-xl bg-blue-50 border border-blue-200 p-6"
          >
            <h2 className="text-lg font-bold text-slate-900 mb-4">Edit Profile</h2>
            <div className="space-y-4">
              {/* Profile Picture Upload */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Picture</label>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full px-4 py-3 rounded-lg border-2 border-dashed border-blue-300 bg-white hover:bg-blue-50 transition text-slate-700 font-semibold flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Click to upload picture
                </button>
                {previewImage && (
                  <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
                    <Check className="w-4 h-4" />
                    Picture selected
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Occupation</label>
                <input
                  type="text"
                  name="occupationTitle"
                  value={formData.occupationTitle}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setPreviewImage(null);
                  }}
                  className="px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-600" />
              <p className="text-sm text-slate-600">Email Address</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{profile.email}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="w-5 h-5 text-green-600" />
              <p className="text-sm text-slate-600">Location</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{profile.location}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <Briefcase className="w-5 h-5 text-purple-600" />
              <p className="text-sm text-slate-600">Occupation</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{profile.occupationTitle}</p>
          </div>

          <div className="rounded-xl bg-slate-50 p-6 border border-slate-200">
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-5 h-5 text-orange-600" />
              <p className="text-sm text-slate-600">Member Since</p>
            </div>
            <p className="text-lg font-semibold text-slate-900">{new Date(profile.joinDate).toLocaleDateString()}</p>
          </div>
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
          className="rounded-xl bg-white border border-slate-200 p-6 mb-8"
        >
          <h2 className="text-xl font-bold text-slate-900 mb-3">About Me</h2>
          <p className="text-slate-700 leading-relaxed">{profile.bio}</p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.2 } }}
          className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8"
        >
          <div className="rounded-lg bg-blue-50 p-4 text-center border border-blue-200">
            <p className="text-2xl font-bold text-blue-600">{stats.totalHabits}</p>
            <p className="text-xs text-slate-600 mt-1">Total Habits</p>
          </div>
          <div className="rounded-lg bg-green-50 p-4 text-center border border-green-200">
            <p className="text-2xl font-bold text-green-600">{stats.habitsCompleted}</p>
            <p className="text-xs text-slate-600 mt-1">Completed</p>
          </div>
          <div className="rounded-lg bg-red-50 p-4 text-center border border-red-200">
            <p className="text-2xl font-bold text-red-600">{stats.streak}</p>
            <p className="text-xs text-slate-600 mt-1">Day Streak</p>
          </div>
          <div className="rounded-lg bg-yellow-50 p-4 text-center border border-yellow-200">
            <p className="text-2xl font-bold text-yellow-600">{stats.achievements}</p>
            <p className="text-xs text-slate-600 mt-1">Achievements</p>
          </div>
          <div className="rounded-lg bg-purple-50 p-4 text-center border border-purple-200">
            <p className="text-2xl font-bold text-purple-600">{stats.joinedMonths}</p>
            <p className="text-xs text-slate-600 mt-1">Months</p>
          </div>
        </motion.div>

        {/* Achievements Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
          className="rounded-xl bg-white border border-slate-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-yellow-600" />
              Achievements
            </h2>
            <span className="text-sm font-semibold text-slate-600">{achievements.length} unlocked</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement, idx) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className="rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 p-4 hover:shadow-lg transition"
              >
                <div className="text-3xl mb-2 text-yellow-600">
                  {achievement.icon}
                </div>
                <p className="font-semibold text-slate-900">{achievement.title}</p>
                <p className="text-xs text-slate-600 mt-1">{achievement.description}</p>
                <p className="text-xs text-slate-500 mt-2">
                  {new Date(achievement.unlockedAt).toLocaleDateString()}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, transition: { delay: 0.4 } }}
          className="mt-8"
        >
          {/* Error message */}
          {exportError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm">{exportError}</span>
            </motion.div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            {/* Share Profile Button */}
            <motion.button
              onClick={handleShareProfile}
              disabled={isExporting}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Share2 className="w-4 h-4" />
              Share Profile
            </motion.button>

            {/* Download Report Dropdown */}
            <div className="relative group">
              <motion.button
                disabled={isExporting}
                className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isExporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Download Report
                  </>
                )}
              </motion.button>

              {/* Dropdown Menu */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute right-0 mt-0 w-48 bg-white border border-slate-200 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all z-50"
              >
                <button
                  onClick={() => handleDownloadReport('json')}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 first:rounded-t-lg flex items-center gap-2 text-slate-700 disabled:opacity-50"
                >
                  <span className="text-sm">📄 Download as JSON</span>
                </button>
                <button
                  onClick={() => handleDownloadReport('csv')}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 flex items-center gap-2 text-slate-700 disabled:opacity-50"
                >
                  <span className="text-sm">📊 Download as CSV</span>
                </button>
                <button
                  onClick={() => handleDownloadReport('pdf')}
                  disabled={isExporting}
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 last:rounded-b-lg flex items-center gap-2 text-slate-700 disabled:opacity-50"
                >
                  <span className="text-sm">📋 Download as PDF</span>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Share Modal */}
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Share2 className="w-6 h-6 text-blue-600" />
                Share Your Profile
              </h2>

              <p className="text-slate-600 mb-4">
                Share your Life OS profile with others. They'll be able to see your public profile and achievements.
              </p>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Profile Link</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={shareLink || ''}
                    readOnly
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600 text-sm"
                  />
                  <motion.button
                    onClick={copyShareLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Check className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>

              <div className="flex gap-3">
                <motion.button
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Close
                </motion.button>
                <motion.button
                  onClick={() => {
                    if (shareLink) {
                      window.open(shareLink, '_blank');
                    }
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  View Profile
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </main>
  );
}
