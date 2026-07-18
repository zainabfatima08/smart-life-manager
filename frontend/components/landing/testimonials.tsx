'use client';

import { motion } from 'motion/react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Product Designer',
    avatar: 'SC',
    rating: 5,
    review: 'Life OS transformed how I manage my week. The dashboard is so intuitive I can plan my entire day in 5 minutes.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Marcus Johnson',
    role: 'Founder & CEO',
    avatar: 'MJ',
    rating: 5,
    review: 'Finally a tool that understands the whole picture. Habits, mood, finances—all in one place. Game changer.',
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Elena Rodriguez',
    role: 'Software Engineer',
    avatar: 'ER',
    rating: 5,
    review: 'The focus tracking feature helped me understand my productivity patterns. I ship 40% faster now.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    name: 'David Kim',
    role: 'Freelance Writer',
    avatar: 'DK',
    rating: 5,
    review: 'The weekly review system is brilliant. I actually stick to my goals now. This is what I needed.',
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Priya Patel',
    role: 'Health Coach',
    avatar: 'PP',
    rating: 5,
    review: 'Tracking habits and mood together shows patterns I never noticed before. Absolutely incredible.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    name: 'James Wilson',
    role: 'Consultant',
    avatar: 'JW',
    rating: 5,
    review: 'The clean interface means I actually use it daily. Better than all my previous tracking apps combined.',
    color: 'from-indigo-500 to-blue-500',
  },
];

export function TestimonialsSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 to-white px-4 py-20 sm:px-6 lg:px-8">
      {/* Subtle background elements */}
      <motion.div
        animate={{
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br from-blue-200/30 to-cyan-200/30 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-600">Trusted by users</p>
          <h2 className="mt-4 text-4xl font-black leading-tight text-slate-950 sm:text-5xl">
            Loved by thousands worldwide
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            See why people are choosing Life OS to transform their daily routines and achieve their goals.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: index * 0.05 }}
              whileHover={{
                translateY: -8,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
              }}
              className="group rounded-2xl border border-white/60 bg-gradient-to-br from-white/80 to-slate-50/80 p-6 shadow-lg backdrop-blur transition"
            >
              {/* Glassmorphism border glow */}
              <motion.div
                className="absolute inset-0 rounded-2xl opacity-0 transition"
                whileHover={{ opacity: 1 }}
              />

              {/* Star rating */}
              <div className="mb-4 flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <motion.div
                    key={i}
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.1,
                    }}
                  >
                    <Star
                      size={16}
                      className="fill-amber-400 text-amber-400"
                    />
                  </motion.div>
                ))}
              </div>

              {/* Review text */}
              <p className="mb-6 text-sm leading-7 text-slate-700">
                "{testimonial.review}"
              </p>

              {/* User info */}
              <div className="flex items-center gap-3 border-t border-white/40 pt-4">
                <motion.div
                  className={`h-10 w-10 rounded-full bg-gradient-to-br ${testimonial.color} grid place-items-center font-bold text-white text-sm`}
                  whileHover={{ scale: 1.1 }}
                >
                  {testimonial.avatar}
                </motion.div>
                <div>
                  <p className="font-bold text-slate-950">{testimonial.name}</p>
                  <p className="text-xs text-slate-500">{testimonial.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
