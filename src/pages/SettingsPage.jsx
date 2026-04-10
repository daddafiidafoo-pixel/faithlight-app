import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/components/i18n/LanguageProvider";
import { useI18n } from "@/components/I18nProvider";
import Footer from "@/components/Footer";

function ChevronRightIcon() {
  return (
    <svg
      className="h-5 w-5 text-gray-400"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M7.293 14.707a1 1 0 0 1 0-1.414L10.586 10 7.293 6.707a1 1 0 1 1 1.414-1.414l4 4a1 1 0 0 1 0 1.414l-4 4a1 1 0 0 1-1.414 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 4 5.9 4 9s-1.5 6.3-4 9c-2.5-2.7-4-5.9-4-9s1.5-6.3 4-9Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M6 8a6 6 0 1 1 12 0v4.5l1.2 2.1A1 1 0 0 1 18.3 16H5.7a1 1 0 0 1-.9-1.4L6 12.5V8Z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </svg>
  );
}

function PaletteIcon() {
  return (
    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3a9 9 0 1 0 0 18h1.5a2.5 2.5 0 0 0 0-5H12a1.5 1.5 0 0 1 0-3h2a4 4 0 0 0 0-8h-2Z" />
      <circle cx="7.5" cy="10" r="1" />
      <circle cx="9.5" cy="7.5" r="1" />
      <circle cx="14.5" cy="7.5" r="1" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg className="h-5 w-5 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SettingsCard({ to, title, description, value, badge, onClick }) {
  const content = (
    <div className="group flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          {badge && (
            <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
              {badge}
            </span>
          )}
        </div>
        <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
        {value && <p className="mt-2 text-sm font-medium text-gray-800">{value}</p>}
      </div>
      <div className="ml-4 shrink-0">
        <ChevronRightIcon />
      </div>
    </div>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className="block w-full text-left">
      {content}
    </button>
  );
}

function SectionHeader({ title, description }) {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-900">{title}</h2>
      <p className="mt-1 text-sm text-gray-600">{description}</p>
    </div>
  );
}

const SUPPORTED_LANGUAGES = [
  { code: "en",  label: "English",          native: "English" },
  { code: "om",  label: "Afaan Oromoo",     native: "Afaan Oromoo" },
  { code: "hae", label: "Afaan Oromoo (Bahaa)", native: "Afaan Oromoo (Bahaa)" },
  { code: "am",  label: "Amharic",          native: "አማርኛ" },
  { code: "ar",  label: "Arabic",           native: "العربية" },
  { code: "sw",  label: "Swahili",          native: "Kiswahili" },
  { code: "fr",  label: "French",           native: "Français" },
  { code: "ti",  label: "Tigrinya",         native: "ትግርኛ" },
];

export default function SettingsPage() {
  const { language } = useLanguage();
  const { lang, setLang, t } = useI18n();

  const [savedMsg, setSavedMsg] = useState("");

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLang(newLang);
    setSavedMsg(t('settings.languageSaved', 'Language saved!'));
    setTimeout(() => setSavedMsg(""), 2500);
  };

  const currentLanguageLabel = SUPPORTED_LANGUAGES.find(l => l.code === (lang || language))?.label || "English";

  const currentThemeLabel = "System default";
  const notificationsLabel = "Enabled";
  const appVersion = "1.0.0";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8">
          <p className="mb-2 text-sm font-medium text-blue-600">Settings</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Manage your app preferences, language, notifications, appearance, and app information.
          </p>
        </header>

        <section className="mb-8">
          <SectionHeader
            title="Preferences"
            description="Customize how the app works for you."
          />

          <div className="space-y-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2">
                  <GlobeIcon />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{t('settings.language', 'Language')}</h3>
                  <p className="text-sm text-gray-600">
                    {t('settings.changeLanguage', 'Choose the language used throughout the app.')}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <select
                  value={lang || language}
                  onChange={handleLanguageChange}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  style={{ minHeight: '44px' }}
                >
                  {SUPPORTED_LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code}>
                      {l.native} — {l.label}
                    </option>
                  ))}
                </select>

                {savedMsg && (
                  <p className="text-sm font-medium text-green-700 bg-green-50 border border-green-200 rounded-xl px-3 py-2">
                    {savedMsg}
                  </p>
                )}

                <p className="text-xs text-gray-500">
                  {t('settings.languageNote', 'This changes the entire app UI language immediately.')}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2">
                  <BellIcon />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600">
                    Control reminders, alerts, and app notifications.
                  </p>
                </div>
              </div>

              <SettingsCard
                to="/NotificationSettings"
                title="Notification settings"
                description="Choose which updates and reminders you want to receive."
                value={notificationsLabel}
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2">
                  <PaletteIcon />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Theme</h3>
                  <p className="text-sm text-gray-600">
                    Adjust the app appearance to match your preference.
                  </p>
                </div>
              </div>

              <SettingsCard
                to="/Settings"
                title="Appearance"
                description="Switch between light mode, dark mode, or use your device setting."
                value={currentThemeLabel}
              />
            </div>
          </div>
        </section>

        <section>
          <SectionHeader
            title="About"
            description="View app information, version details, and helpful resources."
          />

          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-3">
              <div className="rounded-xl bg-blue-50 p-2">
                <InfoIcon />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">About this app</h3>
                <p className="text-sm text-gray-600">
                  Learn more about the app, version, and support information.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <SettingsCard
                to="/AboutPage"
                title="App information"
                description="See version details, app purpose, and support contacts."
                value={`Version ${appVersion}`}
              />

              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-800">Quick info</p>
                    <p className="mt-1 text-sm text-gray-600">
                      Your saved preferences will be applied automatically every time you open the app.
                    </p>
                  </div>

                  <span className="inline-flex w-fit rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                    Saved preferences
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}