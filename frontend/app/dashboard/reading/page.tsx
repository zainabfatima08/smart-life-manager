'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Plus, TrendingUp, Flame, BookOpen, Trash2, Edit2, CheckCircle2 } from 'lucide-react';
import { 
  createTracker, 
  deleteTracker, 
  listTracker, 
  trackerAction, 
  trackerEndpoints, 
  updateTracker,
  Book as BookType,
  ReadingLog,
  Paginated
} from '@/lib/trackers';

export default function ReadingPage() {
  const [books, setBooks] = useState<BookType[]>([]);
  const [logs, setLogs] = useState<ReadingLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState<BookType | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    total_pages: '',
    reading_goal_pages_per_day: '10',
  });

  useEffect(() => {
    loadBooks();
    loadLogs();
    loadStats();
  }, []);

  async function loadBooks() {
    try {
      setLoading(true);
      const response = await listTracker<BookType>(trackerEndpoints.books);
      setBooks(response.results);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs() {
    try {
      const response = await listTracker<ReadingLog>(trackerEndpoints.readingLogs);
      setLogs(response.results);
    } catch (error) {
    }
  }

  async function loadStats() {
    try {
      const data = await trackerAction(trackerEndpoints.books, 'stats');
      setStats(data);
    } catch (error) {
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        total_pages: parseInt(formData.total_pages),
        reading_goal_pages_per_day: parseInt(formData.reading_goal_pages_per_day),
      };

      if (editingBook) {
        await updateTracker(trackerEndpoints.books, editingBook.id, payload);
      } else {
        await createTracker(trackerEndpoints.books, payload);
      }

      setFormData({ title: '', author: '', total_pages: '', reading_goal_pages_per_day: '10' });
      setEditingBook(null);
      setShowModal(false);
      loadBooks();
      loadStats();
    } catch (error) {
      alert('Failed to save book');
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this book?')) return;
    try {
      await deleteTracker(trackerEndpoints.books, id);
      loadBooks();
      loadStats();
    } catch (error) {
    }
  }

  function openEditModal(book: BookType) {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      total_pages: book.total_pages.toString(),
      reading_goal_pages_per_day: book.reading_goal_pages_per_day.toString(),
    });
    setShowModal(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 p-6">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <BookOpen className="w-10 h-10 text-amber-600" />
              Reading Tracker
            </h1>
            <p className="text-gray-600">Track your reading progress and build a reading habit</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setEditingBook(null);
              setFormData({ title: '', author: '', total_pages: '', reading_goal_pages_per_day: '10' });
              setShowModal(true);
            }}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Book
          </motion.button>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Books" value={stats.books} icon={Book} color="amber" />
          <StatsCard title="Pages Read" value={stats.pages_read} icon={BookOpen} color="orange" />
          <StatsCard title="Current Streak" value={`${stats.current_streak} days`} icon={Flame} color="yellow" />
          <StatsCard title="Longest Streak" value={`${stats.longest_streak} days`} icon={TrendingUp} color="red" />
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-200 border-t-amber-600"></div>
        </div>
      ) : books.length === 0 ? (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20">
          <BookOpen className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Books Yet</h3>
          <p className="text-gray-500 mb-6">Start tracking your reading journey</p>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Add Your First Book
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {books.map((book, index) => (
              <BookCard key={book.id} book={book} index={index} onEdit={openEditModal} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800">{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Book title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  placeholder="Author name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Total Pages *</label>
                  <input
                    type="number"
                    required
                    value={formData.total_pages}
                    onChange={(e) => setFormData({ ...formData, total_pages: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Daily Goal (pages)</label>
                  <input
                    type="number"
                    value={formData.reading_goal_pages_per_day}
                    onChange={(e) => setFormData({ ...formData, reading_goal_pages_per_day: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    placeholder="10"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                >
                  {editingBook ? 'Update Book' : 'Add Book'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: { title: string; value: any; icon: any; color: string }) {
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

function BookCard({ book, index, onEdit, onDelete }: { book: BookType; index: number; onEdit: (book: BookType) => void; onDelete: (id: number) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-800 mb-1">{book.title}</h3>
          {book.author && <p className="text-sm text-gray-600 mb-3">by {book.author}</p>}
          
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <span>{book.current_page} / {book.total_pages} pages</span>
            <span>•</span>
            <span>{book.progress_percent}% complete</span>
          </div>

          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${book.progress_percent}%` }}
              transition={{ duration: 0.8, delay: index * 0.05 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 ml-4">
          <button
            onClick={() => onEdit(book)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="w-4 h-4 text-gray-600" />
          </button>
          <button
            onClick={() => onDelete(book.id)}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
