'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, X, Copy, Loader, Mic, MicOff, Volume2, VolumeX, MessageSquare, Trash2, RotateCcw } from 'lucide-react';
import { aiCompanionAPI, AiMessage, AiConversation, AiPersonality } from '@/lib/ai-companion';
import { format } from 'date-fns';

interface AiChatProps {
  isOpen: boolean;
  onClose: () => void;
  initialPersonality?: AiPersonality;
  onPersonalityChange?: (personality: AiPersonality) => void;
}

const personalityColors = {
  astro: 'from-blue-500 to-cyan-500',
  nova: 'from-purple-500 to-pink-500',
  ember: 'from-orange-500 to-red-500',
} as const;

export function AiChat({ isOpen, onClose, initialPersonality = 'astro', onPersonalityChange }: AiChatProps) {
  const [conversation, setConversation] = useState<AiConversation | null>(null);
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [personality, setPersonality] = useState<AiPersonality>(initialPersonality);
  const [isListening, setIsListening] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize conversation
  useEffect(() => {
    if (isOpen && !conversation) {
      loadConversation();
    }
  }, [isOpen, conversation]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      const conv = await aiCompanionAPI.getCurrentConversation();
      setConversation(conv);
      setMessages(conv.messages);
    } catch (error) {
      // Create new conversation if none exists
      try {
        const newConv = await aiCompanionAPI.createConversation(personality);
        setConversation(newConv);
        setMessages(newConv.messages);
      } catch (createError) {
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim() || !conversation || loading) return;

    try {
      setLoading(true);
      const message = inputMessage;
      setInputMessage('');

      const response = await aiCompanionAPI.sendMessage(
        message,
        personality,
        conversation.id
      );

      // Add both messages to the display
      setMessages((prev) => [
        ...prev,
        response.user_message,
        response.ai_message,
      ]);

      // Play sound notification if enabled
      if (soundEnabled) {
        playNotificationSound();
      }
    } catch (error) {
      setInputMessage(inputMessage); // Restore input on error
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleChangePersonality = async (newPersonality: AiPersonality) => {
    try {
      setPersonality(newPersonality);
      await aiCompanionAPI.changePersonality(newPersonality);
      onPersonalityChange?.(newPersonality);
    } catch (error) {
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
  };

  const startListening = async () => {
    try {
      setIsListening(true);
      // TODO: Implement speech-to-text using Web Speech API
      // For now, just a placeholder
    } catch (error) {
      setIsListening(false);
    }
  };

  const playNotificationSound = () => {
    // Simple beep sound using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const handleClearHistory = async () => {
    if (!conversation) return;
    
    const confirmed = confirm('Are you sure you want to clear all messages in this chat? This action cannot be undone.');
    if (!confirmed) return;

    try {
      setLoading(true);
      await aiCompanionAPI.clearHistory(conversation.id);
      
      // Reload conversation to get fresh greeting
      const updatedConv = await aiCompanionAPI.getConversation(conversation.id);
      setConversation(updatedConv);
      setMessages(updatedConv.messages);
    } catch (error) {
      alert('Failed to clear chat history');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteConversation = async () => {
    if (!conversation) return;
    
    const confirmed = confirm('Delete this entire conversation? This cannot be undone.');
    if (!confirmed) return;

    try {
      setLoading(true);
      await aiCompanionAPI.deleteConversation(conversation.id);
      
      // Create a new conversation
      const newConv = await aiCompanionAPI.createConversation(personality);
      setConversation(newConv);
      setMessages(newConv.messages);
    } catch (error) {
      alert('Failed to delete conversation');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${personalityColors[personality]} px-6 py-4 text-white flex items-center justify-between`}>
            <div className="flex items-center gap-3">
              <MessageSquare className="h-6 w-6" />
              <div>
                <h2 className="font-bold capitalize">{personality}</h2>
                <p className="text-xs text-white/80">AI Companion</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                onClick={handleClearHistory}
                disabled={loading || messages.length === 0}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Clear messages"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="h-4 w-4" />
              </motion.button>
              <motion.button
                onClick={handleDeleteConversation}
                disabled={loading}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Delete conversation"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Trash2 className="h-4 w-4" />
              </motion.button>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Personality Selector */}
          <div className="px-4 py-2 border-b border-slate-200 flex gap-2">
            {(['astro', 'nova', 'ember'] as const).map((p) => (
              <motion.button
                key={p}
                onClick={() => handleChangePersonality(p)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                  personality === p
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </motion.button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
            {loading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader className="h-8 w-8 text-slate-400 animate-spin mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Loading conversation...</p>
                </div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <MessageSquare className="h-12 w-12 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-600">Start a conversation!</p>
                </div>
              </div>
            ) : (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                        message.role === 'user'
                          ? 'bg-slate-900 text-white rounded-br-none'
                          : 'bg-slate-100 text-slate-900 rounded-bl-none'
                      }`}
                    >
                      <p className="break-words">{message.content}</p>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs opacity-70">
                          {format(new Date(message.created_at), 'HH:mm')}
                        </p>
                        {message.role === 'ai' && (
                          <button
                            onClick={() => copyMessage(message.content)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                            title="Copy message"
                          >
                            <Copy className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
                {loading && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex justify-start"
                  >
                    <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg">
                      <div className="flex gap-2">
                        <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" />
                        <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="h-2 w-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-slate-200 px-4 py-3 space-y-2">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <motion.button
                type="button"
                onClick={startListening}
                disabled={isListening || loading}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  isListening
                    ? 'bg-red-500 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                whileHover={!isListening ? { scale: 1.05 } : {}}
                whileTap={!isListening ? { scale: 0.95 } : {}}
                title="Voice input"
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </motion.button>

              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Message..."
                disabled={loading}
                className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 disabled:bg-slate-50"
              />

              <motion.button
                type="button"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`px-3 py-2 rounded-lg transition-colors ${
                  soundEnabled
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Sound notifications"
              >
                {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
              </motion.button>

              <motion.button
                type="submit"
                disabled={!inputMessage.trim() || loading}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
              </motion.button>
            </form>
            <p className="text-xs text-slate-500 text-center">Press Enter to send • Shift+Enter for new line</p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
