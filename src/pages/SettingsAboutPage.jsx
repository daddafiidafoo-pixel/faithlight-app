import React from "react";
import { useLanguage } from "@/components/i18n/LanguageProvider";

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-gray-800">{label}</p>
      <p className="text-sm text-gray-600 break-words sm:text-right">{value}</p>
    </div>
  );
}

function LinkCard({ title, description, href, linkLabel }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="block rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-gray-600">{description}</p>
          <p className="mt-3 text-sm font-medium text-blue-600">{linkLabel}</p>
        </div>

        <div className="shrink-0 text-gray-400">
          <svg
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M11.22 4.22a.75.75 0 0 1 1.06 0l3.5 3.5a.75.75 0 0 1 0 1.06l-3.5 3.5a.75.75 0 1 1-1.06-1.06l2.22-2.22H5a.75.75 0 0 1 0-1.5h8.44l-2.22-2.22a.75.75 0 0 1 0-1.06Z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </a>
  );
}

export default function SettingsAboutPage() {
  const { t } = useLanguage();

  const appName = "FaithLight";
  const version = "1.0.0";
  const buildNumber = "100";
  const developerName = "FaithLight Team";
  const supportEmail = "support@faithlight.app";
  const websiteUrl = "https://faithlight.app";
  const privacyUrl = "https://faithlight.app/privacy";
  const termsUrl = "https://faithlight.app/terms";

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="mb-2 text-sm font-medium text-blue-600">
            {t("settingsAbout.sectionLabel") || "Settings"}
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            {t("settingsAbout.title") || "About"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            {t("settingsAbout.description") || "Learn more about the app, version details, support information, and important links."}
          </p>
        </header>

        <div className="space-y-6">
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">
                {t("settingsAbout.appInfoTitle") || "App information"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {t("settingsAbout.appInfoDescription") || "Basic information about the app version and publisher."}
              </p>
            </div>

            <div className="space-y-3 px-5 py-5 sm:px-6">
              <InfoRow
                label={t("settingsAbout.fields.appName") || "App name"}
                value={appName}
              />
              <InfoRow
                label={t("settingsAbout.fields.version") || "Version"}
                value={version}
              />
              <InfoRow
                label={t("settingsAbout.fields.buildNumber") || "Build number"}
                value={buildNumber}
              />
              <InfoRow
                label={t("settingsAbout.fields.developer") || "Developer"}
                value={developerName}
              />
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="border-b border-gray-100 px-5 py-4 sm:px-6">
              <h2 className="text-base font-semibold text-gray-900">
                {t("settingsAbout.supportTitle") || "Support"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {t("settingsAbout.supportDescription") || "Use these details if you need help, want to report a problem, or have questions."}
              </p>
            </div>

            <div className="space-y-3 px-5 py-5 sm:px-6">
              <InfoRow
                label={t("settingsAbout.fields.supportEmail") || "Support email"}
                value={supportEmail}
              />
              <InfoRow
                label={t("settingsAbout.fields.website") || "Website"}
                value={websiteUrl}
              />
            </div>
          </section>

          <section>
            <div className="mb-4">
              <h2 className="text-base font-semibold text-gray-900">
                {t("settingsAbout.linksTitle") || "Helpful links"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {t("settingsAbout.linksDescription") || "Review important app policies and learn more about the platform."}
              </p>
            </div>

            <div className="space-y-4">
              <LinkCard
                title={t("settingsAbout.cards.website.title") || "Official website"}
                description={t("settingsAbout.cards.website.description") || "Visit the main website to learn more about the app and its mission."}
                href={websiteUrl}
                linkLabel={t("settingsAbout.cards.website.linkLabel") || "Open website"}
              />

              <LinkCard
                title={t("settingsAbout.cards.privacy.title") || "Privacy policy"}
                description={t("settingsAbout.cards.privacy.description") || "Read how user information is handled and protected."}
                href={privacyUrl}
                linkLabel={t("settingsAbout.cards.privacy.linkLabel") || "Read privacy policy"}
              />

              <LinkCard
                title={t("settingsAbout.cards.terms.title") || "Terms of use"}
                description={t("settingsAbout.cards.terms.description") || "Review the rules and conditions for using the app."}
                href={termsUrl}
                linkLabel={t("settingsAbout.cards.terms.linkLabel") || "Read terms of use"}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <h2 className="text-sm font-semibold text-blue-900">
              {t("settingsAbout.noteTitle") || "Note"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              {t("settingsAbout.noteBody") || "Before publishing, replace the sample app name, version, build number, website, and support email with your real production values."}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}