import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Heart, MessageCircle, Share2, X } from 'lucide-react';

export default function SocialPrayerWall() {
  const [prayers, setPrayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [newPrayer, setNewPrayer] = useState({ title: '', description: '', category: 'other', isAnonymous: false });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        const me = await base44.auth.me();
        if (!isMounted) return;
        setUser(me);

        const items = await base44.entities.SocialPrayerRequest.filter({ status: 'active' }, '-created_date', 20);
        if (isMounted) {
          setPrayers(items);
        }
      } catch (error) {
        console.error('Failed to load prayers:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const created = await base44.entities.SocialPrayerRequest.create({
        author_email: user.email,
        author_name: user.full_name || 'Anonymous',
        title: newPrayer.title,
        description: newPrayer.description,
        category: newPrayer.category,
        is_anonymous: newPrayer.isAnonymous,
        status: 'active',
      });

      setPrayers([created, ...prayers]);
      setNewPrayer({ title: '', description: '', category: 'other', isAnonymous: false });
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create prayer:', error);
    }
  };

  const handlePray = async (prayerId) => {
    if (!user) return;

    try {
      const prayer = prayers.find(p => p.id === prayerId);
      const alreadyPrayed = prayer.prayed_by.includes(user.email);

      const updatedPrayed = alreadyPrayed
        ? prayer.prayed_by.filter(e => e !== user.email)
        : [...prayer.prayed_by, user.email];

      await base44.entities.SocialPrayerRequest.update(prayerId, {
        prayed_by: updatedPrayed,
        prayer_count: updatedPrayed.length,
      });

      setPrayers(prayers.map(p =>
        p.id === prayerId
          ? { ...p, prayed_by: updatedPrayed, prayer_count: updatedPrayed.length }
          : p
      ));
    } catch (error) {
      console.error('Failed to pray:', error);
    }
  };

  if (loading) return <div className="p-4 text-center">Loading prayer wall...</div>;

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Prayer Wall</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
        >
          Post Prayer
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-slate-200 space-y-4">
          <input
            type="text"
            placeholder="Prayer title"
            value={newPrayer.title}
            onChange={(e) => setNewPrayer({ ...newPrayer, title: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <textarea
            placeholder="Share your prayer request"
            value={newPrayer.description}
            onChange={(e) => setNewPrayer({ ...newPrayer, description: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-24"
            required
          />
          <select
            value={newPrayer.category}
            onChange={(e) => setNewPrayer({ ...newPrayer, category: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="other">Category</option>
            <option value="health">Health</option>
            <option value="family">Family</option>
            <option value="work">Work</option>
            <option value="faith">Faith</option>
            <option value="relationships">Relationships</option>
            <option value="finances">Finances</option>
          </select>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={newPrayer.isAnonymous}
              onChange={(e) => setNewPrayer({ ...newPrayer, isAnonymous: e.target.checked })}
              className="w-4 h-4"
            />
            <span className="text-sm text-slate-600">Post anonymously</span>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition"
            >
              Post
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {prayers.length === 0 ? (
          <div className="bg-slate-50 rounded-xl p-8 text-center">
            <Heart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-600">No prayers yet. Be the first to share.</p>
          </div>
        ) : (
          prayers.map((prayer) => (
            <div key={prayer.id} className="bg-white rounded-xl p-6 border border-slate-200 space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="font-semibold text-slate-900">{prayer.title}</p>
                  <p className="text-xs text-slate-500">
                    {prayer.is_anonymous ? 'Anonymous' : prayer.author_name} • {prayer.category}
                  </p>
                </div>
              </div>
              <p className="text-slate-700 text-sm">{prayer.description}</p>
              <div className="flex items-center gap-4 pt-3 border-t border-slate-200">
                <button
                  onClick={() => handlePray(prayer.id)}
                  className={`flex items-center gap-1 text-sm transition ${
                    prayer.prayed_by.includes(user?.email)
                      ? 'text-red-500'
                      : 'text-slate-600 hover:text-red-500'
                  }`}
                >
                  <Heart className="w-4 h-4" fill={prayer.prayed_by.includes(user?.email) ? 'currentColor' : 'none'} />
                  Pray ({prayer.prayer_count || 0})
                </button>
                <button className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                  <MessageCircle className="w-4 h-4" />
                  Comment
                </button>
                <button className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900">
                  <Share2 className="w-4 h-4" />
                  Share
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}