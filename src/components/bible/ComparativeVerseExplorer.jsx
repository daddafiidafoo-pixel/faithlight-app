import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, BookOpen, Link as LinkIcon, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ComparativeVerseExplorer({ user }) {
  const [theme, setTheme] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);

  const handleSearch = async () => {
    if (!theme.trim()) return;

    setIsLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a Biblical scholar. Find and compare 5-8 key Bible verses that address the theme: "${theme}"

For each verse:
1. Provide the full verse text with reference
2. Explain how it addresses the theme
3. Note the historical/cultural context
4. Identify any unique perspective it offers

Then provide:
- **Thematic Summary**: How these verses collectively address the theme
- **Key Insights**: Main theological principles that emerge
- **Practical Applications**: How believers can apply these teachings
- **Related Themes**: Connected topics to explore further

Format with clear markdown headers and sections.`,
        add_context_from_internet: true
      });

      // Generate cross-reference connections
      const connections = await base44.integrations.Core.InvokeLLM({
        prompt: `Based on the theme "${theme}", identify 3-4 broader Biblical themes or doctrines that connect to this topic. For each:
- Name of the related theme
- Brief explanation of the connection
- 1-2 key verses that bridge both themes

Return as JSON:`,
        response_json_schema: {
          type: 'object',
          properties: {
            connections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  theme: { type: 'string' },
                  connection: { type: 'string' },
                  verses: { 
                    type: 'array',
                    items: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }).catch(() => ({ connections: [] }));

      setResults({
        analysis: response,
        connections: connections.connections || []
      });

      // Track user interest
      await base44.entities.UserInterest.create({
        user_id: user.id,
        interest_type: 'theme',
        interest_value: theme,
        weight: 1
      }).catch(() => {});

    } catch (error) {
      console.error('Search failed:', error);
      alert('Failed to generate comparison. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const quickThemes = [
    'Faith and Works',
    'Grace and Law',
    'Prayer and Fasting',
    'Love and Justice',
    'Suffering and Hope',
    'Wisdom and Understanding',
    'Forgiveness and Reconciliation',
    'Creation and Providence'
  ];

  return (
    <div className="space-y-6">
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-indigo-600" />
            Explore Biblical Themes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter a theme or topic (e.g., 'Faith', 'Love', 'Salvation')"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="flex-1"
            />
            <Button 
              onClick={handleSearch} 
              disabled={!theme.trim() || isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Explore
                </>
              )}
            </Button>
          </div>

          {/* Quick Theme Buttons */}
          <div>
            <p className="text-sm text-gray-600 mb-2">Quick themes:</p>
            <div className="flex flex-wrap gap-2">
              {quickThemes.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="cursor-pointer hover:bg-indigo-50 hover:border-indigo-300"
                  onClick={() => {
                    setTheme(t);
                    setTimeout(handleSearch, 100);
                  }}
                >
                  {t}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {results && (
        <div className="space-y-6">
          {/* Main Analysis */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-purple-600" />
                Comparative Analysis: {theme}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <ReactMarkdown>{results.analysis}</ReactMarkdown>
              </div>
            </CardContent>
          </Card>

          {/* Thematic Connections */}
          {results.connections.length > 0 && (
            <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-900">
                  <LinkIcon className="w-5 h-5" />
                  Related Themes & Connections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {results.connections.map((conn, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-purple-200">
                      <h4 className="font-semibold text-purple-900 mb-2">{conn.theme}</h4>
                      <p className="text-sm text-gray-700 mb-2">{conn.connection}</p>
                      <div className="flex flex-wrap gap-2">
                        {conn.verses.map((verse, i) => (
                          <Badge key={i} className="bg-purple-100 text-purple-800 border-purple-300">
                            📖 {verse}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Initial State */}
      {!results && !isLoading && (
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Discover Biblical Connections
            </h3>
            <p className="text-sm text-gray-600 max-w-md mx-auto">
              Enter a theme or topic above to explore how different Bible verses address it 
              from various perspectives, contexts, and applications.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}