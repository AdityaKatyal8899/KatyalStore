'use client';

import { motion } from 'framer-motion';
import { useScrollY } from '@/lib/hooks/useScrollY';

export function ScrollDrivenHeader() {
  const scrollY = useScrollY();
  const isVisible = scrollY > 100;

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 z-40"
      initial={{ y: -100, opacity: 0 }}
      animate={{
        y: isVisible ? 0 : -100,
        opacity: isVisible ? 1 : 0,
      }}
      transition={{ duration: 0.3 }}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <div className="bg-white border-b-4 border-black">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
          <h1 className="text-2xl font-black text-black uppercase tracking-tight">KatyalStore</h1>
        </div>
      </div>
    </motion.div>
  );
}
