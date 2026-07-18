'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Trash2, Check, CheckCheck, Loader, AlertCircle, Search } from 'lucide-react';
import { notificationService } from '@/lib/notifications';
import { useClickOutside } from '@/hooks/useClickOutside';

interface Notification {
  id: number;
  title: string;
  message: string;
  category: string;
  category_display: string;
  priority: string;
  priority_display: string;
  is_read: boolean;
  icon: string;
  action_url: string | null;
  created_at_formatted: string;
}

interface NotificationResponse {
  count: number;
  next: string | null;
  previous: string | null;
  page: number;
  page_size: number;
  total_pages: number;
  results: Notification[];
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'unread'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Array<{ value: string; label: string }>>([]);
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());
  const panelRef = useRef<HTMLDivElement>(null);

  // Fetch unread count
  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
    }
  };

  // Fetch notifications
  const fetchNotifications = async (page: number = 1) => {
    setLoading(true);
    try {
      const filters: Record<string, any> = { page };
      
      if (selectedFilter === 'unread') {
        filters.is_read = false;
      }
      
      if (selectedCategory !== 'all') {
        filters.category = selectedCategory;
      }

      const response = await notificationService.getNotifications(filters);
      setNotifications(response.results);
      setCurrentPage(response.page);
      setTotalPages(response.total_pages);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  // Fetch filter options
  const fetchFilterOptions = async () => {
    try {
      const options = await notificationService.getFilterOptions();
      setCategories(options.categories);
    } catch (error) {
    }
  };

  // Initial load
  useEffect(() => {
    if (isOpen) {
      fetchUnreadCount();
      fetchNotifications(1);
      fetchFilterOptions();
    }
  }, [isOpen]);

  // Re-fetch when filters change
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1);
    }
  }, [selectedFilter, selectedCategory]);

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.is_read) {
      await notificationService.markAsRead(notification.id);
      setNotifications(notifications.map(n =>
        n.id === notification.id ? { ...n, is_read: true } : n
      ));
      await fetchUnreadCount();
    }

    if (notification.action_url) {
      window.location.href = notification.action_url;
    }
  };

  // Delete single notification
  const handleDeleteNotification = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
      setSelectedNotifications(new Set([...selectedNotifications].filter(nid => nid !== id)));
    } catch (error) {
    }
  };

  // Mark as read
  const handleMarkAsRead = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
      await fetchUnreadCount();
    } catch (error) {
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      await fetchUnreadCount();
    } catch (error) {
    }
  };

  // Delete selected
  const handleDeleteSelected = async () => {
    if (selectedNotifications.size === 0) return;
    
    try {
      await notificationService.deleteSelected(Array.from(selectedNotifications));
      setNotifications(notifications.filter(n => !selectedNotifications.has(n.id)));
      setSelectedNotifications(new Set());
    } catch (error) {
    }
  };

  // Delete all
  const handleDeleteAll = async () => {
    if (!window.confirm('Delete all notifications? This cannot be undone.')) return;
    
    try {
      await notificationService.deleteAll();
      setNotifications([]);
      setSelectedNotifications(new Set());
      await fetchUnreadCount();
    } catch (error) {
    }
  };

  // Toggle notification selection
  const toggleNotificationSelection = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newSelected = new Set(selectedNotifications);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedNotifications(newSelected);
  };

  useClickOutside(panelRef, () => setIsOpen(false));

  // Priority colors
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      default:
        return 'border-l-blue-500 bg-blue-50';
    }
  };

  // Get category icon color
  const getCategoryIconColor = (category: string) => {
    const colorMap: Record<string, string> = {
      habit_reminder: 'text-blue-500',
      goal_reminder: 'text-purple-500',
      mood_reminder: 'text-pink-500',
      sleep_reminder: 'text-indigo-500',
      focus_reminder: 'text-yellow-500',
      reading_reminder: 'text-green-500',
      expense_reminder: 'text-red-500',
      weekly_summary: 'text-cyan-500',
      monthly_replay: 'text-violet-500',
      ai_motivation: 'text-amber-500',
      achievement_unlocked: 'text-yellow-500',
      streak_milestone: 'text-orange-500',
      budget_warning: 'text-red-500',
      goal_deadline: 'text-purple-500',
      new_insight: 'text-teal-500',
    };
    return colorMap[category] || 'text-slate-500';
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative inline-flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 transition hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5" />
        
        {/* Unread Badge */}
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </motion.div>
          )}
        </AnimatePresence>
      </button>

      {/* Notification Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 max-h-96 bg-white/90 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl overflow-hidden flex flex-col z-50"
          >
            {/* Header */}
            <div className="border-b border-white/20 bg-gradient-to-r from-slate-50 to-white/50 px-4 py-3">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-slate-700" />
                  <h2 className="font-semibold text-slate-900">Notifications</h2>
                  {unreadCount > 0 && (
                    <span className="ml-1 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-500 hover:text-slate-700 transition"
                  aria-label="Close notifications"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Filters */}
              <div className="space-y-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Filter Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`text-xs px-2.5 py-1 rounded-full transition ${
                      selectedFilter === 'all'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => setSelectedFilter('unread')}
                    className={`text-xs px-2.5 py-1 rounded-full transition ${
                      selectedFilter === 'unread'
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Unread
                  </button>
                  
                  {/* Category Filter */}
                  {categories.length > 0 && (
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="text-xs px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader className="w-6 h-6 text-indigo-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 text-slate-500">
                  <AlertCircle className="w-8 h-8 mb-2" />
                  <p className="text-sm">No notifications</p>
                </div>
              ) : (
                <div className="divide-y divide-white/20">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      onClick={() => handleNotificationClick(notification)}
                      className={`border-l-4 p-3 cursor-pointer transition hover:bg-slate-50 ${getPriorityColor(notification.priority)}`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={selectedNotifications.has(notification.id)}
                          onChange={(e) => toggleNotificationSelection(notification.id, e as any)}
                          className="mt-1 w-4 h-4 accent-indigo-500 cursor-pointer"
                        />

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h3 className="font-semibold text-slate-900 text-sm break-words">
                                {notification.title}
                              </h3>
                              <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                                {notification.message}
                              </p>
                            </div>
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`text-xs font-medium ${getCategoryIconColor(notification.category)}`}>
                              {notification.category_display}
                            </span>
                            <span className="text-xs text-slate-500">
                              {notification.created_at_formatted}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!notification.is_read && (
                            <button
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              className="p-1 text-slate-400 hover:text-blue-500 transition"
                              aria-label="Mark as read"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDeleteNotification(notification.id, e)}
                            className="p-1 text-slate-400 hover:text-red-500 transition"
                            aria-label="Delete notification"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/20 bg-slate-50/50 px-4 py-3 space-y-2">
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => {
                        setCurrentPage(Math.max(1, currentPage - 1));
                        fetchNotifications(Math.max(1, currentPage - 1));
                      }}
                      disabled={currentPage === 1}
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => {
                        setCurrentPage(Math.min(totalPages, currentPage + 1));
                        fetchNotifications(Math.min(totalPages, currentPage + 1));
                      }}
                      disabled={currentPage === totalPages}
                      className="px-2 py-1 text-slate-600 hover:text-slate-900 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
                  >
                    <CheckCheck className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
                
                {selectedNotifications.size > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedNotifications.size})
                  </button>
                )}

                {notifications.length > 0 && selectedNotifications.size === 0 && (
                  <button
                    onClick={handleDeleteAll}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear all
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
