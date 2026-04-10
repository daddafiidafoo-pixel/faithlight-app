import React from "react";
import { useAuth } from "@/lib/AuthContext";
import OfflineLibraryPanel from "@/components/offline/OfflineLibraryPanel";

export default function SpiritualLibrary() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-slate-600">Please sign in to access your library</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Spiritual Library</h1>
          <p className="mt-2 text-slate-600">
            Download and access your favorite passages, plans, and insights offline
          </p>
        </div>

        <OfflineLibraryPanel userEmail={user.email} />
      </div>
    </div>
  );
}