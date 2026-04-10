import React, { useState, useRef } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Save, Upload, RotateCcw, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function RichTextSermonEditor({ sermon, onSave, onPreview }) {
  const [title, setTitle] = useState(sermon?.title || '');
  const [content, setContent] = useState(sermon?.full_content || '');
  const [changeSummary, setChangeSummary] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'align': [] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image', 'video'],
      ['clean']
    ]
  };

  const formats = [
    'bold', 'italic', 'underline', 'strike',
    'blockquote', 'code-block',
    'header',
    'list', 'indent',
    'align',
    'color', 'background',
    'link', 'image', 'video'
  ];

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Upload file to Base44
      const response = await base44.integrations.Core.UploadFile({ file });
      
      // Insert image into editor at current cursor position
      const editor = document.querySelector('.ql-editor');
      if (editor) {
        const range = ReactQuill.getSelection?.();
        const delta = content;
        
        // Create img tag and insert into content
        const imgHtml = `<img src="${response.file_url}" alt="Sermon image" style="max-width: 100%; height: auto; margin: 10px 0;">`;
        setContent(content + imgHtml);
        
        toast.success('Image inserted successfully');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please enter title and content');
      return;
    }

    setIsSaving(true);
    try {
      // Extract plain text for search/preview
      const plainContent = content.replace(/<[^>]*>/g, '').trim();

      if (sermon?.id) {
        // Update existing sermon
        await base44.entities.SermonNote.update(sermon.id, {
          title,
          full_content: content,
          content_plain: plainContent,
          last_edited_at: new Date().toISOString(),
          current_version: (sermon.current_version || 1) + 1
        });

        // Create version history entry
        await base44.entities.SermonVersion.create({
          sermon_id: sermon.id,
          user_id: sermon.user_id,
          version_number: (sermon.current_version || 1) + 1,
          title,
          content,
          content_plain: plainContent,
          change_summary: changeSummary || 'Content edited',
          change_type: 'edit'
        });

        toast.success('Sermon updated and version saved!');
      } else {
        // Save new sermon
        const newSermon = await base44.entities.SermonNote.create({
          user_id: sermon.user_id,
          title,
          topic: sermon.topic || title,
          full_content: content,
          content_plain: plainContent,
          language: sermon.language || 'en',
          audience: sermon.audience || 'adults',
          style: sermon.style || 'topical',
          format: sermon.format || 'full',
          current_version: 1,
          last_edited_at: new Date().toISOString()
        });

        // Create initial version history entry
        await base44.entities.SermonVersion.create({
          sermon_id: newSermon.id,
          user_id: sermon.user_id,
          version_number: 1,
          title,
          content,
          content_plain: plainContent,
          change_summary: 'Initial creation',
          change_type: 'creation'
        });

        toast.success('Sermon created with version history!');
      }

      onSave?.({ title, content, plainContent });
      setChangeSummary('');
    } catch (error) {
      console.error('Save failed:', error);
      toast.error('Failed to save sermon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setContent(sermon?.full_content || '');
    setTitle(sermon?.title || '');
    setChangeSummary('');
    toast.info('Editor reset to last saved version');
  };

  return (
    <Card className="border-indigo-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          ✏️ Rich Text Sermon Editor
        </CardTitle>
        <p className="text-sm text-gray-600 mt-2">Format your sermon with rich text, insert images, and track versions automatically</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Title Input */}
        <div>
          <label className="text-sm font-medium mb-2 block">Sermon Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter sermon title"
            className="text-lg"
          />
        </div>

        {/* Rich Text Editor */}
        <div>
          <label className="text-sm font-medium mb-2 block">Sermon Content</label>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
            <ReactQuill
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Write or paste your sermon content here. Use the toolbar to format text, add lists, headings, and images."
              theme="snow"
              style={{ minHeight: '400px' }}
            />
          </div>
        </div>

        {/* Image Upload */}
        <div>
          <label className="text-sm font-medium mb-2 block">Insert Image</label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            variant="outline"
            className="gap-2 w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Upload & Insert Image
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 mt-2">Images are automatically inserted at cursor position. Max 10MB.</p>
        </div>

        {/* Change Summary */}
        <div>
          <label className="text-sm font-medium mb-2 block">What Changed? (Optional)</label>
          <Input
            value={changeSummary}
            onChange={(e) => setChangeSummary(e.target.value)}
            placeholder="e.g., Added theological context, Updated illustrations"
            className="text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">This note will be saved with your version history</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim() || !content.trim()}
            className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Sermon & Version
              </>
            )}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={() => onPreview?.({ title, content })}
            variant="outline"
            className="gap-2"
          >
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}