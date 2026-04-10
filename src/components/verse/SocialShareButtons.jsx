import React from 'react';
import { Share2, MessageCircle, Mail, Copy, Loader } from 'lucide-react';

const socialPlatforms = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: '📘',
    color: '#1877F2',
    action: (text, url, image) => {
      const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || window.location.href)}&quote=${encodeURIComponent(text)}`;
      window.open(fbUrl, '_blank', 'width=600,height=400');
    },
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: '𝕏',
    color: '#000000',
    action: (text, url) => {
      const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url || window.location.href)}`;
      window.open(twitterUrl, '_blank', 'width=600,height=400');
    },
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: '💼',
    color: '#0A66C2',
    action: (text, url) => {
      const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || window.location.href)}`;
      window.open(linkedinUrl, '_blank', 'width=600,height=400');
    },
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: '💬',
    color: '#25D366',
    action: (text, url) => {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + (url || window.location.href))}`;
      window.open(whatsappUrl, '_blank');
    },
  },
  {
    id: 'email',
    name: 'Email',
    icon: '✉️',
    color: '#EA4335',
    action: (text, url) => {
      const subject = encodeURIComponent('Check out this Bible verse');
      const body = encodeURIComponent(`${text}\n\n${url || window.location.href}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
    },
  },
  {
    id: 'copy',
    name: 'Copy Link',
    icon: '📋',
    color: '#666666',
    action: (text, url) => {
      const textToCopy = `${text} ${url || window.location.href}`;
      navigator.clipboard.writeText(textToCopy);
    },
  },
];

export default function SocialShareButtons({ verse, reference, imageUrl, isLoading = false }) {
  const shareText = `"${verse}" — ${reference}`;
  const shareUrl = imageUrl || window.location.href;

  const handleShare = (platform) => {
    platform.action(shareText, shareUrl, imageUrl);
  };

  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Share to Social Media</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {socialPlatforms.map((platform) => (
          <button
            key={platform.id}
            onClick={() => handleShare(platform)}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 p-3 rounded-lg border border-gray-300 hover:bg-gray-50 transition disabled:opacity-50"
            style={{
              borderColor: platform.color,
              color: platform.color,
            }}
            title={`Share to ${platform.name}`}
          >
            {isLoading ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="text-lg">{platform.icon}</span>
                <span className="text-sm font-medium hidden sm:inline">{platform.name}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}