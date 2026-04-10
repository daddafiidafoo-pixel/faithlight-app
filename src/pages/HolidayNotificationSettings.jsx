import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Bell, CheckCircle2 } from "lucide-react";
import {
  getNotificationPreference,
  setNotificationPreference,
  hasNotificationPermission,
  requestNotificationPermission,
  notificationPreferences,
} from "@/utils/holidayNotificationService";

export default function HolidayNotificationSettings() {
  const [preference, setPreference] = useState(() => getNotificationPreference());
  const [hasPermission, setHasPermission] = useState(() => hasNotificationPermission());
  const [isRequesting, setIsRequesting] = useState(false);

  const handlePreferenceChange = (newPreference) => {
    setPreference(newPreference);
    setNotificationPreference(newPreference);
  };

  const handleEnableNotifications = async () => {
    setIsRequesting(true);
    try {
      const granted = await requestNotificationPermission();
      setHasPermission(granted);
      if (!granted) {
        alert(
          "Notification permission was denied. Please enable notifications in your browser settings."
        );
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      alert("Unable to request notification permission.");
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-2xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/christian-holidays"
            className="flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
          >
            <ArrowLeft size={20} />
            Back
          </Link>
        </div>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Bell className="w-8 h-8 text-purple-600" />
            <h1 className="text-3xl font-bold text-slate-900">
              Holiday Notifications
            </h1>
          </div>
          <p className="text-slate-600">
            Choose when to receive reminders for Christian holidays and celebrations
          </p>
        </div>

        {/* Notification Permission Status */}
        <div className="rounded-lg bg-white border border-slate-200 p-6 mb-8">
          <h3 className="font-semibold text-slate-900 mb-4">Notification Permission</h3>
          
          {hasPermission ? (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 size={24} className="text-green-600 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">Notifications Enabled</p>
                <p className="text-sm text-green-700">
                  You will receive reminders for your selected holidays
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-slate-700">
                Enable browser notifications to receive reminders for upcoming Christian holidays.
              </p>
              <button
                onClick={handleEnableNotifications}
                disabled={isRequesting}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white font-medium py-3 rounded-lg transition"
              >
                {isRequesting ? "Requesting Permission..." : "Enable Notifications"}
              </button>
            </div>
          )}
        </div>

        {/* Notification Preferences */}
        <div className="rounded-lg bg-white border border-slate-200 p-6 space-y-4">
          <h3 className="font-semibold text-slate-900 mb-6">Notification Frequency</h3>

          {/* All Holidays */}
          <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition"
            style={{
              borderColor: preference === notificationPreferences.ALL ? "#a78bfa" : "#e2e8f0",
              backgroundColor: preference === notificationPreferences.ALL ? "#f5f3ff" : "transparent",
            }}
          >
            <input
              type="radio"
              name="notification-preference"
              value={notificationPreferences.ALL}
              checked={preference === notificationPreferences.ALL}
              onChange={(e) => handlePreferenceChange(e.target.value)}
              className="mt-1 w-4 h-4 text-purple-600"
            />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">All Holidays</p>
              <p className="text-sm text-slate-600">
                Receive notifications for all 9 Christian holidays throughout the year
              </p>
            </div>
          </label>

          {/* Major Holidays Only */}
          <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition"
            style={{
              borderColor: preference === notificationPreferences.MAJOR ? "#a78bfa" : "#e2e8f0",
              backgroundColor: preference === notificationPreferences.MAJOR ? "#f5f3ff" : "transparent",
            }}
          >
            <input
              type="radio"
              name="notification-preference"
              value={notificationPreferences.MAJOR}
              checked={preference === notificationPreferences.MAJOR}
              onChange={(e) => handlePreferenceChange(e.target.value)}
              className="mt-1 w-4 h-4 text-purple-600"
            />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">Major Holidays Only</p>
              <p className="text-sm text-slate-600">
                Get notifications only for major celebrations: Christmas, Easter, Pentecost, Advent, and others
              </p>
            </div>
          </label>

          {/* No Notifications */}
          <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition"
            style={{
              borderColor: preference === notificationPreferences.NONE ? "#a78bfa" : "#e2e8f0",
              backgroundColor: preference === notificationPreferences.NONE ? "#f5f3ff" : "transparent",
            }}
          >
            <input
              type="radio"
              name="notification-preference"
              value={notificationPreferences.NONE}
              checked={preference === notificationPreferences.NONE}
              onChange={(e) => handlePreferenceChange(e.target.value)}
              className="mt-1 w-4 h-4 text-purple-600"
            />
            <div className="flex-1">
              <p className="font-semibold text-slate-900">No Notifications</p>
              <p className="text-sm text-slate-600">
                Don't send me any holiday reminders
              </p>
            </div>
          </label>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 How It Works</h4>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• Notifications arrive on the day of the holiday (or the day before)</li>
            <li>• Each notification includes the holiday greeting and a link to learn more</li>
            <li>• You can change your preferences anytime</li>
            <li>• Your settings are saved locally on this device</li>
          </ul>
        </div>
      </div>
    </div>
  );
}