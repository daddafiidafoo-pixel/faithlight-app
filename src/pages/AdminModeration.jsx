import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, Users, Loader2, Shield, CheckCircle2, Ban, AlertTriangle, Trash2, X, Eye, RotateCcw, Clock } from 'lucide-react';
import { toast } from 'sonner';
import AIModerationAssistPanel from '../components/moderation/AIModerationAssistPanel';
import { can } from '../components/permissions';

const REASON_LABELS = {
  spam: 'Spam',
  harassment: 'Harassment',
  hate_speech: 'Hate Speech',
  sexual_content: 'Sexual Content',
  violence: 'Violence',
  self_harm: 'Self-Harm',
  misinformation: 'Misinformation',
  other: 'Other',
};

const REASON_COLORS = {
  spam: 'bg-blue-100 text-blue-800',
  harassment: 'bg-red-100 text-red-800',
  hate_speech: 'bg-red-100 text-red-800',
  sexual_content: 'bg-orange-100 text-orange-800',
  violence: 'bg-red-100 text-red-800',
  self_harm: 'bg-pink-100 text-pink-800',
  misinformation: 'bg-yellow-100 text-yellow-800',
  other: 'bg-gray-100 text-gray-800',
};

function ReportDetailPanel({ report, onClose, onAction }) {
  const [content, setContent] = useState(null);
  const [modStatus, setModStatus] = useState(null);
  const [busyAction, setBusyAction] = useState(null);

  useEffect(() => {
    if (!report) return;
    // Load content being reported
    const loadContent = async () => {
      try {
        if (report.target_type === 'post') {
          const posts = await base44.entities.CommunityPost.list('-created_date', 500).catch(() => []);
          setContent(posts.find(p => p.id === report.target_id) || null);
        } else {
          const comments = await base44.entities.PostComment.list('-created_date', 500).catch(() => []);
          setContent(comments.find(c => c.id === report.target_id) || null);
        }
        // Load moderation status of the reported user
        const allStatuses = await base44.entities.UserModerationStatus.list('-updated_date', 200).catch(() => []);
        setModStatus(allStatuses.find(s => s.user_id === report.target_owner_user_id) || null);
      } catch (e) {
        console.error(e);
      }
    };
    loadContent();
  }, [report]);

  const takeAction = async (action, extra = {}) => {
    setBusyAction(action);
    try {
      const result = await base44.functions.invoke('processModeration', {
        action,
        report_id: report.id,
        target_type: report.target_type,
        target_id: report.target_id,
        target_owner_user_id: report.target_owner_user_id,
        ...extra,
      });
      if (result.data?.success) {
        toast.success(result.data.message || 'Action completed');
        onAction?.();
        onClose?.();
      } else {
        toast.error(result.data?.error || 'Action failed');
      }
    } catch (e) {
      toast.error('Action failed: ' + e.message);
    } finally {
      setBusyAction(null);
    }
  };

  const handleSuspend = () => {
    const hoursStr = window.prompt('Suspend duration (hours):', '72');
    if (!hoursStr) return;
    const hours = Math.max(1, parseInt(hoursStr) || 72);
    takeAction('suspend', { suspend_hours: hours });
  };

  const handleWarn = () => {
    const note = window.prompt('Warning message (shown to user):', 'Please follow our community guidelines.');
    if (note === null) return;
    takeAction('warn', { warn_message: note });
  };

  if (!report) return null;

  const isSuspended = modStatus?.status === 'suspended' &&
    modStatus?.suspended_until && new Date(modStatus.suspended_until) > new Date();

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-900">Review Report</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Report meta */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><span className="text-gray-500">Report ID:</span> <span className="font-mono text-xs">{report.id}</span></div>
            <div><span className="text-gray-500">Type:</span> <span className="font-medium capitalize">{report.target_type}</span></div>
            <div><span className="text-gray-500">Reason:</span> <Badge className={REASON_COLORS[report.reason]}>{REASON_LABELS[report.reason]}</Badge></div>
            <div><span className="text-gray-500">Reported:</span> <span>{new Date(report.created_date).toLocaleString()}</span></div>
            {report.details && <div className="col-span-2"><span className="text-gray-500">Details:</span> <span className="italic">{report.details}</span></div>}
          </div>

          {/* Reported user status */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Reported User Status</p>
            <div className="flex items-center gap-3">
              <p className="font-medium text-sm font-mono">{report.target_owner_user_id}</p>
              {modStatus ? (
                <Badge className={
                  modStatus.status === 'suspended' ? 'bg-red-100 text-red-800' :
                  modStatus.status === 'warned' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }>
                  {modStatus.status} {modStatus.warnings ? `(${modStatus.warnings} warnings)` : ''}
                </Badge>
              ) : (
                <Badge className="bg-green-100 text-green-800">No prior issues</Badge>
              )}
              {isSuspended && (
                <span className="text-xs text-red-600">Until {new Date(modStatus.suspended_until).toLocaleDateString()}</span>
              )}
            </div>
          </div>

          {/* Reported content */}
          <div className="border rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Reported Content</p>
            {content ? (
              <div className="space-y-1">
                {content.title && <p className="font-semibold text-gray-800">{content.title}</p>}
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                  {content.body || content.comment_text || '(no text content)'}
                </p>
                {content.image_url && (
                  <img src={content.image_url} alt="" className="mt-2 rounded-lg max-h-40 object-cover" />
                )}
                <p className="text-xs text-gray-400 mt-2">
                  By: {content.user_name || content.user_id} • {new Date(content.created_date).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-400 italic">Content could not be loaded (may have been removed already)</p>
            )}
          </div>

          {/* AI Assist */}
          <AIModerationAssistPanel
            report={report}
            content={content}
            modStatus={modStatus}
            modHistory={[]}
          />

          {/* Actions */}
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="outline"
              onClick={() => takeAction('dismiss')}
              disabled={!!busyAction}
              className="gap-2"
            >
              {busyAction === 'dismiss' ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-4 h-4 text-green-600" />}
              Dismiss
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => takeAction('remove_content')}
              disabled={!!busyAction}
              className="gap-2 text-orange-700 border-orange-200 hover:bg-orange-50"
            >
              {busyAction === 'remove_content' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Remove Content
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleWarn}
              disabled={!!busyAction}
              className="gap-2 text-yellow-700 border-yellow-200 hover:bg-yellow-50"
            >
              {busyAction === 'warn' ? <Loader2 className="w-3 h-3 animate-spin" /> : <AlertTriangle className="w-4 h-4" />}
              Warn User
            </Button>
            <Button
              size="sm"
              onClick={handleSuspend}
              disabled={!!busyAction}
              className="gap-2 bg-red-600 hover:bg-red-700"
            >
              {busyAction === 'suspend' ? <Loader2 className="w-3 h-3 animate-spin" /> : <Ban className="w-4 h-4" />}
              Suspend User
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsQueue() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('open');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => { loadReports(); }, [filter]);

  const loadReports = async () => {
    setLoading(true);
    try {
      const all = await base44.entities.CommunityReport.list('-created_date', 200);
      setReports(all.filter(r => r.status === filter));
    } catch (e) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 border-b pb-1">
        {['open', 'reviewing', 'actioned', 'dismissed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              filter === f ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>No {filter} reports</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => (
            <Card key={report.id} className="p-4 border-l-4 border-l-red-400 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge className={REASON_COLORS[report.reason]}>{REASON_LABELS[report.reason]}</Badge>
                    <span className="text-xs text-gray-500 capitalize">{report.target_type}</span>
                    <span className="text-xs text-gray-400">{new Date(report.created_date).toLocaleString()}</span>
                  </div>
                  {report.details && (
                    <p className="text-sm text-gray-600 truncate">{report.details}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">Reporter: {report.reporter_user_id}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedReport(report)}
                  className="gap-1 flex-shrink-0"
                >
                  <Eye className="w-3 h-3" /> Review
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {selectedReport && (
        <ReportDetailPanel
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onAction={loadReports}
        />
      )}
    </div>
  );
}

function UserStatusPanel() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.UserModerationStatus.list('-updated_date', 200)
      .then(all => setUsers(all.filter(u => u.status === 'warned' || u.status === 'suspended')))
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const handleUnsuspend = async (status) => {
    await base44.entities.UserModerationStatus.update(status.id, {
      status: 'active', suspended_until: null, last_reason: 'Suspension lifted by admin'
    });
    setUsers(prev => prev.filter(u => u.id !== status.id));
    toast.success('User unsuspended');
  };

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (users.length === 0) return <p className="text-center py-12 text-gray-400">No warned or suspended users 🎉</p>;

  return (
    <div className="space-y-2">
      {users.map(s => {
        const isSuspended = s.status === 'suspended' && s.suspended_until && new Date(s.suspended_until) > new Date();
        return (
          <div key={s.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <div>
              <p className="font-medium text-sm font-mono">{s.user_id}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {isSuspended
                  ? `Suspended until ${new Date(s.suspended_until).toLocaleString()}`
                  : `Warned (${s.warnings || 1}x)`}
              </p>
              {s.notes && <p className="text-xs text-gray-400 italic mt-0.5">{s.notes}</p>}
            </div>
            <div className="flex items-center gap-2">
              <Badge className={isSuspended ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                {isSuspended ? 'Suspended' : 'Warned'}
              </Badge>
              {isSuspended && (
                <Button size="sm" variant="outline" className="gap-1 text-xs" onClick={() => handleUnsuspend(s)}>
                  <RotateCcw className="w-3 h-3" /> Lift
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActionLogPanel() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    base44.entities.ContentModerationAction.list('-created_date', 30)
      .then(setActions).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (actions.length === 0) return <p className="text-center py-12 text-gray-400">No actions yet</p>;

  const ACTION_COLORS = {
    remove_post: 'bg-orange-100 text-orange-800',
    remove_comment: 'bg-orange-100 text-orange-800',
    warn_user: 'bg-yellow-100 text-yellow-800',
    suspend_user: 'bg-red-100 text-red-800',
    restore_content: 'bg-green-100 text-green-800',
  };

  return (
    <div className="space-y-2 max-h-[500px] overflow-y-auto">
      {actions.map(action => (
        <div key={action.id} className="p-3 bg-gray-50 rounded-xl text-sm flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Badge className={ACTION_COLORS[action.action] || 'bg-gray-100 text-gray-700'}>
                {action.action}
              </Badge>
              <span className="text-xs text-gray-400">{new Date(action.created_date).toLocaleString()}</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{action.note}</p>
            <p className="text-xs text-gray-400 font-mono mt-0.5">User: {action.target_user_id}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AdminModeration() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ openReports: 0, suspendedUsers: 0, warnedUsers: 0, pendingPosts: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!can(currentUser, 'MOD_QUEUE')) { window.location.href = '/'; return; }
        setUser(currentUser);
        const [allReports, allModStatus, allPosts] = await Promise.all([
          base44.entities.CommunityReport.list('-created_date', 200).catch(() => []),
          base44.entities.UserModerationStatus.list('-updated_date', 200).catch(() => []),
          base44.entities.CommunityPost.list('-created_date', 200).catch(() => []),
        ]);
        const openReports = allReports.filter(r => r.status === 'open');
        const suspendedUsers = allModStatus.filter(s => s.status === 'suspended');
        const warnedUsers = allModStatus.filter(s => s.status === 'warned');
        const pendingPosts = allPosts.filter(p => p.status === 'pending');
        setStats({ openReports: openReports.length, suspendedUsers: suspendedUsers.length, warnedUsers: warnedUsers.length, pendingPosts: pendingPosts.length });
      } catch (e) {
        toast.error('Failed to load');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="w-8 h-8 animate-spin text-gray-400" /></div>;
  if (!user) return null;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 bg-indigo-100 rounded-xl">
          <Shield className="w-6 h-6 text-indigo-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Moderation Dashboard</h1>
          <p className="text-gray-500 text-sm">Review reports and manage community safety</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <Card className="p-5 border-l-4 border-l-amber-400">
          <p className="text-sm text-gray-500">Pending Posts</p>
          <p className="text-3xl font-bold text-amber-600 mt-1">{stats.pendingPosts}</p>
        </Card>
        <Card className="p-5 border-l-4 border-l-red-400">
          <p className="text-sm text-gray-500">Open Reports</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{stats.openReports}</p>
        </Card>
        <Card className="p-5 border-l-4 border-l-yellow-400">
          <p className="text-sm text-gray-500">Warned Users</p>
          <p className="text-3xl font-bold text-yellow-600 mt-1">{stats.warnedUsers}</p>
        </Card>
        <Card className="p-5 border-l-4 border-l-red-600">
          <p className="text-sm text-gray-500">Suspended Users</p>
          <p className="text-3xl font-bold text-red-800 mt-1">{stats.suspendedUsers}</p>
        </Card>
      </div>

      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            Pending Posts
            {stats.pendingPosts > 0 && <span className="bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{stats.pendingPosts}</span>}
          </TabsTrigger>
          <TabsTrigger value="reports" className="gap-1.5">
            Reports
            {stats.openReports > 0 && <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5">{stats.openReports}</span>}
          </TabsTrigger>
          <TabsTrigger value="users">User Status</TabsTrigger>
          <TabsTrigger value="actions">Action Log</TabsTrigger>
        </TabsList>
        <TabsContent value="pending"><Card className="p-6"><div className="text-center py-12 text-gray-400"><AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" /><p>Pending posts feature coming soon</p></div></Card></TabsContent>
        <TabsContent value="reports"><Card className="p-6"><ReportsQueue /></Card></TabsContent>
        <TabsContent value="users"><Card className="p-6"><UserStatusPanel /></Card></TabsContent>
        <TabsContent value="actions"><Card className="p-6"><ActionLogPanel /></Card></TabsContent>
      </Tabs>
    </div>
  );
}