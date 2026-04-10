import React from 'react';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';

export default function SummaryStatsCard({ label, value }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="p-6 text-center bg-white">
        <p className="text-muted-foreground text-sm font-medium mb-2">{label}</p>
        <p className="text-4xl font-bold text-indigo-600">{value}</p>
      </Card>
    </motion.div>
  );
}