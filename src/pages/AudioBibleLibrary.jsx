import React, { useState, useRef, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Play, Pause, Volume2, Heart, Clock, Download, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

const AUDIO_ITEMS = [
  { id: 1, title: 'Genesis Overview', type: 'Bible Study', duration: '12:34', book: 'Genesis', narrator: 'David Clarke' },
  { id: 2, title: 'John 3:16 Deep Dive', type: 'Devotion', duration: '08:45', book: 'John', narrator: 'Sarah Johnson' },
  { id: 3, title: 'Romans Daily Devotion', type: 'Devotion', duration: '06:20', book: 'Romans', narrator: 'Michael Brown' },
  { id: 4, title: 'Psalms for Peace', type: 'Study', duration: '15:10', book: 'Psalms', narrator: 'Grace Lee' },
  { id: 5, title: 'Matthew Parables', type: 'Study', duration: '10:55', book: 'Matthew', narrator: 'James Wilson' },
  { id: 6, title: 'Daily Prayer Guide', type: 'Devotion', duration: '05:30', book: 'Prayer', narrator: 'Emma Davis' },
];

export default function AudioBibleLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedBook, setSelectedBook] = useState('all');
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [listenLater, setListenLater] = useState([]);
  const audioRef = useRef(null);
  const queryClient = useQueryClient();

  // Load listen later from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('listenLater');
    if (saved) setListenLater(JSON.parse(saved));
  }, []);

  const filteredAudio = AUDIO_ITEMS.filter((item) => {
    const matchSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                       item.narrator.toLowerCase().includes(searchQuery.toLowerCase());
    const matchType = selectedType === 'all' || item.type === selectedType;
    const matchBook = selectedBook === 'all' || item.book === selectedBook;
    return matchSearch && matchType && matchBook;
  });

  const handlePlayPause = (track) => {
    if (currentTrack?.id === track.id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentTrack(track);
      setIsPlaying(true);
    }
  };

  const toggleListenLater = (trackId) => {
    let updated = listenLater.includes(trackId)
      ? listenLater.filter(id => id !== trackId)
      : [...listenLater, trackId];

    setListenLater(updated);
    localStorage.setItem('listenLater', JSON.stringify(updated));
    
    if (updated.includes(trackId)) {
      toast.success('Added to Listen Later');
    } else {
      toast.info('Removed from Listen Later');
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const books = ['all', ...new Set(AUDIO_ITEMS.map(item => item.book))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Audio Bible Library</h1>
          <p className="text-gray-600">Listen to narrated Bible studies and daily devotions</p>
        </div>

        {/* Player Bar (if something is playing) */}
        {currentTrack && (
          <Card className="p-4 mb-6 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{currentTrack.title}</p>
                <p className="text-sm opacity-90">{currentTrack.narrator}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm whitespace-nowrap">{formatTime(currentTime)}</span>
                <div className="w-32 h-1 bg-white/30 rounded-full">
                  <div
                    className="h-1 bg-white rounded-full"
                    style={{ width: `${(currentTime / 600) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm whitespace-nowrap">{currentTrack.duration}</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setIsPlaying(!isPlaying)}
                  size="icon"
                  className="bg-white text-indigo-600 hover:bg-gray-100"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  onClick={() => toggleListenLater(currentTrack.id)}
                  size="icon"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                >
                  <Heart
                    className="w-4 h-4"
                    fill={listenLater.includes(currentTrack.id) ? 'currentColor' : 'none'}
                  />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              placeholder="Search by title or narrator..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Devotion">Devotion</SelectItem>
                <SelectItem value="Study">Study</SelectItem>
                <SelectItem value="Bible Study">Bible Study</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Book</label>
            <Select value={selectedBook} onValueChange={setSelectedBook}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book} value={book}>
                    {book === 'all' ? 'All Books' : book}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedBook('all');
              setSelectedType('all');
            }}
            variant={searchQuery === '' && selectedBook === 'all' ? 'default' : 'outline'}
            className={searchQuery === '' && selectedBook === 'all' ? 'bg-indigo-600' : ''}
          >
            <BookOpen className="w-4 h-4 mr-2" />
            All Audio
          </Button>
          <Button
            onClick={() => {
              setSearchQuery('');
              setSelectedBook('all');
              setSelectedType('all');
              // Filter to listen later items
            }}
            variant="outline"
          >
            <Heart className="w-4 h-4 mr-2" />
            Listen Later ({listenLater.length})
          </Button>
        </div>

        {/* Audio Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAudio.map((item) => (
            <Card key={item.id} className="p-6 hover:shadow-lg transition">
              <div className="mb-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.narrator}</p>
                  </div>
                  <Button
                    onClick={() => toggleListenLater(item.id)}
                    size="icon"
                    variant="ghost"
                    className="text-red-500"
                  >
                    <Heart
                      className="w-5 h-5"
                      fill={listenLater.includes(item.id) ? 'currentColor' : 'none'}
                    />
                  </Button>
                </div>

                <div className="flex gap-2 mb-3">
                  <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded">
                    {item.type}
                  </span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {item.book}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  {item.duration}
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex gap-2">
                <Button
                  onClick={() => handlePlayPause(item)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700"
                >
                  {currentTrack?.id === item.id && isPlaying ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Play
                    </>
                  )}
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {filteredAudio.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-gray-600">No audio content found matching your filters</p>
          </Card>
        )}

        {/* Hidden audio element for playback */}
        <audio
          ref={audioRef}
          autoPlay={isPlaying}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        />
      </div>
    </div>
  );
}