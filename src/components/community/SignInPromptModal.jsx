import React from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { LogIn, X, BookOpen } from 'lucide-react';

export default function SignInPromptModal({ message = 'Sign in to interact with the community.', onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-300 hover:text-gray-500">
          <X className="w-4 h-4" />
        </button>
        <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center mx-auto mb-4">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <h2 className="font-bold text-gray-900 text-lg mb-2">Join FaithLight</h2>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => base44.auth.redirectToLogin(window.location.href)}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2"
          >
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full">Maybe later</Button>
        </div>
      </div>
    </div>
  );
}