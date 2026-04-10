import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="mt-12 px-4 py-6 border-t border-slate-200 bg-white text-center space-y-4">
      <div className="flex flex-wrap justify-center gap-4 text-sm">
        <Link
          to="/PrivacyPolicy"
          className="text-slate-600 hover:text-purple-600 font-medium transition"
        >
          Privacy Policy
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          to="/TermsOfService"
          className="text-slate-600 hover:text-purple-600 font-medium transition"
        >
          Terms of Service
        </Link>
        <span className="text-slate-300">•</span>
        <Link
          to="/support"
          className="text-slate-600 hover:text-purple-600 font-medium transition"
        >
          Support
        </Link>
      </div>
      <p className="text-xs text-slate-500">
        © 2026 FaithLight. All rights reserved.
      </p>
    </footer>
  );
}