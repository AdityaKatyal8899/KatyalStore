'use client';

import { motion } from 'framer-motion';
import { LayoutGrid, CloudDownload, LogOut } from 'lucide-react';

interface FloatingBottomDockProps {
  onHomeClick: () => void;
  onDownloadsClick: () => void;
  onLogOutClick: () => void;
}

export function FloatingBottomDock({
  onHomeClick,
  onDownloadsClick,
  onLogOutClick,
}: FloatingBottomDockProps) {
  const iconVariants = {
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="bg-orange-200 border-4 border-black shadow-[4px_4px_0px_0px_#000000] px-6 py-3 flex gap-8">
        <motion.button
          onClick={onHomeClick}
          className="text-black hover:scale-110 transition"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <LayoutGrid className="w-6 h-6 font-black" />
        </motion.button>

        <motion.button
          onClick={onDownloadsClick}
          className="text-black hover:scale-110 transition"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <CloudDownload className="w-6 h-6 font-black" />
        </motion.button>

        <motion.button
          onClick={onLogOutClick}
          className="text-black hover:scale-110 transition"
          variants={iconVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <LogOut className="w-6 h-6 font-black text-red-600" />
        </motion.button>
      </div>
    </motion.div>
  );
}
