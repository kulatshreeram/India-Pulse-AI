'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppAuth } from '@/context/AuthContext';
import { Zap, Mail, User, ArrowRight, Loader2, Check } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

const INTERESTS = [
  { id: 'politics', label: 'Politics', emoji: '🏛️' },
  { id: 'technology', label: 'Technology', emoji: '💻' },
  { id: 'startups', label: 'Startups', emoji: '🚀' },
  { id: 'business', label: 'Business', emoji: '📈' },
  { id: 'sports', label: 'Sports', emoji: '🏆' },
  { id: 'science', label: 'Science', emoji: '🔬' },
  { id: 'entertainment', label: 'Entertainment', emoji: '🎬' },
  { id: 'weather', label: 'Weather & Climate', emoji: '🌦️' },
  { id: 'crime', label: 'Law & Order', emoji: '👮' }
];

export default function SignupPage() {
  const router = useRouter();
  const { user, isSignedIn, signup, isClerk } = useAppAuth();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Email is required');
      return;
    }
    if (!name) {
      setErrorMsg('Name is required');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await signup(email, name, selectedInterests);
      router.push('/dashboard');
    } catch (e: any) {
      setErrorMsg(e.message || 'Signup failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isClerk) {
    const { SignUp } = require('@clerk/nextjs');
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <Navbar />
        {/* Background Gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-[120px]" />
        </div>
        <div className="relative z-10 w-full max-w-md flex flex-col items-center">
          <div className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-glow-sm">
              <Zap className="w-5 h-5 text-white animate-pulse" />
            </div>
            <span className="font-bold text-xl text-white">
              <span className="gradient-text">India Pulse</span> AI
            </span>
          </div>
          <SignUp routing="hash" afterSignUpUrl="/dashboard" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center py-20 px-6 relative overflow-hidden">
      <Navbar />
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-lg">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-glow-md mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Pulse Account</h1>
          <p className="text-sm text-slate-500 mt-2">Get personalized Indian news intelligence bulletins</p>
        </div>

        {/* Card */}
        <div
          className="p-8 rounded-3xl"
          style={{
            background: 'rgba(9, 14, 28, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)',
          }}
        >
          {errorMsg && (
            <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Account Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    placeholder="Shree Ram"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/5 focus:border-orange-500/30 text-sm text-white focus:outline-none focus:ring-0 transition-colors placeholder:text-slate-700"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="email"
                    placeholder="shree@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/5 focus:border-orange-500/30 text-sm text-white focus:outline-none focus:ring-0 transition-colors placeholder:text-slate-700"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Step 2: Interest selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Select Interests (Personalized Feed)
              </label>
              <p className="text-[10px] text-slate-500">Pick categories to tailor your Recommended For You bulletins</p>
              
              <div className="grid grid-cols-3 gap-2 pt-1.5">
                {INTERESTS.map((item) => {
                  const active = selectedInterests.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleInterest(item.id)}
                      className={`py-2 px-1 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                        active
                          ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                          : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                      }`}
                    >
                      <span className="text-lg">{item.emoji}</span>
                      <span className="text-[10px] font-bold tracking-tight text-center">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 group transition-all"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                boxShadow: '0 4px 15px rgba(251,146,60,0.3)',
              }}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  Register & Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-orange-400 hover:text-orange-300 font-bold transition-all">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
