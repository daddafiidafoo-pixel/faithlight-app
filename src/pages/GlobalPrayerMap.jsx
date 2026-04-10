import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MapPin, X, Shield, ShieldOff, Flame, Globe, ChevronDown } from 'lucide-react';
import L from 'leaflet';

const CATEGORIES = ['healing', 'peace', 'guidance', 'gratitude', 'grief', 'family', 'salvation', 'other'];
const CAT_COLORS = {
  healing: '#ef4444', peace: '#06b6d4', guidance: '#f59e0b',
  gratitude: '#10b981', grief: '#8b5cf6', family: '#ec4899',
  salvation: '#3b82f6', other: '#6b7280'
};

const CAT_EMOJI = {
  healing: '🩺', peace: '☮️', guidance: '🧭', gratitude: '🙌',
  grief: '💜', family: '👨‍👩‍👧', salvation: '✝️', other: '🙏'
};

const XP_KEY = 'fl_xp_data';
function addIntercessorXP(amount, label) {
  try {
    const data = JSON.parse(localStorage.getItem(XP_KEY) || '{}');
    const today = new Date().toISOString().split('T')[0];
    const updated = {
      ...data,
      totalXP: (data.totalXP || 0) + amount,
      log: [{ action: 'intercession', xp: amount, label, at: today }, ...(data.log || [])].slice(0, 30),
    };
    localStorage.setItem(XP_KEY, JSON.stringify(updated));
  } catch {}
}

