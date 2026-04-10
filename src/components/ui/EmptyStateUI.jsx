import React from "react";
import { ModernButton } from "@/components/ui/ModernButton";

export default function EmptyStateUI({ title, description, actionLabel, onAction }) {
  return (
    <div className="border border-dashed border-gray-300 rounded-2xl p-6 text-center bg-white">
      <div className="text-lg font-semibold">{title}</div>
      {description ? <div className="text-sm text-gray-600 mt-2">{description}</div> : null}
      {actionLabel ? (
        <div className="mt-4 flex justify-center">
          <ModernButton variant="secondary" onClick={onAction} type="button">
            {actionLabel}
          </ModernButton>
        </div>
      ) : null}
    </div>
  );
}