import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Image as ImageIcon, X } from 'lucide-react';
import VerseShareImageGenerator from './VerseShareImageGenerator';

/**
 * Modal wrapper for verse image sharing
 */
export default function VerseShareImageModal({ verse, reference, isDarkMode, open, onOpenChange }) {
  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Share Verse as Image
          </DialogTitle>
        </DialogHeader>
        
        <VerseShareImageGenerator
          verse={verse}
          reference={reference}
          isDarkMode={isDarkMode}
        />
      </DialogContent>
    </Dialog>
  );
}