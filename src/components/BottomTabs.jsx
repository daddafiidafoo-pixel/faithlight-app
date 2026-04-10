import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Home, BookOpen, Sparkles, Bookmark, User, Download, Library } from 'lucide-react';
import { useI18n } from './I18nProvider';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { TAB_ROOTS } from '@/lib/navigationStore';
import { base44 } from '@/api/base44Client';
import UserAvatar from './user/UserAvatar';

const TABS = [
  { labelKey: 'navigation.home',      fallback: 'Home',        root: '/',                tabName: 'Home',      Icon: Home     },
  { labelKey: 'navigation.bible',     fallback: 'Bible',       root: '/BibleReaderPage', tabName: 'Bible',     Icon: BookOpen },
  { labelKey: 'navigation.study',     fallback: 'AI Study',    root: '/AIHub',           tabName: 'Study',     Icon: Sparkles },
  { labelKey: 'navigation.plans',     fallback: 'Plans',       root: '/ReadingPlans',    tabName: 'Plans',     Icon: Library  },
  { labelKey: 'navigation.downloads', fallback: 'Downloads',   root: '/Downloads',       tabName: 'Downloads', Icon: Download },
  { labelKey: 'navigation.saved',     fallback: 'Saved',       root: '/Saved',           tabName: 'Saved',     Icon: Bookmark },
  { labelKey: 'navigation.profile',   fallback: 'Profile',     root: '/UserProfile',     tabName: 'Profile',   Icon: User     },
];

export default function BottomTabs() {
  const tabsRef = React.useRef(null);
  const location = useLocation();
  const { t } = useI18n();
  const { switchTab, activeTab } = useAppNavigation();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    // Re-fetch when profile image may change
    const handler = () => base44.auth.me().then(setCurrentUser).catch(() => {});
    window.addEventListener('profile-image-updated', handler);
    return () => window.removeEventListener('profile-image-updated', handler);
  }, []);

  return (
    <nav
      ref={tabsRef}
      data-bottom-tabs="true"
      role="navigation"
      aria-label="Main navigation tabs"
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="mx-auto grid max-w-md grid-cols-7 px-2 pt-2">
        {TABS.map(({ labelKey, fallback, root, tabName, Icon }) => {
          const label = t(labelKey, fallback);
          const active =
            activeTab === tabName ||
            location.pathname === root ||
            (root !== '/' && location.pathname.startsWith(root));

          return (
            <button
              key={tabName}
              onClick={() => switchTab(tabName)}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
              className="flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-purple-500"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${active ? 'bg-purple-100' : 'bg-transparent'}`}>
                {tabName === 'Profile' && currentUser?.profileImageUrl ? (
                  <UserAvatar
                    imageUrl={currentUser.profileImageUrl}
                    name={currentUser.full_name}
                    size="sm"
                    rounded="full"
                    className={`ring-2 transition-all ${active ? 'ring-purple-500' : 'ring-slate-200'}`}
                  />
                ) : (
                  <Icon
                    className={`w-5 h-5 transition-colors ${active ? 'text-purple-700' : 'text-slate-500'}`}
                    aria-hidden="true"
                  />
                )}
              </div>
              <span
                className={`truncate transition-colors ${active ? 'text-purple-700' : 'text-slate-500'}`}
                aria-hidden="true"
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}