'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';

export function CTASection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white px-4 py-24 sm:px-6 lg:px-8">
      {/* Animated background elements */}
      <motion.div
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute top-10 left-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-blue-300/20 to-cyan-300/20 blur-3xl"
      />
      <motion.div
        animate={{
          x: [0, -100, 0],
          y: [0, -60, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute bottom-10 right-1/4 h-96 w-96 rounded-full bg-gradient-to-br from-purple-300/20 to-pink-300/20 blur-3xl"
      />

      <div className="relative z-10 mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          {/* Badge */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-gradient-to-r from-cyan-50/80 to-blue-50/80 px-4 py-2 text-sm font-bold text-cyan-700 shadow-sm backdrop-blur"
          >
            <Sparkles size={16} />
            Limited time offer
          </motion.div>

          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight text-slate-950 mb-6">
            Ready to transform your week?
          </h2>

          <p className="text-xl leading-8 text-slate-600 mb-8 mx-auto max-w-2xl">
            Join thousands of people who've already taken control of their goals, habits, mood, and finances. Your calm, clear week starts today.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/register"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-slate-950 to-slate-800 px-8 py-4 text-base font-black text-white shadow-xl shadow-slate-900/40 hover:shadow-2xl hover:shadow-slate-900/50 transition"
              >
                Get Started Free <ArrowRight size={20} />
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                href="/#how-it-works"
                className="inline-flex items-center justify-center rounded-full border-2 border-slate-300 bg-white px-8 py-4 text-base font-black text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50 transition"
              >
                Learn More
              </Link>
            </motion.div>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap gap-6 justify-center text-sm text-slate-600 font-bold"
          >
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              No credit card required
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              Free forever plan available
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500" />
              100% data privacy
            </div>
          </motion.div>
        </motion.div>

        {/* Floating stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mt-16 grid gap-4 md:grid-cols-3 mx-auto max-w-2xl"
        >
          {[
            { value: '10K+', label: 'Active Users' },
            { value: '4.9★', label: 'Average Rating' },
            { value: '100%', label: 'Secure' },
          ].map((stat, idx) => (
            <motion.div
              key={stat.label}
              whileHover={{ translateY: -8, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)' }}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-md transition"
            >
              <div className="text-2xl font-black text-slate-950">{stat.value}</div>
              <div className="mt-1 text-xs font-bold uppercase tracking-wide text-slate-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
