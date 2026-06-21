'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppAuth } from '@/context/AuthContext';
import { Zap, Mail, User, ArrowRight, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';

export default function LoginPage() {
  const router = useRouter();
  const { user, isSignedIn, login, isClerk, isLoading } = useAppAuth();
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isSignedIn) {
      router.push('/dashboard');
    }
  }, [isSignedIn, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Email is required');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      await login(email, name || email.split('@')[0]);
      router.push('/dashboard');
    } catch (e: any) {
      setErrorMsg(e.message || 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  // If Clerk is active, render Clerk component wrapped in a beautiful styling block
  if (isClerk) {
    const { SignIn } = require('@clerk/nextjs');
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
          <SignIn routing="hash" afterSignInUrl="/dashboard" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <Navbar />
      
      {/* Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-glow-md mb-4">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Access News Intelligence</h1>
          <p className="text-sm text-slate-500 mt-2">Sign in to your guest account or create one below</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Your Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="text"
                  placeholder="e.g. Shree Ram"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/5 focus:border-orange-500/30 text-sm text-white focus:outline-none focus:ring-0 transition-colors placeholder:text-slate-700"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                <input
                  type="email"
                  placeholder="e.g. shree@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-950 border border-white/5 focus:border-orange-500/30 text-sm text-white focus:outline-none focus:ring-0 transition-colors placeholder:text-slate-700"
                  required
                />
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
                  Enter Dashboard
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Create Account Fallback Link */}
          <div className="mt-6 text-center text-xs text-slate-500 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-orange-400 hover:text-orange-300 font-bold transition-all">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
