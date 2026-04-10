import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { MessageSquare, Calendar, Target } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function StudyGroupDetail() {
  const { groupId } = useParams();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("chat");
  const [message, setMessage] = useState("");

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: group, isLoading } = useQuery({
    queryKey: ["studyGroup", groupId],
    queryFn: () => base44.entities.StudyGroup.get(groupId),
  });

  const { data: messages = [] } = useQuery({
    queryKey: ["groupMessages", groupId],
    queryFn: async () => {
      const all = await base44.entities.GroupMessage.list();
      return all.filter((m) => m.groupId === groupId);
    },
  });

  const { data: sessions = [] } = useQuery({
    queryKey: ["studySessions", groupId],
    queryFn: async () => {
      const all = await base44.entities.StudySession.list();
      return all.filter((s) => s.groupId === groupId);
    },
  });

  const { data: goals = [] } = useQuery({
    queryKey: ["readingGoals", groupId],
    queryFn: async () => {
      const all = await base44.entities.SharedReadingGoal.list();
      return all.filter((g) => g.groupId === groupId);
    },
  });

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim() || !user) return;

    try {
      await base44.entities.GroupMessage.create({
        groupId,
        userEmail: user.email,
        userName: user.full_name,
        content: message,
        messageType: "text",
      });
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-violet-200 border-t-violet-600 rounded-full" />
      </div>
    );
  }

  if (!group) {
    return <div className="p-6 text-center text-slate-600">Group not found</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white p-6">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">{group.name}</h1>
          <p className="mt-2 text-slate-600">{group.description}</p>
        </div>

        <div className="mb-6 flex gap-2 border-b border-slate-200">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${
              activeTab === "chat"
                ? "border-b-2 border-violet-600 text-violet-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            Chat
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${
              activeTab === "calendar"
                ? "border-b-2 border-violet-600 text-violet-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </button>
          <button
            onClick={() => setActiveTab("goals")}
            className={`flex items-center gap-2 px-4 py-2 font-medium ${
              activeTab === "goals"
                ? "border-b-2 border-violet-600 text-violet-600"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Target className="h-4 w-4" />
            Goals
          </button>
        </div>

        {activeTab === "chat" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 h-96 overflow-y-auto space-y-4">
              {messages.length === 0 ? (
                <p className="text-center text-slate-500 py-12">
                  No messages yet. Start the discussion!
                </p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-lg bg-slate-50 p-4 border border-slate-200"
                  >
                    <div className="font-semibold text-slate-900">
                      {msg.userName}
                    </div>
                    <p className="mt-1 text-slate-700">{msg.content}</p>
                  </div>
                ))
              )}
            </div>

            {user && (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Share your thoughts..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-4 py-2"
                />
                <Button type="submit">Send</Button>
              </form>
            )}
          </div>
        )}

        {activeTab === "calendar" && (
          <div className="space-y-4">
            <Button>Schedule Session</Button>
            <div className="space-y-3">
              {sessions.length === 0 ? (
                <p className="text-slate-500 py-8 text-center">
                  No scheduled sessions
                </p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {session.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {session.passage}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(session.sessionDate).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "goals" && (
          <div className="space-y-4">
            <Button>Create Reading Goal</Button>
            <div className="space-y-3">
              {goals.length === 0 ? (
                <p className="text-slate-500 py-8 text-center">
                  No reading goals yet
                </p>
              ) : (
                goals.map((goal) => (
                  <div
                    key={goal.id}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <h3 className="font-semibold text-slate-900">
                      {goal.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {goal.passages.join(", ")}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {goal.completedByEmails.length} of{" "}
                      {group.memberCount} completed
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}