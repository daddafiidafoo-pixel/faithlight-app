import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, MapPin, Users, Heart, Loader2, ChevronRight } from 'lucide-react';
import { createPageUrl } from '../utils';

export default function FindChurches() {
  const navigate = useNavigate();
  const [churches, setChurches] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [followedChurches, setFollowedChurches] = useState(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await base44.auth.isAuthenticated();
      if (isAuth) {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        // Load followed churches
        try {
          const follows = await base44.entities.ChurchFollower.filter({ user_id: currentUser.id });
          setFollowedChurches(new Set(follows.map(f => f.church_id)));
        } catch {}
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const loadChurches = async () => {
      try {
        const allChurches = await base44.entities.Church.filter({ is_active: true }, '-follower_count', 100);
        setChurches(allChurches);
      } catch (error) {
        console.error('Failed to load churches:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChurches();
  }, []);

  useEffect(() => {
    let results = churches;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      results = results.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.pastor_name?.toLowerCase().includes(query)
      );
    }

    if (cityFilter.trim()) {
      results = results.filter(c => c.city.toLowerCase().includes(cityFilter.toLowerCase()));
    }

    setFiltered(results);
  }, [churches, searchQuery, cityFilter]);

  const cities = [...new Set(churches.map(c => c.city))].sort();

  const handleFollow = async (churchId) => {
    if (!user) {
      base44.auth.redirectToLogin();
      return;
    }

    try {
      if (followedChurches.has(churchId)) {
        // Unfollow
        const existing = await base44.entities.ChurchFollower.filter({
          user_id: user.id,
          church_id: churchId
        });
        if (existing.length > 0) {
          await base44.asServiceRole.entities.ChurchFollower.delete(existing[0].id);
        }
        setFollowedChurches(prev => {
          const next = new Set(prev);
          next.delete(churchId);
          return next;
        });
      } else {
        // Follow
        await base44.asServiceRole.entities.ChurchFollower.create({
          user_id: user.id,
          church_id: churchId,
          notification_enabled: true
        });
        setFollowedChurches(prev => new Set(prev).add(churchId));
      }
    } catch (error) {
      console.error('Follow error:', error);
      alert('Failed to update follow status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Find Churches</h1>
          <p className="text-gray-600 text-lg">Discover churches using FaithLight near you</p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative mb-4">
            <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search by church name or pastor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 py-3 rounded-xl text-base"
            />
          </div>

          {/* City Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setCityFilter('')}
              className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                cityFilter === '' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
              }`}
            >
              All Cities
            </button>
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                className={`px-4 py-2 rounded-full whitespace-nowrap font-medium transition-colors ${
                  cityFilter === city ? 'bg-indigo-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
                }`}
              >
                {city}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No churches found</h3>
            <p className="text-gray-600">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map(church => (
              <div key={church.id} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{church.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {church.city}, {church.country}
                      </div>
                      {church.follower_count > 0 && (
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {church.follower_count} followers
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleFollow(church.id)}
                    className={`flex-shrink-0 px-4 py-2 rounded-lg font-bold transition-colors ${
                      followedChurches.has(church.id)
                        ? 'bg-red-100 text-red-600 hover:bg-red-200'
                        : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${followedChurches.has(church.id) ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {church.pastor_name && (
                  <p className="text-gray-600 text-sm mb-3">
                    <strong>Pastor:</strong> {church.pastor_name}
                  </p>
                )}

                {church.description && (
                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">{church.description}</p>
                )}

                {church.service_times && (
                  <p className="text-gray-600 text-sm mb-4">
                    <strong>Services:</strong> {church.service_times}
                  </p>
                )}

                <button
                  onClick={() => navigate(createPageUrl('ChurchDetail'), { state: { church } })}
                  className="text-indigo-600 hover:text-indigo-700 font-bold text-sm flex items-center gap-1 mt-4"
                >
                  View Details <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Seed data notice */}
        {filtered.length > 0 && (
          <div className="mt-12 p-6 bg-blue-50 border border-blue-200 rounded-xl text-center">
            <p className="text-blue-900 text-sm">
              💡 This is sample data. <a href="mailto:support@faithlight.com" className="font-bold hover:underline">Contact us</a> to add your church to FaithLight.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}