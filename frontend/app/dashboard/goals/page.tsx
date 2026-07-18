'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Goal, GoalStats, Milestone, Paginated, createTracker, deleteTracker, listTracker, trackerAction, trackerEndpoints, todayISO, updateTracker } from '@/lib/trackers';
import { 
  Target, 
  Plus, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Edit2,
  Trash2,
  Flag,
  BarChart3,
  Trophy,
  Sparkles,
  ChevronRight,
  Star,
  Pause,
  Play,
  Archive,
  List,
  Rocket,
  Zap,
  BookOpen,
  Wallet,
  GraduationCap,
  Briefcase,
  Flame,
  Heart
} from 'lucide-react';

type ViewMode = 'grid' | 'list' | 'timeline';
type FilterStatus = 'all' | 'not_started' | 'in_progress' | 'completed' | 'paused';
type FilterPriority = 'all' | 'low' | 'medium' | 'high' | 'critical';

// Icon mapping for goals
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  target: Target,
  rocket: Rocket,
  zap: Zap,
  book: BookOpen,
  wallet: Wallet,
  trophy: Trophy,
  star: Star,
  graduation: GraduationCap,
  briefcase: Briefcase,
  sparkles: Sparkles,
  flame: Flame,
  heart: Heart,
};

const ICON_LABELS = [
  { id: 'target', label: 'Target' },
  { id: 'rocket', label: 'Rocket' },
  { id: 'zap', label: 'Power' },
  { id: 'book', label: 'Learning' },
  { id: 'wallet', label: 'Finance' },
  { id: 'trophy', label: 'Trophy' },
  { id: 'star', label: 'Star' },
  { id: 'graduation', label: 'Education' },
  { id: 'briefcase', label: 'Career' },
  { id: 'sparkles', label: 'Sparkles' },
  { id: 'flame', label: 'Passion' },
  { id: 'heart', label: 'Health' },
];

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<GoalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [filterPriority, setFilterPriority] = useState<FilterPriority>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [showGoalModal, setShowGoalModal] = useState(false);

  useEffect(() => {
    loadGoals();
    loadStats();
  }, [filterStatus, filterPriority]);

  async function loadGoals() {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (filterStatus !== 'all') params.status = filterStatus;
      if (filterPriority !== 'all') params.priority = filterPriority;
      const response = await listTracker<Goal>(trackerEndpoints.goals, params);
      setGoals(response.results || []);
    } catch (error) {
      setGoals([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadStats() {
    try {
      const data = await trackerAction<GoalStats>(trackerEndpoints.goals, 'stats');
      setStats(data);
    } catch (error) {
      setStats(null);
    }
  }

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700 border-gray-300',
    medium: 'bg-blue-100 text-blue-700 border-blue-300',
    high: 'bg-orange-100 text-orange-700 border-orange-300',
    critical: 'bg-red-100 text-red-700 border-red-300',
  };

  const statusColors = {
    not_started: 'bg-gray-100 text-gray-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    paused: 'bg-yellow-100 text-yellow-700',
    archived: 'bg-gray-100 text-gray-500',
  };

  const statusIcons = {
    not_started: Clock,
    in_progress: TrendingUp,
    completed: CheckCircle2,
    paused: Pause,
    archived: Archive,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
              <Target className="w-10 h-10 text-purple-600" />
              Goals Tracker
            </h1>
            <p className="text-gray-600">Track your goals and achieve your dreams</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            New Goal
          </motion.button>
        </div>
      </motion.div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Goals"
            value={stats.total}
            icon={Target}
            color="indigo"
          />
          <StatsCard
            title="In Progress"
            value={stats.by_status.in_progress}
            icon={TrendingUp}
            color="blue"
          />
          <StatsCard
            title="Completed"
            value={stats.by_status.completed}
            icon={Trophy}
            color="green"
          />
          <StatsCard
            title="Completion Rate"
            value={`${stats.completion_rate}%`}
            icon={BarChart3}
            color="purple"
          />
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Status:</span>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="paused">Paused</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600 font-medium">Priority:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value as FilterPriority)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div className="ml-auto flex items-center gap-2 bg-white rounded-lg p-1 border border-gray-200">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded ${viewMode === 'grid' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
          >
            Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded ${viewMode === 'list' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`px-3 py-1.5 rounded ${viewMode === 'timeline' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}`}
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : goals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center py-20"
        >
          <Target className="w-20 h-20 mx-auto text-gray-300 mb-4" />
          <h3 className="text-2xl font-semibold text-gray-700 mb-2">No Goals Yet</h3>
          <p className="text-gray-500 mb-6">Start your journey by creating your first goal</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Create First Goal
          </button>
        </motion.div>
      ) : (
        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          <AnimatePresence>
            {goals.map((goal, index) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                index={index}
                viewMode={viewMode}
                onClick={() => {
                  setSelectedGoal(goal);
                  setShowGoalModal(true);
                }}
                onUpdate={loadGoals}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateGoalModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            loadGoals();
            loadStats();
          }}
        />
      )}

      {showGoalModal && selectedGoal && (
        <GoalDetailsModal
          goal={selectedGoal}
          onClose={() => {
            setShowGoalModal(false);
            setSelectedGoal(null);
          }}
          onUpdate={() => {
            loadGoals();
            loadStats();
          }}
        />
      )}
    </div>
  );
}

