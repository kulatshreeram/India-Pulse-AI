'use client';

import { useState, useEffect, useRef } from 'react';
import { useNewsStore } from '@/store/newsStore';
import { useNews } from '@/hooks/useNews';
import { Play, Pause, Calendar, RotateCcw, ChevronRight, FastForward } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

export function TimelineSlider() {
  const { t } = useTranslation();
  const { filters, setFilters, replayTimestamp, isReplayActive, setReplayState } = useNewsStore();
  const { data } = useNews(filters);
  const articles = data?.articles ?? [];

  const [activeTab, setActiveTab] = useState<'today' | 'yesterday' | '7days' | '30days' | 'custom'>('7days');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  
  // Replay player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1); // 1x, 2x, 5x
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Find min/max timestamps for the active articles
  const getTimelineLimits = () => {
    if (articles.length === 0) {
      const now = Date.now();
      return { min: now - 7 * 86400000, max: now };
    }
    const times = articles.map(a => new Date(a.publishedAt).getTime());
    return {
      min: Math.min(...times),
      max: Math.max(...times)
    };
  };

  const { min: minTime, max: maxTime } = getTimelineLimits();

  // Handle preset filters
  const handlePresetSelect = (preset: 'today' | 'yesterday' | '7days' | '30days' | 'custom') => {
    setActiveTab(preset);
    setIsPlaying(false);
    setReplayState({ isReplayActive: false, replayTimestamp: null });

    if (preset === 'custom') {
      // Don't update filter immediately, wait for date inputs
      return;
    }

    setFilters({
      dateRange: preset,
      startDate: undefined,
      endDate: undefined
    });
  };

  // Handle custom date apply
  const applyCustomRange = () => {
    if (customStart && customEnd) {
      setIsPlaying(false);
      setReplayState({ isReplayActive: false, replayTimestamp: null });
      setFilters({
        dateRange: 'custom',
        startDate: new Date(customStart).toISOString(),
        endDate: new Date(customEnd).toISOString()
      });
    }
  };

  // Replay Mode Logic
  const startReplay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      return;
    }

    setIsPlaying(true);
    setReplayState({ isReplayActive: true });
    
    // Start from current scrub position, or restart if near the end
    let current = replayTimestamp !== null && replayTimestamp < maxTime ? replayTimestamp : minTime;
    setReplayState({ replayTimestamp: current });
  };

  useEffect(() => {
    if (isPlaying) {
      const intervalMs = 150;
      // Step sizes in milliseconds:
      // 1x = 1 hour step per tick
      // 2x = 3 hour step per tick
      // 5x = 12 hour step per tick
      const hoursPerStep = speed === 1 ? 2 : (speed === 2 ? 6 : 24);
      const stepMs = hoursPerStep * 3600 * 1000;

      timerRef.current = setInterval(() => {
        const currentTS = useNewsStore.getState().replayTimestamp;
        const next = (currentTS ?? minTime) + stepMs;
        if (next >= maxTime) {
          setIsPlaying(false);
          setReplayState({ replayTimestamp: maxTime });
        } else {
          setReplayState({ replayTimestamp: next });
        }
      }, intervalMs);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, minTime, maxTime, speed, setReplayState]);

  // Sync state if replay is stopped from outside
  useEffect(() => {
    if (!isReplayActive && isPlaying) {
      setIsPlaying(false);
    }
  }, [isReplayActive, isPlaying]);

  const handleScrubChange = (val: number) => {
    setIsPlaying(false);
    setReplayState({
      isReplayActive: true,
      replayTimestamp: val
    });
  };

  const resetReplay = () => {
    setIsPlaying(false);
    setReplayState({
      isReplayActive: false,
      replayTimestamp: null
    });
  };

  const formatDateLabel = (ts: number | null) => {
    if (!ts) return '';
    const date = new Date(ts);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-2xl px-4 py-3 rounded-2xl flex flex-col gap-3"
      style={{
        background: 'rgba(9, 14, 28, 0.9)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
      }}
    >
      {/* Top Filter Buttons & Custom Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        {/* Preset selectors */}
        <div className="flex items-center bg-slate-900/80 p-0.5 rounded-lg border border-white/5">
          {(['today', 'yesterday', '7days', '30days', 'custom'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => handlePresetSelect(tab)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all uppercase ${
                activeTab === tab
                  ? 'bg-orange-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab === '7days' ? t('7 Days') : tab === '30days' ? t('30 Days') : t(tab)}
            </button>
          ))}
        </div>

        {/* Custom Range Picker Fields */}
        {activeTab === 'custom' && (
          <div className="flex items-center gap-1.5 bg-slate-950/40 px-2 py-1 rounded-lg border border-white/5">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-transparent border-0 text-slate-300 text-[10px] font-bold focus:ring-0 w-24 p-0 outline-none cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 font-bold">to</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-transparent border-0 text-slate-300 text-[10px] font-bold focus:ring-0 w-24 p-0 outline-none cursor-pointer"
            />
            <button
              onClick={applyCustomRange}
              disabled={!customStart || !customEnd}
              className="px-2 py-0.5 text-[10px] font-black uppercase text-orange-400 hover:bg-orange-500/10 rounded border border-orange-500/20 disabled:opacity-30 disabled:pointer-events-none transition-all"
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 w-full" />

      {/* Bottom Replay Control & Seekbar */}
      <div className="flex items-center gap-3">
        {/* Play/Pause Button */}
        <button
          onClick={startReplay}
          className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 animate-pulse'
              : 'bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/20'
          }`}
          title={isPlaying ? 'Pause Replay' : 'Start News Replay'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white ml-0.5" />}
        </button>

        {/* Speed Selector */}
        {isReplayActive && (
          <button
            onClick={() => setSpeed((prev) => (prev === 1 ? 2 : prev === 2 ? 5 : 1))}
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 border border-white/5 text-[10px] text-orange-400 font-bold hover:border-orange-500/20 transition-all"
            title="Toggle playback speed"
          >
            <FastForward className="w-3 h-3" />
            {speed}x
          </button>
        )}

        {/* Seekbar and display */}
        <div className="flex-1 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span>{formatDateLabel(minTime)}</span>
            {isReplayActive && replayTimestamp !== null && (
              <span className="text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping" />
                {t('Replay')}: {formatDateLabel(replayTimestamp)}
              </span>
            )}
            <span>{formatDateLabel(maxTime)}</span>
          </div>

          <input
            type="range"
            min={minTime}
            max={maxTime}
            value={replayTimestamp ?? maxTime}
            onChange={(e) => handleScrubChange(Number(e.target.value))}
            className="w-full h-1.5 rounded-lg appearance-none cursor-pointer bg-slate-800 accent-orange-500 outline-none"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${
                (( (replayTimestamp ?? maxTime) - minTime) / (maxTime - minTime || 1)) * 100
              }%, #1e293b ${
                (( (replayTimestamp ?? maxTime) - minTime) / (maxTime - minTime || 1)) * 100
              }%, #1e293b 100%)`
            }}
          />
        </div>

        {/* Reset button */}
        {isReplayActive && (
          <button
            onClick={resetReplay}
            className="p-2 rounded bg-slate-900 border border-white/5 hover:text-orange-400 transition-colors text-slate-400"
            title="Reset to Live Mode"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
