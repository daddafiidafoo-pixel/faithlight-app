import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Calendar, MapPin, Users, Check, Filter, Plus, Monitor, Globe, Zap, Clock } from 'lucide-react';
import L from 'leaflet';

const EVENT_TYPES = {
  service: { label: '⛪ Service', color: '#3b82f6' },
  bible_study: { label: '📖 Bible Study', color: '#8b5cf6' },
  prayer_meeting: { label: '🙏 Prayer Meeting', color: '#ec4899' },
  community_event: { label: '🤝 Community', color: '#f59e0b' },
  youth_group: { label: '👥 Youth Group', color: '#10b981' },
  online_room: { label: '💻 Online Room', color: '#06b6d4' },
};

const XP_KEY = 'fl_xp_data';
const RSVP_KEY = 'fl_rsvped_events';
const SAVED_KEY = 'fl_saved_events';

// Sample events (in production: base44.entities.ChurchEvent.filter)
const SAMPLE_EVENTS = [
  { id: 'e1', title: 'Sunday Morning Worship', church_name: 'Grace Community Church', event_type: 'service', date: '2026-03-29T10:00:00', address: '123 Main St, Toronto, ON', description: 'Join us for worship, teaching from Romans 8, and community fellowship.', latitude: 43.651, longitude: -79.347, rsvp_count: 47, is_online: false, tags: ['en'] },
  { id: 'e2', title: 'Oromo Bible Study', church_name: 'Ethiopian Evangelical Church', event_type: 'bible_study', date: '2026-03-26T18:30:00', address: '450 Yonge St, Toronto, ON', description: 'Macaafa Qulqulluu barachuu — Genesis seexana irraa. Afaan Oromoon.', latitude: 43.664, longitude: -79.386, rsvp_count: 12, is_online: false, tags: ['om'] },
  { id: 'e3', title: 'Amharic Prayer Night', church_name: 'Addis Evangelical Fellowship', event_type: 'prayer_meeting', date: '2026-03-27T19:00:00', address: '780 Bloor St W, Toronto, ON', description: 'ጸሎት ምሽት — በዕምነት ላይ ሁሉ ወደ አምላክ እንጸልይ።', latitude: 43.663, longitude: -79.410, rsvp_count: 23, is_online: false, tags: ['am'] },
  { id: 'e4', title: 'Open Bible Study Room', church_name: 'FaithLight Community', event_type: 'online_room', date: '2026-03-25T20:00:00', address: 'Online — Zoom', description: 'Open to all! Multilingual study room — English, Oromo, Amharic welcome. Come as you are.', latitude: null, longitude: null, rsvp_count: 31, is_online: true, tags: ['en', 'om', 'am'] },
  { id: 'e5', title: 'Youth Night: Faith & Purpose', church_name: 'Cityside Church', event_type: 'youth_group', date: '2026-03-28T17:00:00', address: '220 Spadina Ave, Toronto, ON', description: 'For ages 16-25. Worship, discussion on Jeremiah 29:11, and social time.', latitude: 43.650, longitude: -79.396, rsvp_count: 19, is_online: false, tags: ['en'] },
];

function addXP(amount, label) {
  const d = JSON.parse(localStorage.getItem(XP_KEY) || '{}');
  const today = new Date().toISOString().split('T')[0];
  localStorage.setItem(XP_KEY, JSON.stringify({ ...d, totalXP: (d.totalXP || 0) + amount, log: [{ action: 'church_event', xp: amount, label, at: today }, ...(d.log || [])].slice(0, 30) }));
}

