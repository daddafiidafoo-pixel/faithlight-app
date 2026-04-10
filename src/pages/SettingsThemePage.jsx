import React from "react";

export default function SettingsThemePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <p className="mb-2 text-sm font-medium text-blue-600">Settings</p>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Theme</h1>
          <p className="mt-2 text-sm leading-6 text-gray-600">
            Adjust the app appearance to match your preference.
          </p>
        </header>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <p className="text-gray-600">Theme settings coming soon...</p>
        </div>
      </div>
    </div>
  );
}