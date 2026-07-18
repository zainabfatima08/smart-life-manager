'use client';

import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  Edit2,
  Trash2,
  AlertCircle,
  Loader,
  DollarSign,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

interface ExpenseCategory {
  id: string;
  name: string;
  monthly_budget: number;
  category_type: 'income' | 'expense' | 'both';
  color: string;
  icon: string;
  is_active: boolean;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<ExpenseCategory>>({
    name: '',
    monthly_budget: 0,
    category_type: 'expense',
    color: '#3b82f6',
    icon: '💰',
    is_active: true
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('lifeos_access');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      const res = await fetch('http://localhost:8000/api/expense-categories/', {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError('Session expired. Please login again.');
          localStorage.removeItem('lifeos_access');
          return;
        }
        throw new Error('Failed to fetch categories');
      }

      const data = await res.json();
      setCategories(Array.isArray(data) ? data : data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('lifeos_access');
      if (!token) return;

      const method = editingId ? 'PATCH' : 'POST';
      const url = editingId
        ? `http://localhost:8000/api/expense-categories/${editingId}/`
        : 'http://localhost:8000/api/expense-categories/';

      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save category');

      setShowForm(false);
      setEditingId(null);
      setFormData({
        name: '',
        monthly_budget: 0,
        category_type: 'expense',
        color: '#3b82f6',
        icon: '💰',
        is_active: true
      });
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;

    try {
      const token = localStorage.getItem('lifeos_access');
      if (!token) return;

      const res = await fetch(`http://localhost:8000/api/expense-categories/${id}/`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Failed to delete');
      fetchCategories();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
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
          className="mb-8 flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Expense Categories</h1>
            <p className="mt-2 text-slate-600">Manage your spending categories</p>
          </div>
          <motion.button
            onClick={() => setShowForm(!showForm)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-white"
          >
            <Plus className="h-5 w-5" />
            New Category
          </motion.button>
        </motion.div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3"
          >
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-red-900">{error}</p>
          </motion.div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 rounded-2xl bg-white p-6 shadow-lg border border-slate-200"
          >
            <h2 className="mb-4 text-xl font-bold text-slate-900">
              {editingId ? 'Edit Category' : 'New Category'}
            </h2>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <input
                type="text"
                placeholder="Category Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              />

              <input
                type="number"
                placeholder="Monthly Budget"
                value={formData.monthly_budget || 0}
                onChange={(e) => setFormData({ ...formData, monthly_budget: Number(e.target.value) })}
                className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              />

              <select
                value={formData.category_type || 'expense'}
                onChange={(e) => setFormData({ ...formData, category_type: e.target.value as any })}
                className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="both">Both</option>
              </select>

              <input
                type="color"
                value={formData.color || '#3b82f6'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="rounded-lg border border-slate-300 h-10 cursor-pointer"
              />

              <input
                type="text"
                placeholder="Icon Emoji"
                value={formData.icon || '💰'}
                onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                className="rounded-lg border border-slate-300 px-4 py-2 outline-none focus:border-blue-500"
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_active !== false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="rounded"
                />
                <span className="text-sm font-medium text-slate-900">Active</span>
              </label>
            </div>

            <div className="mt-4 flex gap-3">
              <motion.button
                onClick={handleSave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex-1 rounded-lg bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700"
              >
                {editingId ? 'Update' : 'Create'}
              </motion.button>
              <motion.button
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                  setFormData({
                    name: '',
                    monthly_budget: 0,
                    category_type: 'expense',
                    color: '#3b82f6',
                    icon: '💰',
                    is_active: true
                  });
                }}
                whileHover={{ scale: 1.02 }}
                className="flex-1 rounded-lg bg-slate-200 px-4 py-2 text-slate-900 font-medium hover:bg-slate-300"
              >
                Cancel
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Categories Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-2xl bg-white p-6 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">{category.icon}</div>
                  <div>
                    <h3 className="font-bold text-slate-900">{category.name}</h3>
                    <p className="text-xs text-slate-500">{category.category_type}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => {
                      setFormData(category);
                      setEditingId(category.id);
                      setShowForm(true);
                    }}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4 text-slate-600" />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(category.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Monthly Budget:</span>
                  <span className="font-bold text-slate-900">Rs {Math.round(category.monthly_budget).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    category.is_active ? 'bg-green-100 text-green-900' : 'bg-slate-100 text-slate-900'
                  }`}>
                    {category.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {categories.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <DollarSign className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600">No categories yet. Create one to get started!</p>
          </motion.div>
        )}
      </div>
    </main>
  );
}
