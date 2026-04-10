import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trash2, BookOpen, Volume2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

function groupByBook(items) {
  const map = {};
  for (const item of items) {
    const key = item.book_name || item.book_id;
    if (!map[key]) map[key] = [];
    map[key].push(item);
  }
  return map;
}

export default function DownloadedItemsList({ refreshKey }) {
  const [textItems, setTextItems] = useState([]);
  const [audioItems, setAudioItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [refreshKey]);

  const load = async () => {
    setLoading(true);
    try {
      const [text, audio] = await Promise.all([
        base44.entities.OfflineTextChapter.list('-downloaded_at', 200),
        base44.entities.OfflineAudioChapter.list('-downloaded_at', 200),
      ]);
      setTextItems(text);
      setAudioItems(audio);
    } catch { } finally { setLoading(false); }
  };

  const deleteText = async (id) => {
    await base44.entities.OfflineTextChapter.delete(id);
    setTextItems(prev => prev.filter(i => i.id !== id));
    toast.success('Removed');
  };

  const deleteAudio = async (id) => {
    await base44.entities.OfflineAudioChapter.delete(id);
    setAudioItems(prev => prev.filter(i => i.id !== id));
    toast.success('Removed');
  };

  const deleteAllText = async () => {
    await Promise.all(textItems.map(i => base44.entities.OfflineTextChapter.delete(i.id)));
    setTextItems([]);
    toast.success('All text chapters removed');
  };

  const deleteAllAudio = async () => {
    await Promise.all(audioItems.map(i => base44.entities.OfflineAudioChapter.delete(i.id)));
    setAudioItems([]);
    toast.success('All audio chapters removed');
  };

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 animate-spin text-gray-300" /></div>;

  const textBooks = groupByBook(textItems);
  const audioBooks = groupByBook(audioItems);

  return (
    <div>
      <p className="text-sm font-semibold text-gray-700 mb-3">Downloaded Items</p>
      <Tabs defaultValue="text">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="text">
            <BookOpen className="w-3.5 h-3.5 mr-1.5" /> Text ({textItems.length})
          </TabsTrigger>
          <TabsTrigger value="audio">
            <Volume2 className="w-3.5 h-3.5 mr-1.5" /> Audio ({audioItems.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text">
          {textItems.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No text chapters downloaded yet.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">{textItems.length} chapters</span>
                <button onClick={deleteAllText} className="text-xs text-red-400 hover:text-red-600 underline">Clear all</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {Object.entries(textBooks).map(([bk, chs]) => {
                  const sorted = [...chs].sort((a, b) => a.chapter - b.chapter);
                  const ver = sorted[0]?.version_id;
                  const first = sorted[0]?.chapter, last = sorted[sorted.length - 1]?.chapter;
                  return (
                    <div key={bk} className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-indigo-50">
                        <div className="flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                          <span className="font-semibold text-sm text-gray-700">{bk}</span>
                          <span className="text-xs text-gray-400">Ch. {first}{first !== last ? `–${last}` : ''} · {ver}</span>
                        </div>
                        <span className="text-xs text-gray-400">{chs.length} ch</span>
                      </div>
                      <div className="divide-y divide-gray-50">
                        {sorted.map(ch => (
                          <div key={ch.id} className="flex items-center px-4 py-1.5">
                            <span className="text-sm text-gray-600 flex-1">Chapter {ch.chapter}</span>
                            <span className="text-xs text-gray-300 mr-2">{ch.verse_count || '?'} verses</span>
                            <button onClick={() => deleteText(ch.id)} className="p-1 rounded hover:bg-red-50 text-gray-200 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="audio">
          {audioItems.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No audio chapters saved yet.</p>
          ) : (
            <>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs text-gray-400">{audioItems.length} chapters</span>
                <button onClick={deleteAllAudio} className="text-xs text-red-400 hover:text-red-600 underline">Clear all</button>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {Object.entries(audioBooks).map(([bk, chs]) => {
                  const sorted = [...chs].sort((a, b) => a.chapter - b.chapter);
                  const lang = sorted[0]?.language_name || sorted[0]?.language_code;
                  const bible = sorted[0]?.bible_name;
                  const first = sorted[0]?.chapter, last = sorted[sorted.length - 1]?.chapter;
                  return (
                    <div key={bk} className="rounded-xl border border-gray-100 overflow-hidden">
                      <div className="flex items-center justify-between px-3 py-2 bg-purple-50">
                        <div className="flex items-center gap-2">
                          <Volume2 className="w-3.5 h-3.5 text-purple-400" />
                          <span className="font-semibold text-sm text-gray-700">{bk}</span>
                          <span className="text-xs text-gray-400">Ch. {first}{first !== last ? `–${last}` : ''} · {lang}</span>
                        </div>
                        <span className="text-xs text-gray-400">{chs.length} ch</span>
                      </div>
                      {bible && <div className="px-4 py-1 bg-purple-50/50 text-xs text-gray-400 border-b border-gray-50">{bible}</div>}
                      <div className="divide-y divide-gray-50">
                        {sorted.map(ch => (
                          <div key={ch.id} className="flex items-center px-4 py-1.5">
                            <span className="text-sm text-gray-600 flex-1">Chapter {ch.chapter}</span>
                            <button onClick={() => deleteAudio(ch.id)} className="p-1 rounded hover:bg-red-50 text-gray-200 hover:text-red-400 transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}