import React from 'react';
import { Church, Share2, Mail, MessageCircle, Copy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { useI18n } from '../I18nProvider';

export default function InviteChurchCard() {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [copied, setCopied] = React.useState(false);

  const inviteMessage = t(
    'invite.churchMessage',
    `Hey! Our church is using FaithLight to enhance our Sunday services. It helps our congregation follow along with the sermon, take notes, and pray together. Check it out: https://faithlight.app`
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: t('invite.title', 'Invite Your Church'),
        text: inviteMessage,
      });
    } else {
      handleCopy();
    }
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(t('invite.emailSubject', 'Try FaithLight for Your Church'));
    const body = encodeURIComponent(inviteMessage);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  return (
    <div className="rounded-2xl bg-white border border-amber-200 shadow-sm overflow-hidden mb-6">
      <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <Church className="w-5 h-5 text-amber-700" />
          </div>
          <div>
            <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
              {t('invite.label', 'Help Us Grow')}
            </p>
            <p className="font-bold text-gray-900 text-sm">
              {t('invite.title', 'Invite Your Church')}
            </p>
          </div>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          {t('invite.description', 'Share FaithLight with your pastor or church leadership. One invitation can bring hundreds of new members to the community.')}
        </p>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-amber-700 font-semibold text-xs py-2 px-3 rounded-lg border border-amber-200 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5" />
            {t('common.share', 'Share')}
          </button>
          <button
            onClick={handleEmail}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-amber-700 font-semibold text-xs py-2 px-3 rounded-lg border border-amber-200 transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            {t('invite.email', 'Email')}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-amber-700 font-semibold text-xs py-2 px-3 rounded-lg border border-amber-200 transition-colors"
          >
            <Copy className="w-3.5 h-3.5" />
            {copied ? t('common.copied', 'Copied!') : t('common.copy', 'Copy')}
          </button>
        </div>
      </div>
    </div>
  );
}