'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, Target, BookOpen, Heart, Shield, Zap } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-950 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl font-black text-slate-950 sm:text-6xl">
              About Life OS
            </h1>
            <p className="mt-6 text-xl leading-8 text-slate-600">
              We believe that the parts of your life—habits, goals, mood, sleep, focus, and finances—shouldn't live in different apps. Life OS brings them together into one focused dashboard.
            </p>
          </div>

          {/* Mission Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-16 rounded-3xl border border-slate-200 bg-slate-50 p-8"
          >
            <h2 className="text-3xl font-black text-slate-950 mb-4">Our Mission</h2>
            <p className="text-lg leading-8 text-slate-600">
              To create the calmest, most effective personal dashboard for life management. We're building tools that help you capture what matters, prioritize wisely, and improve steadily.
            </p>
          </motion.section>

          {/* Values Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-black text-slate-950 mb-8">Our Values</h2>
            <div className="grid gap-6 md:grid-cols-2">
              {[
                {
                  title: 'Simplicity',
                  description: 'Clean interfaces, thoughtful defaults, and minimal friction. We remove clutter so you can focus on what matters.',
                  Icon: Sparkles,
                  color: 'from-blue-100 to-blue-200',
                },
                {
                  title: 'Privacy',
                  description: 'Your data is yours. We don\'t sell it, track it, or use it to manipulate you. Secure by default.',
                  Icon: Shield,
                  color: 'from-green-100 to-green-200',
                },
                {
                  title: 'Effectiveness',
                  description: 'Every feature serves a purpose. We\'re obsessed with helping you build systems that actually work.',
                  Icon: Zap,
                  color: 'from-yellow-100 to-yellow-200',
                },
                {
                  title: 'Connection',
                  description: 'Life is interconnected. Your mood affects focus. Goals connect to habits. We show these relationships.',
                  Icon: Heart,
                  color: 'from-red-100 to-red-200',
                },
              ].map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-lg transition"
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${value.color} flex items-center justify-center mb-4`}>
                    <value.Icon className="w-6 h-6 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-black text-slate-950 mb-3">{value.title}</h3>
                  <p className="text-slate-600 leading-7">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Features Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-3xl font-black text-slate-950 mb-8">What You Can Track</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { Icon: Sparkles, name: 'Habits', desc: 'Build streaks and spot what works', color: 'text-indigo-600' },
                { Icon: Target, name: 'Goals', desc: 'Track progress with milestones', color: 'text-purple-600' },
                { Icon: Heart, name: 'Mood', desc: 'Log emotions and trends', color: 'text-cyan-600' },
                { Icon: BookOpen, name: 'Sleep', desc: 'Monitor rest patterns', color: 'text-indigo-600' },
                { Icon: Zap, name: 'Focus', desc: 'Track productivity sessions', color: 'text-emerald-600' },
                { Icon: Sparkles, name: 'Finances', desc: 'Manage budgets and spending', color: 'text-green-600' },
              ].map((feature) => (
                <div key={feature.name} className="rounded-xl border border-slate-200 bg-white p-4 text-center hover:border-slate-300 transition">
                  <feature.Icon className={`w-8 h-8 mx-auto mb-2 ${feature.color}`} />
                  <h3 className="font-bold text-slate-950">{feature.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{feature.desc}</p>
                </div>
              ))}
            </div>
          </motion.section>

          {/* CTA Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="text-center"
          >
            <h2 className="text-3xl font-black text-slate-950 mb-6">Ready to get started?</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-8 py-4 font-bold text-white transition hover:-translate-y-1 hover:bg-slate-800"
              >
                Create Account
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 font-bold text-slate-950 transition hover:bg-slate-50"
              >
                Sign In
              </Link>
            </div>
          </motion.section>
        </motion.div>
      </main>
    </div>
  );
}
