import React, { useState } from 'react';
import { Link2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function CrossReferenceSuggester({ verse, onVerseClick }) {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);

  const findCrossReferences = async () => {
    if (!verse) return;

    setLoading(true);
    try {
      const prompt = `For the Bible verse "${verse.reference}: ${verse.text}", suggest 5-7 relevant cross-references from other parts of Scripture.

For each reference:
1. Provide the verse reference (e.g., Romans 8:28)
2. Explain briefly how it relates thematically or theologically

Format as:
**[Reference]**
Connection: [Brief explanation]`;

      const response = await base44.integrations.Core.InvokeLLM({
        prompt,
        add_context_from_internet: false
      });

      setReferences(response);
    } catch (error) {
      toast.error('Failed to find cross-references');
    } finally {
      setLoading(false);
    }
  };

  const parseReferences = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    const refs = [];
    let currentRef = null;

    lines.forEach(line => {
      const refMatch = line.match(/\*\*(.+?)\*\*/);
      if (refMatch) {
        if (currentRef) refs.push(currentRef);
        currentRef = { reference: refMatch[1], connection: '' };
      } else if (currentRef && line.trim()) {
        currentRef.connection += line.trim() + ' ';
      }
    });
    if (currentRef) refs.push(currentRef);
    return refs;
  };

  const parsedRefs = parseReferences(references);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-semibold">Cross References</h3>
        </div>
        <Button onClick={findCrossReferences} disabled={loading} size="sm">
          <Search className="w-4 h-4 mr-1" />
          {loading ? 'Finding...' : 'Find'}
        </Button>
      </div>

      {parsedRefs.length > 0 && (
        <div className="space-y-2">
          {parsedRefs.map((ref, idx) => (
            <Card key={idx} className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-sm text-indigo-600">{ref.reference}</p>
                  <p className="text-xs text-gray-600 mt-1">{ref.connection}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {!references && !loading && (
        <Card className="p-6 text-center border-dashed">
          <Link2 className="w-10 h-10 mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Discover related verses from across Scripture
          </p>
        </Card>
      )}
    </div>
  );
}