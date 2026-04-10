import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import SermonTranscriptUploader from '@/components/sermon/SermonTranscriptUploader';
import SermonAnalysisResults from '@/components/sermon/SermonAnalysisResults';
import { Zap } from 'lucide-react';

export default function SermonAnalyzer() {
  const [analyses, setAnalyses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user
  useEffect(() => {
    base44.auth.me()
      .then(user => setCurrentUser(user))
      .catch(() => setCurrentUser(null));
  }, []);

  // Load analyses
  useEffect(() => {
    if (!currentUser?.email) return;
    setLoading(true);
    base44.entities.SermonTranscriptAnalysis.filter(
      { user_email: currentUser.email },
      '-created_date',
      50
    )
      .then(data => setAnalyses(data || []))
      .catch(() => setAnalyses([]))
      .finally(() => setLoading(false));
  }, [currentUser?.email]);

  const handleSuccess = (newAnalysis) => {
    setAnalyses([newAnalysis, ...analyses]);
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.SermonTranscriptAnalysis.delete(id);
      setAnalyses(analyses.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error deleting analysis:', err);
      alert('Failed to delete analysis');
    }
  };

  if (!currentUser?.email) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#F8F6F1' }}>
        <p style={{ color: '#6B7280' }}>Please log in to use the sermon analyzer.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F8F6F1' }}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8" style={{ color: '#8B5CF6' }} />
            <h1 className="text-3xl font-bold" style={{ color: '#1F2937' }}>
              Sermon Analyzer
            </h1>
          </div>
          <p style={{ color: '#6B7280' }}>
            Transform sermon transcripts into actionable insights with AI
          </p>
        </div>

        {/* Uploader */}
        <div className="mb-8">
          <SermonTranscriptUploader onSuccess={handleSuccess} />
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8" style={{ borderTop: '2px solid #8B5CF6', borderRight: '2px solid #8B5CF6', borderBottom: '2px solid transparent', borderLeft: '2px solid transparent' }} />
          </div>
        ) : analyses.length === 0 ? (
          <div
            className="bg-white rounded-2xl p-12 text-center border border-gray-200"
          >
            <p style={{ color: '#9CA3AF' }}>
              No analyses yet. Upload your first sermon transcript above!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold" style={{ color: '#1F2937' }}>
              Your Analyses ({analyses.length})
            </h2>
            {analyses.map(analysis => (
              <SermonAnalysisResults
                key={analysis.id}
                analysis={analysis}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}