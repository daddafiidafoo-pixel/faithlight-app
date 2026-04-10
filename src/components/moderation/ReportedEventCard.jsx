import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Eye, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { format } from 'date-fns';

export default function ReportedEventCard({ event, onAction }) {
  const [isLoading, setIsLoading] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [reports, setReports] = useState([]);

  const handleViewReports = async () => {
    setIsLoading(true);
    try {
      const reportList = await base44.entities.ContentReport.filter({
        content_type: 'live_event',
        content_id: event.id
      });
      setReports(reportList);
      setShowReports(true);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    try {
      await base44.entities.LiveEvent.update(event.id, {
        is_published: false
      });
      onAction('unpublished');
    } catch (error) {
      console.error('Unpublish failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    setIsLoading(true);
    try {
      await base44.entities.LiveEvent.update(event.id, {
        is_published: false,
        status: 'cancelled',
        moderation_reason: 'Removed due to reports'
      });
      onAction('removed');
    } catch (error) {
      console.error('Remove failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (showReports) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-600" />
            Reports for: {event.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 max-h-96 overflow-y-auto">
          {reports.length === 0 ? (
            <p className="text-sm text-gray-600">No reports found.</p>
          ) : (
            reports.map((report) => (
              <div key={report.id} className="bg-white p-3 rounded border border-red-100">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="text-sm font-medium text-red-700 capitalize">{report.reason.replace(/_/g, ' ')}</p>
                    <p className="text-xs text-gray-600">{report.reported_by_name}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">{report.status}</Badge>
                </div>
                {report.details && (
                  <p className="text-xs text-gray-700 mb-2">{report.details}</p>
                )}
                <p className="text-xs text-gray-500">{format(new Date(report.created_date), 'PPp')}</p>
              </div>
            ))
          )}
        </CardContent>
        <Button
          onClick={() => setShowReports(false)}
          variant="outline"
          size="sm"
          className="w-full"
        >
          Back
        </Button>
      </Card>
    );
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{event.title}</CardTitle>
          </div>
          <Badge variant="destructive" className="gap-1">
            <AlertTriangle className="w-3 h-3" />
            {event.report_count} Reports
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="text-gray-500">Type</p>
            <p className="font-medium">{event.event_type}</p>
          </div>
          <div>
            <p className="text-gray-500">Status</p>
            <p className="font-medium capitalize">{event.status}</p>
          </div>
        </div>

        <div className="flex gap-2 pt-3">
          <Button
            onClick={handleViewReports}
            disabled={isLoading}
            variant="outline"
            className="flex-1 gap-2"
            size="sm"
          >
            <Eye className="w-4 h-4" />
            View Reports
          </Button>
          <Button
            onClick={handleUnpublish}
            disabled={isLoading}
            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white gap-2"
            size="sm"
          >
            Unpublish
          </Button>
          <Button
            onClick={handleRemove}
            disabled={isLoading}
            variant="destructive"
            className="gap-2"
            size="sm"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}