import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Upload, FileText, Loader } from 'lucide-react';

export default function SermonTranscriptUploader({ onSuccess }) {
  const [title, setTitle] = useState('');
  const [preacher, setPreacher] = useState('');
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('paste'); // 'paste' or 'upload'
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setTranscript(event.target?.result || '');
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!title.trim() || !transcript.trim()) {
      alert('Please fill in sermon title and transcript');
      return;
    }

    setLoading(true);
    try {
      const result = await base44.functions.invoke('analyzeSermonTranscript', {
        sermon_title: title.trim(),
        preacher_name: preacher.trim(),
        transcript: transcript.trim()
      });

      if (result?.data?.id) {
        setTitle('');
        setPreacher('');
        setTranscript('');
        onSuccess?.(result.data);
      }
    } catch (err) {
      console.error('Error analyzing sermon:', err);
      alert('Failed to analyze sermon. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2" style={{ color: '#1F2937' }}>
          Analyze Sermon Transcript
        </h2>
        <p style={{ color: '#6B7280' }} className="text-sm">
          Upload or paste a sermon transcript to get AI-generated takeaways and action plans
        </p>
      </div>

      {/* Input Fields */}
      <div className="space-y-4 mb-6">
        <input
          type="text"
          placeholder="Sermon Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-purple-500"
          style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFBFC' }}
        />
        <input
          type="text"
          placeholder="Preacher Name (optional)"
          value={preacher}
          onChange={(e) => setPreacher(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border text-sm outline-none transition-colors focus:border-purple-500"
          style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFBFC' }}
        />
      </div>

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setMode('paste')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            mode === 'paste'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Paste Text
        </button>
        <button
          onClick={() => setMode('upload')}
          className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
            mode === 'upload'
              ? 'bg-purple-100 text-purple-700'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Upload File
        </button>
      </div>

      {/* Transcript Input */}
      {mode === 'paste' ? (
        <textarea
          placeholder="Paste your sermon transcript here..."
          value={transcript}
          onChange={(e) => setTranscript(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border text-sm outline-none transition-colors focus:border-purple-500 resize-none"
          style={{ borderColor: '#E5E7EB', backgroundColor: '#FAFBFC', minHeight: '200px' }}
        />
      ) : (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors hover:border-purple-500 hover:bg-purple-50"
          style={{ borderColor: '#D1D5DB', backgroundColor: '#FAFBFC' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 mx-auto mb-2" style={{ color: '#9CA3AF' }} />
          <p className="font-medium text-sm" style={{ color: '#374151' }}>
            Click to upload or drag and drop
          </p>
          <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>
            TXT or PDF files supported
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf"
            onChange={handleFileUpload}
            hidden
          />
        </div>
      )}

      {transcript && (
        <div className="mt-3 p-3 rounded-lg flex items-center gap-2" style={{ backgroundColor: '#F0FDF4' }}>
          <FileText className="w-4 h-4" style={{ color: '#16A34A' }} />
          <span className="text-xs" style={{ color: '#15803D' }}>
            {transcript.length} characters loaded
          </span>
        </div>
      )}

      {/* Analyze Button */}
      <button
        onClick={handleAnalyze}
        disabled={!title.trim() || !transcript.trim() || loading}
        className="w-full mt-6 px-4 py-3 rounded-lg font-medium text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        style={{
          backgroundColor: '#8B5CF6',
          color: 'white'
        }}
      >
        {loading ? (
          <>
            <Loader className="w-4 h-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          'Analyze Sermon'
        )}
      </button>
    </div>
  );
}