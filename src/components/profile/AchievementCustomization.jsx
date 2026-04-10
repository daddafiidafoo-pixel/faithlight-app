import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Award, Palette, Loader2 } from 'lucide-react';

/**
 * Customize profile with earned badges and achievements
 */
export default function AchievementCustomization({ userId }) {
  const [displayStyle, setDisplayStyle] = useState('grid');
  const [selectedBadges, setSelectedBadges] = useState([]);
  const queryClient = useQueryClient();

  // Get user's earned badges
  const { data: userBadges = [] } = useQuery({
    queryKey: ['user-badges', userId],
    queryFn: async () => {
      return await base44.entities.UserBadge.filter(
        { user_id: userId },
        '-created_at'
      );
    },
  });

  // Get customization settings
  const { data: customization } = useQuery({
    queryKey: ['achievement-customization', userId],
    queryFn: async () => {
      const records = await base44.entities.UserAchievementCustomization.filter(
        { user_id: userId }
      );
      return records[0];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (customization) {
        return await base44.entities.UserAchievementCustomization.update(
          customization.id,
          {
            pinned_badges: selectedBadges.slice(0, 6),
            achievement_display_style: displayStyle,
          }
        );
      } else {
        return await base44.entities.UserAchievementCustomization.create({
          user_id: userId,
          pinned_badges: selectedBadges.slice(0, 6),
          achievement_display_style: displayStyle,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['achievement-customization'] });
    },
  });

  return (
    <div className="space-y-4">
      {/* Display Style */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Display Style
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {['grid', 'timeline', 'carousel'].map((style) => (
              <button
                key={style}
                onClick={() => setDisplayStyle(style)}
                className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${
                  displayStyle === style
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                {style.charAt(0).toUpperCase() + style.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pinned Badges */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Award className="w-5 h-5" />
            Featured Badges (max 6)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {userBadges.length === 0 ? (
            <p className="text-sm text-gray-600">No badges earned yet</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-2">
                {userBadges.map((badge) => (
                  <button
                    key={badge.id}
                    onClick={() => {
                      if (selectedBadges.includes(badge.id)) {
                        setSelectedBadges(selectedBadges.filter(id => id !== badge.id));
                      } else if (selectedBadges.length < 6) {
                        setSelectedBadges([...selectedBadges, badge.id]);
                      }
                    }}
                    className={`p-3 rounded-lg border-2 text-center transition-all ${
                      selectedBadges.includes(badge.id)
                        ? 'border-indigo-600 bg-indigo-50 scale-105'
                        : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{badge.badge_emoji}</div>
                    <p className="text-xs font-semibold line-clamp-2">
                      {badge.badge_name}
                    </p>
                    {selectedBadges.includes(badge.id) && (
                      <p className="text-xs text-indigo-600 mt-1">✓ Pinned</p>
                    )}
                  </button>
                ))}
              </div>

              <div className="text-xs text-gray-600">
                {selectedBadges.length} / 6 badges pinned
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {displayStyle === 'grid' && (
            <div className="grid grid-cols-3 gap-2">
              {selectedBadges.map((badgeId) => {
                const badge = userBadges.find(b => b.id === badgeId);
                return (
                  <div key={badgeId} className="text-center">
                    <div className="text-3xl mb-1">{badge?.badge_emoji}</div>
                    <p className="text-xs text-gray-600">{badge?.badge_name}</p>
                  </div>
                );
              })}
            </div>
          )}

          {displayStyle === 'timeline' && (
            <div className="space-y-2">
              {selectedBadges.map((badgeId) => {
                const badge = userBadges.find(b => b.id === badgeId);
                return (
                  <div key={badgeId} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                    <div className="text-2xl">{badge?.badge_emoji}</div>
                    <div>
                      <p className="text-sm font-semibold">{badge?.badge_name}</p>
                      <p className="text-xs text-gray-600">Earned {new Date(badge?.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {displayStyle === 'carousel' && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {selectedBadges.map((badgeId) => {
                const badge = userBadges.find(b => b.id === badgeId);
                return (
                  <div
                    key={badgeId}
                    className="flex-shrink-0 w-24 h-24 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-indigo-300"
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-1">{badge?.badge_emoji}</div>
                      <p className="text-xs font-semibold text-gray-700 line-clamp-1">
                        {badge?.badge_name}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={() => saveMutation.mutate()}
        disabled={saveMutation.isPending}
        className="w-full gap-2"
      >
        {saveMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Customization'
        )}
      </Button>
    </div>
  );
}