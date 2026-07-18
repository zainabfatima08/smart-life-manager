'use client';

import { FormEvent, useState } from 'react';
import { createTracker } from '@/lib/trackers';
import { TrackerCard } from './tracker-card';

export type FieldConfig = {
  name: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'datetime-local' | 'textarea' | 'select' | 'checkbox';
  required?: boolean;
  options?: { label: string; value: string | number | boolean }[];
  defaultValue?: string | number | boolean;
};

export function TrackerForm({
  endpoint,
  fields,
  title,
  onCreated,
}: {
  endpoint: string;
  fields: FieldConfig[];
  title: string;
  onCreated: () => void;
}) {
  const initial = Object.fromEntries(fields.map((field) => [field.name, field.defaultValue ?? (field.type === 'checkbox' ? false : '')]));
  const [values, setValues] = useState<Record<string, string | number | boolean>>(initial);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setSaving(true);
    try {
      await createTracker(endpoint, values);
      setValues(initial);
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save entry.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <TrackerCard>
      <h2 className="mb-5 text-xl font-black text-slate-950">{title}</h2>
      <form className="grid gap-4" onSubmit={submit}>
        {fields.map((field) => (
          <label key={field.name} className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-wide text-slate-500">{field.label}</span>
            {field.type === 'textarea' ? (
              <textarea
                required={field.required}
                value={String(values[field.name] ?? '')}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                className="min-h-28 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            ) : field.type === 'select' ? (
              <select
                required={field.required}
                value={String(values[field.name] ?? '')}
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.value }))}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-cyan-400"
              >
                <option value="">Select</option>
                {field.options?.map((option) => (
                  <option key={String(option.value)} value={String(option.value)}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : field.type === 'checkbox' ? (
              <input
                checked={Boolean(values[field.name])}
                type="checkbox"
                onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                className="h-5 w-5 accent-cyan-500"
              />
            ) : (
              <input
                required={field.required}
                type={field.type}
                value={String(values[field.name] ?? '')}
                onChange={(event) => {
                  const value = field.type === 'number' ? Number(event.target.value) : event.target.value;
                  setValues((current) => ({ ...current, [field.name]: value }));
                }}
                className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 outline-none transition focus:border-cyan-400"
              />
            )}
          </label>
        ))}
        {error && <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-600">{error}</p>}
        <button
          disabled={saving}
          className="rounded-full bg-slate-950 px-6 py-3 font-black text-white transition hover:-translate-y-0.5 disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>
    </TrackerCard>
  );
}
