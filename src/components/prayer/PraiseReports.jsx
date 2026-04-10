import React, { useState, useEffect } from 'react';
import { Heart, Share2, Link as LinkIcon, Plus, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { t } from '@/lib/i18n';
import { toast } from 'sonner';

export default function PraiseReports({ currentUser, uiLang }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    testimony: '',
    linkedPrayerId: '',
  });

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    try {
      const res = await base44.entities.PraiseReport?.list?.('-created_date', 20) || [];
      setReports(res);
    } catch {
      setReports([]);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      toast.error(t(uiLang, 'communityPrayerBoard.toastSignInRequired'));
      return;
    }
    if (!formData.title.trim() || !formData.testimony.trim()) {
      toast.error(t(uiLang, 'communityPrayerBoard.toastFillFields'));
      return;
    }

    try {
      const report = await base44.entities.PraiseReport?.create?.({
        authorEmail: currentUser.email,
        authorName: currentUser.full_name || 'Anonymous',
        title: formData.title.trim(),
        testimony: formData.testimony.trim(),
        linkedPrayerId: formData.linkedPrayerId || null,
        likesCount: 0,
        likedByEmails: [],
      });

      if (report) {
        setReports(prev => [report, ...prev]);
        setFormData({ title: '', testimony: '', linkedPrayerId: '' });
        setShowForm(false);
        toast.success(t(uiLang, 'praiseReport.toastPosted'));
      }
    } catch (err) {
      toast.error(t(uiLang, 'communityPrayerBoard.toastFailPost'));
    }
  };

  const handleLike = async (reportId) => {
    if (!currentUser) {
      toast.error(t(uiLang, 'communityPrayerBoard.toastSignInRequired'));
      return;
    }

    try {
      const report = reports.find(r => r.id === reportId);
      const likedByEmails = report.likedByEmails || [];
      const hasLiked = likedByEmails.includes(currentUser.email);

      const updatedEmails = hasLiked
        ? likedByEmails.filter(e => e !== currentUser.email)
        : [...likedByEmails, currentUser.email];

      await base44.entities.PraiseReport?.update?.(reportId, {
        likedByEmails: updatedEmails,
        likesCount: updatedEmails.length,
      });

      setReports(prev =>
        prev.map(r =>
          r.id === reportId
            ? { ...r, likedByEmails: updatedEmails, likesCount: updatedEmails.length }
            : r
        )
      );
    } catch {
      toast.error(t(uiLang, 'communityPrayerBoard.toastFailUpdate'));
    }
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🙌</span>
            {t(uiLang, 'praiseReport.title') || 'Praise Reports'}
          </h2>
          <p className="text-sm text-gray-500 mt-1">{t(uiLang, 'praiseReport.subtitle') || 'Share testimonies of answered prayers'}</p>
        </div>
        {currentUser && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2.5 min-h-[44px] bg-green-600 text-white rounded-lg font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            <Plus size={16} />
            {t(uiLang, 'praiseReport.share') || 'Share'}
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(uiLang, 'praiseReport.titleLabel') || 'Title'}
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder={t(uiLang, 'praiseReport.titlePlaceholder') || 'What did God do?'}
                className="w-full min-h-[44px] border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t(uiLang, 'praiseReport.testimonyLabel') || 'Your Testimony'}
              </label>
              <textarea
                value={formData.testimony}
                onChange={e => setFormData({ ...formData, testimony: e.target.value })}
                placeholder={t(uiLang, 'praiseReport.testimonyPlaceholder') || 'Share your story...'}
                rows={4}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 min-h-[44px] rounded-lg border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                {t(uiLang, 'common.cancel')}
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 min-h-[44px] rounded-lg bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
              >
                {t(uiLang, 'praiseReport.postButton') || 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="text-center py-8 text-gray-400">{t(uiLang, 'common.loading')}</div>
      ) : reports.length === 0 ? (
        <div className="text-center py-8 bg-green-50 rounded-2xl border border-green-100">
          <Heart size={24} className="mx-auto mb-2 text-green-300" />
          <p className="text-gray-500 text-sm">{t(uiLang, 'praiseReport.empty') || 'No praise reports yet. Be the first to share!'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(report => {
            const hasLiked = (report.likedByEmails || []).includes(currentUser?.email);
            return (
              <div key={report.id} className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.title}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {report.authorName || 'Anonymous'} • {new Date(report.created_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-3">{report.testimony}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => handleLike(report.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors min-h-[36px]"
                    style={{
                      backgroundColor: hasLiked ? '#dcfce7' : '#f0fdf4',
                      color: hasLiked ? '#15803d' : '#6b7280',
                    }}
                  >
                    <Heart size={14} fill={hasLiked ? 'currentColor' : 'none'} />
                    {report.likesCount || 0} {t(uiLang, 'praiseReport.likeLabel') || 'Amen'}
                  </button>
                  {report.linkedPrayerId && (
                    <button className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-green-200 text-green-700 text-sm font-medium hover:bg-green-50 transition-colors min-h-[36px]">
                      <LinkIcon size={14} />
                      {t(uiLang, 'praiseReport.originalRequest') || 'View Request'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}