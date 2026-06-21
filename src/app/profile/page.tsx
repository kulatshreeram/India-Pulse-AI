'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppAuth } from '@/context/AuthContext';
import { useUserBookmarks, useSavePreferences } from '@/hooks/useNews';
import { Navbar } from '@/components/layout/Navbar';
import { User, Mail, Shield, Check, Loader2, Bookmark, BarChart, Settings, Award } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

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

export default function ProfilePage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isSignedIn, isLoading, updateProfile } = useAppAuth();
  const { data: bookmarks = [], isLoading: isBookmarksLoading } = useUserBookmarks();
  const savePrefsMutation = useSavePreferences();

  const [name, setName] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Route protection redirect
  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, isLoading, router]);

  // Load user data on initialization
  useEffect(() => {
    if (user) {
      setName(user.name);
      setSelectedInterests(user.interests || []);
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </main>
    );
  }

  const toggleInterest = (id: string) => {
    setSelectedInterests(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setSuccessMsg('');

    try {
      // 1. Update Auth profile (saves name & interests to local/Clerk session)
      await updateProfile(name, selectedInterests);
      
      // 2. Call SavePreferences mutation (syncs with backend endpoints)
      await savePrefsMutation.mutateAsync(selectedInterests);
      
      setSuccessMsg(t('Preferences updated successfully'));
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-24 pb-16 px-6 relative overflow-hidden">
      <Navbar />

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-orange-500/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Side: Avatar Card */}
        <div className="md:col-span-1 space-y-6">
          <div
            className="p-6 rounded-2xl flex flex-col items-center text-center space-y-4"
            style={{
              background: 'rgba(9, 14, 28, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div className="relative">
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full border-2 border-orange-500/30 object-cover"
              />
              <span className="absolute bottom-0 right-0 px-2 py-0.5 bg-orange-500 text-white text-[9px] font-black rounded-full uppercase tracking-wider">
                {user.id.startsWith('mock_') ? 'Guest' : 'Member'}
              </span>
            </div>
            
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{user.name}</h2>
              <p className="text-xs text-slate-500 mt-1">{user.email}</p>
            </div>

            <div className="w-full border-t border-white/5 pt-4 flex justify-around text-center text-xs">
              <div>
                <p className="text-xl font-bold text-orange-400">{bookmarks.length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{t('Saved')}</p>
              </div>
              <div className="w-px bg-white/5" />
              <div>
                <p className="text-xl font-bold text-blue-400">{user.interests.length}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase">{t('Interests')}</p>
              </div>
            </div>
          </div>

          <div
            className="p-4 rounded-xl flex items-center gap-3 text-xs"
            style={{
              background: 'rgba(9, 14, 28, 0.4)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
            }}
          >
            <Shield className="w-5 h-5 text-orange-400 flex-shrink-0" />
            <p className="text-slate-400 leading-normal">
              Your preferences and library bookmarks are saved securely in SQLite local database.
            </p>
          </div>
        </div>

        {/* Right Side: Preferences Forms */}
        <div className="md:col-span-2 space-y-6">
          <div
            className="p-8 rounded-2xl space-y-6"
            style={{
              background: 'rgba(9, 14, 28, 0.75)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.06)',
            }}
          >
            <div>
              <h1 className="text-xl font-bold text-white">{t('Account Profile')}</h1>
              <p className="text-xs text-slate-500 mt-1">Configure name and customize categories for personalized news feeds</p>
            </div>

            {successMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Display Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-white/5 focus:border-orange-500/30 text-sm text-white focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Interests Grid */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Interests & Topics</label>
                  <p className="text-[10px] text-slate-500 mt-0.5">Toggle categories to prioritize articles on your custom feed</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {INTERESTS.map((item) => {
                    const active = selectedInterests.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleInterest(item.id)}
                        className={`py-2 px-3 rounded-xl border flex items-center gap-2 transition-all text-xs font-bold ${
                          active
                            ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 shadow-md'
                            : 'bg-slate-950 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-200'
                        }`}
                      >
                        <span>{item.emoji}</span>
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2.5 rounded-xl text-xs font-black uppercase text-white flex items-center gap-2 group transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #fb923c, #f97316)',
                    boxShadow: '0 4px 15px rgba(251,146,60,0.2)',
                  }}
                >
                  {isUpdating ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    t('Save Changes')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </main>
  );
}
