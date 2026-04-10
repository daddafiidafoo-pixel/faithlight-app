import React, { useEffect, useState } from 'react';
import { X, Sparkles, Check, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function SmartPaywall({ trigger, onClose, onUpgrade }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const getContent = () => {
    switch (trigger) {
      case 'after_use':
        return {
          title: 'Unlock Unlimited Prayers 🙏',
          desc: 'You\'ve used 2 prayers today. Upgrade to FaithLight Premium for unlimited access.',
          features: [
            'Unlimited AI prayers & sermons',
            'Save & download all content',
            'Advanced Bible insights',
            'Ad-free experience',
          ],
          cta: 'Upgrade Now',
          icon: Sparkles,
        };
      case 'after_sermon':
        return {
          title: 'Save Your Sermon ✨',
          desc: 'Love this sermon? Upgrade to FaithLight Premium to save, edit, and download.',
          features: [
            'Save all your sermons',
            'Generate unlimited sermons',
            'Professional formatting',
            'Export as PDF',
          ],
          cta: 'Upgrade Now',
          icon: Sparkles,
        };
      case 'limit_reached':
        return {
          title: 'You\'ve Reached Your Free Limit',
          desc: 'Ready for unlimited access? Join Premium today.',
          features: [
            'Unlimited prayers',
            'Unlimited sermons',
            'All languages',
            'No ads',
          ],
          cta: 'Upgrade to Premium',
          icon: Sparkles,
        };
      case 'go_live':
        return {
          title: 'Go Live with Premium ✨',
          desc: 'Broadcast sermons and church messages to your audience from FaithLight.',
          features: [
            'Stream your sermon live',
            'Reach YouTube, Facebook, and more',
            'Share your church message instantly',
            'Simple setup inside FaithLight',
          ],
          cta: 'Upgrade to Premium',
          icon: Mic,
        };
      default:
        return {
          title: 'Upgrade to FaithLight Premium 💎',
          desc: 'Get unlimited access to all features.',
          features: [
            'Unlimited prayers & sermons',
            'Save & download content',
            'Advanced insights',
            'Priority support',
          ],
          cta: 'Upgrade Now',
          icon: Sparkles,
        };
    }
  };

  const content = getContent();
  const Icon = content.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end justify-center z-40 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in slide-in-from-bottom-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-full mb-3">
            <Icon className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-900 mb-2">{content.title}</h2>
          <p className="text-gray-600">{content.desc}</p>
        </div>

        <div className="space-y-2 mb-6">
          {content.features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
              <span className="text-gray-700 font-medium">{f}</span>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <Button
            onClick={() => {
              onUpgrade?.();
              onClose();
            }}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl"
          >
            {content.cta}
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full text-gray-700 font-medium"
          >
            Maybe later
          </Button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-4">
          {trigger === 'go_live' ? 'Cancel anytime • Secure payment' : 'Try 7 days free — cancel anytime'}
        </p>
      </div>
    </div>
  );
}