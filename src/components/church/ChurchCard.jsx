import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, MapPin, Globe, Clock, Phone } from 'lucide-react';

export default function ChurchCard({ church, isFavorited, onFavorite }) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {church.imageUrl && <img src={church.imageUrl} alt={church.name} className="w-full h-40 object-cover" />}

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-gray-900">{church.name}</h3>
            {church.denomination && <p className="text-xs text-gray-500">{church.denomination}</p>}
          </div>
          <button onClick={() => onFavorite(church.id)} className="text-lg">
            {isFavorited ? '❤️' : '🤍'}
          </button>
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex gap-2">
            <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{church.address}, {church.city}</span>
          </div>

          {church.phone && (
            <div className="flex gap-2">
              <Phone className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <a href={`tel:${church.phone}`} className="text-indigo-600 hover:underline">
                {church.phone}
              </a>
            </div>
          )}

          {church.website && (
            <div className="flex gap-2">
              <Globe className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <a href={church.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
                Visit Website
              </a>
            </div>
          )}

          {church.serviceTimes?.length > 0 && (
            <div className="flex gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="text-xs">
                {church.serviceTimes.map((s, i) => (
                  <div key={i}>
                    {s.day}: {s.time}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {church.description && <p className="text-xs text-gray-600 mt-3 line-clamp-2">{church.description}</p>}
      </div>
    </Card>
  );
}