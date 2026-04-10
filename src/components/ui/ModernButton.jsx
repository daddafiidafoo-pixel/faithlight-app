import React from "react";

export function ModernButton({ variant = "primary", className = "", ...props }) {
  const base = "h-11 px-4 rounded-xl font-semibold transition disabled:opacity-50";
  const styles =
    variant === "primary"
      ? "bg-black text-white hover:opacity-90"
      : variant === "ghost"
      ? "bg-transparent hover:bg-gray-100"
      : "border border-gray-200 bg-white hover:bg-gray-50";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}

export default ModernButton;