'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Map, Bot, ChevronRight, X, Sparkles } from 'lucide-react';

const STEPS = [
  {
    id: 1,
    icon: '🗺️',
    title: 'Explore the Live Map',
    description: 'Every dot on the map is a live news story. Click any marker to read the article. Click a state to see all regional news.',
    highlight: 'map',
    color: '#fb923c',
  },
  {
    id: 2,
    icon: '📰',
    title: 'Discover State News',
    description: 'Click any Indian state on the map to open a news panel with the latest stories from that region, complete with AI summaries.',
    highlight: 'state',
    color: '#3b82f6',
  },
  {
    id: 3,
    icon: '🤖',
    title: 'Ask the AI Assistant',
    description: 'Use the AI Chat to ask anything about Indian news. Generate full research reports, daily briefings, and trend analyses.',
    highlight: 'ai',
    color: '#a855f7',
  },
];

const STORAGE_KEY = 'india_pulse_onboarded';

export function OnboardingOverlay() {
  const [visible, setVisible] = useState(false);
  const [step, setStep]       = useState(0);

  useEffect(() => {
    // Only show on first visit
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done) {
      // Small delay so the map loads first
      const t = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  const next = () => {
    if (step < STEPS.length - 1) setStep(step + 1);
    else dismiss();
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      {visible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-[2px]"
            onClick={dismiss}
          />

          {/* Card */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[340px] sm:w-[400px]"
          >
            <div
              className="rounded-3xl p-6 relative overflow-hidden"
              style={{
                background: 'rgba(9,14,28,0.98)',
                backdropFilter: 'blur(32px)',
                border: '1px solid rgba(255,255,255,0.10)',
                boxShadow: `0 30px 80px rgba(0,0,0,0.6), 0 0 40px ${current.color}15`,
              }}
            >
              {/* Dismiss */}
              <button
                onClick={dismiss}
                className="absolute top-4 right-4 w-7 h-7 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/8 transition-all"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Brand pill */}
              <div className="flex items-center gap-2 mb-5">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
                  style={{ background: 'rgba(251,146,60,0.08)', border: '1px solid rgba(251,146,60,0.15)' }}>
                  <Sparkles className="w-3 h-3 text-orange-400" />
                  <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Quick Tour</span>
                </div>
                <span className="text-[10px] text-slate-600">{step + 1} of {STEPS.length}</span>
              </div>

              {/* Icon */}
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
                style={{ background: `${current.color}12`, border: `1px solid ${current.color}25` }}
              >
                {current.icon}
              </div>

              {/* Content */}
              <h2 className="text-lg font-black text-white mb-2">{current.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-6">{current.description}</p>

              {/* Progress dots */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {STEPS.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setStep(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width: i === step ? 20 : 6,
                        height: 6,
                        background: i === step ? current.color : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>

                <button
                  onClick={next}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                  style={{
                    background: `linear-gradient(135deg,${current.color},${current.color}cc)`,
                    boxShadow: `0 6px 20px ${current.color}30`,
                  }}
                >
                  {step === STEPS.length - 1 ? "Let's Go!" : 'Next'}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
