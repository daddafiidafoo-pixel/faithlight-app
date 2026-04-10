import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Heart, MapPin } from 'lucide-react';
import { t } from '@/lib/i18n';

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function PrayerMapView({ onRequestSelect, uiLang }) {
  const [position, setPosition] = useState([43.6532, -79.3832]); // Default: Toronto
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
        },
        () => {
          // Use default position on error
        }
      );
    }

    // Load prayer requests with coordinates
    const loadRequests = async () => {
      try {
        // Simulate loading prayer requests
        // In production, filter for requests with location data
        setRequests([]);
      } catch {
        setRequests([]);
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-2xl flex items-center justify-center">
        <p className="text-gray-500">{t(uiLang, 'common.loading')}</p>
      </div>
    );
  }

  // Create prayer request markers with default locations
  const demoMarkers = [
    { id: 1, title: 'Health Prayer', lat: 43.6629, lng: -79.3957, category: 'health' },
    { id: 2, title: 'Family Support', lat: 43.6452, lng: -79.4003, category: 'family' },
    { id: 3, title: 'Job Search', lat: 43.6629, lng: -79.3957, category: 'work' },
  ];

  return (
    <div className="w-full">
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {demoMarkers.map(marker => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={L.icon({
                iconUrl: `data:image/svg+xml;base64,${btoa(`
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#4f46e5" width="32" height="32">
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 7 10 13 10 13s10-6 10-13c0-5.52-4.48-10-10-10z"/>
                  </svg>
                `)}`,
                iconSize: [32, 32],
                iconAnchor: [16, 32],
                popupAnchor: [0, -32],
              })}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">{marker.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{marker.category}</p>
                  <button
                    onClick={() => onRequestSelect?.(marker)}
                    className="mt-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors min-h-[32px]"
                  >
                    {t(uiLang, 'common.view') || 'View'}
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {requests.length === 0 && (
        <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200 flex items-start gap-3">
          <MapPin size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-blue-900">{t(uiLang, 'prayerMap.noLocationRequests') || 'Prayer requests without location data will appear here'}</p>
            <p className="text-xs text-blue-700 mt-1">{t(uiLang, 'prayerMap.dragMarker') || 'Share your location when posting a prayer request to appear on the map'}</p>
          </div>
        </div>
      )}
    </div>
  );
}