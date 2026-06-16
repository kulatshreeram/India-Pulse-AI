export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-saffron-400/20 border-t-saffron-400 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-blue-400/20 border-b-blue-400 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.8s' }} />
        </div>
        <p className="text-slate-400 text-sm animate-pulse">Loading India Pulse AI…</p>
      </div>
    </div>
  );
}
