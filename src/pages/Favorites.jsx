import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Heart, ArrowLeft, Trash2 } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function Favorites() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const user = await base44.auth.me();
      if (!user) return;

      const records = await base44.entities.Favorites.filter({
        userId: user.email,
      }, '-savedDate', 50);

      setFavorites(records || []);
    } catch (error) {
      console.error('Error loading favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (id) => {
    try {
      await base44.entities.Favorites.delete(id);
      setFavorites(favorites.filter(f => f.id !== id));
    } catch (error) {
      console.error('Error removing favorite:', error);
      alert('Failed to remove favorite');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Link to={createPageUrl('FaithWidget')}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Favorite Verses</h1>
        </div>

        {loading ? (
          <div className="text-center py-12">Loading your favorites...</div>
        ) : (
          <>
            {favorites.length > 0 ? (
              <div className="grid gap-4">
                {favorites.map((fav) => (
                  <Card key={fav.id} className="p-4 border-rose-200 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-lg font-semibold text-rose-700">{fav.reference}</p>
                        {fav.notes && (
                          <p className="text-sm text-gray-600 mt-2 italic">"{fav.notes}"</p>
                        )}
                        <p className="text-xs text-gray-500 mt-3">
                          Saved {new Date(fav.savedDate).toLocaleDateString('default', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemove(fav.id)}
                        className="text-rose-500 hover:text-rose-700 hover:bg-rose-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-rose-200">
                <Heart className="w-12 h-12 text-rose-300 mx-auto mb-4" />
                <p className="text-gray-600 mb-2 font-medium">No favorite verses yet.</p>
                <p className="text-sm text-gray-500">
                  Go to the Faith Widget and click the heart button to save your favorite verses.
                </p>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}