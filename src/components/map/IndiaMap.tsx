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
import { useNews } from '@/hooks/useNews';
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
  const size = article.isBreaking ? 20 : article.impactScore.national > 80 ? 18 : 14;

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
  
  const { filters, setFilters } = useNewsStore();

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

    return {
      fillColor: isSelected ? '#fb923c' : '#ffffff',
      fillOpacity: isSelected ? 0.22 : 0.02,
      color: isSelected ? '#fb923c' : 'rgba(255, 255, 255, 0.15)',
      weight: isSelected ? 2 : 1.2,
    };
  };

  const onEachFeature = (feature: any, layer: any) => {
    const stateName = normalizeStateName(feature.properties.ST_NM);

    layer.bindTooltip(stateName, {
      sticky: true,
      className: 'custom-map-tooltip',
    });

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
              key={filters.state || 'none'}
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
