'use client';

import { motion } from 'framer-motion';
import { useScrollY } from '@/lib/hooks/useScrollY';
import { Menu } from 'lucide-react';

interface ScrollDrivenHeaderProps {
  onOpenMenu?: () => void;
}

export function ScrollDrivenHeader({ onOpenMenu }: ScrollDrivenHeaderProps) {
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
      transition={{ duration: 0.2, ease: 'easeOut' }}
      pointerEvents={isVisible ? 'auto' : 'none'}
    >
      <div className="bg-[var(--theme-surface)] border-b-4 border-[var(--theme-border)] shadow-[0px_4px_0px_0px_var(--theme-shadow-color)] transition-colors">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {onOpenMenu && (
              <button
                type="button"
                onClick={onOpenMenu}
                className="flex items-center gap-1.5 bg-[var(--theme-surface-elevated)] border-2 border-[var(--theme-border)] px-2.5 py-1 text-xs font-black uppercase text-[var(--theme-text-primary)] shadow-[2px_2px_0px_0px_var(--theme-shadow-color)] hover:bg-yellow-300 hover:text-black transition-colors cursor-pointer"
              >
                <Menu className="w-3.5 h-3.5" />
                <span>Menu</span>
              </button>
            )}
            <h1 className="text-xl font-black text-[var(--theme-text-primary)] uppercase tracking-tight">
              KatyalStore
            </h1>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
