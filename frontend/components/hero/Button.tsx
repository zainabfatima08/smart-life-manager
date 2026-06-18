import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: 'primary' | 'secondary';
};

// Reusable premium CTA button for the hero. It intentionally uses Tailwind
// classes only so the visual system stays portable and easy to customize.
export function Button({ children, className, variant = 'primary', ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'group relative inline-flex min-h-12 items-center justify-center overflow-hidden rounded-full px-7 py-3 text-sm font-bold transition duration-300 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:pointer-events-none disabled:opacity-60',
        variant === 'primary'
          ? 'bg-slate-950 text-white shadow-2xl shadow-indigo-500/20 hover:-translate-y-0.5 hover:shadow-indigo-500/30'
          : 'border border-white/70 bg-white/55 text-slate-900 shadow-xl shadow-slate-200/60 backdrop-blur-xl hover:-translate-y-0.5 hover:bg-white/80',
        className,
      )}
      {...props}
    >
      <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition duration-700 group-hover:translate-x-full" />
      <span className="relative z-10">{children}</span>
    </button>
  );
}