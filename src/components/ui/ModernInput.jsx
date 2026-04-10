import React from "react";

export function ModernInput({ className = "", ...props }) {
  return (
    <input
      className={`h-11 w-full border border-gray-200 rounded-xl px-4 outline-none focus:border-gray-400 ${className}`}
      {...props}
    />
  );
}

export function ModernTextarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-gray-400 ${className}`}
      {...props}
    />
  );
}

export default ModernInput;