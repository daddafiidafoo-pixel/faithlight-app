import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useI18n } from '../components/I18nProvider';
import QRCodeModal from '../components/share/QRCodeModal';
import DailyVerseReminderSettings from '../components/settings/DailyVerseReminderSettings';
import DailyVerseNotificationSettings from '../components/notifications/DailyVerseNotificationSettings';
import BibleLanguageSelector from '../components/settings/BibleLanguageSelector';
import {
  User, Bell, Shield, LogOut, Trash2, Globe, ChevronRight,
  Loader2, AlertCircle, Settings, QrCode, HardDrive, WifiOff,
  FileText, Heart, HelpCircle, MessageCircle, Flag, Database,
  Sun, Info, BookOpen, Volume2, Sparkles, ExternalLink, Mail,
  CreditCard, Lock
} from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English',      flag: '🇬🇧' },
  { code: 'om', name: 'Afaan Oromoo', flag: '🇪🇹' },
  { code: 'am', name: 'አማርኛ',         flag: '🇪🇹' },
  { code: 'ar', name: 'العربية',       flag: '🇸🇦' },
  { code: 'sw', name: 'Kiswahili',    flag: '🇰🇪' },
  { code: 'fr', name: 'Français',     flag: '🇫🇷' },
];

// ── Reusable row components ─────────────────────────────────────────
function SettingsRow({ icon: Icon, label, value, href, to, onPress, danger, iconColor = 'text-indigo-500' }) {
  const inner = (
    <div className={`flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors cursor-pointer ${danger ? 'hover:bg-red-50' : ''}`} onClick={onPress}>
      <div className={`w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 ${danger ? 'bg-red-100' : ''}`}>
        <Icon className={`w-4 h-4 ${danger ? 'text-red-500' : iconColor}`} />
      </div>
      <span className={`flex-1 text-sm font-medium ${danger ? 'text-red-600' : 'text-gray-800'}`}>{label}</span>
      {value && <span className="text-sm text-gray-400 mr-1">{value}</span>}
      <ChevronRight className={`w-4 h-4 ${danger ? 'text-red-300' : 'text-gray-300'}`} />
    </div>
  );
  if (to) return <Link to={to}>{inner}</Link>;
  if (href) return <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a>;
  return inner;
}

function SettingsGroup({ title, children }) {
  return (
    <div>
      {title && <p className="text-xs font-bold uppercase tracking-wider text-gray-400 px-1 mb-2">{title}</p>}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
        {children}
      </div>
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-indigo-600' : 'bg-gray-200'}`}
    >
      <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${checked ? 'left-6' : 'left-1'}`} />
    </button>
  );
}

function ToggleRow({ icon: Icon, label, checked, onChange, iconColor = 'text-indigo-500' }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Icon className={`w-4 h-4 ${iconColor}`} />
      </div>
      <span className="flex-1 text-sm font-medium text-gray-800">{label}</span>
      <Toggle checked={checked} onChange={onChange} />
    </div>
  );
}

// ── Language picker modal ───────────────────────────────────────────
function LanguageModal({ open, onClose, lang, setLang }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="bg-white w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-5 shadow-xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-base font-bold text-gray-900 mb-4">Select Language</h3>
        <div className="space-y-1">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); onClose(); }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-colors text-left ${lang === l.code ? 'bg-indigo-50 border-2 border-indigo-500' : 'hover:bg-gray-50 border-2 border-transparent'}`}
            >
              <span className="text-2xl">{l.flag}</span>
              <span className="text-sm font-medium text-gray-800">{l.name}</span>
              {lang === l.code && <span className="ml-auto text-indigo-600 text-xs font-bold">✓</span>}
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-4 py-3 text-sm text-gray-500 hover:text-gray-700">Cancel</button>
      </div>
    </div>
  );
}

