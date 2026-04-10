import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, Loader2, X, ChevronDown, ChevronUp, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const KNOWN_PLACES = {
  'Jerusalem': { lat: 31.7683, lng: 35.2137 },
  'Bethlehem': { lat: 31.7054, lng: 35.2024 },
  'Nazareth': { lat: 32.6996, lng: 35.3035 },
  'Sea of Galilee': { lat: 32.8208, lng: 35.5839 },
  'Galilee': { lat: 32.8208, lng: 35.5839 },
  'Jordan River': { lat: 31.8441, lng: 35.5491 },
  'Jordan': { lat: 31.8441, lng: 35.5491 },
  'Jericho': { lat: 31.8613, lng: 35.4541 },
  'Mount Sinai': { lat: 28.5391, lng: 33.9750 },
  'Sinai': { lat: 28.5391, lng: 33.9750 },
  'Egypt': { lat: 29.8484, lng: 31.2508 },
  'Babylon': { lat: 32.5361, lng: 44.4208 },
  'Corinth': { lat: 37.9074, lng: 22.8778 },
  'Rome': { lat: 41.9028, lng: 12.4964 },
  'Antioch': { lat: 36.2021, lng: 36.1597 },
  'Ephesus': { lat: 37.9395, lng: 27.3408 },
  'Mount of Olives': { lat: 31.7762, lng: 35.2458 },
  'Bethany': { lat: 31.7686, lng: 35.2625 },
  'Capernaum': { lat: 32.8815, lng: 35.5751 },
  'Caesarea': { lat: 32.5034, lng: 34.8937 },
  'Damascus': { lat: 33.5138, lng: 36.2765 },
  'Samaria': { lat: 32.2729, lng: 35.2001 },
  'Athens': { lat: 37.9838, lng: 23.7275 },
  'Thessalonica': { lat: 40.6401, lng: 22.9444 },
  'Philippi': { lat: 41.0122, lng: 24.2848 },
  'Crete': { lat: 35.2401, lng: 24.8093 },
  'Cyprus': { lat: 35.1264, lng: 33.4299 },
  'Ur': { lat: 30.9611, lng: 46.1025 },
  'Canaan': { lat: 31.5, lng: 35.0 },
  'Mount Carmel': { lat: 32.7385, lng: 34.9676 },
  'Hebron': { lat: 31.5296, lng: 35.0998 },
  'Beersheba': { lat: 31.2516, lng: 34.7913 },
  'Tyre': { lat: 33.2705, lng: 35.2038 },
  'Sidon': { lat: 33.5614, lng: 35.3714 },
  'Philistia': { lat: 31.7, lng: 34.6 },
  'Gaza': { lat: 31.5017, lng: 34.4668 },
  'Persia': { lat: 32.4279, lng: 53.6880 },
  'Nineveh': { lat: 36.3566, lng: 43.1586 },
  'Macedonia': { lat: 41.6086, lng: 21.7453 },
};

