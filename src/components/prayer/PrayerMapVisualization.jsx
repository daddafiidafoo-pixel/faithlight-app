import React, { useState, useEffect } from 'react';
import { MapPin, Loader, AlertCircle } from 'lucide-react';

export default function PrayerMapVisualization({ locations }) {
  const [map, setMap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        // Dynamically load Leaflet
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        if (!map) {
          const mapInstance = L.map('prayer-map').setView([20, 0], 2);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 19,
          }).addTo(mapInstance);

          // Add prayer location markers
          locations.forEach(loc => {
            const marker = L.circleMarker([loc.latitude, loc.longitude], {
              radius: 6,
              fillColor: '#6C5CE7',
              color: '#5B4BD6',
              weight: 2,
              opacity: 0.8,
              fillOpacity: 0.6,
            });
            marker.bindPopup(`<div class="text-sm"><p class="font-semibold">${loc.region}</p><p class="text-xs text-gray-500">Prayer community active</p></div>`);
            marker.addTo(mapInstance);
          });

          setMap(mapInstance);
        }
        setLoading(false);
      } catch (err) {
        console.error('Map initialization error:', err);
        setError('Failed to load map');
        setLoading(false);
      }
    };

    initMap();
  }, [locations, map]);

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
        <AlertCircle className="w-5 h-5 text-red-600" />
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-slate-900">Global Prayer Community</h3>
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">{locations.length} locations</span>
      </div>
      
      {loading && (
        <div className="h-64 bg-slate-100 rounded-xl flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <Loader className="w-6 h-6 text-purple-600 animate-spin" />
            <p className="text-sm text-slate-500">Loading map...</p>
          </div>
        </div>
      )}
      
      {!loading && (
        <div id="prayer-map" className="h-96 rounded-xl border border-slate-200 overflow-hidden shadow-sm" />
      )}
    </div>
  );
}