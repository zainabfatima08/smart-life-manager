'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, Mail, MessageSquare, Code2, Send } from 'lucide-react';
import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd send this to a backend
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

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
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-black text-slate-950 sm:text-6xl">
              Get in Touch
            </h1>
            <p className="mt-4 text-xl text-slate-600">
              Have questions or feedback? We'd love to hear from you.
            </p>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {/* Contact Form */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h2 className="text-2xl font-black text-slate-950 mb-6">Send us a message</h2>
              
              {submitted ? (
                <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
                  <div className="text-4xl mb-2">✓</div>
                  <h3 className="font-bold text-green-900 text-lg">Message sent!</h3>
                  <p className="text-green-800 mt-2">We'll get back to you soon.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold transition focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                      placeholder="Your name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold transition focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Subject</label>
                    <input
                      type="text"
                      required
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold transition focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                      placeholder="What is this about?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                    <textarea
                      required
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={6}
                      className="w-full rounded-lg border border-slate-200 bg-white px-4 py-3 font-semibold transition focus:border-slate-950 focus:outline-none focus:ring-2 focus:ring-slate-950/10"
                      placeholder="Your message..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full rounded-lg bg-slate-950 px-6 py-3 font-bold text-white transition hover:bg-slate-800"
                  >
                    Send Message
                  </button>
                </form>
              )}
            </motion.section>

            {/* Contact Info */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-black text-slate-950 mb-6">Other ways to reach us</h2>

              {/* Email */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 transition">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-slate-100 p-3 mt-1">
                    <Mail className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 mb-1">Email</h3>
                    <p className="text-slate-600">support@lifeos.app</p>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 transition">
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-slate-100 p-3 mt-1">
                    <MessageSquare className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950 mb-1">Live Chat</h3>
                    <p className="text-slate-600">Available Monday-Friday, 9am-5pm PT</p>
                  </div>
                </div>
              </div>

              {/* Social */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h3 className="font-bold text-slate-950 mb-4">Follow us</h3>
                <div className="flex gap-3">
                  <a
                    href="#"
                    className="rounded-lg bg-slate-100 p-3 hover:bg-slate-200 transition"
                    title="GitHub"
                  >
                    <Code2 className="w-5 h-5 text-slate-950" />
                  </a>
                  <a
                    href="#"
                    className="rounded-lg bg-slate-100 p-3 hover:bg-slate-200 transition"
                    title="Email"
                  >
                    <Send className="w-5 h-5 text-slate-950" />
                  </a>
                </div>
              </div>

              {/* FAQ */}
              <div className="rounded-2xl border border-blue-200 bg-blue-50 p-6">
                <h3 className="font-bold text-blue-950 mb-2">FAQ</h3>
                <p className="text-blue-800 text-sm mb-3">Check out our frequently asked questions to find quick answers.</p>
                <Link href="#" className="text-blue-700 font-semibold hover:text-blue-900 transition">
                  View FAQ →
                </Link>
              </div>
            </motion.section>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
