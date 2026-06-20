'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, useMap, Marker, Popup, GeoJSON } from 'react-leaflet';
import MarkerClusterGroup from '@changey/react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import '@changey/react-leaflet-markercluster/dist/styles.min.css';

import { useNewsStore } from '@/store/newsStore';
import { useNews, useStates } from '@/hooks/useNews';
import { CATEGORY_COLORS } from '@/lib/mock-data';
import type { NewsArticle } from '@/types';

// ── Constants ─────────────────────────────────────────────────────────────────
const INDIA_CENTER: [number, number] = [22.5, 82.0];
const INDIA_BOUNDS: [[number, number], [number, number]] = [
  [6.0, 68.0],
  [37.5, 97.5],
];
const DARK_TILES = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const DARK_TILES_ATTR = '© OpenStreetMap contributors © CARTO';

// ── Marker icon factory ───────────────────────────────────────────────────────
function createNewsIcon(article: NewsArticle) {
  const color = CATEGORY_COLORS[article.category] ?? '#fb923c';
  const size = article.isBreaking ? 24 : article.impactScore.national > 80 ? 18 : 14;

  if (article.isBreaking) {
    return L.divIcon({
      html: `
        <div style="position:relative;width:24px;height:24px;display:flex;align-items:center;justify-content:center;">
          <!-- Red pulsing outer ring -->
          <div style="
            position:absolute;width:100%;height:100%;border-radius:50%;
            background:#ef4444;opacity:0.6;
            animation:pulse-beacon 1.2s infinite;
          "></div>
          <!-- White border ring -->
          <div style="
            position:absolute;width:12px;height:12px;border-radius:50%;
            background:#ef4444;
            border:2.5px solid #ffffff;
            box-shadow:0 0 14px #ef4444;
          "></div>
          <!-- Small text tag above marker -->
          <div style="
            position:absolute;bottom:115%;left:50%;transform:translateX(-50%);
            white-space:nowrap;background:rgba(239,68,68,0.95);
            color:white;font-size:8px;font-weight:900;
            padding:1.5px 5.5px;border-radius:4px;
            box-shadow:0 2px 6px rgba(0,0,0,0.4);
            letter-spacing:0.5px;
            text-transform:uppercase;
            border: 1px solid rgba(255,255,255,0.15);
            display: flex; align-items: center; gap: 2px;
          "><span style="width:4px;height:4px;border-radius:50%;background:#ffffff;display:inline-block;animation:pulse-ring 1s infinite;"></span>Breaking</div>
        </div>`,
      className: '',
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -16],
    });
  }

  return L.divIcon({
    html: `
      <div style="position:relative;width:${size}px;height:${size}px;">
        <div style="
          position:absolute;inset:0;border-radius:50%;
          background:${color};opacity:0.35;
          animation:pulse-ring 2s ease-out infinite;
        "></div>
        <div style="
          position:relative;width:100%;height:100%;border-radius:50%;
          background:${color};
          border:2px solid rgba(255,255,255,0.65);
          box-shadow:0 0 10px ${color}80;
        "></div>
      </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 4],
  });
}

// ── Markers layer ─────────────────────────────────────────────────────────────
function NewsMarkers() {
  const { filters, setSelectedArticle } = useNewsStore();
  const { data } = useNews(filters);
  const articles = data?.articles ?? [];

  return (
    <MarkerClusterGroup chunkedLoading maxClusterRadius={40}>
      {articles
        .filter((a) => a.coordinates)
        .map((article) => (
          <Marker
            key={article.id}
            position={[article.coordinates!.lat, article.coordinates!.lng]}
            icon={createNewsIcon(article)}
            eventHandlers={{ click: () => setSelectedArticle(article) }}
          >
            <Popup>
              <div style={{ padding: '8px', minWidth: 220, maxWidth: 260 }}>
                {/* Category badge */}
                <div style={{ marginBottom: 6 }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700,
                    padding: '2px 8px', borderRadius: 4,
                    background: `${CATEGORY_COLORS[article.category]}25`,
                    color: CATEGORY_COLORS[article.category],
                    textTransform: 'uppercase', letterSpacing: 0.5,
                  }}>
                    {article.category}
                  </span>
                </div>
                {/* Title */}
                <p style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', lineHeight: 1.4, marginBottom: 8 }}>
                  {article.title.length > 90 ? article.title.slice(0, 90) + '…' : article.title}
                </p>
                {/* Footer */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: 11, color: '#64748b' }}>{article.source.name}</span>
                  <button
                    onClick={() => setSelectedArticle(article)}
                    style={{
                      fontSize: 11, color: '#fb923c',
                      background: 'rgba(251,146,60,0.15)',
                      border: '1px solid rgba(251,146,60,0.3)',
                      borderRadius: 6, padding: '3px 8px',
                      cursor: 'pointer', fontWeight: 600,
                    }}
                  >
                    Read More →
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
    </MarkerClusterGroup>
  );
}

// ── Fit bounds on first load ──────────────────────────────────────────────────
function MapEvents() {
  const map = useMap();
  const fitted = useRef(false);

  useEffect(() => {
    if (!fitted.current) {
      map.fitBounds(INDIA_BOUNDS, { padding: [20, 20] });
      fitted.current = true;
    }
  }, [map]);

  return null;
}

const normalizeStateName = (name: string): string => {
  return name.replace('&', 'and').trim();
};

// ── Main export ───────────────────────────────────────────────────────────────
export default function IndiaMap() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  
  const { filters, setFilters, isHeatmapMode } = useNewsStore();
  const { data: statesList } = useStates(filters.category);

  const stateCounts = statesList?.reduce((acc: Record<string, number>, s) => {
    acc[s.name] = s.newsCount;
    return acc;
  }, {}) ?? {};

  useEffect(() => {
    if (wrapperRef.current) {
      const el = wrapperRef.current as HTMLElement & { _leaflet_id?: number };
      delete el._leaflet_id;
    }
    setReady(true);

    // Load GeoJSON data
    fetch('/india-states.geojson')
      .then((res) => res.json())
      .then((data) => setGeoJsonData(data))
      .catch((err) => console.error('Error loading GeoJSON:', err));

    return () => {
      setReady(false);
    };
  }, []);

  const getFeatureStyle = (feature: any) => {
    const stateName = normalizeStateName(feature.properties.ST_NM);
    const isSelected = filters.state === stateName;
    const count = stateCounts[stateName] ?? 0;

    if (isHeatmapMode) {
      let color = '#3b82f6'; // Low (blue)
      let opacity = 0.08;
      
      if (count > 15) {
        color = '#ef4444'; // Very High (red)
        opacity = 0.45;
      } else if (count > 8) {
        color = '#f97316'; // High (orange)
        opacity = 0.35;
      } else if (count > 3) {
        color = '#eab308'; // Medium (yellow)
        opacity = 0.25;
      } else if (count > 0) {
        color = '#10b981'; // Low-medium (green)
        opacity = 0.15;
      }

      return {
        fillColor: color,
        fillOpacity: isSelected ? opacity + 0.15 : opacity,
        color: isSelected ? '#fb923c' : 'rgba(255, 255, 255, 0.15)',
        weight: isSelected ? 2 : 1.2,
      };
    }

    return {
      fillColor: isSelected ? '#fb923c' : '#ffffff',
      fillOpacity: isSelected ? 0.22 : 0.02,
      color: isSelected ? '#fb923c' : 'rgba(255, 255, 255, 0.15)',
      weight: isSelected ? 2 : 1.2,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = normalizeStateName(feature.properties.ST_NM);
    const count = stateCounts[stateName] ?? 0;

    const stateDetailObj = statesList?.find(s => normalizeStateName(s.name) === stateName);
    const trending = stateDetailObj?.trendingTopic || 'General';
    const score = stateDetailObj?.sentimentScore ?? 0.0;
    const sentiment = score > 0.05 ? 'Positive 😊' : score < -0.05 ? 'Negative 😟' : 'Neutral 😐';

    const tooltipHtml = `
      <div style="
        background: rgba(9, 14, 28, 0.96);
        backdrop-filter: blur(12px);
        border: 1.5px solid rgba(255, 255, 255, 0.15);
        border-radius: 10px;
        padding: 8px 12px;
        min-width: 175px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.6);
        color: #e2e8f0;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <p style="font-size: 13px; font-weight: 700; color: #ffffff; margin: 0 0 6px 0;">${stateName}</p>
        <div style="height: 1px; background: rgba(255, 255, 255, 0.08); margin: 0 0 6px 0;"></div>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
          <tr>
            <td style="color: #64748b; padding: 2px 0;">Articles:</td>
            <td style="text-align: right; font-weight: 600; color: #f8fafc; padding: 2px 0;">${count}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;">Top Topic:</td>
            <td style="text-align: right; font-weight: 600; color: #fb923c; padding: 2px 0;">${trending}</td>
          </tr>
          <tr>
            <td style="color: #64748b; padding: 2px 0;">Sentiment:</td>
            <td style="text-align: right; font-weight: 600; padding: 2px 0; color: ${score > 0.05 ? '#34d399' : score < -0.05 ? '#f87171' : '#94a3b8'}">${sentiment}</td>
          </tr>
        </table>
      </div>
    `;

    layer.bindTooltip(tooltipHtml, {
      sticky: true,
      className: 'custom-premium-tooltip',
      html: true
    } as any);

    layer.on({
      mouseover: (e: any) => {
        const l = e.target;
        l.setStyle({
          fillColor: '#fb923c',
          fillOpacity: 0.18,
          color: '#fb923c',
          weight: 2,
        });
      },
      mouseout: (e: any) => {
        const l = e.target;
        l.setStyle(getFeatureStyle(feature));
      },
      click: () => {
        const currentState = useNewsStore.getState().filters.state;
        if (currentState === stateName) {
          setFilters({ state: undefined });
        } else {
          setFilters({ state: stateName as any });
        }
      },
    });
  };

  return (
    <div ref={wrapperRef} style={{ height: '100%', width: '100%' }}>
      {ready && (
        <MapContainer
          center={INDIA_CENTER}
          zoom={5}
          minZoom={4}
          maxZoom={14}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          attributionControl={false}
        >
          <TileLayer
            url={DARK_TILES}
            attribution={DARK_TILES_ATTR}
            subdomains="abcd"
          />
          {geoJsonData && (
            <GeoJSON
              key={`${filters.state || 'none'}-${isHeatmapMode ? 'heatmap' : 'normal'}-${filters.category || 'all'}-${statesList ? 'ready' : 'notready'}-${Object.keys(stateCounts).length}`}
              data={geoJsonData}
              style={getFeatureStyle}
              onEachFeature={onEachFeature}
            />
          )}
          <MapEvents />
          <NewsMarkers />
        </MapContainer>
      )}
    </div>
  );
}
