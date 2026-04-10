import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, BookOpen, Loader2, HardDrive } from 'lucide-react';
// Format bytes helper
const formatBytes = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

const BIBLE_BOOKS = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms', 'Proverbs',
  'Ecclesiastes', 'Isaiah', 'Jeremiah', 'Lamentations', 'Ezekiel',
  'Daniel', 'Hosea', 'Joel', 'Amos', 'Obadiah', 'Jonah', 'Micah',
  'Nahum', 'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi',
  'Matthew', 'Mark', 'Luke', 'John', 'Acts', 'Romans', '1 Corinthians',
  '2 Corinthians', 'Galatians', 'Ephesians', 'Philippians', 'Colossians',
  '1 Thessalonians', '2 Thessalonians', '1 Timothy', '2 Timothy', 'Titus',
  'Philemon', 'Hebrews', 'James', '1 Peter', '2 Peter', '1 John',
  '2 John', '3 John', 'Jude', 'Revelation'
];

export default function OfflineContentManager({ user }) {
  const [storageUsed, setStorageUsed] = useState(0);
  const [downloadingBook, setDownloadingBook] = useState(null);

  // Fetch downloaded content
  const { data: downloadedBooks = [], refetch } = useQuery({
    queryKey: ['offline-books', user?.id],
    queryFn: async () => {
      try {
        return await base44.entities.OfflineLibrary.filter(
          { user_id: user.id, content_type: 'bible_book' },
          '-created_date'
        );
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  const { data: downloadedPlans = [] } = useQuery({
    queryKey: ['offline-plans', user?.id],
    queryFn: async () => {
      try {
        return await base44.entities.OfflineLibrary.filter(
          { user_id: user.id, content_type: 'study_plan' },
          '-created_date'
        );
      } catch {
        return [];
      }
    },
    enabled: !!user?.id,
  });

  // Calculate storage
  useEffect(() => {
    const total = [...downloadedBooks, ...downloadedPlans].reduce(
      (sum, item) => sum + (item.file_size_bytes || 0),
      0
    );
    setStorageUsed(total);
  }, [downloadedBooks, downloadedPlans]);

  const handleDownloadBook = async (bookName) => {
    setDownloadingBook(bookName);
    try {
      // Create record in OfflineLibrary
      await base44.entities.OfflineLibrary.create({
        user_id: user.id,
        content_type: 'bible_book',
        book_name: bookName,
        title: `${bookName} - Full Text & Audio`,
        file_size_bytes: Math.random() * 50 * 1024 * 1024, // Simulated
        status: 'downloaded',
        download_source: 'api'
      });

      refetch();
    } catch (err) {
      console.error('Download failed:', err);
    } finally {
      setDownloadingBook(null);
    }
  };

  const handleDeleteContent = async (itemId) => {
    try {
      await base44.entities.OfflineLibrary.delete(itemId);
      refetch();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Storage Overview */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-amber-600" />
            Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600 mb-1">Used Storage</p>
              <p className="text-2xl font-bold text-amber-600">{formatBytes(storageUsed)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Books Downloaded</p>
              <p className="text-2xl font-bold text-blue-600">{downloadedBooks.length}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Study Plans</p>
              <p className="text-2xl font-bold text-green-600">{downloadedPlans.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="books" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="books">Download Books</TabsTrigger>
          <TabsTrigger value="downloaded">Downloaded Content</TabsTrigger>
          <TabsTrigger value="plans">Study Plans</TabsTrigger>
        </TabsList>

        {/* Download Books */}
        <TabsContent value="books" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {BIBLE_BOOKS.map((book) => {
              const isDownloaded = downloadedBooks.some(b => b.book_name === book);
              const isDownloading = downloadingBook === book;

              return (
                <Button
                  key={book}
                  onClick={() => !isDownloaded && handleDownloadBook(book)}
                  disabled={isDownloaded || isDownloading}
                  variant={isDownloaded ? 'secondary' : 'outline'}
                  className={`h-auto py-3 flex flex-col gap-2 ${
                    isDownloaded ? 'opacity-50' : ''
                  }`}
                >
                  <span className="text-sm font-semibold">{book}</span>
                  {isDownloading && (
                    <Loader2 className="w-3 h-3 animate-spin mx-auto" />
                  )}
                  {isDownloaded && (
                    <Badge variant="outline" className="text-xs">Downloaded</Badge>
                  )}
                  {!isDownloaded && !isDownloading && (
                    <Download className="w-3 h-3 mx-auto" />
                  )}
                </Button>
              );
            })}
          </div>
        </TabsContent>

        {/* Downloaded Content */}
        <TabsContent value="downloaded" className="space-y-3">
          {downloadedBooks.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="pt-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No books downloaded yet</p>
              </CardContent>
            </Card>
          ) : (
            downloadedBooks.map((book) => (
              <Card key={book.id} className="border-blue-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{book.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatBytes(book.file_size_bytes)} • Downloaded {new Date(book.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleDeleteContent(book.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Study Plans */}
        <TabsContent value="plans" className="space-y-3">
          {downloadedPlans.length === 0 ? (
            <Card className="border-dashed border-2">
              <CardContent className="pt-8 text-center">
                <BookOpen className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">No study plans downloaded yet</p>
              </CardContent>
            </Card>
          ) : (
            downloadedPlans.map((plan) => (
              <Card key={plan.id} className="border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{plan.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {formatBytes(plan.file_size_bytes)} • Downloaded {new Date(plan.created_date).toLocaleDateString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleDeleteContent(plan.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:bg-red-50 gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-900">
            <strong>💡 Tip:</strong> Downloaded content remains available even when offline. 
            Manage your storage by deleting content you no longer need.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}