function createEventIcon(type) {
  const cfg = EVENT_TYPES[type] || EVENT_TYPES.service;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
    <path d="M16 0C7.16 0 0 7.16 0 16c0 12 16 24 16 24S32 28 32 16C32 7.16 24.84 0 16 0z" fill="${cfg.color}"/>
    <circle cx="16" cy="16" r="9" fill="white" fill-opacity="0.9"/>
    <text x="16" y="21" text-anchor="middle" font-size="11">${cfg.label.split(' ')[0]}</text>
  </svg>`;
  return L.divIcon({ html: svg, className: '', iconSize: [32, 40], iconAnchor: [16, 40], popupAnchor: [0, -40] });
}

export default function ChurchEvents() {
  const [events] = useState(SAMPLE_EVENTS);
  const [selected, setSelected] = useState(null);
  const [viewMode, setViewMode] = useState('split'); // 'map' | 'list' | 'split'
  const [filter, setFilter] = useState('all');
  const [langFilter, setLangFilter] = useState('all');
  const [userLocation, setUserLocation] = useState([43.655, -79.383]);
  const [rsvped, setRsvped] = useState(() => { try { return JSON.parse(localStorage.getItem(RSVP_KEY) || '[]'); } catch { return []; } });
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); } catch { return []; } });
  const [xpToast, setXpToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(p => setUserLocation([p.coords.latitude, p.coords.longitude]), () => {});
  }, []);

  const showXP = (msg) => { setXpToast(msg); setTimeout(() => setXpToast(null), 2500); };

  const handleRSVP = (eventId) => {
    if (rsvped.includes(eventId)) return;
    const updated = [...rsvped, eventId];
    setRsvped(updated);
    localStorage.setItem(RSVP_KEY, JSON.stringify(updated));
    addXP(15, 'RSVP\'d to a church event');
    showXP('+15 XP — RSVP confirmed! ⛪');
  };

  const handleSave = (eventId) => {
    const updated = saved.includes(eventId) ? saved.filter(id => id !== eventId) : [...saved, eventId];
    setSaved(updated);
    localStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  const addToCalendar = (event) => {
    const start = new Date(event.date);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.address)}`;
    window.open(url, '_blank');
    addXP(5, 'Added event to calendar');
    showXP('+5 XP — Added to calendar! 📅');
  };

  const filtered = events.filter(e => {
    const typeOk = filter === 'all' || e.event_type === filter;
    const langOk = langFilter === 'all' || e.tags?.includes(langFilter);
    return typeOk && langOk;
  });

  const mapEvents = filtered.filter(e => e.latitude && e.longitude);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {xpToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm">{xpToast}</div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">⛪ Church Events</h1>
              <p className="text-xs text-gray-500">{filtered.length} events · {filtered.filter(e => e.is_online).length} online</p>
            </div>
            <div className="flex gap-1.5">
              {[['split', '⊞'], ['list', '☰'], ['map', '🗺']].map(([mode, icon]) => (
                <button key={mode} onClick={() => setViewMode(mode)}
                  className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${viewMode === mode ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setFilter('all')} className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === 'all' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200'}`}>All</button>
            {Object.entries(EVENT_TYPES).map(([k, v]) => (
              <button key={k} onClick={() => setFilter(k)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filter === k ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200'}`}
                style={{ backgroundColor: filter === k ? v.color : '' }}>
                {v.label}
              </button>
            ))}
            <div className="border-l border-gray-200 mx-1" />
            {[['all', '🌐 All'], ['en', '🇬🇧 EN'], ['om', '🇪🇹 OM'], ['am', '🇪🇹 AM']].map(([code, label]) => (
              <button key={code} onClick={() => setLangFilter(code)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${langFilter === code ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-600 border-gray-200'}`}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className={`${viewMode === 'split' ? 'grid grid-cols-1 lg:grid-cols-2 gap-4' : ''}`}>

          {/* Map */}
          {(viewMode === 'map' || viewMode === 'split') && (
            <div className="h-[480px] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <MapContainer center={userLocation} zoom={12} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                {mapEvents.map(event => (
                  <Marker key={event.id} position={[event.latitude, event.longitude]} icon={createEventIcon(event.event_type)}>
                    <Popup>
                      <div className="w-52">
                        <p className="font-bold text-sm text-gray-900 mb-1">{event.title}</p>
                        <p className="text-xs text-gray-500 mb-1">{event.church_name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mb-2"><Calendar size={10} /> {new Date(event.date).toLocaleDateString()}</p>
                        <button onClick={() => setSelected(event)}
                          className="w-full py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-semibold">View Details</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          )}

          {/* List */}
          {(viewMode === 'list' || viewMode === 'split') && (
            <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
              {filtered.map(event => {
                const typeCfg = EVENT_TYPES[event.event_type] || EVENT_TYPES.service;
                const isRsvped = rsvped.includes(event.id);
                const isSaved = saved.includes(event.id);
                return (
                  <div key={event.id}
                    onClick={() => setSelected(event)}
                    className={`bg-white rounded-2xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${selected?.id === event.id ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-100'}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: typeCfg.color }}>{typeCfg.label}</span>
                          {event.is_online && <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><Monitor size={9} /> Online</span>}
                          {isRsvped && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><Check size={9} /> Going</span>}
                        </div>
                        <p className="font-bold text-gray-900 text-sm">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.church_name}</p>
                        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Clock size={10} /> {new Date(event.date).toLocaleDateString('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                          <span className="flex items-center gap-1"><Users size={10} /> {event.rsvp_count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && <p className="text-center text-gray-400 text-sm py-8">No events match your filter</p>}
            </div>
          )}
        </div>

        {/* Event Detail Panel */}
        {selected && (
          <div className="mt-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ backgroundColor: (EVENT_TYPES[selected.event_type] || EVENT_TYPES.service).color }}>
                    {(EVENT_TYPES[selected.event_type] || EVENT_TYPES.service).label}
                  </span>
                  {selected.is_online && <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"><Monitor size={9} /> Online</span>}
                  {selected.tags?.includes('om') && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Afaan Oromoo</span>}
                  {selected.tags?.includes('am') && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">አማርኛ</span>}
                </div>
                <h2 className="text-xl font-bold text-gray-900">{selected.title}</h2>
                <p className="text-sm text-gray-500">{selected.church_name}</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-gray-300 hover:text-gray-500 text-xl">✕</button>
            </div>

            <p className="text-sm text-gray-600 mb-5 leading-relaxed">{selected.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                <Calendar size={15} className="text-indigo-500" />
                <div>
                  <p className="text-xs font-semibold text-gray-800">{new Date(selected.date).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                  <p className="text-xs text-gray-400">{new Date(selected.date).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-2">
                {selected.is_online ? <Monitor size={15} className="text-cyan-500" /> : <MapPin size={15} className="text-rose-500" />}
                <div>
                  <p className="text-xs font-semibold text-gray-800">{selected.is_online ? 'Online Event' : 'In Person'}</p>
                  <p className="text-xs text-gray-400">{selected.address}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-5 text-sm text-gray-500">
              <Users size={14} className="text-green-500" />
              <span><span className="font-bold text-gray-900">{selected.rsvp_count + (rsvped.includes(selected.id) ? 1 : 0)}</span> people interested</span>
              {rsvped.includes(selected.id) && <span className="text-xs text-green-600 font-semibold ml-1">including you!</span>}
            </div>

            <div className="flex gap-2 flex-wrap">
              <button onClick={() => handleRSVP(selected.id)} disabled={rsvped.includes(selected.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-sm transition-all ${rsvped.includes(selected.id) ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                {rsvped.includes(selected.id) ? <><Check size={15} /> Going (+15 XP earned)</> : <><Zap size={15} /> RSVP (+15 XP)</>}
              </button>
              <button onClick={() => addToCalendar(selected)}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">
                <Calendar size={15} /> Add to Calendar
              </button>
              <button onClick={() => handleSave(selected.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl border font-semibold text-sm transition-all ${saved.includes(selected.id) ? 'border-indigo-300 bg-indigo-50 text-indigo-600' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                {saved.includes(selected.id) ? '★ Saved' : '☆ Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}