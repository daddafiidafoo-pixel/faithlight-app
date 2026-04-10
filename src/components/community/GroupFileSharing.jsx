import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, File, Download, Trash2, FileText } from 'lucide-react';

export default function GroupFileSharing({ groupId, user, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('study_material');

  const { data: files = [] } = useQuery({
    queryKey: ['group-files', groupId],
    queryFn: async () => {
      return await base44.entities.GroupFile.filter(
        { group_id: groupId, is_public: true },
        '-created_date',
        100
      );
    },
  });

  const uploadFileMutation = useMutation({
    mutationFn: async (formData) => {
      const { file_url } = await base44.integrations.Core.UploadFile({ file: formData.file });
      return base44.entities.GroupFile.create({
        group_id: groupId,
        file_name: formData.file.name,
        file_url,
        file_type: formData.file.type,
        file_size_bytes: formData.file.size,
        uploaded_by_id: user.id,
        uploaded_by_name: user.full_name,
        description: formData.description,
        category: formData.category,
        is_public: true,
      });
    },
    onSuccess: async (newFile) => {
      toast.success('File uploaded successfully!');
      
      // Notify group members
      const members = await base44.entities.GroupMember.filter({ group_id: groupId });
      const notifications = members
        .filter(m => m.user_id !== user.id)
        .map(m => ({
          user_id: m.user_id,
          group_id: groupId,
          notification_type: 'file_shared',
          title: `New file: ${newFile.file_name}`,
          message: `${user.full_name} shared a file in the group`,
          related_entity_id: newFile.id,
          related_entity_type: 'file',
          triggered_by_user_id: user.id,
          triggered_by_name: user.full_name,
        }));
      
      if (notifications.length > 0) {
        await base44.entities.GroupNotification.bulkCreate(notifications);
      }
      
      queryClient.invalidateQueries(['group-files', groupId]);
      setFile(null);
      setDescription('');
      setCategory('study_material');
      onClose();
    },
    onError: () => toast.error('Failed to upload file'),
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileId) => {
      return base44.entities.GroupFile.delete(fileId);
    },
    onSuccess: () => {
      toast.success('File deleted');
      queryClient.invalidateQueries(['group-files', groupId]);
    },
  });

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) {
      toast.error('Please select a file');
      return;
    }
    uploadFileMutation.mutate({ file, description, category });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Share Files</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Upload Form */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-4">Upload New File</h3>
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-indigo-500 transition-colors">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="flex flex-col items-center cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm font-medium text-gray-900">
                    {file ? file.name : 'Click to select a file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PDF, DOC, DOCX, JPG, PNG (max 10MB)</p>
                </label>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What is this file about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="h-16"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="study_material">Study Material</SelectItem>
                    <SelectItem value="resource">Resource</SelectItem>
                    <SelectItem value="assignment">Assignment</SelectItem>
                    <SelectItem value="discussion">Discussion</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" disabled={uploadFileMutation.isPending} className="w-full bg-indigo-600">
                {uploadFileMutation.isPending ? 'Uploading...' : 'Upload File'}
              </Button>
            </form>
          </div>

          {/* Files List */}
          <div>
            <h3 className="font-semibold mb-4">Shared Files ({files.length})</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {files.length === 0 ? (
                <p className="text-gray-500 text-sm">No files shared yet</p>
              ) : (
                files.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{f.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {f.uploaded_by_name} • {formatFileSize(f.file_size_bytes)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <a href={f.file_url} target="_blank" rel="noopener noreferrer">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Download className="w-4 h-4" />
                        </Button>
                      </a>
                      {(user.id === f.uploaded_by_id) && (
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteFileMutation.mutate(f.id)}
                          className="h-8 w-8 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}