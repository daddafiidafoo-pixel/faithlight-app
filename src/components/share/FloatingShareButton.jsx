/**
 * FloatingShareButton
 * Persistent floating share button that appears on any page with verse context.
 * One tap opens VerseShareSheet from anywhere in the app.
 * 
 * Usage: Drop into any page that has a verse:
 *   <FloatingShareButton verse={currentVerse} />
 */
import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { motion } from 'framer-motion';
import VerseShareSheet from './VerseShareSheet';

export default function FloatingShareButton({ verse, style = {} }) {
  const [open, setOpen] = useState(false);
  if (!verse) return null;

  return (
    <>
      <motion.button
        whileTap={{ scale: 0.92 }}
        whileHover={{ scale: 1.05 }}
        onClick={() => setOpen(true)}
        style={{
          position: 'fixed', bottom: 90, right: 20, zIndex: 40,
          width: 52, height: 52, borderRadius: '50%', border: 'none',
          background: 'linear-gradient(135deg, #6C5CE7, #8E7CFF)',
          boxShadow: '0px 6px 20px rgba(108,92,231,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          ...style,
        }}
      >
        <Share2 size={20} color="white" />
      </motion.button>

      <VerseShareSheet verse={verse} open={open} onClose={() => setOpen(false)} />
    </>
  );
}