function createPinIcon(color = '#4F46E5', active = false) {
  const size = active ? 36 : 28;
  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px">
      <div style="background:${color};width:${size}px;height:${size}px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);border:3px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.4)"></div>
      ${active ? `<div style="position:absolute;inset:0;border-radius:50%;animation:ping 1s cubic-bezier(0,0,0.2,1) infinite;background:${color};opacity:0.4"></div>` : ''}
    </div>`,
    className: '',
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size - 4],
  });
}

function FlyTo({ place }) {
  const map = useMap();
  useEffect(() => {
    if (place) map.flyTo([place.lat, place.lng], 8, { duration: 1.0 });
  }, [place?.name]);
  return null;
}

function FitBounds({ places }) {
  const map = useMap();
  useEffect(() => {
    if (places.length > 1) {
      const bounds = L.latLngBounds(places.map(p => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (places.length === 1) {
      map.flyTo([places[0].lat, places[0].lng], 8, { duration: 1.0 });
    }
  }, [places.length]);
  return null;
}

export default function ChapterGeographyMap({ book, chapter, verses, isDarkMode }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [summaries, setSummaries] = useState({});
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [fetched, setFetched] = useState(null);

  const chapterKey = `${book}-${chapter}`;

  const fetchLocations = async () => {
    if (fetched === chapterKey) return;
    setLoading(true);
    setLocations([]);
    setSelected(null);
    setSummaries({});
    try {
      const verseText = (verses || []).slice(0, 20).map(v => `${v.verse}. ${v.text}`).join(' ');
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Bible geography expert. For the passage ${book} chapter ${chapter}, identify ALL geographical locations (cities, regions, mountains, rivers, seas, countries) mentioned or strongly implied in this text:

"${verseText}"

For each location found, provide:
1. The exact location name (as commonly known)
2. A 1-2 sentence summary of what happened there in this specific chapter

Return as JSON only. No extra text.`,
        response_json_schema: {
          type: 'object',
          properties: {
            locations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  name: { type: 'string' },
                  event_summary: { type: 'string' }
                }
              }
            }
          },
          required: ['locations']
        }
      });

      const found = (result?.locations || []).map(loc => {
        // Match against known coordinates
        const match = Object.entries(KNOWN_PLACES).find(([k]) =>
          k.toLowerCase() === loc.name.toLowerCase() ||
          loc.name.toLowerCase().includes(k.toLowerCase()) ||
          k.toLowerCase().includes(loc.name.toLowerCase())
        );
        if (!match) return null;
        return { name: loc.name, lat: match[1].lat, lng: match[1].lng, summary: loc.event_summary };
      }).filter(Boolean);

      setLocations(found);
      if (found.length > 0) setSelected(found[0]);
      setFetched(chapterKey);
    } catch (e) {
      setLocations([]);
    }
    setLoading(false);
  };

  const handleOpen = () => {
    setOpen(true);
    fetchLocations();
  };

  if (!book || !chapter) return null;

  const bg = isDarkMode ? '#1A1F1C' : '#FFFFFF';
  const text = isDarkMode ? '#EAEAEA' : '#1E1E1E';
  const border = isDarkMode ? '#2A2F2C' : '#E6E6E6';
  const muted = isDarkMode ? '#A0A0A0' : '#6B7280';

  return (
    <div className="mb-4">
      <button
        onClick={() => open ? setOpen(false) : handleOpen()}
        className="flex items-center gap-2 text-xs px-3 py-2 rounded-xl border transition-all font-medium w-full justify-between"
        style={{ background: open ? '#4F46E5' : bg, color: open ? '#fff' : text, borderColor: open ? '#4F46E5' : border }}
      >
        <span className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5" />
          📍 Geography Map — {book} {chapter}
        </span>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="mt-2 rounded-xl overflow-hidden border" style={{ borderColor: border }}>
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12" style={{ background: bg }}>
                  <Loader2 className="w-6 h-6 animate-spin mb-3" style={{ color: '#4F46E5' }} />
                  <p className="text-sm" style={{ color: muted }}>Finding locations in {book} {chapter}…</p>
                </div>
              ) : locations.length === 0 && fetched === chapterKey ? (
                <div className="text-center py-10" style={{ background: bg }}>
                  <MapPin className="w-8 h-8 mx-auto mb-2 opacity-20" style={{ color: text }} />
                  <p className="text-sm" style={{ color: muted }}>No mapped locations found in this chapter.</p>
                </div>
              ) : locations.length > 0 ? (
                <div className="flex flex-col md:flex-row" style={{ background: bg }}>
                  {/* Map */}
                  <div className="flex-1" style={{ minHeight: '280px' }}>
                    <MapContainer center={[31.5, 35.5]} zoom={5} style={{ height: '280px', width: '100%' }}>
                      <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='© OpenStreetMap'
                      />
                      {locations.map((loc, i) => (
                        <Marker
                          key={i}
                          position={[loc.lat, loc.lng]}
                          icon={createPinIcon(selected?.name === loc.name ? '#DC2626' : '#4F46E5', selected?.name === loc.name)}
                          eventHandlers={{ click: () => setSelected(loc) }}
                        >
                          <Popup>
                            <div className="min-w-[160px]">
                              <p className="font-bold text-gray-900 mb-1">{loc.name}</p>
                              <p className="text-xs text-gray-600 leading-relaxed">{loc.summary}</p>
                            </div>
                          </Popup>
                        </Marker>
                      ))}
                      {selected && <FlyTo place={selected} />}
                      {!selected && <FitBounds places={locations} />}
                    </MapContainer>
                  </div>

                  {/* Sidebar */}
                  <div className="w-full md:w-56 border-t md:border-t-0 md:border-l overflow-y-auto" style={{ borderColor: border, maxHeight: '280px' }}>
                    {locations.map((loc, i) => (
                      <button
                        key={i}
                        onClick={() => setSelected(loc)}
                        className="w-full text-left px-4 py-3 border-b transition-colors"
                        style={{
                          borderColor: border,
                          background: selected?.name === loc.name ? (isDarkMode ? '#1e1b4b' : '#EEF2FF') : 'transparent',
                        }}
                      >
                        <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: selected?.name === loc.name ? '#4F46E5' : text }}>
                          <MapPin className="w-3 h-3 flex-shrink-0" /> {loc.name}
                        </p>
                        <p className="text-xs mt-0.5 leading-snug line-clamp-2" style={{ color: muted }}>
                          {loc.summary}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}