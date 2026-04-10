import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../I18nProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  Trash2,
  HardDrive,
  Wifi,
  WifiOff,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pause,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

export default function AdvancedOfflineManager() {
  const { t, lang } = useI18n();
  const [offlineContent, setOfflineContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [totalStorage, setTotalStorage] = useState(0);
  const [downloadingIds, setDownloadingIds] = useState(new Set());
  const [pausedIds, setPausedIds] = useState(new Set());

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const content = await base44.entities.OfflineContent.filter({
          user_id: currentUser.id,
        }, '-downloaded_at');

        setOfflineContent(content);

        // Calculate total storage
        const total = content.reduce((sum, c) => sum + (c.size_bytes || 0), 0);
        setTotalStorage(total);
      } catch (error) {
        console.error('Error fetching offline content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDownloadContent = async (contentType, contentId, contentName, translation) => {
    setDownloadingIds(prev => new Set([...prev, contentId]));

    try {
      // Simulate progressive download
      for (let progress = 0; progress <= 100; progress += 10) {
        if (pausedIds.has(contentId)) {
          await new Promise(resolve => {
            const checkInterval = setInterval(() => {
              if (!pausedIds.has(contentId)) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 500);
          });
        }

        await new Promise(resolve => setTimeout(resolve, 300));

        // Update progress in DB
        const existing = offlineContent.find(c => c.content_id === contentId);
        if (existing) {
          await base44.entities.OfflineContent.update(existing.id, {
            download_progress: progress,
            download_status: progress === 100 ? 'completed' : 'downloading',
          });
        }
      }

      // Create final record
      const newContent = {
        user_id: user.id,
        content_type: contentType,
        content_id: contentId,
        content_name: contentName,
        translation,
        size_bytes: Math.floor(Math.random() * 50) + 10 * 1024 * 1024, // ~10-60MB
        download_progress: 100,
        download_status: 'completed',
        is_synced: true,
      };

      const existing = offlineContent.find(c => c.content_id === contentId);
      if (existing) {
        await base44.entities.OfflineContent.update(existing.id, newContent);
        setOfflineContent(prev =>
          prev.map(c => (c.content_id === contentId ? { ...c, ...newContent } : c))
        );
      } else {
        const created = await base44.entities.OfflineContent.create(newContent);
        setOfflineContent(prev => [created, ...prev]);
      }

      toast.success(
        lang === 'om'
          ? `${contentName} gad facaasifamee`
          : `${contentName} downloaded`
      );
    } catch (error) {
      toast.error(
        lang === 'om' ? 'Gad facaasuun kuffa' : 'Download failed'
      );
    } finally {
      setDownloadingIds(prev => {
        const updated = new Set(prev);
        updated.delete(contentId);
        return updated;
      });
    }
  };

  const handleDeleteContent = async (id) => {
    if (!confirm(lang === 'om' ? 'Balleessi?' : 'Delete?')) return;

    try {
      await base44.entities.OfflineContent.delete(id);
      setOfflineContent(prev => prev.filter(c => c.id !== id));
      toast.success(lang === 'om' ? 'Balleessifamee' : 'Deleted');
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Error');
    }
  };

  const handleTogglePause = (contentId) => {
    setPausedIds(prev => {
      const updated = new Set(prev);
      if (updated.has(contentId)) {
        updated.delete(contentId);
      } else {
        updated.add(contentId);
      }
      return updated;
    });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const downloadableContent = [
    {
      type: 'bible_translation',
      items: [
        { id: 'web', name: 'Bible (WEB)', size: 5242880 },
        { id: 'asv', name: 'Bible (ASV)', size: 5242880 },
      ],
    },
    {
      type: 'bible_book',
      items: [
        { id: 'genesis', name: 'Genesis', size: 524288 },
        { id: 'john', name: 'John', size: 262144 },
        { id: 'psalms', name: 'Psalms', size: 786432 },
      ],
    },
  ];

  if (loading) {
    return <div className="text-center py-12">{lang === 'om' ? 'Lakkaawamu...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with Status */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <h2 className="text-3xl font-bold text-[var(--faith-light-primary-dark)]">
            {lang === 'om' ? 'Differeewwan Offlain' : 'Offline Downloads'}
          </h2>
          {isOnline ? (
            <Badge className="bg-green-600">
              <Wifi className="w-3 h-3 mr-1" />
              {lang === 'om' ? 'Walitti' : 'Online'}
            </Badge>
          ) : (
            <Badge className="bg-red-600">
              <WifiOff className="w-3 h-3 mr-1" />
              {lang === 'om' ? 'Offlaain' : 'Offline'}
            </Badge>
          )}
        </div>
        <p className="text-gray-600">
          {lang === 'om'
            ? 'Qopheeffii bii fayyadamuuf jidha qabaachuu dhaabi'
            : 'Download content to read offline without internet'}
        </p>
      </div>

      {/* Storage Info */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-blue-600" />
              <span className="font-semibold">
                {lang === 'om' ? 'Kuusaa Fayyadamaa' : 'Storage Used'}
              </span>
            </div>
            <span className="text-lg font-bold">{formatBytes(totalStorage)}</span>
          </div>
          <Progress value={Math.min((totalStorage / (500 * 1024 * 1024)) * 100, 100)} />
          <p className="text-xs text-gray-500 mt-2">
            {lang === 'om'
              ? `${formatBytes(totalStorage)} / 500 MB`
              : `${formatBytes(totalStorage)} / 500 MB`}
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="available">
            {lang === 'om' ? 'Gad Facaasu' : 'Available'}
          </TabsTrigger>
          <TabsTrigger value="downloaded">
            {lang === 'om' ? 'Gad Facaasifame' : 'Downloaded'}
            {offlineContent.length > 0 && (
              <Badge className="ml-2 bg-blue-600">{offlineContent.length}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Available Downloads */}
        <TabsContent value="available" className="space-y-4 mt-6">
          {downloadableContent.map(category => (
            <div key={category.type}>
              <h3 className="font-semibold text-lg mb-3">
                {category.type === 'bible_translation'
                  ? lang === 'om'
                    ? 'Turjuumaa Kilaab'
                    : 'Bible Translations'
                  : lang === 'om'
                  ? 'Kilaab'
                  : 'Books'}
              </h3>
              <div className="space-y-2">
                {category.items.map(item => {
                  const isDownloaded = offlineContent.some(c => c.content_id === item.id);
                  const isDownloading = downloadingIds.has(item.id);

                  return (
                    <Card key={item.id}>
                      <CardContent className="pt-6">
                        <div className="flex justify-between items-center gap-4">
                          <div className="flex-1">
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-500">{formatBytes(item.size)}</p>
                          </div>

                          {isDownloaded ? (
                            <Badge className="bg-green-600">
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              {lang === 'om' ? 'Gad Facaasifame' : 'Downloaded'}
                            </Badge>
                          ) : (
                            <Button
                              onClick={() =>
                                handleDownloadContent(
                                  category.type,
                                  item.id,
                                  item.name,
                                  category.type === 'bible_translation' ? item.id : null
                                )
                              }
                              disabled={isDownloading}
                              size="sm"
                            >
                              <Download className="w-4 h-4 mr-1" />
                              {isDownloading
                                ? lang === 'om'
                                  ? 'Lakkaawamu...'
                                  : 'Downloading...'
                                : lang === 'om'
                                ? 'Gad Facaasu'
                                : 'Download'}
                            </Button>
                          )}
                        </div>

                        {isDownloading && (
                          <div className="mt-4 space-y-2">
                            <Progress value={downloadingIds.has(item.id) ? 50 : 0} />
                            <p className="text-xs text-gray-600">
                              {lang === 'om' ? 'Lakkaawamu...' : 'Downloading...'}
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </TabsContent>

        {/* Downloaded Content */}
        <TabsContent value="downloaded" className="space-y-4 mt-6">
          {offlineContent.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <WifiOff className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {lang === 'om'
                    ? 'Qopheeffii offlain hin jiru. Haa dabal jabeessa!'
                    : 'No offline content yet. Download some!'}
                </p>
              </CardContent>
            </Card>
          ) : (
            offlineContent.map(content => (
              <Card key={content.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{content.content_name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(content.downloaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge>{formatBytes(content.size_bytes)}</Badge>
                  </div>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {content.is_synced ? (
                        <CheckCircle2 className="w-4 h-4 text-green-600" />
                      ) : (
                        <Clock className="w-4 h-4 text-yellow-600" />
                      )}
                      <span className="text-sm">
                        {content.is_synced
                          ? lang === 'om'
                            ? 'Walitti qabaachaa jira'
                            : 'Synced'
                          : lang === 'om'
                          ? 'Walitti qabaachuu eegaa'
                          : 'Pending sync'}
                      </span>
                    </div>

                    {!isOnline && (
                      <div className="flex items-center gap-2 text-orange-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {lang === 'om'
                          ? 'Offlain jirta. Walitti qabaachuu erga Internettii dhumanatti ta\'a'
                          : 'Offline. Changes will sync when online.'}
                      </div>
                    )}

                    <div className="flex gap-2 pt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleTogglePause(content.id)}
                        className="flex-1"
                      >
                        {pausedIds.has(content.id) ? (
                          <>
                            <Play className="w-4 h-4 mr-1" />
                            {lang === 'om' ? 'Fufi' : 'Resume'}
                          </>
                        ) : (
                          <>
                            <Pause className="w-4 h-4 mr-1" />
                            {lang === 'om' ? 'Dhaabi' : 'Pause'}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteContent(content.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}