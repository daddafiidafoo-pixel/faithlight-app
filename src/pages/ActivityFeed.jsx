import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AccessibleSelect } from '@/components/ui/accessible-select';
import { AlertCircle, Loader2, Search } from 'lucide-react';
import { createPageUrl } from '../utils';
import ActivityLogCard from '../components/ActivityLogCard.jsx';
import PullToRefresh from '@/components/PullToRefresh';
import SafeAreaWrapper from '@/components/SafeAreaWrapper';
import ResponsiveGrid from '@/components/ResponsiveGrid';
import { useI18n } from '@/components/I18nProvider';

export default function ActivityFeed() {
  const { t } = useI18n();
  const [user, setUser] = useState(null);
  const [filterUser, setFilterUser] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [sortBy, setSortBy] = useState('-created_date');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch {
        window.location.href = createPageUrl('Home');
      }
    };
    fetchUser();
  }, []);

  // Build filter
  const buildFilter = () => {
    const filter = {};
    if (filterUser) filter.user_id = filterUser;
    if (filterAction) filter.action_type = filterAction;
    return filter;
  };

  const { data: activities, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['activities', filterUser, filterAction, sortBy],
    queryFn: async () => {
      const filter = buildFilter();
      const result = await base44.entities.ActivityLog.filter(filter, sortBy, 100);
      return result || [];
    },
  });

  const handlePullToRefresh = () => {
    refetch();
  };

  // Client-side search
  const filteredActivities = activities?.filter(a =>
    a.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.entity_title?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const actionTypes = [
    'create', 'update', 'delete', 'comment', 'like', 'join', 'leave', 'invite', 'publish', 'share'
  ];

  return (
    <SafeAreaWrapper>
      <PullToRefresh onRefresh={handlePullToRefresh} refreshing={isFetching}>
        <div className="max-w-6xl mx-auto p-4 sm:p-6 overflow-x-hidden">
         {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">{t('activity.title', 'Activity Feed')}</h1>
            <p className="text-sm sm:text-base text-gray-600">{t('activity.desc', 'See recent actions and updates across the app')}</p>
          </div>

        {/* Filters */}
         <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-6 shadow-sm overflow-x-hidden">
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">{t('common.search', 'Search')}</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder={t('activity.searchPlaceholder', 'Search activities...')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Action Type Filter */}
             <div>
               <AccessibleSelect
                 value={filterAction}
                 onValueChange={setFilterAction}
                 label={t('activity.actionType', 'Action Type')}
                 placeholder={t('activity.allActions', 'All Actions')}
                 options={actionTypes.map(type => ({
                   value: type,
                   label: type.charAt(0).toUpperCase() + type.slice(1),
                 }))}
               />
             </div>

             {/* Sort */}
             <div>
               <AccessibleSelect
                 value={sortBy}
                 onValueChange={setSortBy}
                 label={t('common.sort', 'Sort')}
                 options={[
                   { value: '-created_date', label: t('activity.newestFirst', 'Newest First') },
                   { value: 'created_date', label: t('activity.oldestFirst', 'Oldest First') },
                   { value: '-updated_date', label: t('activity.recentlyUpdated', 'Recently Updated') },
                 ]}
               />
             </div>
          </div>

          {/* Clear Filters Button */}
          {(filterUser || filterAction || searchTerm) && (
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilterUser('');
                  setFilterAction('');
                  setSearchTerm('');
                  refetch();
                }}
              >
                {t('activity.clearFilters', 'Clear Filters')}
              </Button>
            </div>
          )}
        </div>

        {/* Activities List */}
        <div className="space-y-4">
          {isLoading && (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          )}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-red-800 font-semibold">{t('activity.errorLoading', 'Error loading activities')}</p>
                <Button
                  onClick={() => refetch()}
                  size="sm"
                  variant="outline"
                  className="mt-2"
                >
                  {t('common.retry', 'Retry')}
                </Button>
              </div>
            </div>
          )}

          {!isLoading && !error && filteredActivities.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">{t('activity.noActivities', 'No activities found')}</p>
              <Button variant="outline" onClick={() => refetch()}>
                {t('common.refresh', 'Refresh')}
              </Button>
            </div>
          )}

          {!isLoading && !error && filteredActivities.length > 0 && (
            <>
              <p className="text-sm text-gray-600 mb-4">
                {t('activity.showing', 'Showing')} {filteredActivities.length} {t('activity.of', 'of')} {activities?.length || 0} {t('activity.activities', 'activities')}
              </p>
              {filteredActivities.map((activity) => (
                <ActivityLogCard key={activity.id} activity={activity} />
              ))}
            </>
          )}
        </div>
        </div>
        </PullToRefresh>
        </SafeAreaWrapper>
        );
        }