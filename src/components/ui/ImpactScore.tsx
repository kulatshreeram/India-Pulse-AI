import type { ImpactScore } from '@/types';

interface ImpactScoreDisplayProps {
  impactScore: ImpactScore;
}

function ScorePill({ label, value }: { label: string; value: number }) {
  const color = value >= 75 ? '#10b981' : value >= 50 ? '#f59e0b' : value >= 25 ? '#f97316' : '#6b7280';
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold border-2"
        style={{ borderColor: color, background: `${color}20`, color }}
      >
        {value}
      </div>
      <span className="text-xs text-slate-500 font-medium">{label}</span>
    </div>
  );
}

export function ImpactScoreDisplay({ impactScore }: ImpactScoreDisplayProps) {
  return (
    <div>
      <p className="section-heading mb-3">Impact Score</p>
      <div className="flex gap-4 justify-between">
        <ScorePill label="Local"    value={impactScore.local} />
        <ScorePill label="State"    value={impactScore.state} />
        <ScorePill label="National" value={impactScore.national} />
        <ScorePill label="Global"   value={impactScore.global} />
      </div>
    </div>
  );
}
