'use client';

import dynamic from 'next/dynamic';

// Import IndiaMap once at module level — never inside useMemo or a hook.
// This prevents the map from remounting on every render and breaking tile loading.
const IndiaMap = dynamic(() => import('./IndiaMap'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-full border-2 border-saffron-400/30 border-t-saffron-400 animate-spin" />
        <p className="text-slate-500 text-sm">Loading Map…</p>
      </div>
    </div>
  ),
});

export default function MapWrapper() {
  return <IndiaMap />;
}
