import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { base44 } from '@/api/base44Client';
import { Heart, MapPin, Loader2 } from 'lucide-react';

// Fix default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/**
 * Interactive map showing prayer requests by location
 */
export default function PrayerRequestMap() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrayers = async () => {
      try {
        setLoading(true);
        const prayerList = await base44.entities.PrayerLocation.list();
        setPrayers(prayerList);
      } catch (err) {
        console.error('Failed to fetch prayer locations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPrayers();
  }, []);

  if (loading) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-gray-50 rounded-lg">
        <Loader2 className="animate-spin text-gray-400" size={32} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[500px] flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-md border border-gray-200">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        style={{ height: '500px', width: '100%' }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {prayers.map((prayer) => (
          <Marker
            key={prayer.id}
            position={[prayer.latitude, prayer.longitude]}
            icon={L.icon({
              iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41],
            })}
          >
            <Popup>
              <div className="p-2 max-w-xs">
                <h3 className="font-semibold text-sm text-gray-900 mb-1">{prayer.region}</h3>
                <p className="text-xs text-gray-600 mb-2">
                  Intercession happening here
                </p>
                <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                  <Heart size={12} fill="currentColor" />
                  Someone is praying
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-center gap-3 text-sm">
          <MapPin size={16} className="text-red-600" />
          <span className="text-gray-700">
            {prayers.length} active prayer {prayers.length === 1 ? 'location' : 'locations'}
          </span>
        </div>
      </div>
    </div>
  );
}