const createPinIcon = (category, count) => {
  const color = CAT_COLORS[category] || '#6b7280';
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="44" viewBox="0 0 36 44">
      <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 26 18 26S36 31.5 36 18C36 8.06 27.94 0 18 0z" fill="${color}"/>
      <circle cx="18" cy="18" r="10" fill="white" fill-opacity="0.9"/>
      <text x="18" y="23" text-anchor="middle" font-size="12">${CAT_EMOJI[category] || '🙏'}</text>
      ${count > 0 ? `<circle cx="28" cy="6" r="7" fill="#ef4444"/><text x="28" y="10" text-anchor="middle" font-size="9" fill="white" font-weight="bold">${count > 99 ? '99+' : count}</text>` : ''}
    </svg>`;
  return L.divIcon({
    html: svg, className: '', iconSize: [36, 44], iconAnchor: [18, 44], popupAnchor: [0, -44],
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({ click: (e) => onMapClick(e.latlng) });
  return null;
}

export default function GlobalPrayerMap() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [pinLocation, setPinLocation] = useState(null);
  const [userLocation, setUserLocation] = useState([20, 0]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [prayedFor, setPrayedFor] = useState(() => {
    try { return JSON.parse(localStorage.getItem('fl_prayed_for') || '[]'); } catch { return []; }
  });
  const [xpToast, setXpToast] = useState(null);
  const [filterCat, setFilterCat] = useState('all');
  const [formData, setFormData] = useState({ category: 'other', message: '', is_anonymous: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    base44.auth.me().then(u => { setIsLoggedIn(!!u); setUser(u); }).catch(() => {});
    loadPrayers();
    navigator.geolocation?.getCurrentPosition(
      p => setUserLocation([p.coords.latitude, p.coords.longitude]),
      () => {}
    );
  }, []);

  const loadPrayers = async () => {
    try {
      const data = await base44.entities.GeoPrayer.filter({}, '-created_date', 200);
      setPrayers(data || []);
    } catch (e) {
      console.error('Error loading prayers:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = (latlng) => {
    if (!isLoggedIn) return;
    setPinLocation(latlng);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) { alert('Please log in to post a prayer request'); return; }
    const loc = pinLocation || { lat: userLocation[0], lng: userLocation[1] };
    setSubmitting(true);
    try {
      const newPrayer = await base44.entities.GeoPrayer.create({
        lat: loc.lat,
        lng: loc.lng,
        category: formData.category,
        message: formData.message || 'Prayer request',
        is_anonymous: formData.is_anonymous,
        pray_count: 0,
        author_email: formData.is_anonymous ? null : user?.email,
        author_name: formData.is_anonymous ? 'Anonymous' : user?.full_name,
      });
      setPrayers(prev => [newPrayer, ...prev]);
      setFormData({ category: 'other', message: '', is_anonymous: true });
      setShowForm(false);
      setPinLocation(null);
    } catch (err) {
      console.error('Error posting prayer:', err);
      alert('Failed to post. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePrayFor = async (prayerId) => {
    if (prayedFor.includes(prayerId)) return;
    try {
      const prayer = prayers.find(p => p.id === prayerId);
      if (!prayer) return;
      await base44.entities.GeoPrayer.update(prayerId, { pray_count: (prayer.pray_count || 0) + 1 });
      setPrayers(prev => prev.map(p => p.id === prayerId ? { ...p, pray_count: (p.pray_count || 0) + 1 } : p));
      const updated = [...prayedFor, prayerId];
      setPrayedFor(updated);
      localStorage.setItem('fl_prayed_for', JSON.stringify(updated));
      // Award XP to intercessor
      addIntercessorXP(5, 'Prayed for a global request');
      setXpToast('+5 XP — Intercession logged! 🙏');
      setTimeout(() => setXpToast(null), 2500);
    } catch (err) {
      console.error('Error updating prayer count:', err);
    }
  };

  const filtered = filterCat === 'all' ? prayers : prayers.filter(p => p.category === filterCat);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Loading prayer map…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {xpToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl font-bold text-sm">
          {xpToast}
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Globe size={20} className="text-rose-500" /> Global Prayer Map</h1>
            <p className="text-xs text-gray-500 mt-0.5">{prayers.length} prayers from {new Set(prayers.map(p => `${Math.round(p.lat)},${Math.round(p.lng)}`)).size} locations worldwide</p>
          </div>
          {isLoggedIn ? (
            <button onClick={() => setShowForm(s => !s)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-xl text-sm font-semibold hover:bg-rose-700 transition-colors">
              <MapPin size={15} /> Pin Prayer
            </button>
          ) : (
            <span className="text-xs text-gray-400">Log in to post</span>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Map */}
          <div className="lg:col-span-2">
            {isLoggedIn && (
              <p className="text-xs text-gray-400 mb-2 text-center">Click anywhere on the map to pin your prayer</p>
            )}
            <div className="h-[500px] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
              <MapContainer center={userLocation} zoom={3} className="h-full w-full">
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <MapClickHandler onMapClick={handleMapClick} />
                {filtered.map(prayer => prayer.lat && prayer.lng && (
                  <Marker key={prayer.id} position={[prayer.lat, prayer.lng]} icon={createPinIcon(prayer.category, prayer.pray_count || 0)}>
                    <Popup>
                      <div className="w-52 py-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{CAT_EMOJI[prayer.category]}</span>
                          <span className="font-bold capitalize text-gray-900">{prayer.category}</span>
                          {prayer.is_anonymous && <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded text-gray-500">anonymous</span>}
                        </div>
                        <p className="text-sm text-gray-700 mb-3 leading-relaxed">{prayer.message}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-rose-600 font-semibold">🙏 {prayer.pray_count || 0} praying</span>
                          <button
                            onClick={() => handlePrayFor(prayer.id)}
                            disabled={prayedFor.includes(prayer.id)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${prayedFor.includes(prayer.id) ? 'bg-rose-100 text-rose-600' : 'bg-rose-600 text-white hover:bg-rose-700'}`}
                          >
                            <Heart size={11} fill={prayedFor.includes(prayer.id) ? 'currentColor' : 'none'} />
                            {prayedFor.includes(prayer.id) ? 'Prayed' : 'Pray for this'}
                          </button>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Post Form */}
            {showForm && isLoggedIn && (
              <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 text-sm">Pin a Prayer Request</h3>
                  <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600"><X size={16} /></button>
                </div>
                {pinLocation && (
                  <p className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg mb-3">
                    📍 Pinning at {pinLocation.lat.toFixed(2)}, {pinLocation.lng.toFixed(2)}
                  </p>
                )}
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1.5">Category</label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {CATEGORIES.map(cat => (
                        <button type="button" key={cat} onClick={() => setFormData(f => ({ ...f, category: cat }))}
                          className={`py-1.5 rounded-xl text-center text-xs transition-all ${formData.category === cat ? 'ring-2 ring-offset-1 scale-105' : 'bg-gray-50'}`}
                          style={{ backgroundColor: formData.category === cat ? CAT_COLORS[cat] + '22' : '', borderColor: CAT_COLORS[cat], border: '1px solid' }}
                        >
                          <span className="block text-base">{CAT_EMOJI[cat]}</span>
                          <span className="text-gray-700" style={{ fontSize: 9 }}>{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    placeholder="Share your prayer request…"
                    value={formData.message}
                    onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                    className="h-20 text-sm resize-none"
                  />

                  {/* Privacy toggle */}
                  <div className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5">
                    <button type="button" onClick={() => setFormData(f => ({ ...f, is_anonymous: !f.is_anonymous }))}
                      className={`relative w-10 h-5 rounded-full transition-all ${formData.is_anonymous ? 'bg-indigo-500' : 'bg-gray-300'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${formData.is_anonymous ? 'left-5' : 'left-0.5'}`} />
                    </button>
                    <div className="flex items-center gap-1.5">
                      {formData.is_anonymous ? <Shield size={13} className="text-indigo-500" /> : <ShieldOff size={13} className="text-gray-400" />}
                      <span className="text-xs font-medium text-gray-700">{formData.is_anonymous ? 'Anonymous posting' : 'Posting as ' + user?.full_name}</span>
                    </div>
                  </div>

                  <button type="submit" disabled={submitting}
                    className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-semibold text-sm hover:bg-rose-700 disabled:opacity-60 transition-colors">
                    {submitting ? 'Posting…' : '🙏 Post Prayer'}
                  </button>
                </form>
              </div>
            )}

            {/* Category Filter */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <p className="text-xs font-semibold text-gray-700 mb-2">Filter by category</p>
              <div className="flex flex-wrap gap-1.5">
                <button onClick={() => setFilterCat('all')}
                  className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filterCat === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600'}`}>
                  All
                </button>
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setFilterCat(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${filterCat === cat ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                    style={{ backgroundColor: filterCat === cat ? CAT_COLORS[cat] : '' }}>
                    {CAT_EMOJI[cat]} {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Recent requests */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 text-sm mb-3">Recent Requests ({filtered.length})</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {filtered.slice(0, 15).map(prayer => (
                  <div key={prayer.id} className="border-l-3 pl-3 py-2 rounded-r-xl border-l-4 bg-gray-50"
                    style={{ borderLeftColor: CAT_COLORS[prayer.category] }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-gray-700 capitalize">{CAT_EMOJI[prayer.category]} {prayer.category}</span>
                      {prayer.is_anonymous && <span className="text-xs text-gray-400 flex items-center gap-0.5"><Shield size={9} /> anon</span>}
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">{prayer.message}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-rose-500 font-medium">🙏 {prayer.pray_count || 0}</span>
                      <button onClick={() => handlePrayFor(prayer.id)} disabled={prayedFor.includes(prayer.id)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${prayedFor.includes(prayer.id) ? 'bg-rose-50 text-rose-400' : 'bg-rose-600 text-white hover:bg-rose-700'}`}>
                        <Heart size={10} fill={prayedFor.includes(prayer.id) ? 'currentColor' : 'none'} />
                        {prayedFor.includes(prayer.id) ? 'Prayed' : 'Pray for this'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}