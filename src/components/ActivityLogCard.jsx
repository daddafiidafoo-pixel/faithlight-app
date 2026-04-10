import React from 'react';
import { format } from 'date-fns';
import { createPageUrl } from '../utils';
import {
  Plus, Edit, Trash2, MessageCircle, Heart, LogIn, LogOut,
  Mail, CheckSquare, Share2, Sparkles
} from 'lucide-react';

const ACTION_ICONS = {
  create: <Plus className="w-5 h-5 text-green-600" />,
  update: <Edit className="w-5 h-5 text-blue-600" />,
  delete: <Trash2 className="w-5 h-5 text-red-600" />,
  comment: <MessageCircle className="w-5 h-5 text-purple-600" />,
  like: <Heart className="w-5 h-5 text-pink-600" />,
  join: <LogIn className="w-5 h-5 text-green-600" />,
  leave: <LogOut className="w-5 h-5 text-gray-600" />,
  invite: <Mail className="w-5 h-5 text-blue-600" />,
  publish: <CheckSquare className="w-5 h-5 text-indigo-600" />,
  share: <Share2 className="w-5 h-5 text-teal-600" />
};

const ENTITY_COLORS = {
  Group: 'bg-blue-50 border-blue-200',
  LiveEvent: 'bg-purple-50 border-purple-200',
  Post: 'bg-green-50 border-green-200',
  Comment: 'bg-gray-50 border-gray-200',
  StudyPlan: 'bg-amber-50 border-amber-200',
  Course: 'bg-indigo-50 border-indigo-200',
  PrayerRequest: 'bg-pink-50 border-pink-200',
  SermonNote: 'bg-orange-50 border-orange-200',
  Challenge: 'bg-teal-50 border-teal-200'
};

export default function ActivityLogCard({ activity }) {
  const actionIcon = ACTION_ICONS[activity.action_type] || <Sparkles className="w-5 h-5 text-gray-600" />;
  const entityColor = ENTITY_COLORS[activity.entity_type] || 'bg-gray-50 border-gray-200';
  const timestamp = format(new Date(activity.created_date), 'MMM d, h:mm a');

  const getEntityLink = () => {
    // Customize based on entity type
    switch (activity.entity_type) {
      case 'Group':
        return createPageUrl(`GroupDetail?id=${activity.entity_id}`);
      case 'LiveEvent':
        return createPageUrl(`LiveEventDetail?id=${activity.entity_id}`);
      case 'Post':
        return createPageUrl(`Community`);
      case 'StudyPlan':
        return createPageUrl(`BibleStudyPlans`);
      default:
        return '#';
    }
  };

  return (
    <div className={`border rounded-lg p-4 ${entityColor} hover:shadow-md transition-shadow`}>
      <div className="flex gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          {actionIcon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <p className="text-gray-900 font-medium">{activity.description}</p>
              <p className="text-sm text-gray-600 mt-1">
                By <span className="font-medium">{activity.user_name}</span> • {timestamp}
              </p>

              {/* Entity Info */}
              {activity.entity_title && (
                <div className="mt-2 inline-block">
                  <a
                    href={getEntityLink()}
                    className="text-sm px-3 py-1 bg-white border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                  >
                    {activity.entity_type}: <span className="font-medium">{activity.entity_title}</span>
                  </a>
                </div>
              )}

              {/* Details */}
              {activity.details && Object.keys(activity.details).length > 0 && (
                <div className="mt-3 text-xs text-gray-600 bg-white bg-opacity-50 rounded p-2">
                  {Object.entries(activity.details).slice(0, 2).map(([key, value]) => (
                    <div key={key}>
                      <span className="font-medium">{key}:</span> {String(value).substring(0, 50)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Badge */}
            <div className="flex-shrink-0">
              <span className="inline-block px-3 py-1 text-xs font-semibold rounded-full bg-white border border-gray-300 text-gray-700">
                {activity.action_type}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}