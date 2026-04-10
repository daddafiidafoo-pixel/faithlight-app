import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Flag, CheckCircle, Trash2, AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const REASON_LABELS = {
  inaccurate_theology: 'Inaccurate Theology',
  offensive_harmful: 'Offensive / Harmful',
  inappropriate_advice: 'Inappropriate Advice',
  other: 'Other',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  reviewed: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
};

export default function AIReportsAdmin() {
  const [user, setUser] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const qc = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => null);
  }, []);

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ['aiReports'],
    queryFn: () => base44.entities.AIReport.list('-created_date', 100),
    enabled: user?.role === 'admin',
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.AIReport.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aiReports'] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.AIReport.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['aiReports'] }); toast.success('Report deleted.'); },
  });

  if (!user) return <div className="flex items-center justify-center min-h-screen"><RefreshCw className="w-5 h-5 animate-spin text-gray-400" /></div>;

  if (user.role !== 'admin') return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-center px-4">
      <Shield className="w-12 h-12 text-gray-300" />
      <h2 className="text-xl font-bold text-gray-700">Admin Access Required</h2>
      <p className="text-gray-400 text-sm">You must be an admin to view this page.</p>
    </div>
  );

  const pending = reports.filter(r => r.status === 'pending');
  const reviewed = reports.filter(r => r.status !== 'pending');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Flag className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI Response Reports</h1>
            <p className="text-sm text-gray-500">Review and moderate reported AI responses</p>
          </div>
          <div className="ml-auto flex gap-3">
            <div className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
              {pending.length} Pending
            </div>
            <div className="bg-gray-100 text-gray-600 text-sm font-medium px-3 py-1 rounded-full">
              {reports.length} Total
            </div>
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <RefreshCw className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {!isLoading && reports.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
            <p className="text-gray-500">No reports yet. All clear!</p>
          </div>
        )}

        <div className="space-y-3">
          {reports.map(report => (
            <div key={report.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Report header */}
              <div className="flex items-center gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === report.id ? null : report.id)}>
                <AlertTriangle className={`w-4 h-4 flex-shrink-0 ${report.status === 'pending' ? 'text-yellow-500' : 'text-green-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800 truncate">
                      {REASON_LABELS[report.reason] || report.reason}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[report.status]}`}>
                      {report.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {report.created_date ? format(new Date(report.created_date), 'MMM d, yyyy · h:mm a') : ''}
                    {report.user_id && ` · User: ${report.user_id.slice(0, 8)}…`}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {report.status === 'pending' && (
                    <Button size="sm" variant="outline"
                      onClick={e => { e.stopPropagation(); updateMutation.mutate({ id: report.id, data: { status: 'reviewed' } }); toast.success('Marked as reviewed.'); }}
                      className="text-xs h-7 gap-1 text-blue-600 border-blue-200 hover:bg-blue-50">
                      <CheckCircle className="w-3 h-3" /> Review
                    </Button>
                  )}
                  {report.status === 'reviewed' && (
                    <Button size="sm" variant="outline"
                      onClick={e => { e.stopPropagation(); updateMutation.mutate({ id: report.id, data: { status: 'resolved' } }); toast.success('Marked as resolved.'); }}
                      className="text-xs h-7 gap-1 text-green-600 border-green-200 hover:bg-green-50">
                      <CheckCircle className="w-3 h-3" /> Resolve
                    </Button>
                  )}
                  <Button size="sm" variant="ghost"
                    onClick={e => { e.stopPropagation(); deleteMutation.mutate(report.id); }}
                    className="text-xs h-7 text-red-400 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>

              {/* Expanded content */}
              {expanded === report.id && (
                <div className="border-t border-gray-100 px-5 py-4 space-y-3 bg-gray-50">
                  {report.prompt && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">User Prompt</p>
                      <p className="text-sm text-gray-700 bg-white rounded-lg border border-gray-200 p-3 leading-relaxed">
                        {report.prompt}
                      </p>
                    </div>
                  )}
                  {report.ai_response && (
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">AI Response (Reported)</p>
                      <p className="text-sm text-gray-700 bg-white rounded-lg border border-red-100 p-3 leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap">
                        {report.ai_response}
                      </p>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Badge variant="outline" className="text-xs">{REASON_LABELS[report.reason]}</Badge>
                    {report.session_id && <Badge variant="outline" className="text-xs font-mono">Session: {report.session_id.slice(0, 8)}…</Badge>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}