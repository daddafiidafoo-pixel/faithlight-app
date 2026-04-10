import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Heart, Check } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function CommunityPrayerWall() {
  const [user, setUser] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    body: "",
    isAnonymous: false,
    category: "other",
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: prayers = [], refetch } = useQuery({
    queryKey: ["prayerRequests"],
    queryFn: () => base44.entities.PrayerRequest.list(),
  });

  const handleCreatePrayer = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await base44.entities.PrayerRequest.create({
        ...formData,
        authorEmail: user.email,
        authorName: user.full_name,
        supportCount: 0,
        supporterEmails: [],
      });
      setFormData({
        title: "",
        body: "",
        isAnonymous: false,
        category: "other",
      });
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Error creating prayer request:", error);
    }
  };

  const handleSupport = async (prayerId) => {
    if (!user) return;

    const prayer = prayers.find((p) => p.id === prayerId);
    if (!prayer) return;

    const isSupported = prayer.supporterEmails.includes(user.email);
    const newSupporters = isSupported
      ? prayer.supporterEmails.filter((e) => e !== user.email)
      : [...prayer.supporterEmails, user.email];

    try {
      await base44.entities.PrayerRequest.update(prayerId, {
        supportCount: newSupporters.length,
        supporterEmails: newSupporters,
      });
      refetch();
    } catch (error) {
      console.error("Error supporting prayer:", error);
    }
  };

  const handleMarkAnswered = async (prayerId) => {
    try {
      const prayer = prayers.find((p) => p.id === prayerId);
      await base44.entities.PrayerRequest.update(prayerId, {
        isAnswered: !prayer.isAnswered,
      });
      refetch();
    } catch (error) {
      console.error("Error updating prayer:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Prayer Wall</h1>
            <p className="mt-2 text-slate-600">
              Share and support prayer requests
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            Share Prayer Request
          </Button>
        </div>

        {showForm && (
          <form
            onSubmit={handleCreatePrayer}
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Post Prayer Request
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Prayer title"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                required
              />
              <textarea
                placeholder="Share your prayer request..."
                value={formData.body}
                onChange={(e) =>
                  setFormData({ ...formData, body: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2 h-32"
                required
              />
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
              >
                <option value="health">Health</option>
                <option value="family">Family</option>
                <option value="work">Work</option>
                <option value="faith">Faith</option>
                <option value="other">Other</option>
              </select>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isAnonymous}
                  onChange={(e) =>
                    setFormData({ ...formData, isAnonymous: e.target.checked })
                  }
                />
                <span className="text-sm text-slate-600">Post anonymously</span>
              </label>
              <div className="flex gap-3">
                <Button type="submit">Post</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {prayers.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
              <p className="text-slate-600">
                No prayer requests yet. Be the first to share!
              </p>
            </div>
          ) : (
            prayers.map((prayer) => (
              <div
                key={prayer.id}
                className={`rounded-2xl border transition ${
                  prayer.isAnswered
                    ? "border-green-200 bg-green-50"
                    : "border-slate-200 bg-white"
                } p-6 shadow-sm`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-slate-900">
                        {prayer.title}
                      </h3>
                      {prayer.isAnswered && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-200 px-2 py-1 text-xs font-medium text-green-700">
                          <Check className="h-3 w-3" />
                          Answered
                        </span>
                      )}
                    </div>
                    <p className="text-slate-700 mb-3">{prayer.body}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="inline-block rounded-full bg-slate-100 px-2 py-1">
                        {prayer.category}
                      </span>
                      {prayer.isAnonymous ? (
                        <span>Anonymous</span>
                      ) : (
                        <span>{prayer.authorName}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {user && (
                      <>
                        <button
                          onClick={() => handleSupport(prayer.id)}
                          className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition ${
                            prayer.supporterEmails.includes(user.email)
                              ? "bg-red-100 text-red-600"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{prayer.supportCount}</span>
                        </button>
                        {user.email === prayer.authorEmail && (
                          <button
                            onClick={() => handleMarkAnswered(prayer.id)}
                            className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200"
                          >
                            <Check className="h-4 w-4" />
                            {prayer.isAnswered ? "Undo" : "Mark Answered"}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}