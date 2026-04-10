import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Dialog as ConfirmDialog, DialogContent as ConfirmContent, DialogHeader as ConfirmHeader, DialogTitle as ConfirmTitle } from '@/components/ui/dialog';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function CertificateTemplateManager() {
  const queryClient = useQueryClient();
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    title: '',
    description: '',
    track_id: '',
    primary_color: '#2563eb',
    accent_color: '#6366f1',
    signature_image_url: '',
    custom_text: '',
    include_instructor_name: true,
    include_signature_line: true,
    include_qr_code: true,
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['certificate-templates'],
    queryFn: () => base44.entities.CertificateTemplate.list(),
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['training-tracks'],
    queryFn: () => base44.entities.TrainingTrack.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.CertificateTemplate.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
      setDialogOpen(false);
      resetForm();
      toast.success('Template created');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.CertificateTemplate.update(editingTemplate.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
      setDialogOpen(false);
      resetForm();
      toast.success('Template updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.CertificateTemplate.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['certificate-templates'] });
      toast.success('Template deleted');
    },
  });

  const resetForm = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      title: '',
      description: '',
      track_id: '',
      primary_color: '#2563eb',
      accent_color: '#6366f1',
      signature_image_url: '',
      custom_text: '',
      include_instructor_name: true,
      include_signature_line: true,
      include_qr_code: true,
    });
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData(template);
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.title || !formData.track_id) {
      toast.error('Fill in required fields');
      return;
    }

    if (editingTemplate) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate({
        ...formData,
        created_by_user_id: (async () => {
          const user = await base44.auth.me();
          return user.id;
        })(),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Certificate Templates</h2>
        <Button onClick={() => {
          resetForm();
          setDialogOpen(true);
        }} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{template.title}</p>
                  <div className="flex gap-2 mt-3">
                    <div
                      className="w-8 h-8 rounded border-2"
                      style={{ backgroundColor: template.primary_color, borderColor: template.accent_color }}
                    />
                    <div
                      className="w-8 h-8 rounded border-2"
                      style={{ backgroundColor: template.accent_color }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate(template.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Template' : 'Create Certificate Template'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold mb-1 block">Template Name *</label>
              <Input
                placeholder="e.g., Biblical Leadership L1"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Certificate Title *</label>
              <Input
                placeholder="e.g., Certificate of Completion"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Training Track *</label>
              <select
                className="w-full border rounded px-3 py-2"
                value={formData.track_id}
                onChange={(e) => setFormData({ ...formData, track_id: e.target.value })}
              >
                <option value="">Select track</option>
                {tracks.map((track) => (
                  <option key={track.id} value={track.id}>{track.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Description</label>
              <Textarea
                placeholder="Certificate description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold mb-1 block">Primary Color</label>
                <input
                  type="color"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
              <div>
                <label className="text-sm font-semibold mb-1 block">Accent Color</label>
                <input
                  type="color"
                  value={formData.accent_color}
                  onChange={(e) => setFormData({ ...formData, accent_color: e.target.value })}
                  className="w-full h-10 rounded cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Signature Image URL</label>
              <Input
                placeholder="https://example.com/signature.png"
                value={formData.signature_image_url}
                onChange={(e) => setFormData({ ...formData, signature_image_url: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold mb-1 block">Custom Footer Text</label>
              <Textarea
                placeholder="e.g., Approved by FaithLight Training Board"
                value={formData.custom_text}
                onChange={(e) => setFormData({ ...formData, custom_text: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.include_signature_line}
                  onChange={(e) => setFormData({ ...formData, include_signature_line: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Include signature line</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.include_qr_code}
                  onChange={(e) => setFormData({ ...formData, include_qr_code: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-sm">Include QR code</span>
              </label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} className="flex-1">
                {editingTemplate ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}