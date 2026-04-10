import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FolderOpen, Upload, FileText, Download, Trash2, Plus, Image, Film, Link as LinkIcon, File, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

const FILE_TYPES = ['document', 'image', 'video', 'link', 'other'];
const FILE_ICONS = { document: FileText, image: Image, video: Film, link: LinkIcon, other: File };

const CATEGORIES = ['Study Materials', 'Sermons', 'Prayer Guides', 'Devotionals', 'Articles', 'Other'];

export default function GroupResourceLibrary({ groupId, user, isAdmin }) {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Study Materials', file_type: 'document', url: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  const { data: files = [], isLoading } = useQuery({
    queryKey: ['group-resources', groupId],
    queryFn: () => base44.entities.GroupFile.filter({ group_id: groupId }, '-created_date', 50).catch(() => []),
    enabled: !!groupId,
  });

  const addResource = useMutation({
    mutationFn: async () => {
      let fileUrl = form.url;
      if (selectedFile) {
        setUploading(true);
        const res = await base44.integrations.Core.UploadFile({ file: selectedFile });
        fileUrl = res.file_url;
        setUploading(false);
      }
      return base44.entities.GroupFile.create({
        group_id: groupId,
        uploader_id: user.id,
        uploader_name: user.full_name,
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        file_type: form.file_type,
        file_url: fileUrl,
        file_name: selectedFile?.name || form.title,
        file_size: selectedFile?.size || 0,
      });
    },
    onSuccess: () => {
      toast.success('Resource added!');
      setShowForm(false);
      setForm({ title: '', description: '', category: 'Study Materials', file_type: 'document', url: '' });
      setSelectedFile(null);
      queryClient.invalidateQueries(['group-resources', groupId]);
    },
    onError: () => { setUploading(false); toast.error('Failed to add resource'); },
  });

  const deleteResource = useMutation({
    mutationFn: (id) => base44.entities.GroupFile.delete(id),
    onSuccess: () => { toast.success('Resource removed'); queryClient.invalidateQueries(['group-resources', groupId]); },
  });

  const filtered = filter === 'all' ? files : files.filter(f => f.category === filter || f.file_type === filter);
  const categories = [...new Set(files.map(f => f.category).filter(Boolean))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FolderOpen className="w-5 h-5 text-green-600" />
          <h3 className="font-bold text-gray-900">Resource Library</h3>
          <Badge variant="outline" className="text-xs">{files.length} files</Badge>
        </div>
        <Button size="sm" className="gap-1.5 bg-green-600 hover:bg-green-700" onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4" /> Add Resource
        </Button>
      </div>

      {/* Add Form */}
      {showForm && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4 space-y-3">
            <h4 className="font-semibold text-gray-900">Add Resource</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input className="border rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
              <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-400" value={form.file_type} onChange={e => setForm(p => ({ ...p, file_type: e.target.value }))}>
                {FILE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
              <textarea className="border rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="Description (optional)" rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
              {form.file_type === 'link' ? (
                <input className="border rounded-lg px-3 py-2 text-sm col-span-2 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="URL (https://...)" value={form.url} onChange={e => setForm(p => ({ ...p, url: e.target.value }))} />
              ) : (
                <div className="col-span-2 border-2 border-dashed border-green-300 rounded-lg p-4 text-center">
                  <Upload className="w-6 h-6 text-green-400 mx-auto mb-2" />
                  <label className="cursor-pointer">
                    <span className="text-sm text-green-700 font-medium hover:underline">Choose file</span>
                    <input type="file" className="hidden" onChange={e => { setSelectedFile(e.target.files[0]); if (e.target.files[0] && !form.title) setForm(p => ({ ...p, title: e.target.files[0].name })); }} />
                  </label>
                  {selectedFile && <p className="text-xs text-gray-600 mt-1">{selectedFile.name}</p>}
                </div>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button size="sm" className="gap-1 bg-green-600 hover:bg-green-700" onClick={() => addResource.mutate()}
                disabled={!form.title || addResource.isPending || uploading}>
                {(addResource.isPending || uploading) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                {uploading ? 'Uploading...' : 'Add'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant={filter === 'all' ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setFilter('all')}>All</Button>
          {categories.map(cat => (
            <Button key={cat} size="sm" variant={filter === cat ? 'default' : 'outline'} className="h-7 text-xs" onClick={() => setFilter(cat)}>{cat}</Button>
          ))}
        </div>
      )}

      {/* Files Grid */}
      {isLoading ? (
        <div className="text-center py-8 text-gray-500">Loading resources...</div>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-gray-300">
          <CardContent className="py-12 text-center">
            <FolderOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No resources yet. Add study materials, documents, or links!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map(file => {
            const Icon = FILE_ICONS[file.file_type] || File;
            const iconColors = { document: 'text-blue-600 bg-blue-100', image: 'text-green-600 bg-green-100', video: 'text-purple-600 bg-purple-100', link: 'text-orange-600 bg-orange-100', other: 'text-gray-600 bg-gray-100' };
            return (
              <Card key={file.id} className="border-gray-200 hover:shadow-sm transition-shadow">
                <CardContent className="py-3 px-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconColors[file.file_type] || iconColors.other}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm truncate">{file.title}</h4>
                      {file.description && <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{file.description}</p>}
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {file.category && <Badge variant="outline" className="text-[10px] h-4 px-1.5">{file.category}</Badge>}
                        <span className="text-[10px] text-gray-400">By {file.uploader_name} · {file.created_date ? formatDistanceToNow(new Date(file.created_date), { addSuffix: true }) : ''}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 flex-shrink-0">
                      {file.file_url && (
                        <a href={file.file_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-indigo-600 hover:bg-indigo-50">
                            <Download className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      )}
                      {(isAdmin || file.uploader_id === user?.id) && (
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-gray-400 hover:text-red-500"
                          onClick={() => { if (confirm('Delete this resource?')) deleteResource.mutate(file.id); }}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}