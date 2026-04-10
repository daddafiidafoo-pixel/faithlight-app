import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useI18n } from '../I18nProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Star, FileText, Copy, Tag, Search } from 'lucide-react';
import { toast } from 'sonner';

export default function SavedAIOutputsLibrary() {
  const { t, lang } = useI18n();
  const [outputs, setOutputs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterTags, setFilterTags] = useState([]);
  const [editingTags, setEditingTags] = useState(null);
  const [newTag, setNewTag] = useState('');
  const [allTags, setAllTags] = useState(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);

        const userOutputs = await base44.entities.SavedAIOutput.filter({
          user_id: currentUser.id,
        }, '-updated_date');

        setOutputs(userOutputs);

        // Collect all unique tags
        const tags = new Set();
        userOutputs.forEach(o => {
          o.tags?.forEach(tag => tags.add(tag));
        });
        setAllTags(tags);
      } catch (error) {
        console.error('Error fetching outputs:', error);
        toast.error(lang === 'om' ? 'Dogoggora' : 'Error loading library');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lang]);

  const filteredOutputs = outputs.filter(output => {
    const matchesSearch = output.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         output.content.substring(0, 100).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || output.output_type === filterType;
    const matchesTags = filterTags.length === 0 || 
                       filterTags.some(tag => output.tags?.includes(tag));
    return matchesSearch && matchesType && matchesTags;
  });

  const handleDelete = async (id) => {
    if (!confirm(lang === 'om' ? 'Balleessi?' : 'Delete this output?')) return;

    try {
      await base44.entities.SavedAIOutput.delete(id);
      setOutputs(prev => prev.filter(o => o.id !== id));
      toast.success(lang === 'om' ? 'Balleessifamee' : 'Deleted');
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Delete failed');
    }
  };

  const handleToggleFavorite = async (id, current) => {
    try {
      await base44.entities.SavedAIOutput.update(id, { is_favorite: !current });
      setOutputs(prev =>
        prev.map(o => (o.id === id ? { ...o, is_favorite: !current } : o))
      );
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Update failed');
    }
  };

  const handleAddTag = async (id) => {
    if (!newTag.trim()) return;

    try {
      const output = outputs.find(o => o.id === id);
      const updatedTags = [...(output.tags || []), newTag];
      await base44.entities.SavedAIOutput.update(id, { tags: updatedTags });

      setOutputs(prev =>
        prev.map(o => (o.id === id ? { ...o, tags: updatedTags } : o))
      );
      
      setAllTags(prev => new Set([...prev, newTag]));
      setNewTag('');
      setEditingTags(null);
      toast.success(lang === 'om' ? 'Dabalame' : 'Tag added');
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Failed to add tag');
    }
  };

  const handleExport = async (output, format) => {
    try {
      let content = output.content;
      let filename = `${output.title.replace(/\s+/g, '_')}.${format}`;

      if (format === 'pdf') {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        doc.text(output.title, 10, 10);
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(content, 190);
        doc.text(lines, 10, 20);
        doc.save(filename);
      } else {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      }

      toast.success(lang === 'om' ? `${format} qajaa\'e` : `Exported as ${format}`);
    } catch (error) {
      toast.error(lang === 'om' ? 'Dogoggora' : 'Export failed');
    }
  };

  const typeLabels = {
    sermon: lang === 'om' ? 'Waaqeffannaa' : 'Sermon',
    study_plan: lang === 'om' ? 'Karoora Barumsa' : 'Study Plan',
    commentary: lang === 'om' ? 'Baasii' : 'Commentary',
    devotional: lang === 'om' ? 'Jaalala Guddina' : 'Devotional',
    lesson: lang === 'om' ? 'Barumsa' : 'Lesson',
  };

  if (loading) {
    return <div className="text-center py-12">{lang === 'om' ? 'Lakkaawamu...' : 'Loading...'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-[var(--faith-light-primary-dark)]">
          {lang === 'om' ? 'Kitaaba AI Akka Seeya' : 'Saved AI Outputs'}
        </h2>
        <p className="text-gray-600 mt-2">
          {lang === 'om'
            ? 'Filannoowwan AI akka seeyaa tugde, kayuu fi deebisuu danda\'a'
            : 'Save, organize, and reuse your AI-generated content'}
        </p>
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder={lang === 'om' ? 'Barbaadi...' : 'Search outputs...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['all', 'sermon', 'study_plan', 'commentary'].map(type => (
              <Badge
                key={type}
                variant={filterType === type ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => setFilterType(type)}
              >
                {typeLabels[type] || (lang === 'om' ? 'Hundi' : 'All')}
              </Badge>
            ))}
          </div>

          {allTags.size > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {lang === 'om' ? 'Kayuuwwan' : 'Tags'}
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.from(allTags).map(tag => (
                  <Badge
                    key={tag}
                    variant={filterTags.includes(tag) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                      setFilterTags(prev =>
                        prev.includes(tag)
                          ? prev.filter(t => t !== tag)
                          : [...prev, tag]
                      )
                    }
                  >
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Outputs List */}
      {filteredOutputs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {lang === 'om'
                ? 'Filannoowwan akka seeyaa itti fayyadamuuf AI meeshaalee fayyadhaa'
                : 'No saved outputs yet. Use AI tools to generate and save content.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredOutputs.map(output => (
            <Card key={output.id}>
              <CardHeader>
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{output.title}</CardTitle>
                      <Badge>{typeLabels[output.output_type]}</Badge>
                      {output.is_favorite && <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(output.updated_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFavorite(output.id, output.is_favorite)}
                    >
                      <Star className={`w-4 h-4 ${output.is_favorite ? 'fill-current text-yellow-400' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(output.content);
                        toast.success(lang === 'om' ? 'Koopii ta\'e' : 'Copied');
                      }}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-gray-700">{output.content.substring(0, 200)}...</p>

                {/* Tags */}
                {output.tags && output.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {output.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Add Tag */}
                {editingTags === output.id ? (
                  <div className="flex gap-2">
                    <Input
                      placeholder={lang === 'om' ? 'Kayuu...' : 'Add tag...'}
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') handleAddTag(output.id);
                      }}
                      className="text-sm"
                    />
                    <Button
                      size="sm"
                      onClick={() => handleAddTag(output.id)}
                      variant="default"
                    >
                      {lang === 'om' ? 'Dabal' : 'Add'}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setEditingTags(null);
                        setNewTag('');
                      }}
                    >
                      {lang === 'om' ? 'Dhaabi' : 'Cancel'}
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingTags(output.id)}
                    className="w-full"
                  >
                    <Tag className="w-4 h-4 mr-2" />
                    {lang === 'om' ? 'Kayuu Dabal' : 'Add Tag'}
                  </Button>
                )}

                {/* Export & Delete */}
                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleExport(output, 'txt')}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    {lang === 'om' ? 'Gad' : 'Export'}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(output.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}