import React, { useState, useEffect, useMemo } from 'react';

const STORAGE_KEY = "notification_settings";

const defaultSettings = {
  prayerReminders: true,
  communityUpdates: true,
  dailyVerse: true,
  appAnnouncements: true
};

function loadNotificationSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSettings;

    const parsed = JSON.parse(raw);

    return {
      prayerReminders: parsed.prayerReminders ?? defaultSettings.prayerReminders,
      communityUpdates: parsed.communityUpdates ?? defaultSettings.communityUpdates,
      dailyVerse: parsed.dailyVerse ?? defaultSettings.dailyVerse,
      appAnnouncements: parsed.appAnnouncements ?? defaultSettings.appAnnouncements
    };
  } catch (error) {
    console.warn("Failed to load notification settings.", error);
    return defaultSettings;
  }
}

function saveNotificationSettings(settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save notification settings.", error);
    throw error;
  }
}

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={[
        "relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition",
        "focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2",
        checked ? "bg-blue-600" : "bg-gray-300",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer"
      ].join(" ")}
    >
      <span
        className={[
          "inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition",
          checked ? "translate-x-6" : "translate-x-1"
        ].join(" ")}
      />
    </button>
  );
}

function NotificationRow({
  title,
  description,
  checked,
  onChange,
  disabled
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4">
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
      </div>

      <div className="shrink-0 pt-1">
        <ToggleSwitch checked={checked} onChange={onChange} disabled={disabled} />
      </div>
    </div>
  );
}

export default function SettingsNotificationsPage() {
  // Fallback translation function (t) that returns English defaults
  const t = (key, defaultValue) => defaultValue;

  const [settings, setSettings] = useState(defaultSettings);
  const [initialSettings, setInitialSettings] = useState(defaultSettings);
  const [saveState, setSaveState] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loaded = loadNotificationSettings();
    setSettings(loaded);
    setInitialSettings(loaded);
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(settings) !== JSON.stringify(initialSettings);
  }, [settings, initialSettings]);

  const allEnabled = useMemo(() => {
    return Object.values(settings).every(Boolean);
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings((current) => ({
      ...current,
      [key]: value
    }));
    setSaveState("idle");
    setErrorMessage("");
  };

  const setAllSettings = (value) => {
    setSettings({
      prayerReminders: value,
      communityUpdates: value,
      dailyVerse: value,
      appAnnouncements: value
    });
    setSaveState("idle");
    setErrorMessage("");
  };

  const handleSave = async () => {
    try {
      setSaveState("saving");
      setErrorMessage("");

      saveNotificationSettings(settings);

      setInitialSettings(settings);
      setSaveState("saved");

      window.setTimeout(() => {
        setSaveState("idle");
      }, 2000);
    } catch (error) {
      console.error("Failed to save notification settings:", error);
      setSaveState("error");
      setErrorMessage(
        t(
          "settingsNotifications.messages.saveError",
          "Unable to save notification settings. Please try again."
        )
      );
    }
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setSaveState("idle");
    setErrorMessage("");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="mb-2 text-sm font-medium text-blue-600">
            {t("settingsNotifications.sectionLabel", "Settings")}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t("settingsNotifications.title", "Notifications")}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {t(
              "settingsNotifications.description",
              "Choose which alerts, reminders, and updates you want to receive from the app."
            )}
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
          <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
            <h2 className="text-base font-semibold text-gray-900">
              {t("settingsNotifications.cardTitle", "Notification Preferences")}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              {t(
                "settingsNotifications.cardDescription",
                "You can turn notifications on or off at any time."
              )}
            </p>
          </div>

          <div className="space-y-5 px-5 py-5 sm:px-6">
            <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-900">
                    {t("settingsNotifications.quickActionsTitle", "Quick actions")}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-blue-800">
                    {t(
                      "settingsNotifications.quickActionsDescription",
                      "Turn all app notifications on or off with one tap."
                    )}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setAllSettings(!allEnabled)}
                  className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm ring-1 ring-blue-200 transition hover:bg-blue-100"
                >
                  {allEnabled
                    ? t("settingsNotifications.actions.disableAll", "Disable all")
                    : t("settingsNotifications.actions.enableAll", "Enable all")}
                </button>
              </div>
            </div>

            <div className="space-y-3">
              <NotificationRow
                title={t("settingsNotifications.options.prayerReminders.title", "Prayer reminders")}
                description={t(
                  "settingsNotifications.options.prayerReminders.description",
                  "Receive reminders to pray and stay consistent with your spiritual routine."
                )}
                checked={settings.prayerReminders}
                onChange={(value) => updateSetting("prayerReminders", value)}
                disabled={saveState === "saving"}
              />

              <NotificationRow
                title={t("settingsNotifications.options.communityUpdates.title", "Community updates")}
                description={t(
                  "settingsNotifications.options.communityUpdates.description",
                  "Get notified about prayer board activity and important community updates."
                )}
                checked={settings.communityUpdates}
                onChange={(value) => updateSetting("communityUpdates", value)}
                disabled={saveState === "saving"}
              />

              <NotificationRow
                title={t("settingsNotifications.options.dailyVerse.title", "Daily verse")}
                description={t(
                  "settingsNotifications.options.dailyVerse.description",
                  "Receive a daily Bible verse or short encouragement from the app."
                )}
                checked={settings.dailyVerse}
                onChange={(value) => updateSetting("dailyVerse", value)}
                disabled={saveState === "saving"}
              />

              <NotificationRow
                title={t("settingsNotifications.options.appAnnouncements.title", "App announcements")}
                description={t(
                  "settingsNotifications.options.appAnnouncements.description",
                  "Stay informed about new features, improvements, and important app news."
                )}
                checked={settings.appAnnouncements}
                onChange={(value) => updateSetting("appAnnouncements", value)}
                disabled={saveState === "saving"}
              />
            </div>

            <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
              <p className="text-sm font-medium text-gray-800">
                {t("settingsNotifications.noteTitle", "Note")}
              </p>
              <p className="mt-1 text-sm leading-6 text-gray-600">
                {t(
                  "settingsNotifications.noteBody",
                  "These settings control your in-app notification preferences. Device-level notification permission may also need to be enabled in your phone settings."
                )}
              </p>
            </div>

            {saveState === "error" && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {errorMessage}
              </div>
            )}

            {saveState === "saved" && (
              <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {t(
                  "settingsNotifications.messages.saved",
                  "Notification settings updated successfully."
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2 sm:flex-row">
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || saveState === "saving"}
                className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                {saveState === "saving"
                  ? t("settingsNotifications.actions.saving", "Saving...")
                  : t("settingsNotifications.actions.save", "Save changes")}
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || saveState === "saving"}
                className="inline-flex items-center justify-center rounded-xl border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("settingsNotifications.actions.cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}