// Stats Card Component
function StatsCard({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) {
  const colorClasses = {
    indigo: 'from-indigo-500 to-indigo-600',
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100"
    >
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

// Goal Card Component
function GoalCard({ goal, index, viewMode, onClick, onUpdate }: {
  goal: Goal;
  index: number;
  viewMode: ViewMode;
  onClick: () => void;
  onUpdate: () => void;
}) {
  const StatusIcon = {
    not_started: Clock,
    in_progress: TrendingUp,
    completed: CheckCircle2,
    paused: Pause,
    archived: Archive,
  }[goal.status];

  const priorityColors = {
    low: 'text-gray-500',
    medium: 'text-blue-500',
    high: 'text-orange-500',
    critical: 'text-red-500',
  };

  const progressColor = goal.progress_percent >= 75 ? 'bg-green-500' : goal.progress_percent >= 50 ? 'bg-blue-500' : goal.progress_percent >= 25 ? 'bg-yellow-500' : 'bg-gray-300';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      onClick={onClick}
      className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
            {ICON_MAP[goal.icon] ? (
              React.createElement(ICON_MAP[goal.icon], { className: 'w-6 h-6 text-indigo-600' })
            ) : (
              React.createElement(Target, { className: 'w-6 h-6 text-indigo-600' })
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-indigo-600 transition-colors">
              {goal.title}
            </h3>
            <span className={`text-xs px-2 py-1 rounded-full ${priorityColors[goal.priority]} bg-opacity-10`}>
              {goal.priority.toUpperCase()}
            </span>
          </div>
        </div>
        <Flag className={`w-5 h-5 ${priorityColors[goal.priority]}`} />
      </div>

      {goal.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{goal.description}</p>
      )}

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600">Progress</span>
          <span className="font-semibold text-gray-800">{goal.progress_percent}%</span>
        </div>
        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${goal.progress_percent}%` }}
            transition={{ duration: 0.8, delay: index * 0.05 }}
            className={`h-full ${progressColor} rounded-full`}
          />
        </div>
      </div>

      {/* Milestones */}
      {goal.milestones.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Sparkles className="w-4 h-4" />
          <span>{goal.completed_milestones} / {goal.milestone_count} milestones</span>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2 text-sm">
          <StatusIcon className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 capitalize">{goal.status.replace('_', ' ')}</span>
        </div>
        
        {goal.deadline && (
          <div className={`flex items-center gap-1 text-sm ${goal.is_overdue ? 'text-red-500' : 'text-gray-600'}`}>
            <Calendar className="w-4 h-4" />
            <span>{goal.days_until_deadline !== null ? `${Math.abs(goal.days_until_deadline)} days ${goal.is_overdue ? 'overdue' : 'left'}` : new Date(goal.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// Create Goal Modal Component
function CreateGoalModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'personal',
    priority: 'medium',
    deadline: '',
    icon: 'target',
    color: 'blue',
    target_value: 100,
    current_value: 0,
    status: 'not_started',
  });

  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createTracker(trackerEndpoints.goals, {
        ...formData,
        deadline: formData.deadline || null,
      });
      onSuccess();
    } catch (error) {
      alert('Failed to create goal');
    } finally {
      setSubmitting(false);
    }
  }

  const categories = ['personal', 'career', 'health', 'finance', 'education', 'relationship', 'other'];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-2xl font-bold text-gray-800">Create New Goal</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
            <div className="grid grid-cols-4 gap-3">
              {ICON_LABELS.map(({ id, label }) => {
                const IconComponent = ICON_MAP[id];
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setFormData({ ...formData, icon: id })}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      formData.icon === id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                    title={label}
                  >
                    {IconComponent && <IconComponent className="w-6 h-6 text-indigo-600 mb-1" />}
                    <span className="text-xs text-gray-600">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Enter goal title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              rows={3}
              placeholder="Describe your goal"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
            <input
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Goal Details Modal Component
function GoalDetailsModal({ goal, onClose, onUpdate }: { goal: Goal; onClose: () => void; onUpdate: () => void }) {
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(goal);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');

  async function handleUpdate() {
    try {
      await updateTracker(trackerEndpoints.goals, goal.id, formData);
      setEditing(false);
      onUpdate();
    } catch (error) {
      alert('Failed to update goal');
    }
  }

  async function handleDelete() {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteTracker(trackerEndpoints.goals, goal.id);
      onClose();
      onUpdate();
    } catch (error) {
      alert('Failed to delete goal');
    }
  }

  async function handleAddMilestone() {
    if (!milestoneTitle.trim()) return;
    try {
      await createTracker(trackerEndpoints.milestones, {
        goal: goal.id,
        title: milestoneTitle,
        order: goal.milestones.length,
      });
      setMilestoneTitle('');
      setShowMilestoneForm(false);
      onUpdate();
    } catch (error) {
    }
  }

  async function toggleMilestone(milestone: Milestone) {
    try {
      await updateTracker(trackerEndpoints.milestones, milestone.id, {
        completed: !milestone.completed,
      });
      onUpdate();
    } catch (error) {
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-indigo-100 flex items-center justify-center">
                {ICON_MAP[goal.icon] ? (
                  React.createElement(ICON_MAP[goal.icon], { className: 'w-8 h-8 text-indigo-600' })
                ) : (
                  React.createElement(Target, { className: 'w-8 h-8 text-indigo-600' })
                )}
              </div>
              {editing ? (
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="text-2xl font-bold border-b-2 border-indigo-500 focus:outline-none"
                />
              ) : (
                <h2 className="text-2xl font-bold text-gray-800">{goal.title}</h2>
              )}
            </div>
            <div className="flex items-center gap-2">
              {!editing && (
                <button
                  onClick={() => setEditing(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit2 className="w-5 h-5 text-gray-600" />
                </button>
              )}
              <button
                onClick={handleDelete}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Progress Section */}
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-semibold text-gray-800">Progress</span>
              <span className="text-3xl font-bold text-indigo-600">{goal.progress_percent}%</span>
            </div>
            <div className="h-3 bg-white rounded-full overflow-hidden">
              <div
                style={{ width: `${goal.progress_percent}%` }}
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all"
              />
            </div>
          </div>

          {/* Description */}
          {editing ? (
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              rows={4}
            />
          ) : (
            goal.description && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-600">{goal.description}</p>
              </div>
            )
          )}

          {/* Milestones */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Milestones</h3>
              <button
                onClick={() => setShowMilestoneForm(!showMilestoneForm)}
                className="px-4 py-2 bg-indigo-100 text-indigo-600 rounded-lg hover:bg-indigo-200 transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Milestone
              </button>
            </div>

            {showMilestoneForm && (
              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Milestone title"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMilestone()}
                />
                <button
                  onClick={handleAddMilestone}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Add
                </button>
              </div>
            )}

            <div className="space-y-2">
              {goal.milestones.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No milestones yet</p>
              ) : (
                goal.milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    onClick={() => toggleMilestone(milestone)}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        milestone.completed ? 'bg-green-500 border-green-500' : 'border-gray-300'
                      }`}
                    >
                      {milestone.completed && <CheckCircle2 className="w-4 h-4 text-white" />}
                    </div>
                    <span className={milestone.completed ? 'line-through text-gray-500' : 'text-gray-700'}>
                      {milestone.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          {editing && (
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setEditing(false)}
                className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
