import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle2, Ban, AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment',
  hate_speech: 'Hate Speech',
  sexual_content: 'Sexual Content',
  violence: 'Violence',
  misinformation: 'Misinformation',
  other: 'Other',
};

const REASON_COLORS = {
  spam: 'bg-blue-100 text-blue-800',
  harassment: 'bg-red-100 text-red-800',
  hate_speech: 'bg-red-100 text-red-800',
  sexual_content: 'bg-orange-100 text-orange-800',
  violence: 'bg-red-100 text-red-800',
  misinformation: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
};

function ReportCard({ report, onAction }) {
  const [processing, setProcessing] = useState(null);

  const handleAction = async (action, suspendDays = 7) => {
    setProcessing(action);
    try {
      const result = await base44.functions.invoke('processModeration', {
        action,
        report_id: report.id,
        suspend_days: suspendDays,
      });

      if (result.data.success) {
        toast.success(`Report ${action}d`);
        onAction?.();
      }
    } catch (error) {
      toast.error(`Failed to ${action} report`);
      console.error('Action error:', error);
    } finally {
      setProcessing(null);
    }
  };

  return (
    <Card className="p-4 border-l-4 border-l-red-500">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className="w-4 h-4 text-red-500" />
              <span className="font-semibold">{report.content_type}</span>
              <Badge className={REASON_COLORS[report.reason]}>
                {REASON_LABELS[report.reason]}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">
              Reported by {report.reporter_name || report.reporter_user_id}
            </p>
          </div>
          <span className="text-xs text-gray-400">
            {new Date(report.created_date).toLocaleDateString()}
          </span>
        </div>

        {/* Content preview */}
        {report.content_title && (
          <div className="bg-gray-50 p-2 rounded text-sm truncate">
            {report.content_title}
          </div>
        )}

        {/* Details */}
        {report.details && (
          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">
            {report.details}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('approve')}
            disabled={processing}
            className="gap-1"
          >
            {processing === 'approve' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Approve
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleAction('warn')}
            disabled={processing}
            className="gap-1 text-yellow-600 border-yellow-200"
          >
            {processing === 'warn' ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
            Warn User
          </Button>
          <Button
            size="sm"
            onClick={() => handleAction('suspend', 7)}
            disabled={processing}
            className="gap-1 bg-red-600 hover:bg-red-700"
          >
            {processing === 'suspend' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-4 h-4" />}
            Suspend
          </Button>
        </div>
      </div>
    </Card>
  );
}

export default function ModerationQueuePanel() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');

  useEffect(() => {
    loadReports();
  }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const query = filter === 'open' ? { status: 'open' } : { status: 'closed' };
      const data = await base44.entities.CommunityReport.filter(query, '-created_date', 20);
      setReports(data);
    } catch (error) {
      toast.error('Failed to load reports');
      console.error('Load error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p>No {filter} reports</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter tabs */}
      <div className="flex gap-2 border-b">
        <button
          onClick={() => setFilter('open')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'open'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Open ({reports.filter(r => r.status === 'open').length})
        </button>
        <button
          onClick={() => setFilter('closed')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
            filter === 'closed'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          Closed ({reports.filter(r => r.status === 'closed').length})
        </button>
      </div>

      {/* Reports list */}
      <div className="space-y-3">
        {reports.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            onAction={loadReports}
          />
        ))}
      </div>
    </div>
  );
}