'use client';

import dynamic from 'next/dynamic';
import { useMemo } from 'react';

export default function MapWrapper() {
  const Map = useMemo(
    () =>
      dynamic(() => import('./IndiaMap'), {
        loading: () => (
          <div className="h-full w-full flex items-center justify-center bg-slate-950">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-saffron-400/30 border-t-saffron-400 animate-spin" />
              </div>
              <p className="text-slate-500 text-sm">Loading Map…</p>
            </div>
          </div>
        ),
        ssr: false,
      }),
    []
  );

  return <Map />;
}
