import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { AlertCircle, Check, Flag } from 'lucide-react';

export default function EventReportForm({ eventId, reportedUserId, reportedUserName, onReportSubmitted }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    reason: '',
    description: ''
  });

  React.useEffect(() => {
    const fetchUser = async () => {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    };
    fetchUser();
  }, []);

  const handleSubmit = async () => {
    if (!formData.reason) {
      setError('Please select a reason');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await base44.entities.LiveEventReport.create({
        event_id: eventId,
        reported_user_id: reportedUserId,
        reported_user_name: reportedUserName,
        reporter_user_id: user.id,
        reporter_name: user.full_name,
        reason: formData.reason,
        description: formData.description,
        status: 'pending'
      });

      setSuccess(true);
      setFormData({ reason: '', description: '' });
      onReportSubmitted?.();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Report error:', err);
      setError(err.message || 'Failed to submit report');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="space-y-4 p-4 bg-white border border-gray-200 rounded-lg">
      <h3 className="font-semibold flex items-center gap-2">
        <Flag className="w-4 h-4" />
        Report User
      </h3>

      <div>
        <Label className="text-sm font-semibold">Reporting: {reportedUserName}</Label>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {success && (
        <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
          <Check className="w-4 h-4" />
          Report submitted. Thank you for keeping our community safe.
        </div>
      )}

      <div>
        <Label className="text-sm font-semibold">Reason *</Label>
        <Select value={formData.reason} onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}>
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="spam">Spam</SelectItem>
            <SelectItem value="harassment">Harassment</SelectItem>
            <SelectItem value="hate_speech">Hate Speech</SelectItem>
            <SelectItem value="sexual_content">Sexual Content</SelectItem>
            <SelectItem value="violence">Violence</SelectItem>
            <SelectItem value="misinformation">Misinformation</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-sm font-semibold">Details (optional)</Label>
        <Textarea
          placeholder="Describe what happened..."
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          className="mt-1 h-16 text-sm"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={loading || !formData.reason}
        className="w-full bg-red-600 hover:bg-red-700 text-white text-sm"
      >
        {loading ? 'Submitting...' : 'Submit Report'}
      </Button>
    </div>
  );
}