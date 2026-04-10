import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Check } from 'lucide-react';
import { useI18n } from '../I18nProvider';

const TRANSLATIONS = {
  restoreTitle: 'Restore Purchase',
  restoreDesc: 'If you have an existing subscription, tap restore',
  checkingButton: 'Checking...',
  restoreButton: 'Restore Purchases',
  manageTitle: 'Manage Subscription',
  manageDesc: 'Manage your subscription in Google Play Store',
  googlePlayButton: 'Go to Google Play',
};
const t = (key, fallback) => fallback || key;

export default function MobileIAPHandler({ user, entitlementStatus }) {
  const { lang } = useI18n();
  const [platform, setPlatform] = useState(null);
  const [verifyingReceipt, setVerifyingReceipt] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Detect if running in iOS or Android WebView
    const detectPlatform = () => {
      const ua = navigator.userAgent;
      if (/iPad|iPhone|iPod/.test(ua)) {
        setPlatform('ios');
      } else if (/Android/.test(ua)) {
        setPlatform('android');
      } else {
        setPlatform('web');
      }
    };
    detectPlatform();
  }, []);

  // iOS Restore Purchases
  const handleRestorePurchases = async () => {
    setVerifyingReceipt(true);
    setError(null);

    try {
      // In production, get receipt from iOS app via native bridge
      // For now, show instructions
      if (!window.webkit?.messageHandlers?.getAppStoreReceipt) {
        setError(
          lang === 'om'
            ? 'App biraa irra haa jiru'
            : 'This feature only works in the FaithLight iOS app'
        );
        setVerifyingReceipt(false);
        return;
      }

      // Request receipt from app
      window.webkit.messageHandlers.getAppStoreReceipt.postMessage({});

      // Listen for receipt response
      window.handleAppStoreReceipt = async (receiptData) => {
        try {
          const response = await base44.functions.invoke('verifyAppleReceipt', {
            receipt_data: receiptData,
            user_id: user.id,
          });

          if (response.data.valid) {
            // Show success and refresh entitlement
            window.location.reload();
          } else {
            setError(
              lang === 'om'
                ? 'Galmee momaati'
                : 'Receipt is not valid'
            );
          }
        } catch (err) {
          setError(err.message);
        } finally {
          setVerifyingReceipt(false);
        }
      };

      // Timeout if no response
      setTimeout(() => {
        if (verifyingReceipt) {
          setError(lang === 'om' ? 'Yeroo isaa caalaa' : 'Request timeout');
          setVerifyingReceipt(false);
        }
      }, 5000);
    } catch (err) {
      setError(err.message);
      setVerifyingReceipt(false);
    }
  };

  // Android: Direct to Google Play
  const handleManageSubscription = () => {
    const packageName = 'com.faithlight.app'; // Replace with actual package name
    const url = `https://play.google.com/store/account/subscriptions?sku=faithlight_premium&package=${packageName}`;
    window.open(url, '_blank');
  };

  // Show nothing if not premium and not mobile
  if (!entitlementStatus?.isPremium && platform === 'web') {
    return null;
  }

  // Show nothing if premium
  if (entitlementStatus?.isPremium) {
    return null;
  }

  // iOS: Show Restore Purchases button
  if (platform === 'ios') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">
                {t(TRANSLATIONS.restoreTitle, 'Restore Purchase')}
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                {t(TRANSLATIONS.restoreDesc, 'If you have an existing subscription, tap restore')}
              </p>
            </div>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-300 rounded p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <Button
            onClick={handleRestorePurchases}
            disabled={verifyingReceipt}
            className="w-full"
          >
            {verifyingReceipt
              ? t(TRANSLATIONS.checkingButton, 'Checking...')
              : t(TRANSLATIONS.restoreButton, 'Restore Purchases')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Android: Show Manage Subscription link
  if (platform === 'android') {
    return (
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6 space-y-4">
          <div className="flex items-start gap-3">
            <Check className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-gray-900">
                {t(TRANSLATIONS.manageTitle, 'Manage Subscription')}
              </h3>
              <p className="text-sm text-gray-700 mt-1">
                {t(TRANSLATIONS.manageDesc, 'Manage your subscription in Google Play Store')}
              </p>
            </div>
          </div>

          <Button
            onClick={handleManageSubscription}
            className="w-full"
          >
            {t(TRANSLATIONS.googlePlayButton, 'Go to Google Play')}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return null;
}