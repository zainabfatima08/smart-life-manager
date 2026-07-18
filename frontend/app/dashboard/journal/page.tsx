'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JournalEntry, JournalStats, Paginated, createTracker, deleteTracker, listTracker, trackerAction, trackerEndpoints, todayISO, updateTracker, postTrackerAction } from '@/lib/trackers';
import { 
  BookOpen, 
  Plus, 
  Search, 
  Pin, 
  Heart, 
  Calendar,
  Tag,
  Edit2,
  Trash2,
  Star,
  TrendingUp,
  FileText,
  ChevronRight,
  Sparkles,
  Filter
} from 'lucide-react';

type ViewMode = 'grid' | 'timeline' | 'calendar';

export default function JournalPage() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [stats, setStats] = useState<JournalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);

  useEffect(() => {
    loadEntries();
    loadStats();
  }, [searchQuery, filterTag, showPinnedOnly, showFavoritesOnly]);

  async function loadEntries() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchQuery) params.search = searchQuery;
      if (filterTag) params.tag = filterTag;
      if (showPinnedOnly) params.is_pinned = 'true';
      if (showFavoritesOnly) params.is_favorite = 'true';
      
      const response = await listTracker<JournalEntry>(trackerEndpoints.journal, params);
      setEntries(response.results);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await trackerAction<JournalStats>(trackerEndpoints.journal, 'stats');
      setStats(data);
    } catch (error) {
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-amber-600" />
              Journal
            </h1>
            <p className="text-gray-600">Capture your thoughts and memories</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Entry
          </motion.button>
        </div>
      </motion.div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total Entries" value={stats.entries} icon={BookOpen} color="amber" />
          <StatsCard title="Current Streak" value={`${stats.current_streak} days`} icon={TrendingUp} color="orange" />
          <StatsCard title="Total Words" value={stats.total_words.toLocaleString()} icon={FileText} color="yellow" />
          <StatsCard title="Favorites" value={stats.favorites} icon={Heart} color="red" />
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
        </div>
        <button
          onClick={() => setShowPinnedOnly(!showPinnedOnly)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            showPinnedOnly ? 'bg-amber-100 text-amber-700' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          <Pin className="w-4 h-4" />
          Pinned
        </button>
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
            showFavoritesOnly ? 'bg-red-100 text-red-700' : 'bg-white text-gray-600 border border-gray-200'
          }`}
        >
          <Heart className="w-4 h-4" />
          Favorites
        </button>
      </div>

      {stats && stats.top_tags.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Popular Tags</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.top_tags.map((tagData) => (
              <button
                key={tagData.tag}
                onClick={() => setFilterTag(filterTag === tagData.tag ? '' : tagData.tag)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  filterTag === tagData.tag
                    ? 'bg-amber-100 text-amber-700 border-2 border-amber-300'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-amber-300'
                }`}
              >
                #{tagData.tag} <span className="text-xs opacity-75">({tagData.count})</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
        </div>
      ) : entries.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <BookOpen className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Entries Yet</h3>
          <p className="text-gray-500 mb-6">Start journaling and capture your thoughts</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Write First Entry
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {entries.map((entry, index) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={index}
                onClick={() => { setSelectedEntry(entry); setShowEntryModal(true); }}
                onTogglePin={async () => { await postTrackerAction(`${trackerEndpoints.journal}${entry.id}/`, 'toggle_pin', {}); loadEntries(); loadStats(); }}
                onToggleFavorite={async () => { await postTrackerAction(`${trackerEndpoints.journal}${entry.id}/`, 'toggle_favorite', {}); loadEntries(); loadStats(); }}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {showCreateModal && (
        <CreateEntryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); loadEntries(); loadStats(); }}
        />
      )}

      {showEntryModal && selectedEntry && (
        <EntryDetailsModal
          entry={selectedEntry}
          onClose={() => { setShowEntryModal(false); setSelectedEntry(null); }}
          onUpdate={() => { loadEntries(); loadStats(); }}
        />
      )}
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colorClasses = {
    amber: 'from-amber-500 to-amber-600',
    orange: 'from-orange-500 to-orange-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600',
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} rounded-xl`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </motion.div>
  );
}

function EntryCard({ entry, index, onClick, onTogglePin, onToggleFavorite }: {
  entry: JournalEntry;
  index: number;
  onClick: () => void;
  onTogglePin: () => void;
  onToggleFavorite: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1" onClick={onClick} style={{ cursor: 'pointer' }}>
          <div className="flex items-center gap-3 mb-2">
            {entry.is_pinned && <Pin className="w-4 h-4 text-amber-500 fill-amber-500" />}
            {entry.is_favorite && <Heart className="w-4 h-4 text-red-500 fill-red-500" />}
            <span className="text-sm text-gray-500">{new Date(entry.entry_date).toLocaleDateString()}</span>
          </div>
          {entry.title && <h3 className="text-xl font-semibold text-gray-800 mb-2 group-hover:text-amber-600 transition-colors">{entry.title}</h3>}
          <p className="text-gray-600 line-clamp-3 mb-4">{entry.content}</p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>{entry.word_count} words</span>
            {entry.mood && <span>Mood: {entry.mood}</span>}
          </div>
          {entry.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {entry.tags.map((tag) => (
                <span key={tag} className="px-2 py-1 bg-amber-50 text-amber-700 rounded-full text-xs">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
            className={`p-2 rounded-lg transition-colors ${entry.is_pinned ? 'bg-amber-100 text-amber-600' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <Pin className={`w-4 h-4 ${entry.is_pinned ? 'fill-amber-600' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
            className={`p-2 rounded-lg transition-colors ${entry.is_favorite ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100 text-gray-400'}`}
          >
            <Heart className={`w-4 h-4 ${entry.is_favorite ? 'fill-red-600' : ''}`} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function CreateEntryModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    entry_date: todayISO(),
    mood: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createTracker(trackerEndpoints.journal, formData);
      onSuccess();
    } catch (error) {
      alert('Failed to create entry');
    } finally {
      setSubmitting(false);
    }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  }

  const moods = ['😊 Happy', '😌 Calm', '😢 Sad', '😠 Angry', '🤔 Thoughtful', '😴 Tired', '😎 Confident', '🥳 Excited'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">New Journal Entry</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input type="date" value={formData.entry_date} onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title (Optional)</label>
            <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" placeholder="Give your entry a title" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
            <textarea required value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" rows={12} placeholder="Write your thoughts..." />
            <div className="text-sm text-gray-500 mt-2">{formData.content.split(/\s+/).filter(w => w).length} words</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mood (Optional)</label>
            <div className="grid grid-cols-4 gap-2">
              {moods.map((mood) => (
                <button key={mood} type="button" onClick={() => setFormData({ ...formData, mood })} className={`px-3 py-2 rounded-lg border-2 transition-all text-sm ${formData.mood === mood ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'}`}>
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            <div className="flex gap-2 mb-3">
              <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" placeholder="Add a tag" />
              <button type="button" onClick={addTag} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200">
                Add
              </button>
            </div>
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center gap-2">
                    #{tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:text-amber-900">
                      ✕
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50">
              {submitting ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function EntryDetailsModal({ entry, onClose, onUpdate }: { entry: JournalEntry; onClose: () => void; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(entry);
  const [tagInput, setTagInput] = useState('');

  async function handleUpdate() {
    try {
      await updateTracker(trackerEndpoints.journal, entry.id, formData);
      setEditing(false);
      onUpdate();
    } catch (error) {
      alert('Failed to update entry');
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this entry?')) return;
    try {
      await deleteTracker(trackerEndpoints.journal, entry.id);
      onClose();
      onUpdate();
    } catch (error) {
      alert('Failed to delete entry');
    }
  }

  function addTag() {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  }

  function removeTag(tag: string) {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2 text-sm text-gray-500">
                <Calendar className="w-4 h-4" />
                <span>{new Date(entry.entry_date).toLocaleDateString()}</span>
              </div>
              {editing ? (
                <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="text-2xl font-bold border-b-2 border-amber-500 focus:outline-none w-full" placeholder="Entry title" />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{entry.title || 'Untitled Entry'}</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!editing && (
                <button onClick={() => setEditing(true)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <button onClick={handleDelete} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>{entry.word_count} words</span>
            </div>
            {entry.mood && (
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <span>{entry.mood}</span>
              </div>
            )}
            {entry.is_pinned && (
              <div className="flex items-center gap-2 text-amber-600">
                <Pin className="w-4 h-4 fill-amber-600" />
                <span>Pinned</span>
              </div>
            )}
            {entry.is_favorite && (
              <div className="flex items-center gap-2 text-red-600">
                <Heart className="w-4 h-4 fill-red-600" />
                <span>Favorite</span>
              </div>
            )}
          </div>

          <div>
            {editing ? (
              <textarea value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" rows={16} />
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{entry.content}</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
            {editing && (
              <div className="flex gap-2 mb-3">
                <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500" placeholder="Add a tag" />
                <button type="button" onClick={addTag} className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg hover:bg-amber-200">
                  Add
                </button>
              </div>
            )}
            {formData.tags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm flex items-center gap-2">
                    #{tag}
                    {editing && (
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-amber-900">
                        ✕
                      </button>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No tags</p>
            )}
          </div>

          {editing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button onClick={() => { setEditing(false); setFormData(entry); }} className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                Cancel
              </button>
              <button onClick={handleUpdate} className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium">
                Save Changes
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
