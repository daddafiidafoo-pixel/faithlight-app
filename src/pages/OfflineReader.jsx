import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { offlineDb } from '../components/lib/offlineDb';
import { Button } from '@/components/ui/button';
import { useI18n } from '../components/I18nProvider';
import { Trash2, BookOpen, HardDrive } from 'lucide-react';
import { motion } from 'framer-motion';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.22, delay: i * 0.06 } }),
};

export default function OfflineReader() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [totalSize, setTotalSize] = useState(0);

  useEffect(() => {
    loadDownloaded();
  }, []);

  const loadDownloaded = async () => {
    const list = offlineDb.getDownloadedList();
    setChapters(list);
    setTotalSize(offlineDb.getTotalSize());
  };

  const handleDelete = async (reference) => {
    await offlineDb.deleteChapter(reference);
    await loadDownloaded();
    setSelectedChapter(null);
  };

  const handleClearAll = async () => {
    if (window.confirm('Delete all offline content?')) {
      await offlineDb.clearAll();
      await loadDownloaded();
      setSelectedChapter(null);
    }
  };

  const loadChapterText = async (reference) => {
    const chapter = await offlineDb.getChapter(reference);
    setSelectedChapter(chapter);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3 mb-2">
              <BookOpen size={32} />
              Offline Library
            </h1>
            <p className="text-gray-600">Read downloaded chapters without internet</p>
          </div>

          {/* Storage Info */}
          <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HardDrive size={20} className="text-gray-500" />
              <div>
                <p className="text-sm text-gray-600">Storage Used</p>
                <p className="text-xl font-semibold text-gray-900">
                  {formatSize(totalSize)} / ~50 MB
                </p>
              </div>
            </div>
            {chapters.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleClearAll}
              >
                Clear All
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chapters List */}
          <motion.div
            custom={1}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="md:col-span-1"
          >
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-4">
                Downloaded ({chapters.length})
              </h2>

              {chapters.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No chapters downloaded yet. Download from the Bible reader to read offline.
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {chapters.map((ch) => (
                    <button
                      key={ch.reference}
                      onClick={() => loadChapterText(ch.reference)}
                      className={`w-full p-3 rounded text-left transition-colors ${
                        selectedChapter?.reference === ch.reference
                          ? 'bg-indigo-50 border-l-4 border-indigo-600'
                          : 'hover:bg-gray-50 border-l-4 border-transparent'
                      }`}
                    >
                      <p className="font-medium text-sm text-gray-900">{ch.title}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(ch.downloadedAt).toLocaleDateString()} •{' '}
                        {formatSize(ch.sizeBytes)}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Chapter Content */}
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="md:col-span-2"
          >
            <div className="bg-white rounded-lg shadow-sm p-6">
              {selectedChapter ? (
                <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedChapter.title}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {selectedChapter.language.toUpperCase()} •{' '}
                        {new Date(selectedChapter.downloadedAt).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() =>
                        handleDelete(selectedChapter.reference).then(() =>
                          setSelectedChapter(null)
                        )
                      }
                      className="gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>

                  <div className="prose prose-sm max-w-none bg-gray-50 p-6 rounded text-gray-800 max-h-96 overflow-y-auto">
                    {selectedChapter.text.split('\n').map((line, i) => (
                      <p key={i} className="mb-4 leading-relaxed whitespace-pre-wrap text-sm">
                        {line}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-16">
                  <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                  <p className="text-gray-500">
                    {chapters.length === 0
                      ? 'Download chapters to read offline'
                      : 'Select a chapter to read'}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}