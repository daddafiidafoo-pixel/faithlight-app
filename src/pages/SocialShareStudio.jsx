import React from "react";
import { useAuth } from "@/lib/AuthContext";
import SocialCardBuilder from "@/components/share/SocialCardBuilder";

export default function SocialShareStudio() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-slate-600">Please sign in to create share cards</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Share Your Faith</h1>
          <p className="mt-2 text-slate-600">
            Create beautiful, branded cards to share verses, devotions, and insights on social media
          </p>
        </div>

        <SocialCardBuilder userEmail={user.email} />
      </div>
    </div>
  );
}