export default function UserSettings() {
  const { t, lang, setLang } = useI18n();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qrOpen, setQrOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [showDeleteFlow, setShowDeleteFlow] = useState(false);
  const [deleteStep, setDeleteStep] = useState(0);
  const [deleteInput, setDeleteInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [notif, setNotif] = useState({ notif_replies: true, notif_mentions: true, notif_streak: true });
  const [notifId, setNotifId] = useState(null);
  const [showBibleLang, setShowBibleLang] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);
  const [dailyVerseEnabled, setDailyVerseEnabled] = useState(false);
  const [dailyVerseTime, setDailyVerseTime] = useState('08:00');
  const [savingVersePref, setSavingVersePref] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        setDailyVerseEnabled(!!u.daily_verse_enabled);
        setDailyVerseTime(u.daily_verse_time || '08:00');
        const prefs = await base44.entities.NotificationPreference.filter({ user_id: u.id }, '-created_date', 1).catch(() => []);
        if (prefs.length > 0) {
          const p = prefs[0];
          setNotif({ notif_replies: p.notif_replies ?? true, notif_mentions: p.notif_mentions ?? true, notif_streak: p.notif_streak ?? true });
          setNotifId(p.id);
        }
      } catch { /* not authenticated */ }
      finally { setLoading(false); }
    })();
  }, []);

  const currentLangName = LANGUAGES.find(l => l.code === lang)?.name || 'English';
  const currentLangFlag = LANGUAGES.find(l => l.code === lang)?.flag || '🇬🇧';

  const saveDailyVersePref = async (enabled, time) => {
    setSavingVersePref(true);
    try {
      await base44.auth.updateMe({ daily_verse_enabled: enabled, daily_verse_time: time });
    } catch (e) { console.error(e); }
    finally { setSavingVersePref(false); }
  };

  const handleDeleteAccount = async () => {
    if (deleteStep === 0) { setDeleteStep(1); return; }
    if (deleteStep === 1) {
      if (deleteInput.toUpperCase() !== 'DELETE') { setDeleteError('Type DELETE to confirm.'); return; }
      setDeleteLoading(true);
      try {
        await base44.functions.invoke('deleteUserAccount', {}).catch(() => {});
        setTimeout(() => base44.auth.logout(), 1500);
      } catch { setTimeout(() => base44.auth.logout(), 1500); }
      finally { setDeleteLoading(false); }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">

        {/* ── Header ── */}
        <div className="pb-2">
          <h1 className="text-2xl font-bold text-gray-900">{t('settings.title', 'Settings')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('settings.subtitle', 'Manage your app, language, privacy, and support')}</p>
        </div>

        {/* ── 1. Profile Card ── */}
        <SettingsGroup>
          {user ? (
            <>
              <div className="px-4 py-4 flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow">
                  <span className="text-white text-xl font-bold">{(user.full_name || user.email || 'U')[0].toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-base font-bold text-gray-900 truncate">{user.full_name || 'FaithLight User'}</p>
                  <p className="text-sm text-gray-500 truncate">{user.email}</p>
                </div>
              </div>
              <div className="px-4 pb-4 flex gap-2">
                <Link to={createPageUrl('UserProfile')} className="flex-1">
                  <Button variant="outline" className="w-full text-sm rounded-xl">
                    <User className="w-4 h-4 mr-1.5" /> Edit Profile
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={() => base44.auth.logout()}
                  className="flex-1 text-sm rounded-xl text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-1.5" /> Sign Out
                </Button>
              </div>
            </>
          ) : (
            <div className="px-4 py-5 space-y-3">
              <p className="text-sm text-gray-600">Sign in to access your settings and sync your data.</p>
              <div className="flex gap-2">
                <Button onClick={() => base44.auth.redirectToLogin()} className="flex-1 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm">
                  Sign In
                </Button>
                <Button onClick={() => base44.auth.redirectToLogin()} variant="outline" className="flex-1 rounded-xl text-sm">
                  Create Account
                </Button>
              </div>
            </div>
          )}
        </SettingsGroup>

        {/* ── 2. Preferences ── */}
        <SettingsGroup title={t('settings.preferences', 'Preferences')}>
          <SettingsRow
            icon={Globe}
            label={t('settings.language', 'Language')}
            value={`${currentLangFlag} ${currentLangName}`}
            onPress={() => setLangOpen(true)}
          />
          <SettingsRow icon={Sun} label={t('settings.appearance', 'Appearance')} value="Light" to={createPageUrl('UserSettings')} />
          <SettingsRow
            icon={Bell}
            label={t('settings.notifications', 'Notifications')}
            onPress={() => setShowNotifSettings(v => !v)}
          />
          <div className="px-4 py-3">
            <DailyVerseNotificationSettings />
          </div>
        </SettingsGroup>

        {/* Notification toggles (expandable) */}
        {showNotifSettings && user && (
          <SettingsGroup>
            <ToggleRow icon={MessageCircle} label="Replies to my posts" checked={notif.notif_replies} onChange={() => setNotif(p => ({ ...p, notif_replies: !p.notif_replies }))} />
            <ToggleRow icon={Bell} label="Mentions" checked={notif.notif_mentions} onChange={() => setNotif(p => ({ ...p, notif_mentions: !p.notif_mentions }))} />
            <ToggleRow icon={Sparkles} label="Streak milestones" checked={notif.notif_streak} onChange={() => setNotif(p => ({ ...p, notif_streak: !p.notif_streak }))} />
          </SettingsGroup>
        )}

        {/* ── 3. Bible & Study ── */}
        <SettingsGroup title={t('settings.bibleAndStudy', 'Bible & Study')}>
          <SettingsRow icon={BookOpen} label="Default Bible Language" value={currentLangFlag} onPress={() => setShowBibleLang(v => !v)} />
          <SettingsRow icon={BookOpen} label="Verse of the Day Language" value={currentLangFlag} onPress={() => setLangOpen(true)} />
          <SettingsRow icon={Sparkles} label="AI Response Language" value={currentLangFlag} onPress={() => setLangOpen(true)} />
          <SettingsRow icon={HelpCircle} label="Quiz Language" value={currentLangFlag} onPress={() => setLangOpen(true)} />
          <SettingsRow icon={Volume2} label="Audio Bible Language" value={currentLangFlag} onPress={() => setLangOpen(true)} />
          <SettingsRow icon={HardDrive} label="Offline Library" to={createPageUrl('OfflineLibrary')} />
        </SettingsGroup>

        {/* Bible Language Selector (expandable) */}
        {showBibleLang && user && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <BibleLanguageSelector user={user} onSaved={() => setShowBibleLang(false)} />
          </div>
        )}

        {/* ── 4. Legal ── */}
        <SettingsGroup title={t('settings.legal', 'Legal')}>
          <SettingsRow icon={Shield} label={t('settings.privacyPolicy', 'Privacy Policy')} to={createPageUrl('PrivacyPolicy')} />
          <SettingsRow icon={FileText} label={t('settings.termsOfUse', 'Terms of Use')} to={createPageUrl('TermsOfService')} />
          <SettingsRow icon={Heart} label={t('settings.christianDisclaimer', 'Christian Content Disclaimer')} to={createPageUrl('StatementOfFaith')} />
          <SettingsRow icon={FileText} label={t('settings.copyrightNotice', 'Copyright & Bible Translation Notice')} to={createPageUrl('CopyrightNotice')} />
          <SettingsRow icon={Shield} label={t('settings.communityPolicy', 'Community Policy')} to={createPageUrl('CommunityGuidelines')} />
        </SettingsGroup>

        {/* ── Support CTA ── */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-5 flex items-center gap-4 shadow-sm cursor-pointer" onClick={() => window.location.href = createPageUrl('SupportFaithLight')}>
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
            <Heart className="w-5 h-5 text-white fill-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-white">Support FaithLight ❤️</p>
            <p className="text-xs text-rose-100">Help keep the Bible free worldwide</p>
          </div>
          <ChevronRight className="w-5 h-5 text-white/60" />
        </div>

        {/* ── 5. Support ── */}
        <SettingsGroup title={t('settings.support', 'Support')}>
          <SettingsRow icon={HelpCircle} label={t('settings.helpCenter', 'Help Center')} to={createPageUrl('HelpCenter')} />
          <SettingsRow icon={Mail} label={t('settings.contactSupport', 'Contact Support')} href="mailto:support@faithlight.app" />
          <SettingsRow icon={Flag} label={t('settings.reportProblem', 'Report a Problem')} href="mailto:support@faithlight.app?subject=Problem Report" />
          <SettingsRow icon={Database} label="Request Data Deletion" to={createPageUrl('DataDeletionRequest')} danger />
          <SettingsRow icon={MessageCircle} label={t('settings.sendFeedback', 'Send Feedback')} href="mailto:hello@faithlight.app?subject=Feedback" />
        </SettingsGroup>

        {/* ── 6. About ── */}
        <SettingsGroup title={t('settings.about', 'About')}>
          <div className="flex items-center gap-3 px-4 py-3.5">
            <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
              <Info className="w-4 h-4 text-indigo-500" />
            </div>
            <span className="flex-1 text-sm font-medium text-gray-800">{t('settings.appVersion', 'App Version')}</span>
            <span className="text-sm text-gray-400">1.0.0</span>
          </div>
          <SettingsRow icon={Sparkles} label="About FaithLight" to={createPageUrl('About')} />
          <SettingsRow icon={Heart} label="Mission & Vision" to={createPageUrl('VisionValues')} />
          <SettingsRow icon={ExternalLink} label="Website" href="https://faithlight.app" />
          <SettingsRow icon={QrCode} label="Share FaithLight" onPress={() => setQrOpen(true)} />
        </SettingsGroup>

        {/* ── Danger Zone (only if signed in) ── */}
        {user && (
          <SettingsGroup>
            {!showDeleteFlow ? (
              <SettingsRow icon={Trash2} label="Delete My Account" onPress={() => setShowDeleteFlow(true)} danger />
            ) : (
              <div className="p-4 space-y-3">
                {deleteStep === 0 && (
                  <>
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-red-800">Delete account permanently?</p>
                        <p className="text-xs text-red-600 mt-1">This removes all your data — notes, highlights, and downloads. Cannot be undone.</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setShowDeleteFlow(false)} className="flex-1">Cancel</Button>
                      <Button size="sm" onClick={handleDeleteAccount} className="flex-1 bg-red-600 hover:bg-red-700">Continue</Button>
                    </div>
                  </>
                )}
                {deleteStep === 1 && (
                  <>
                    <p className="text-sm font-semibold text-red-800">Type DELETE to confirm</p>
                    <input
                      type="text"
                      value={deleteInput}
                      onChange={e => { setDeleteInput(e.target.value); setDeleteError(null); }}
                      placeholder="DELETE"
                      autoFocus
                      className="w-full px-3 py-2 border-2 border-red-300 rounded-xl text-sm font-mono focus:outline-none focus:border-red-500"
                    />
                    {deleteError && <p className="text-xs text-red-700">{deleteError}</p>}
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => { setShowDeleteFlow(false); setDeleteStep(0); setDeleteInput(''); }} className="flex-1">Cancel</Button>
                      <Button
                        size="sm"
                        onClick={handleDeleteAccount}
                        disabled={deleteInput.toUpperCase() !== 'DELETE' || deleteLoading}
                        className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50"
                      >
                        {deleteLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete Now'}
                      </Button>
                    </div>
                  </>
                )}
              </div>
            )}
          </SettingsGroup>
        )}

        <p className="text-center text-xs text-gray-400 pb-8">FaithLight v1.0.0 · support@faithlight.app</p>
      </div>

      <LanguageModal open={langOpen} onClose={() => setLangOpen(false)} lang={lang} setLang={setLang} />
      <QRCodeModal open={qrOpen} onClose={() => setQrOpen(false)} title="Download FaithLight" url="https://faithlight.app/download" />
    </div>
  );
}