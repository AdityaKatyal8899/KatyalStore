'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { LayoutGrid, CloudDownload, User, LogOut } from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: 'home' | 'downloads' | 'account') => void;
  onLogOut: () => void;
  currentUser?: { name: string; email: string } | null;
}

export function Sidebar({
  isOpen,
  onClose,
  onNavigate,
  onLogOut,
  currentUser,
}: SidebarProps) {
  const handleNavigate = (section: 'home' | 'downloads' | 'account') => {
    onNavigate(section);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            transition={{ duration: 0.2 }}
          />

          {/* Sidebar */}
          <motion.div
            className="fixed left-0 top-0 h-screen bg-white border-r-4 border-black z-50 w-64 overflow-y-auto"
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
          >
            {/* Header */}
            <div className="p-6 border-b-4 border-black">
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                Menu
              </h2>
              {currentUser && (
                <div className="bg-yellow-100 border-2 border-black p-3">
                  <p className="text-xs font-black text-black uppercase tracking-tight">
                    Logged in as
                  </p>
                  <p className="text-sm font-bold text-black truncate">{currentUser.name}</p>
                  <p className="text-xs text-gray-600 truncate">{currentUser.email}</p>
                </div>
              )}
            </div>

            {/* Navigation items */}
            <nav className="p-6 space-y-3">
              <motion.button
                onClick={() => handleNavigate('home')}
                className="w-full flex items-center gap-4 bg-white border-2 border-black px-4 py-3 text-left font-black uppercase tracking-tight hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LayoutGrid className="w-5 h-5 text-black" />
                Home
              </motion.button>

              <motion.button
                onClick={() => handleNavigate('downloads')}
                className="w-full flex items-center gap-4 bg-white border-2 border-black px-4 py-3 text-left font-black uppercase tracking-tight hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <CloudDownload className="w-5 h-5 text-black" />
                Downloads
              </motion.button>

              <motion.button
                onClick={() => handleNavigate('account')}
                className="w-full flex items-center gap-4 bg-white border-2 border-black px-4 py-3 text-left font-black uppercase tracking-tight hover:shadow-[4px_4px_0px_0px_#000000] transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <User className="w-5 h-5 text-black" />
                Account
              </motion.button>
            </nav>

            {/* Divider */}
            <div className="border-t-4 border-black mx-6" />

            {/* LogOut button */}
            <div className="p-6">
              <motion.button
                onClick={onLogOut}
                className="w-full flex items-center justify-center gap-2 bg-red-400 border-2 border-black px-4 py-3 text-black font-black uppercase tracking-tight shadow-[3px_3px_0px_0px_#000000] hover:shadow-[5px_5px_0px_0px_#000000] transition-shadow"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <LogOut className="w-5 h-5" />
                Log Out
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
