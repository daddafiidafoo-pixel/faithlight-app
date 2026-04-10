import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Plus, Users, Lock, Unlock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function StudyGroupsHub() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPrivate: true,
  });

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: groups = [], refetch } = useQuery({
    queryKey: ["studyGroups"],
    queryFn: async () => {
      if (!user) return [];
      const all = await base44.entities.StudyGroup.list();
      return all.filter(
        (g) =>
          g.creatorEmail === user.email || g.memberEmails.includes(user.email)
      );
    },
    enabled: !!user,
  });

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      await base44.entities.StudyGroup.create({
        ...formData,
        creatorEmail: user.email,
        creatorName: user.full_name,
        memberEmails: [user.email],
        memberCount: 1,
        inviteCode: Math.random().toString(36).substr(2, 9),
      });
      setFormData({ name: "", description: "", isPrivate: true });
      setShowCreateForm(false);
      refetch();
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">Study Groups</h1>
            <p className="mt-2 text-slate-600">
              Collaborate with others on Scripture
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            New Group
          </Button>
        </div>

        {showCreateForm && (
          <form
            onSubmit={handleCreateGroup}
            className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h2 className="text-lg font-semibold text-slate-900 mb-4">
              Create Study Group
            </h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Group name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2"
                required
              />
              <textarea
                placeholder="Description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full rounded-lg border border-slate-200 px-4 py-2 h-24"
                required
              />
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isPrivate}
                  onChange={(e) =>
                    setFormData({ ...formData, isPrivate: e.target.checked })
                  }
                />
                <span className="text-sm text-slate-600">Private group</span>
              </label>
              <div className="flex gap-3">
                <Button type="submit">Create</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => navigate(`/study-group/${group.id}`)}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-slate-900 line-clamp-2">
                  {group.name}
                </h3>
                {group.isPrivate ? (
                  <Lock className="h-4 w-4 text-slate-400 shrink-0" />
                ) : (
                  <Unlock className="h-4 w-4 text-slate-400 shrink-0" />
                )}
              </div>
              <p className="text-sm text-slate-600 line-clamp-2 mb-4">
                {group.description}
              </p>
              <div className="flex items-center gap-1 text-sm text-slate-500">
                <Users className="h-4 w-4" />
                <span>{group.memberCount} members</span>
              </div>
            </button>
          ))}
        </div>

        {groups.length === 0 && !showCreateForm && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
            <Users className="mx-auto h-12 w-12 text-slate-400 mb-4" />
            <p className="text-slate-600 mb-4">
              No study groups yet. Create one to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}