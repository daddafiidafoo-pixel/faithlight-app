import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Sparkles, Copy, Heart, Trash2, Loader2 } from 'lucide-react';

export default function AISermonGeneratorPage() {
  const [user, setUser] = useState(null);
  const [outlines, setOutlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedOutline, setSelectedOutline] = useState(null);
  const [formData, setFormData] = useState({
    passage_reference: '',
    passage_text: '',
    type: 'sermon'
  });

  useEffect(() => {
    base44.auth.me()
      .then(u => {
        setUser(u);
        return base44.entities.SermonOutline.filter({ user_email: u.email }, '-created_date', 20);
      })
      .then(setOutlines)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleGenerate = async () => {
    if (!user || !formData.passage_reference || !formData.passage_text) return;
    setGenerating(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate a detailed ${formData.type} based on this Bible passage:

Passage: ${formData.passage_reference}
Text: ${formData.passage_text}

Please provide:
1. A compelling title
2. Main points (3-5 key insights)
3. Life applications (2-3 practical applications)
4. A full outline with commentary

Return ONLY valid JSON with keys: title, main_points (array), applications (array), outline (string)`,
        response_json_schema: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            main_points: { type: 'array', items: { type: 'string' } },
            applications: { type: 'array', items: { type: 'string' } },
            outline: { type: 'string' }
          }
        }
      });

      const outline = {
        user_email: user.email,
        passage_reference: formData.passage_reference,
        passage_text: formData.passage_text,
        type: formData.type,
        title: response.title || 'Untitled',
        main_points: response.main_points || [],
        applications: response.applications || [],
        outline: response.outline || '',
        language: 'en',
        is_favorite: false
      };

      const created = await base44.entities.SermonOutline.create(outline);
      setOutlines(prev => [created, ...prev]);
      setSelectedOutline(created);
      setFormData({ passage_reference: '', passage_text: '', type: 'sermon' });
      alert('Sermon generated successfully!');
    } catch (err) {
      console.error('Error generating:', err);
      alert('Error generating sermon. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await base44.entities.SermonOutline.delete(id);
      setOutlines(prev => prev.filter(o => o.id !== id));
      if (selectedOutline?.id === id) setSelectedOutline(null);
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-slate-900 mb-8">AI Sermon & Devotional Generator</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Generate New</h2>
            
            <input
              type="text"
              placeholder="Passage reference (e.g., John 3:16)"
              value={formData.passage_reference}
              onChange={(e) => setFormData({ ...formData, passage_reference: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            />

            <textarea
              placeholder="Paste the full passage text..."
              value={formData.passage_text}
              onChange={(e) => setFormData({ ...formData, passage_text: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg mb-4 h-32"
            />

            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg mb-4"
            >
              <option value="sermon">Sermon Outline</option>
              <option value="devotional">Devotional</option>
            </select>

            <button
              onClick={handleGenerate}
              disabled={generating || !formData.passage_reference || !formData.passage_text}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
            >
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {generating ? 'Generating...' : 'Generate'}
            </button>
          </div>

          {/* Preview & List */}
          <div className="lg:col-span-2">
            {selectedOutline ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{selectedOutline.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{selectedOutline.passage_reference}</p>
                  </div>
                  <button
                    onClick={() => handleDelete(selectedOutline.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {selectedOutline.main_points?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2">Main Points:</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        {selectedOutline.main_points.map((p, i) => (
                          <li key={i} className="list-disc list-inside">{p}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedOutline.applications?.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2">Life Applications:</h4>
                      <ul className="space-y-1 text-sm text-slate-600">
                        {selectedOutline.applications.map((a, i) => (
                          <li key={i} className="list-disc list-inside">{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedOutline.outline && (
                    <div>
                      <h4 className="font-semibold text-slate-700 mb-2">Full Outline:</h4>
                      <p className="text-sm text-slate-600 whitespace-pre-wrap">{selectedOutline.outline}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(selectedOutline))}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border text-slate-700 hover:bg-slate-50"
                >
                  <Copy className="w-5 h-5" /> Copy
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center text-slate-500">
                <p>Select a sermon or generate a new one to view details</p>
              </div>
            )}
          </div>
        </div>

        {/* History */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Recent Outlines</h2>
          {outlines.length === 0 ? (
            <p className="text-slate-500">No outlines yet. Generate one to get started!</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outlines.map(o => (
                <button
                  key={o.id}
                  onClick={() => setSelectedOutline(o)}
                  className={`text-left p-4 rounded-lg border transition ${
                    selectedOutline?.id === o.id
                      ? 'border-purple-600 bg-purple-50'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <p className="font-semibold text-slate-900">{o.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{o.passage_reference}</p>
                  <p className="text-xs text-slate-400 mt-1">{o.type}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}