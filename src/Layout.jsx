import React, { useEffect } from 'react';
import { AccessibilityProvider } from './lib/accessibilityStore.jsx';
import { AppProvider, useAppStore } from './components/store/appStore';
import { LanguageProvider, useLanguage } from './components/i18n/LanguageProvider';
import { t, getLanguageDirection } from './lib/i18n';
import RTLWrapper from './components/RTLWrapper';
import BackgroundSyncService from './components/offline/BackgroundSyncService';
import SyncStatusIndicator from './components/offline/SyncStatusIndicator';
import Header from './components/Header';
import BottomTabs from './components/BottomTabs';
import { logEvent, Events } from './components/services/analytics/eventLogger';
import { SkipToContent, FocusableMain } from './components/A11yAriaElements';
import SafeAreaWrapper from './components/SafeAreaWrapper';
import CapacitorBackButtonHandler from './components/CapacitorBackButtonHandler';
import A11yAuditOverlay from './components/A11yAuditOverlay';
import FloatingHelpButton from './components/FloatingHelpButton';
import OfflineSyncManager from './components/offline/OfflineSyncManager';
import GlobalAudioEngine from './components/audio/GlobalAudioEngine';
import PersistentAudioBar from './components/audio/PersistentAudioBar';

function LayoutContent({ children, currentPageName }) {
  const { theme } = useAppStore();
  const { language: uiLanguage } = useLanguage();
  const initializeLanguage = () => {};

  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') html.classList.add('dark');
    else html.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    initializeLanguage();
  }, [initializeLanguage]);

  useEffect(() => {
    if (!sessionStorage.getItem('fl_app_opened')) {
      sessionStorage.setItem('fl_app_opened', '1');
      logEvent(Events.APP_OPENED, { lang: uiLanguage });
    }
  }, [uiLanguage]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(err => {
        console.warn('Service worker registration failed:', err);
      });
    }
  }, []);

  return (
    <>
      <SkipToContent />
      <RTLWrapper language={uiLanguage} className="min-h-screen flex flex-col overflow-x-hidden w-full max-w-full">
        <Header currentPageName={currentPageName} />
        <FocusableMain>
          <div style={{ paddingTop: 'calc(56px + env(safe-area-inset-top))', paddingBottom: 'env(safe-area-inset-bottom)' }}>
            <BackgroundSyncService />
            <SyncStatusIndicator />
            <div key={uiLanguage}>
              {children}
            </div>
          </div>
        </FocusableMain>
        <BottomTabs />
        <PersistentAudioBar />
        <GlobalAudioEngine />
        <FloatingHelpButton />
        <OfflineSyncManager />
        <CapacitorBackButtonHandler />
        <A11yAuditOverlay />
      </RTLWrapper>
    </>
  );
}

export default function Layout({ children, currentPageName }) {
  return (
    <SafeAreaWrapper>
      <AccessibilityProvider>
        <AppProvider>
          <LanguageProvider>
            <LayoutContent currentPageName={currentPageName}>
              {children}
            </LayoutContent>
          </LanguageProvider>
        </AppProvider>
      </AccessibilityProvider>
    </SafeAreaWrapper>
  );
}